import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/constants'
import Link from 'next/link'
import { useRouter } from 'next/navigation'


export default function GiverJobPostingCard({ jobPostings,onDelete}) {
  const router = useRouter();
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-4">
      {jobPostings.map((job) => (
        <Card
          key={job.jobPostingId}
          className={`flex flex-col justify-between w-auto bg-[#FDF0D5]`}
        >
          <CardHeader className="space-y-2">
            <div className='flex flex-row justify-between'>
            <CardTitle className="text-2xl">{job.jobTitle}</CardTitle>
            <Link
            href={{
              pathname:'/job-giver/dashboard/job-posting-info',
              query:{
                jobPosting:encodeURIComponent(JSON.stringify(job)),
              }
            }}>
            <Button size="sm">
              Info
            </Button>
            </Link>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className={'bg-[#003049] text-[#FDF0D5] font-bold'}>{job.jobType}</Badge>
              <Badge variant="outline" className={'bg-[]#FDF0D5 border border-[#003049] font-bold'}>{job.jobLocationType}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {job.jobCategory && (
              <p className="text-sm text-[#003049]">
                <strong>Category:</strong> {job.jobCategoryName}
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

          <CardFooter className="flex flex-row justify-between">  
            <Button size="sm" className={'bg-[#003049] text-[#FDF0D5]'}
            onClick={()=>router.push(`dashboard/job-posting-info/job-applications?jobPostingId=${job.jobPostingId}&jobPostingName=${job.jobTitle}`)}
            >
              {job.applicantsCount} Applications
            </Button>

            <Link
            href={""}>
            <Button size="sm" className={'bg-[#003049] text-[#FDF0D5]'}>
               Suggestions
            </Button>
            </Link>
            
            <Button size="sm" className={'bg-[#C1121F] text-[#FDF0D5] hover:bg-[#780000]'}
            onClick={()=>onDelete(job.jobPostingId)}
            >
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
