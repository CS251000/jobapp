"use client";
import SeekerNavbar from "@/components/dashboard/seekerNavbar";
export default function SeekerLayout({ children }) {
  return (
    <>
    <SeekerNavbar/>
    {children}
    </>
  );
}
