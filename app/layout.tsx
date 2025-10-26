import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

import { Inter } from "next/font/google";
import "./globals.css";
import { dark } from "@clerk/themes";
import Header from "@/components/Header"; // We will create this component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ambulance Tracker",
  description: "Real-time ambulance tracking and dispatch system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Wrap the entire app in ClerkProvider for authentication
    <ClerkProvider
      appearance={{
        baseTheme: dark, // Apply dark theme to all Clerk components
      }}
    >
      <html lang="en">
        <body className={`${inter.className} bg-gray-900 text-gray-100`}>
          {/* Header will show on every page */}
          <Header />
          
          {/* Page content will be rendered below the header */}
          {/* We add 'pt-20' to offset the height of the fixed header */}
          <main className="pt-20">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}