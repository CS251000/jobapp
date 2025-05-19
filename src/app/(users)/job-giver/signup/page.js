"use client";
import React from 'react'
import { useState } from 'react';
import { useUser,SignInButton } from "@clerk/nextjs";


export default function JobGiverSignup() {
  const { user, isSignedIn,isLoaded } = useUser();

  
  if(!isSignedIn || !isLoaded){
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <SignInButton mode="modal">
        <h1 className="text-2xl font-bold text-black hover:cursor-pointer">
          Please Sign In to continue
          </h1>
          </SignInButton>
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-black">Welcome to the Job Giver Dashboard</h1>
      </div>
      
    </div>
  )
}
