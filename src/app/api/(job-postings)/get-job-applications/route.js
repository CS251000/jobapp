// src/app/api/(job-postings)/get-job-applications/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import {
  jobApplications,
  jobSeekerProfiles,
  jobSeekerSkills,
  skills,
  jobSeekerDesiredJobRoles,
  desiredJobRoles,
  jobSeekerDesiredJobTypes,
  jobSeekerPreferredJobLocationTypes,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const jobPostingId = searchParams.get("jobPostingId");
    if (!jobPostingId) {
      return NextResponse.json(
        { error: "`jobPostingId` query parameter is required." },
        { status: 400 }
      );
    }

    // 1) Fetch base application + profile info
    const apps = await db
      .select({
        jobApplicationId: jobApplications.jobApplicationId,
        applicationDate: jobApplications.applicationDate,
        status: jobApplications.status,
        coverLetter: jobApplications.coverLetterText,
        resumeUrl: jobApplications.seekerResumeUrlAtApplication,
        seekerProfileId: jobApplications.jobSeekerProfileId,
        name: jobSeekerProfiles.fullName,
        email: jobSeekerProfiles.email,
        phone: jobSeekerProfiles.phone,
        city: jobSeekerProfiles.locationCity,
        state: jobSeekerProfiles.locationState,
        willingToRelocate: jobSeekerProfiles.willingToRelocate,
      })
      .from(jobApplications)
      .leftJoin(
        jobSeekerProfiles,
        eq(jobApplications.jobSeekerProfileId, jobSeekerProfiles.jobSeekerProfileId)
      )
      .where(eq(jobApplications.jobPostingId, jobPostingId));

    if (apps.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const seekerIds = [...new Set(apps.map((a) => a.seekerProfileId))];

    // 2) Fetch skills
    const rawSkills = await db
      .select({
        seekerProfileId: jobSeekerSkills.jobSeekerProfileId,
        skillName: skills.skillName,
      })
      .from(jobSeekerSkills)
      .leftJoin(skills, eq(jobSeekerSkills.skillId, skills.skillId))
      .where(inArray(jobSeekerSkills.jobSeekerProfileId, seekerIds));

    // 3) Desired roles
    const rawRoles = await db
      .select({
        seekerProfileId: jobSeekerDesiredJobRoles.jobSeekerProfileId,
        roleName: desiredJobRoles.roleName,
      })
      .from(jobSeekerDesiredJobRoles)
      .leftJoin(
        desiredJobRoles,
        eq(jobSeekerDesiredJobRoles.desiredJobRoleId, desiredJobRoles.desiredJobRoleId)
      )
      .where(inArray(jobSeekerDesiredJobRoles.jobSeekerProfileId, seekerIds));

    // 4) Desired job types
    const rawTypes = await db
      .select({
        seekerProfileId: jobSeekerDesiredJobTypes.jobSeekerProfileId,
        jobType: jobSeekerDesiredJobTypes.jobType,
      })
      .from(jobSeekerDesiredJobTypes)
      .where(inArray(jobSeekerDesiredJobTypes.jobSeekerProfileId, seekerIds));

    // 5) Preferred location types
    const rawLocTypes = await db
      .select({
        seekerProfileId: jobSeekerPreferredJobLocationTypes.jobSeekerProfileId,
        jobLocationType: jobSeekerPreferredJobLocationTypes.jobLocationType,
      })
      .from(jobSeekerPreferredJobLocationTypes)
      .where(inArray(jobSeekerPreferredJobLocationTypes.jobSeekerProfileId, seekerIds));

    const groupBy =(arr) =>
      arr.reduce((acc, cur) => {
        (acc[cur.seekerProfileId] ||= []).push(cur);
        return acc;
      }, {});

    const skillsBySeeker = groupBy(rawSkills);
    const rolesBySeeker = groupBy(rawRoles);
    const typesBySeeker = groupBy(rawTypes);
    const locTypesBySeeker = groupBy(rawLocTypes);

    // 6) Assemble final shape
    const enriched = apps.map((app) => ({
      jobApplicationId: app.jobApplicationId,
      applicationDate: app.applicationDate,
      status: app.status,
      coverLetter: app.coverLetter,
      resumeUrl: app.resumeUrl,
      name: app.name,
      email: app.email,
      phone: app.phone,
      city: app.city,
      state: app.state,
      willingToRelocate: app.willingToRelocate,
      skills: (skillsBySeeker[app.seekerProfileId] || []).map((r) => r.skillName),
      desiredRoles: (rolesBySeeker[app.seekerProfileId] || []).map((r) => r.roleName),
      desiredJobTypes: (typesBySeeker[app.seekerProfileId] || []).map((r) => r.jobType),
      preferredLocationTypes: (locTypesBySeeker[app.seekerProfileId] || []).map(
        (r) => r.jobLocationType
      ),
    }));

    return NextResponse.json(enriched, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/get-job-applications:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
