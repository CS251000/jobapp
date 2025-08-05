import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobPostings, jobPostingSkills, jobPostingCategories } from "@/db/schema";

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
    vacancies,
    minAge,
    maxAge,
    languages,
    jobTimingStartTime,
    jobTimingEndTime,
    jobTimingDays,
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

  // Validate required fields
  if (
    !companyId ||
    !postedByClerkUserId ||
    !jobTitle?.trim() ||
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
    let newJobId;

    await db.transaction(async (tx) => {
      // Insert job posting with all columns
      const [created] = await tx
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
          jobRole: Array.isArray(jobRole) ? jobRole : [],
          vacancies: vacancies ?? 1,
          minAge: minAge ?? null,
          maxAge: maxAge ?? null,
          languages: Array.isArray(languages) ? languages : [],
          jobTimingStartTime: jobTimingStartTime || null,
          jobTimingEndTime: jobTimingEndTime || null,
          jobTimingDays: Array.isArray(jobTimingDays) ? jobTimingDays : [],
          applicationDeadline,
          jobDescription: jobDescription || null,
          keyResponsibilities: keyResponsibilities || null,
          requiredQualifications: requiredQualifications || null,
          experienceLevelRequired: experienceLevelRequired || null,
          salaryMin: salaryMin ?? null,
          salaryMax: salaryMax ?? null,
          howToApply: howToApply || null,
        })
        .returning({ jobPostingId: jobPostings.jobPostingId });

      newJobId = created.jobPostingId;

      // Associate skills
      if (Array.isArray(skills) && skills.length) {
        const skillInserts = skills.map(({ skillId, skillType }) => ({
          jobPostingId: newJobId,
          skillId,
          skillType,
        }));
        await tx.insert(jobPostingSkills).values(skillInserts);
      }

      // Associate category
      if (jobCategory) {
        await tx.insert(jobPostingCategories).values({
          jobPostingId: newJobId,
          categoryId: jobCategory,
        });
      }
    });

    return NextResponse.json(
      { message: "Job posting created", jobPostingId: newJobId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating job posting:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
