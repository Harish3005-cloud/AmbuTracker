"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Siren } from "lucide-react"; // Using an icon for the logo

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-950 border-b border-gray-700 h-20 flex items-center z-50">
      <nav className="container mx-auto px-4 w-full flex items-center justify-between">
        
        {/* Logo and Title */}
        <Link
          href="/"
          className="flex items-center gap-3 text-white transition-opacity hover:opacity-80"
        >
          <Siren className="h-8 w-8 text-red-500" />
          <span className="text-xl font-bold">Ambulance Tracker</span>
        </Link>

        {/* Auth Section (Changes based on login state) */}
        <div className="flex items-center gap-4">
          
          {/* Shows only if the user is logged IN */}
          <SignedIn>
            {/* This is Clerk's pre-built component.
              It shows the user's profile picture and handles
              profile management, sign out, etc.
            */}
            <UserButton afterSignOutUrl="/sign-in" />
          </SignedIn>

          {/* Shows only if the user is logged OUT */}
          <SignedOut>
            <Link
              href="/sign-in"
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Sign Up
            </Link>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}