import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobPostings, jobPostingSkills } from "@/db/schema";

export async function POST(req) {
  const body = await req.json();
  const {
    companyId,
    postedByClerkUserId,
    jobTitle,
    jobCategory,
    jobType,
    jobLocationType,
    jobLocationAddress,
    jobLocationCity,
    jobLocationState,
    zipCode,
    jobRole,
    applicationDeadline,
    jobDescription,
    keyResponsibilities,
    requiredQualifications,
    experienceLevelRequired,
    salaryMin,
    salaryMax,
    howToApply,
    skills,
  } = body;

  if (
    !companyId ||
    !postedByClerkUserId ||
    !jobTitle ||
    !jobType ||
    !jobLocationType ||
    !applicationDeadline
  ) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  try {
    let newJobPostingId = null;

    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(jobPostings)
        .values({
          companyId,
          postedByClerkUserId,
          jobTitle,
          jobCategory: jobCategory || null,
          jobType,
          jobLocationType,
          jobLocationAddress: jobLocationAddress || null,
          jobLocationCity: jobLocationCity || null,
          jobLocationState: jobLocationState || null,
          zipCode: zipCode || null,
          jobRole: jobRole || null,
          applicationDeadline,
          jobDescription: jobDescription || null,
          keyResponsibilities: keyResponsibilities || null,
          requiredQualifications: requiredQualifications || null,
          experienceLevelRequired: experienceLevelRequired || null,
          salaryMin: salaryMin !== undefined ? salaryMin : null,
          salaryMax: salaryMax !== undefined ? salaryMax : null,
          howToApply: howToApply || null,
        })
        .returning({ jobPostingId: jobPostings.jobPostingId });

      newJobPostingId = inserted.jobPostingId;

      // 2. Insert associated skills if provided
      if (Array.isArray(skills) && skills.length > 0) {
        const skillRows = skills.map((s) => ({
          jobPostingId: newJobPostingId,
          skillId: s.skillId,
          skillType: s.skillType,
        }));
        await tx.insert(jobPostingSkills).values(skillRows);
      }
    });

    return NextResponse.json(
      { message: "Job posting created.", jobPostingId: newJobPostingId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job posting:", error);
    return NextResponse.json(
      { error: "Internal server error while creating job posting." },
      { status: 500 }
    );
  }
}
