"use client";

import { SignIn } from "@clerk/nextjs";
// import NavbarPage from "@/components/Landing/LandingNavbar";

export default function SignInPage() {

  return (
    <>
      <div className=" bg-cover flex h-screen login-page flex-wrap justify-center pt-6">
        <SignIn/>
      </div>
    </>
  );
}
