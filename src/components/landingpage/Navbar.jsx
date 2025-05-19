import { SignInButton, SignUpButton, useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function HomeNavbar() {
    const { isSignedIn, user } = useUser();
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center gap-96">
        <Link href="/" className="flex items-center gap-2">
            {/* Updated logo icon */}
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-blue-600">JOBAPP</span>
          </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/features" className="text-gray-600 hover:text-blue-600">
            Features
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-blue-600">
            Pricing
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600">
            About
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-blue-600">
            Contact
          </Link>
        </div>

        {/* <div className="flex items-center gap-3">
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

            <SignUpButton>
              <button className="bg-white text-gray-800 py-2 px-4 rounded hover:bg-gray-200 border border-blue-600 hover:cursor-pointer">
                Sign up
              </button>
            </SignUpButton> 
          </>
        )}
          
        </div> */}
      </div>
    </nav>
  );
}
