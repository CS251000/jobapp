"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import JobApplications from "./JobApplications";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function JobPostApplications() {
  const router= useRouter();
  const searchParams = useSearchParams();
  const jobPostingId = searchParams.get("jobPostingId");
  const jobPostingName= searchParams.get('jobPostingName');

  const [jobApplications, setJobApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const didFetchRef = useRef(false);

  useEffect(() => {

    if (!jobPostingId || didFetchRef.current) return;

    didFetchRef.current = true; 
    async function fetchApplications() {
      setIsLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch(
          `/api/get-job-applications?jobPostingId=${jobPostingId}`
        );
        if (!res.ok) {
          setErrorMsg("Failed to fetch applications. Please try again.");
          setJobApplications([]);
        } else {
          const data = await res.json();
          console.log("d",data);
          setJobApplications(data || []);
        }
      } catch (err) {
        console.error("Error fetching job applicants:", err);
        setErrorMsg("An unexpected error occurred.");
        setJobApplications([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, [jobPostingId]);

  return (
    <div className="p-4">
      <div className="flex flex-row justify-start gap-x-40">
        <Button onClick={()=>router.back()}>View Job Posting</Button>
      <h1 className="text-2xl font-semibold mb-6">
        Job Applications for Posting:{" "}
        <span className="text-indigo-600">{jobPostingName}</span>
      </h1>
      </div>
      

      {isLoading && <p className="text-gray-500">Loading applications…</p>}

      {!isLoading && errorMsg && (
        <p className="text-red-500">{errorMsg}</p>
      )}

      {!isLoading && !errorMsg && jobApplications.length === 0 && (
        <p className="text-gray-600">
          No applications found for this job posting.
        </p>
      )}

      {!isLoading && !errorMsg && jobApplications.length > 0 && (
        <JobApplications jobApplications={jobApplications}/>
      )}
      
    </div>
  );
}
