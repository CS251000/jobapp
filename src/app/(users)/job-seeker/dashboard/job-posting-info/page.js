"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function JobPostingInfo() {
  const router= useRouter();
  const searchParams = useSearchParams();
  const jobPostingString = searchParams.get("jobPosting");
  const jobPosting = jobPostingString
    ? JSON.parse(decodeURIComponent(jobPostingString))
    : null;

  if (!jobPosting) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg font-medium">No job data found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Card */}
      <Card className="rounded-lg shadow-lg overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:justify-evenly md:items-center gap-4 bg-gradient-to-r from-indigo-50 to-emerald-50 p-4">
          

          <div className="flex-1 text-center md:text-left">
            <CardTitle className="text-2xl md:text-3xl font-extrabold text-gray-800">
              {jobPosting.jobTitle}
            </CardTitle>
            
            <CardDescription className="mt-1 text-sm text-gray-600">
              Category:{" "}
              <span className="font-medium text-indigo-700">
                {jobPosting.jobCategoryName||"N/A"}
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Badge */}
            <Badge className="bg-emerald-600 text-white font-semibold">
              {jobPosting.status || "N/A"}
            </Badge>

            {/* Job Type Badge */}
            <Badge className="bg-indigo-500 text-white font-medium">
              {jobPosting.jobType || "N/A"}
            </Badge>

            {/* Location Type Badge */}
            <Badge className="bg-amber-500 text-white font-medium">
              {jobPosting.jobLocationType || "N/A"}
            </Badge>
          </div>
        </CardHeader>

        {/* Divider */}
        <div className="border-b border-gray-200" />

        <CardContent className="space-y-6 p-6 bg-white">
          {/* Top Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-800">Location:</span>{" "}
                {`${jobPosting.jobLocationAddress || "N/A"}, ${jobPosting.jobLocationCity || "N/A"}, ${jobPosting.jobLocationState || "N/A"} - ${jobPosting.zipCode || "N/A"}`}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-800">Experience:</span>{" "}
                {jobPosting.experienceLevelRequired || "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-800">Salary:</span> ₹
                {jobPosting.salaryMin?.toLocaleString() || "N/A"} – ₹
                {jobPosting.salaryMax?.toLocaleString() || "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-800">
                  Application Deadline:
                </span>{" "}
                {jobPosting.applicationDeadline}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-800">Posted On:</span>{" "}
                {jobPosting.createdAt || "N/A"}
              </p>
            </div>

            {/* Right Column: Skills */}
            <div>
              <p className="font-semibold text-sm text-gray-800 mb-2">
                Skills Required:
              </p>
              <div className="flex flex-wrap gap-2">
                {jobPosting.skillsRequired.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-emerald-200 text-emerald-800 font-medium"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-200" />

          {/* Key Responsibilities */}
          <div>
            <p className="font-semibold text-sm text-gray-800 mb-1">
              Key Responsibilities
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {jobPosting.keyResponsibilities}
            </p>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-200" />

          {/* Qualifications */}
          <div>
            <p className="font-semibold text-sm text-gray-800 mb-1">
              Qualifications
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {jobPosting.requiredQualifications}
            </p>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-200" />

          {/* Job Description */}
          <div>
            <p className="font-semibold text-sm text-gray-800 mb-1">
              Job Description
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {jobPosting.jobDescription}
            </p>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-200" />

          {/* How to Apply */}
          <div>
            <p className="font-semibold text-sm text-gray-800 mb-1">
              How to Apply
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {jobPosting.howToApply}
            </p>
          </div>
        </CardContent>

      </Card>
    </div>
  );
}
