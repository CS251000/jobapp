import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/constants'
import Link from 'next/link'




export default function GiverJobCard({ jobPostings}) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-4">
      {jobPostings.map((job) => (
        <Card
          key={job.jobPostingId}
          className={`flex flex-col justify-between w-auto bg-[#FDF0D5]`}
        >
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">{job.jobTitle}</CardTitle>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className={'bg-[#003049] text-[#FDF0D5] font-bold'}>{job.jobType}</Badge>
              <Badge variant="outline" className={'bg-[]#FDF0D5 border border-[#003049] font-bold'}>{job.jobLocationType}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {job.jobCategory && (
              <p className="text-sm text-[#003049]">
                <strong>Category:</strong> {job.jobCategory}
              </p>
            )}

            <p className="text-sm text-[#003049]">
              <strong>Location:</strong>{' '}
              {[job.jobLocationCity, job.jobLocationState, job.zipCode]
                .filter(Boolean)
                .join(', ')}
            </p>

            {job.salaryMin != null && job.salaryMax != null && (
              <p className="text-sm text-[#003049]">
                <strong>Salary:</strong> ₹{job.salaryMin} – ₹{job.salaryMax}
              </p>
            )}

            <p className="text-sm text-[#003049]">
              <strong>Deadline:</strong>{' '}
              {formatDate( new Date(job.applicationDeadline))}
            </p>

            <p className="text-sm text-[#003049]">
              <strong>Status:</strong> {job.status}
            </p>

          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            <Link
            href={{
              pathname:'/job-seeker/dashboard/job-posting-info',
              query:{
                jobPosting:encodeURIComponent(JSON.stringify(job)),
              }
            }}>
            <Button size="sm" className={'bg-[#003049] text-[#FDF0D5]'}>
              Info
            </Button>
            </Link>
            
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
