'use client';
import React, { useState } from 'react';
import JobApplicantCard from '@/components/dashboard/jobApplicant';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockApplicants = [
  {
    id: 1,
    name: 'Aisha Khan',
    avatar: '',
    currentRole: 'Software Engineer',
    location: 'Delhi',
    experience: 3,
    skills: ['JavaScript', 'React', 'Node.js'],
  },
  {
    id: 2,
    name: 'Rohan Verma',
    avatar: '',
    currentRole: 'Data Analyst',
    location: 'Mumbai',
    experience: 2,
    skills: ['Python', 'SQL', 'Tableau'],
  },
  {
    id: 3,
    name: 'Neha Patel',
    avatar: '',
    currentRole: 'UI/UX Designer',
    location: 'Bengaluru',
    experience: 4,
    skills: ['Figma', 'Adobe XD', 'Sketch'],
  },
];

export default function JobApplicantsPage() {


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Job Applicants</h1>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockApplicants.map((applicant) => (
            <JobApplicantCard key={applicant.id} applicant={applicant} />
          ))}
        </div>
      </div>
    </div>
  );
}
