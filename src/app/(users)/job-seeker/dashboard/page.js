'use client';

import SeekerJobCard from '@/components/dashboard/seekerJobCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';


export default function JobSeekerDashboard() {
  const [jobPostings, setJobPostings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/get-job-postings');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setJobPostings(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (isLoading) {
    return <p className="text-center p-6">Loading…</p>;
  }
  if (error) {
    return <p className="text-center text-red-600 p-6">Error: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className='flex flex-row justify-between items-center mb-6'>
      <h1 className="text-4xl font-extrabold text-center mb-6">
        Suggested Job Postings
      </h1>
      <Link href="/job-seeker/dashboard/applications">
      <Button>View Your Applications</Button>
      </Link>
      </div>
      <SeekerJobCard jobPostings={jobPostings} />
    </div>
  );
}
