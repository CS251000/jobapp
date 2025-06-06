import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req){
  try{
    const {searchParams}= new URL(req.url);
    const jobPostingId= searchParams.get('jobPostingId');
    if (!jobPostingId) {
      return NextResponse.json(
        { error: "`jobPostingId` query parameter is required." },
        { status: 400 }
      );
    }
    const applications = await db
    .select().from(jobApplications)
    .where(eq(jobApplications.jobPostingId,jobPostingId));

    if (applications.length === 0) {
          return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(applications, { status: 200 });

  }catch(err){
    console.error("Error in GET /api/get-job-applications:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
