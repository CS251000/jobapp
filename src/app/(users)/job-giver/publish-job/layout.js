"use client";
import GiverNavbar from "@/components/dashboard/giverNavbar";
import { Suspense } from "react";
export default function GiverLayout({ children }) {
  return (
    <>
    <GiverNavbar/>
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
    </>
  );
}
