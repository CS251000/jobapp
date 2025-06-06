// File: app/api/get-job-postings/route.js
import { NextResponse } from "next/server";
import { db } from "@/db";                   // your Drizzle client (plain)
import { 
  jobPostings, 
  jobPostingSkills, 
  skills 
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "`companyId` query parameter is required." },
        { status: 400 }
      );
    }

    const postings = await db
      .select({
        jobPostingId:            jobPostings.jobPostingId,
        postedByClerkUserId:     jobPostings.postedByClerkUserId,
        jobTitle:                jobPostings.jobTitle,
        jobCategory:             jobPostings.jobCategory,
        jobType:                 jobPostings.jobType,
        jobLocationType:         jobPostings.jobLocationType,
        jobLocationAddress:      jobPostings.jobLocationAddress,
        jobLocationCity:         jobPostings.jobLocationCity,
        jobLocationState:        jobPostings.jobLocationState,
        zipCode:                 jobPostings.zipCode,
        jobRole:                 jobPostings.jobRole,
        applicationDeadline:     jobPostings.applicationDeadline,
        jobDescription:          jobPostings.jobDescription,
        keyResponsibilities:     jobPostings.keyResponsibilities,
        requiredQualifications:  jobPostings.requiredQualifications,
        experienceLevelRequired: jobPostings.experienceLevelRequired,
        salaryMin:               jobPostings.salaryMin,
        salaryMax:               jobPostings.salaryMax,
        howToApply:              jobPostings.howToApply,
        status:                  jobPostings.status,
        createdAt:               jobPostings.createdAt,
        updatedAt:               jobPostings.updatedAt,
      })
      .from(jobPostings)
      .where(eq(jobPostings.companyId, companyId));

    // If no postings found, return an empty array
    if (postings.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 2) Extract all jobPostingIds so we can fetch skills in one shot
    const postingIds = postings.map((p) => p.jobPostingId);

    //
    // 3) Fetch all skill‐name rows for those postings
    //
    const skillRows = await db
      .select({
        jobPostingId: jobPostingSkills.jobPostingId,
        skillName:    skills.skillName,
      })
      .from(jobPostingSkills)
      .leftJoin(skills, eq(skills.skillId, jobPostingSkills.skillId))
      .where(inArray(jobPostingSkills.jobPostingId, postingIds));

    // 4) Group skill names by jobPostingId
    const skillsMap = {};
    skillRows.forEach((row) => {
      const pid = row.jobPostingId;
      if (!skillsMap[pid]) {
        skillsMap[pid] = [];
      }

      if (row.skillName !== null) {
        skillsMap[pid].push(row.skillName);
      }
    });

    //
    // 5) Merge into final result array
    //
    const result = postings.map((jp) => {
      return {
        jobPostingId:           jp.jobPostingId,
        postedByClerkUserId:    jp.postedByClerkUserId,
        jobTitle:               jp.jobTitle,
        jobCategory:            jp.jobCategory,
        jobType:                jp.jobType,
        jobLocationType:        jp.jobLocationType,
        jobLocationAddress:     jp.jobLocationAddress,
        jobLocationCity:        jp.jobLocationCity,
        jobLocationState:       jp.jobLocationState,
        zipCode:                jp.zipCode,
        jobRole:                jp.jobRole,
        applicationDeadline:    jp.applicationDeadline,
        jobDescription:         jp.jobDescription,
        keyResponsibilities:    jp.keyResponsibilities,
        requiredQualifications: jp.requiredQualifications,
        experienceLevelRequired: jp.experienceLevelRequired,
        salaryMin:              jp.salaryMin,
        salaryMax:              jp.salaryMax,
        howToApply:             jp.howToApply,
        status:                 jp.status,
        createdAt:              jp.createdAt,
        updatedAt:              jp.updatedAt,
        skillsRequired:         skillsMap[jp.jobPostingId] || [],
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/get-job-postings:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
