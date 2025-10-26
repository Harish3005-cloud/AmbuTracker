import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import UserProfile from "@/models/UserProfile.model";

// This function handles POST requests from Clerk webhooks
export async function POST(req: Request) {
  // --- 1. GET THE WEBHOOK SECRET ---
  // You must get this from the Clerk Dashboard > Webhooks > select your endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local"
    );
  }

  // --- 2. VALIDATE THE REQUEST ---
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get the body
  const body = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Invalid signature", {
      status: 400,
    });
  }

  // --- 3. CONNECT TO YOUR DATABASE ---
  try {
    await connectToDB();
  } catch (err) {
    console.error("Error connecting to database:", err);
    return new Response("Error: Database connection failed", {
      status: 500,
    });
  }

  // --- 4. HANDLE THE WEBHOOK EVENT ---
  // Get the type of event (e.g., "user.created", "user.updated")
  const eventType = evt.type;
  console.log(`Received webhook event: ${eventType}`);

  // A. Handle User Creation
  if (eventType === "user.created") {
    const { id, email_addresses, image_url, public_metadata } = evt.data;

    // Extract the primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    )?.email_address;

    if (!primaryEmail) {
      return new Response("Error: Primary email not found", { status: 400 });
    }

    // Create the new user profile in your MongoDB
    try {
      await UserProfile.create({
        userId: id, // This is the Clerk User ID
        email: primaryEmail,
        imageUrl: image_url,
        // Save the metadata you set in the Clerk Dashboard
        role: public_metadata?.role as string,
        vehicleNumber: public_metadata?.vehicleNumber as string,
        rtoLocation: public_metadata?.rtoLocation as string,
      });

      console.log(`Created new user profile in DB: ${id}`);
      return new Response("User created successfully", { status: 201 });
    } catch (err) {
      console.error("Error creating user profile:", err);
      return new Response("Error: Could not create user profile", {
        status: 500,
      });
    }
  }

  // B. Handle User Updates
  if (eventType === "user.updated") {
    const { id, email_addresses, image_url, public_metadata } = evt.data;

    // Extract the primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    )?.email_address;

    if (!primaryEmail) {
      return new Response("Error: Primary email not found", { status: 400 });
    }

    // Find and update the user profile in your MongoDB
    try {
      await UserProfile.findOneAndUpdate(
        { userId: id }, // Find user by their Clerk ID
        {
          // Update their data
          email: primaryEmail,
          imageUrl: image_url,
          role: public_metadata?.role as string,
          vehicleNumber: public_metadata?.vehicleNumber as string,
          rtoLocation: public_metadata?.rtoLocation as string,
        },
        { new: true, upsert: true } // `upsert: true` will create if not found
      );

      console.log(`Updated user profile in DB: ${id}`);
      return new Response("User updated successfully", { status: 200 });
    } catch (err) {
      console.error("Error updating user profile:", err);
      return new Response("Error: Could not update user profile", {
        status: 500,
      });
    }
  }
  
  // C. Handle User Deletion (Optional but good practice)
  if (eventType === "user.deleted") {
    const { id } = evt.data;
    
    if (!id) {
       return new Response("Error: User ID not found", { status: 400 });
    }
    
    try {
      await UserProfile.findOneAndDelete({ userId: id });
      console.log(`Deleted user profile from DB: ${id}`);
      return new Response("User deleted successfully", { status: 200 });
    } catch (err) {
      console.error("Error deleting user profile:", err);
      return new Response("Error: Could not delete user profile", {
        status: 500,
      });
    }
  }

  // If it's an event we don't care about, just return 200
  return new Response("Event received", { status: 200 });
}