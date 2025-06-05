
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CirclePlus } from 'lucide-react';
import GiverJobPostingCard from '@/components/dashboard/giverJobPostings';
import Loading from './loading';



export default function JobApplicantsPage() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [jobPostings, setJobPostings] =useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setError('No companyId provided in the URL.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/get-company-job-postings?companyId=${companyId}`)
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Failed to fetch job postings');
        }
        return res.json();
      })
      .then((data) => {
        setJobPostings(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching job postings:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [companyId]);
  const handleDelete = async (jobPostingId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      const res = await fetch(`/api/delete-job-posting?jobPostingId=${jobPostingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to delete posting');
      }
      setJobPostings((prev) =>
        prev.filter((jp) => jp.jobPostingId !== jobPostingId)
      );
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Could not delete posting: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between p-4">
        <h1 className="font-extrabold text-3xl">Manage your Job Postings</h1>
        <Link href={`/job-giver/publish-job?companyId=${companyId}`}>
          <Button>
            <CirclePlus />
            Publish a job
          </Button>
        </Link>
      </div>

      {isLoading && <Loading/>}
      {error && <p className="p-4 text-center text-red-600">{error}</p>}
      {!isLoading && !error && (
        <div className="p-4">
          <GiverJobPostingCard jobPostings={jobPostings} 
          onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
