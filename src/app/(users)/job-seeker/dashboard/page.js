'use client';

import SeekerJobCard from '@/components/dashboard/seekerJobCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Loading from './loading';
import { useSearchParams } from 'next/navigation';

export default function JobSeekerDashboard() {
  const [jobPostings, setJobPostings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const searchParams = useSearchParams();
  const jobSeekerId = searchParams.get('jobSeekerId');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const resApplied = await fetch(`/api/get-jobseeker-applications?jobSeekerId=${jobSeekerId}`);
        const resJobs = await fetch('/api/get-job-postings');

        if (!resApplied.ok) throw new Error(`HTTP ${resApplied.status}`);
        if (!resJobs.ok) throw new Error(`HTTP ${resJobs.status}`);

        const appliedData = await resApplied.json();
        const jobsData = await resJobs.json();

        // Filter out already applied jobs
        const filteredJobs = jobsData.filter(
          job => !appliedData.some(
            applied => applied.job_postings.jobPostingId === job.jobPostingId
          )
        );

        setAppliedJobs(appliedData);
        setJobPostings(filteredJobs);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (jobSeekerId) {
      fetchJobs();
    }
  }, [jobSeekerId]);

  const handleApply = async (job) => {
    setIsApplying(true);
    try {
      const res = await fetch('/api/apply-to-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobSeekerId,
          jobPostingId: job.jobPostingId,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // After applying, remove the job from the list instantly
      setJobPostings(prev => prev.filter(j => j.jobPostingId !== job.jobPostingId));

      console.log(await res.json());
    } catch (error) {
      console.error("Error applying for job:", error);
      setError(error.message || 'Unknown error');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <p className="text-center text-red-600 p-6">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className='flex flex-row justify-between items-center mb-6'>
        <h1 className="text-4xl font-extrabold text-center mb-6">
          Suggested Job Postings
        </h1>
        <Link href={`/job-seeker/dashboard/applications?jobSeekerId=${jobSeekerId}`}>
          <Button>View Your Applications</Button>
        </Link>
      </div>
      <SeekerJobCard jobPostings={jobPostings} onApply={handleApply} isApplying={isApplying} />
    </div>
  );
}
