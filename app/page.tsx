import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  // --- FIX ---
  // Instead of: const { userId } = auth();
  // Get the whole object first:
  // const authData = auth();
  // // --- END FIX ---



  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const role = (user.publicMetadata?.role as string | undefined) ?? undefined;
  if (role === "DRIVER") {
    redirect("/driver");
  }
  if (role === "RTO") {
    redirect("/rto");
  }

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
