"use client";
import GiverNavbar from "@/components/dashboard/giverNavbar";

export default function GiverLayout({ children }) {
  return (
    <>
    <GiverNavbar/>
    {children}
    </>
  );
}
