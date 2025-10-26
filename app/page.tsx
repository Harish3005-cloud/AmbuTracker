import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  // --- FIX ---
  // Instead of: const { userId } = auth();
  // Get the whole object first:
  // const authData = auth();
  // // --- END FIX ---


  // // 1. If the user is not logged in, send them to the sign-in page
  // // Then check the .userId property
  // if (!authData.userId) {
  //   redirect("/sign-in");
  // }

  // // 2. Get the full user object to read their metadata
  // const user = await currentUser();
  // if (!user) {
  //   // This is a safety check, should be covered by !userId
  //   redirect("/sign-in");
  // }

  // // 3. Read the role from the public metadata we set in the Clerk Dashboard
  // const role = user.publicMetadata?.role;

  // // 4. Redirect based on the role
  // if (role === "DRIVER") {
  //   redirect("/driver");
  // }

  // if (role === "RTO") {
  //   redirect("/rto");
  // }

  // 5. (Fallback) If they are logged in but have no role assigned
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] text-center p-4">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">
        Account Pending
      </h1>
      <p className="text-lg text-gray-300">
        Your account is active but has not been assigned a role.
      </p>
      <p className="text-md text-gray-400">
        Please contact your administrator to get access to your dashboard.
      </p>
    </div>
  );
}
