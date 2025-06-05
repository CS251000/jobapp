import { db } from "@/db";
import { jobPostings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobPostingId = searchParams.get('jobPostingId');

    if (!jobPostingId) {
      return NextResponse.json(
        { error: '`jobPostingId` query parameter is required.' },
        { status: 400 }
      );
    }
    const deleted = await db
      .delete(jobPostings)
      .where(eq(jobPostings.jobPostingId, jobPostingId));

    return NextResponse.json(
      { message: 'Job posting deleted successfully.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in DELETE /api/job-postings:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}