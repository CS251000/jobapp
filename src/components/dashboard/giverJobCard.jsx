"use client";
import React from 'react'
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


export default function GiverJobCard({job}) {
  return (
    <div>
      <Card key={job.id} 
      className="group transform transition hover:scale-[1.02] hover:shadow-lg rounded-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black group-hover:text-indigo-600 transition">
                  {job.title}
                </CardTitle>
                <p className="text-sm text-gray-500">{job.company}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{job.location}</Badge>
                  <Badge variant="secondary">{job.type}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Apply Now</Button>
              </CardFooter>
            </Card>
    </div>
  )
}
