
import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  jobSeekerProfiles,
  jobSeekerDesiredJobRoles,
  jobSeekerDesiredJobTypes,
  jobSeekerPreferredJobLocationTypes,
  jobSeekerSkills,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "`userId` is required" }, { status: 400 });
    }

    // 1) Fetch the main profile row, if it exists
    const profile = await db
      .select({
        jobSeekerProfileId:     jobSeekerProfiles.jobSeekerProfileId,
        fullName:               jobSeekerProfiles.fullName,
        phone:                  jobSeekerProfiles.phone,
        email:                  jobSeekerProfiles.email,
        profilePictureUrl:      jobSeekerProfiles.profilePictureUrl,
        address:                jobSeekerProfiles.address,
        locationCity:           jobSeekerProfiles.locationCity,
        locationState:          jobSeekerProfiles.locationState,
        zipCode:                jobSeekerProfiles.zipCode,
        aboutMe:                jobSeekerProfiles.aboutMe,
        resumeFileUrl:          jobSeekerProfiles.resumeFileUrl,
        willingToRelocate:      jobSeekerProfiles.willingToRelocate,
        expectedSalaryMin:      jobSeekerProfiles.expectedSalaryMin,
        totalYearsOfExperience: jobSeekerProfiles.totalYearsOfExperience,
        availabilityStartDate:  jobSeekerProfiles.availabilityStartDate,
      })
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.clerkUserId, userId));

    if (profile.length === 0) {
      return NextResponse.json({ isExisting: false }, { status: 200 });
    }
    const row = profile[0];

    const rolesRows = await db
      .select({ desiredJobRoleId: jobSeekerDesiredJobRoles.desiredJobRoleId })
      .from(jobSeekerDesiredJobRoles)
      .where(eq(jobSeekerDesiredJobRoles.jobSeekerProfileId, row.jobSeekerProfileId));

    const desiredRoles = rolesRows.map((r) => r.desiredJobRoleId);
    const skillsRows = await db
      .select({ skillId: jobSeekerSkills.skillId })
      .from(jobSeekerSkills)
      .where(eq(jobSeekerSkills.jobSeekerProfileId, row.jobSeekerProfileId));

    const skillIds = skillsRows.map((r) => r.skillId);

    const typesRows = await db
      .select({ jobType: jobSeekerDesiredJobTypes.jobType })
      .from(jobSeekerDesiredJobTypes)
      .where(eq(jobSeekerDesiredJobTypes.jobSeekerProfileId, row.jobSeekerProfileId));

    const desiredTypes = typesRows.map((r) => r.jobType);

    const locRows = await db
      .select({ jobLocationType: jobSeekerPreferredJobLocationTypes.jobLocationType })
      .from(jobSeekerPreferredJobLocationTypes)
      .where(eq(jobSeekerPreferredJobLocationTypes.jobSeekerProfileId, row.jobSeekerProfileId));

    const preferredLocations = locRows.map((r) => r.jobLocationType);

    const result = {
      isExisting: true,
      jobSeekerProfileId:     row.jobSeekerProfileId,
      fullName:               row.fullName,
      phone:                  row.phone,
      email:                  row.email,
      profilePictureUrl:      row.profilePictureUrl,
      address:                row.address,
      locationCity:           row.locationCity,
      locationState:          row.locationState,
      zipCode:                row.zipCode,
      aboutMe:                row.aboutMe,
      resumeFileUrl:          row.resumeFileUrl,
      willingToRelocate:      row.willingToRelocate,
      expectedSalaryMin:      row.expectedSalaryMin,
      totalYearsOfExperience: row.totalYearsOfExperience,
      availabilityStartDate:  row.availabilityStartDate,
      jobRoles:               desiredRoles,       
      skills:                 skillIds,   
      desiredJobTypes:        desiredTypes,       
      preferredLocationTypes: preferredLocations,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/get-seeker-profile:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
