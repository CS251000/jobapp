import { NextResponse } from "next/server";
import { db} from "@/db";
import { jobApplications } from "@/db/schema";

export async function POST(request) {
  const { jobSeekerId, jobPostingId } = await request.json();
  if (!jobSeekerId || !jobPostingId) {
    return NextResponse.json({ error: "Missing job seeker ID or job posting ID." }, { status: 400 });
  }
  try {
    await db.insert(jobApplications).values({
      jobSeekerProfileId: jobSeekerId,
      jobPostingId,
      applicationDate: new Date(),

  });
  return NextResponse.json({ message: "Application submitted successfully." });
}catch (error) {
  console.error("Error submitting job application:", error);
  return NextResponse.json({ error: "Failed to submit job application." }, { status: 500 });
}
}
