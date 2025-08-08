// components/SeekerJobApplicationsCard.jsx
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

export default function SeekerJobApplicationsCard({ applications, onDelete }) {
  const handleDelete = async (applicationId) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    try {
      const res = await fetch(
        `/api/delete-application?applicationId=${applicationId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete");
      onDelete(applicationId);
    } catch (err) {
      console.error(err);
      alert("Could not delete application.");
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-4">
      {applications.map(({ job_applications: app, job_postings: job, company_profiles: company }) => (
        <Card key={app.jobApplicationId} className="flex flex-col justify-between bg-[#FDF0D5]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{job.jobTitle}</CardTitle>
            <p className="text-sm text-[#003049]">
              <strong>{company.companyName || "Unknown Company"}</strong>
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge className="bg-[#003049] text-[#FDF0D5] font-bold">{job.jobType}</Badge>
              <Badge className="border border-[#003049] text-[#FDF0D5] font-bold">
                {job.jobLocationType}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 text-[#003049]">
            <p>
              <strong>Applied On:</strong>{" "}
              {format(new Date(app.applicationDate), "PPP p")}
            </p>

            <p>
              <strong>Deadline:</strong>{" "}
              {format(new Date(job.applicationDeadline), "PPP")}
            </p>

            <p>
              <strong>Status:</strong> {app.status}
            </p>

            {job.salaryMin != null && job.salaryMax != null && (
              <p>
                <strong>Salary:</strong> ₹{job.salaryMin}–₹{job.salaryMax}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            {/* Info button passes jobPostingId via query string */}
            <Link
              href={{
                pathname: "/job-seeker/dashboard/job-posting-info",
                query: {
                  jobPostingId: job.jobPostingId,
                },
              }}
            >
              <Button size="sm" className="bg-[#003049] text-[#FDF0D5]">
                Info
              </Button>
            </Link>

            {/* Delete/Withdraw application */}
            <Button
              size="sm"
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => handleDelete(app.jobApplicationId)}
            >
              Withdraw
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
