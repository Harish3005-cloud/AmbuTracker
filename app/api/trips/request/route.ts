import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import UserProfile from "@/models/UserProfile.model";
import Trip from "@/models/trip.model";

export async function POST(req: NextRequest) {
  try {
    // 1. Get the logged-in user's ID from Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Connect to the database
    await connectToDB();

    // 3. Find the user's profile in your MongoDB
    // We need this to get their assigned rtoLocation and MongoDB ID
    let userProfile = await UserProfile.findOne({ userId: userId });
    if (!userProfile) {
      // Attempt to auto-create from Clerk user metadata
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
      }

      const role = (user.publicMetadata?.role as string | undefined)?.toUpperCase();
      const vehicleNumber = user.publicMetadata?.vehicleNumber as string | undefined;
      const rtoLocation = user.publicMetadata?.rtoLocation as string | undefined;

      if (!role || !rtoLocation) {
        return NextResponse.json(
          { error: "User profile not found. Please set role and rtoLocation in Clerk metadata or create profile." },
          { status: 404 }
        );
      }

      userProfile = await UserProfile.create({
        userId,
        email: user.emailAddresses?.[0]?.emailAddress || "",
        imageUrl: user.imageUrl,
        role: role === "DRIVER" || role === "RTO" ? (role as any) : "DRIVER",
        vehicleNumber,
        rtoLocation,
      });
    }

    // 4. Check if this user is a DRIVER
    if (userProfile.role !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden: Not a driver" }, { status: 403 });
    }

    // 5. Get the form data from the request body
    const { startLocation, endLocation, criticalLevel } = await req.json();

    if (!startLocation || !endLocation || !criticalLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 6. Create the new Trip document in the database
    const newTrip = new Trip({
      driverId: userProfile._id, // Link to the user profile's MongoDB ID
      rtoLocation: userProfile.rtoLocation, // Assign it to the driver's RTO
      startLocation,
      endLocation,
      criticalLevel,
      status: "pending", // The initial status is always 'pending'
    });

    // 7. Save the new trip to the database
    await newTrip.save();

    // 8. Return the newly created trip as confirmation
    return NextResponse.json(newTrip, { status: 201 });
    
  } catch (error) {
    console.error("[TRIP_REQUEST_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}