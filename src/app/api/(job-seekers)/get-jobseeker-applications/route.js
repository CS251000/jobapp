import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobApplications,jobPostings,companyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req){
  const { searchParams } = new URL(req.url);
  const jobSeekerId= searchParams.get("jobSeekerId");
  if (!jobSeekerId) {
    return NextResponse.json(
      { error: "Job seeker ID is required." },
      { status: 400 }
    );
  }   
  try{
    const Applications = await db.select()
    .from(jobApplications).leftJoin(jobPostings, eq(jobPostings.jobPostingId, jobApplications.jobPostingId)).leftJoin(companyProfiles, eq(companyProfiles.companyId, jobPostings.companyId))
    .where(eq(jobApplications.jobSeekerProfileId, jobSeekerId));

    return NextResponse.json(Applications, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve job applications." },
      { status: 500 }
    );
  }
}
