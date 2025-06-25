// src/components/JobApplications.tsx
"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";



export default function JobApplications({ jobApplications,onDelete}) {
  const[isMember,setIsMember]= useState(true);
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {jobApplications.map((app) => (
        <Card
          key={app.jobApplicationId}
          className="bg-[#F7F7FF] text-[#545E75] hover:shadow-lg transition-shadow duration-200"
        >
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">
              {app.name}
            </CardTitle>
            <p className="text-sm text-gray-500">
              Applied on{" "}
              {new Date(app.applicationDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {app.skills.map((skill) => (
                <Badge key={skill} className={'bg-[#F2D0A4] text-[#545E75] text-sm'}>
                  {skill}
                </Badge>
              ))}
            </div>
            {app.willingToRelocate !== undefined && (
              <p>
                <strong>Relocate:</strong>{" "}
                {app.willingToRelocate ? "Yes" : "No"}
              </p>
            )}
            {app.desiredRoles.length > 0 && (
              <p>
                <strong>Desired Roles:</strong>{" "}
                {app.desiredRoles.join(", ")}
              </p>
            )}
            {app.desiredJobTypes.length > 0 && (
              <p>
                <strong>Job Types:</strong>{" "}
                {app.desiredJobTypes.join(", ")}
              </p>
            )}
            {app.preferredLocationTypes.length > 0 && (
              <p>
                <strong>Locations:</strong>{" "}
                {app.preferredLocationTypes.join(", ")}
              </p>
            )}
            {app.coverLetter && (
              <details>
                <summary className="cursor-pointer text-sm text-blue-600">
                  View Cover Letter
                </summary>
                <p className="mt-2 text-sm text-gray-700">
                  {app.coverLetter}
                </p>
              </details>
            )}
            {app.resumeUrl && (
              <p>
                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Download Resume
                </a>
              </p>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex flex-row justify-between gap-6">
              <Button className='bg-[#3F826D] text-[#F7F7FF]'>View Complete Profile</Button>
              <Button className='bg-[#C03221] text-[#F7F7FF]'
              onClick={()=>onDelete(app.jobApplicationId)}
              >Reject Application</Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
