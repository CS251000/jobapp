'use client';
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function JobApplicantCard({ applicant }) {
  return (
    <Card
      key={applicant.id}
      className="group transform transition hover:scale-[1.02] hover:shadow-lg rounded-xl overflow-hidden"
    >
      <CardHeader className="flex items-center gap-4 px-6 pt-6">
        <Avatar>
          {applicant.avatar ? (
            <AvatarImage src={applicant.avatar} alt={applicant.name} />
          ) : (
            <AvatarFallback>{applicant.name[0]}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
            {applicant.name}
          </CardTitle>
          <p className="text-sm text-gray-500">{applicant.currentRole}</p>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            {applicant.location}
          </Badge>
          <Badge variant="accent" className="bg-green-100 text-green-800">
            {applicant.experience} yrs
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Skills:</p>
          <div className="flex flex-wrap gap-2">
            {applicant.skills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="border-gray-200 text-white bg-black"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6">
        <Button variant="outline" className="mr-2 hover:cursor-pointer">
          View Profile
        </Button>
        <Button variant="secondary" className={"hover:cursor-pointer"}>
          Shortlist
        </Button>
      </CardFooter>
    </Card>
  );
}
