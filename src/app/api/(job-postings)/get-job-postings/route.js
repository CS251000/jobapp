// app/api/get-job-postings/route.ts
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  companyProfiles,
  jobPostings,
  jobPostingSkills,
  skills,
} from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET() {
  try {

    const rawPostings = await db
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
        companyName:         companyProfiles.companyName,
      })
      .from(jobPostings)
      .leftJoin(
        companyProfiles,
        eq(companyProfiles.companyId, jobPostings.companyId)
      )

    if (rawPostings.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const postingIds = rawPostings.map((p) => p.jobPostingId);
    const skillRows = await db
      .select({
        jobPostingId: jobPostingSkills.jobPostingId,
        skillName:    skills.skillName,
      })
      .from(jobPostingSkills)
      .leftJoin(skills, eq(skills.skillId, jobPostingSkills.skillId))
      .where(inArray(jobPostingSkills.jobPostingId, postingIds));

    // 4) Group skills by postingId
    const skillsMap= {};
    for (const { jobPostingId, skillName } of skillRows) {
      if (!skillsMap[jobPostingId]) skillsMap[jobPostingId] = [];
      if (skillName) skillsMap[jobPostingId].push(skillName);
    }

    // 5) Merge into final shape
    const result = rawPostings.map((p) => ({
      ...p,
      skillsRequired: skillsMap[p.jobPostingId] || [],
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('GET /api/get-job-postings error', err);
    return NextResponse.json(
      { error: err.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
