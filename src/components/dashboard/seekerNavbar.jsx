import React from 'react'
import Link from 'next/link'
import { useUser } from "@clerk/nextjs";
import { UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Briefcase } from "lucide-react";


export default function SeekerNavbar() {
  const { user, isSignedIn } = useUser();
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center gap-96">
        <Link href="/" className="flex items-center gap-2">
            {/* Updated logo icon */}
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-blue-600">JOBAPP</span>
          </Link>

        <div className=" flex items-center gap-6 text-black font-semibold">
          Get a Job Quickly
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-black">
              Hello, {user?.firstName || "User"}!
            </span>
            <UserButton />
          </div>
        ) : (
          <>
            <SignInButton>
              <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 hover:cursor-pointer">
                Log In
              </button>
            </SignInButton>

            {/* <SignUpButton>
              <button className="bg-white text-gray-800 py-2 px-4 rounded hover:bg-gray-200 border border-blue-600 hover:cursor-pointer">
                Sign up
              </button>
            </SignUpButton>  */}
          </>
        )}
          
        </div>
      </div>
    </nav>
  )
}
