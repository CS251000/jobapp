// app/job-seeker/dashboard/page.js
"use client";

import React, { use, useEffect, useState } from "react";
import SeekerJobApplicationsCard from "@/components/dashboard/seekerJobApplicationsCard";
import { useSearchParams,useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const jobSeekerId = searchParams.get("jobSeekerId");
  const router= useRouter();
  useEffect(() => {
    if (!jobSeekerId) return;
    console.log("JOB SEEKER ID:", jobSeekerId);

    setLoading(true);
    fetch(`/api/get-jobseeker-applications?jobSeekerId=${jobSeekerId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("RAW APPLICATIONS PAYLOAD:", data);
        // If the API returns a single object, wrap it in an array:
        if (!Array.isArray(data) && data.job_applications && data.job_postings) {
          setApplications([data]);
        } else {
          setApplications(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error(err);
        setApplications([]);
      })
      .finally(() => setLoading(false));
  }, [jobSeekerId]);

  const handleDelete = (deletedId) => {
    setApplications((prev) =>
      prev.filter(
        (item) => item.job_applications.jobApplicationId !== deletedId
      )
    );
  };

  if (loading || !jobSeekerId) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading…
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-row">
      <SeekerJobApplicationsCard
        applications={applications}
        onDelete={handleDelete}
      />
      <Button onClick={() => router.back()}>Go to Dashboard</Button>
    </div>
  );
}
