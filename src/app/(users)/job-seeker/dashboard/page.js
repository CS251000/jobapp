'use client';
import GiverJobCard from '@/components/dashboard/giverJobCard';
import React, { useState } from 'react';

const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'Remote',
    type: 'Full-time',
    tags: ['React', 'Tailwind', 'TypeScript'],
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'CodeBase Ltd.',
    location: 'Bangalore',
    type: 'Part-time',
    tags: ['Node.js', 'PostgreSQL', 'Docker'],
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    company: 'Designify',
    location: 'Mumbai',
    type: 'Internship',
    tags: ['Figma', 'Adobe XD'],
  },
];

export default function JobSeekerDashboard() {

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-9">
          <h1 className="text-4xl font-extrabold text-center ">Find your ideal job now</h1>
        {/* Job List */}
        <div className=" mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockJobs.map((job) => (
            <GiverJobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}
