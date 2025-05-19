"use client";
import Link from "next/link";
import HomeNavbar from "@/components/landingpage/Navbar";


export default function Home() {
  return (
    <main className="bg-gray-100 min-h-screen text-black flex flex-col">
      <HomeNavbar />
      <div className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-center mb-6">
          Welcome to <span className="text-indigo-600">JobApp</span>
        </h1>
        <p className="text-lg text-center mb-10">
          Your one-stop solution for job applications and management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Job Seeker Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow">
            <div className="text-indigo-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.486 0 4.82.695 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 00-7.07 17.07M12 2a10 10 0 017.07 17.07" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Job Seeker</h2>
            <p className="text-gray-600 mb-6">
              Create your profile, browse jobs, and apply to opportunities that match your skills.
            </p>
            <Link href="/job-seeker/signup">
              <div className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors">
                Sign In as Seeker
              </div>
            </Link>
          </div>

          {/* Job Giver Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow">
            <div className="text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10-6h3a1 1 0 011 1v4m-6 8H9m3 0v1m0-10V7m0 4h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Job Giver</h2>
            <p className="text-gray-600 mb-6">
              Post job openings, manage applications, and find the best candidates for your organization.
            </p>
            <Link href="/job-giver/signup">
              <div className="inline-block bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition-colors">
                Sign In as Giver
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
