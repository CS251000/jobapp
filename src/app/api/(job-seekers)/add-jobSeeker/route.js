import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  jobSeekerProfiles,
  jobSeekerDesiredJobRoles,
  jobSeekerDesiredJobTypes,
  jobSeekerPreferredJobLocationTypes,
  jobSeekerSkills,
  users,
} from "@/db/schema";

export async function POST(req) {
  const body = await req.json();

  const {
    clerkId,
    resumeUrl,
    fullName,
    email,
    phone,
    address,
    city,
    state,
    zip,
    jobRoles,       // Array<string> of desiredJobRoleId
    skills,         // Array<{ skillId: string }>
    expectedSalary,
    experience,
    availability,   // Array<string> of jobType enum
    startDate,      // ISO date string
    jobLocation,    // Array<string> of jobLocationType enum
    aboutMe,
    willingToRelocate,
    profilePictureUrl,
  } = body;

  try {
    await db
      .insert(users)
      .values({
        clerkUserId: clerkId,
        email: email,
        role: "JobSeeker",
      })
      .onConflictDoNothing({ target: users.clerkUserId });
    // 1. Insert into jobSeekerProfiles
    const [insertedProfile] = await db
      .insert(jobSeekerProfiles)
      .values({
        clerkUserId: clerkId,
        fullName: fullName,
        phone: phone,
        resumeFileUrl: resumeUrl,
        email: email,
        locationCity: city,
        locationState: state,
        zipCode: zip,
        address: address,
        aboutMe: aboutMe,
        willingToRelocate: willingToRelocate,
        profilePictureUrl: profilePictureUrl,
        totalYearsOfExperience: experience,
        expectedSalaryMin: expectedSalary,
        availabilityStartDate: startDate,
      })
      .returning({ jobSeekerProfileId: jobSeekerProfiles.jobSeekerProfileId });

    const seekerId = insertedProfile.jobSeekerProfileId;

    if (Array.isArray(jobRoles) && jobRoles.length > 0) {
      const roleRows = jobRoles.map((roleId) => ({
        jobSeekerProfileId: seekerId,
        desiredJobRoleId: roleId,
      }));
      await db.insert(jobSeekerDesiredJobRoles).values(roleRows);
    }

    // 3. Insert desired job‐types (enum values)
    if (Array.isArray(availability) && availability.length > 0) {
      const typeRows = availability.map((jobType) => ({
        jobSeekerProfileId: seekerId,
        jobType: jobType, // must be "Full-Time" | "Part-Time" | "Contract" | "Internship" | "Temporary"
      }));
      await db.insert(jobSeekerDesiredJobTypes).values(typeRows);
    }

    // 4. Insert preferred job‐location types (enum values)
    if (Array.isArray(jobLocation) && jobLocation.length > 0) {
      const locRows = jobLocation.map((locType) => ({
        jobSeekerProfileId: seekerId,
        jobLocationType: locType, // must be "Onsite" | "Remote" | "Hybrid"
      }));
      await db.insert(jobSeekerPreferredJobLocationTypes).values(locRows);
    }

    // 5. Insert skills (if provided)
    //    Each element is { skillId: string, … }. We only require the skillId.
    if (Array.isArray(skills) && skills.length > 0) {
      const skillRows = skills.map((s) => ({
        jobSeekerProfileId: seekerId,
        skillId: s.skillId,
        isPrimary: s.isPrimary ?? false,
        yearsOfExperience: s.yearsOfExperience ?? null,
        proficiencyLevel: s.proficiencyLevel ?? null,
      }));
      await db.insert(jobSeekerSkills).values(skillRows);
    }

    return NextResponse.json(
      { message: "Job seeker profile created successfully." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error inserting job seeker:", err);
    return NextResponse.json(
      { error: "Failed to add job seeker information." },
      { status: 500 }
    );
  }
}
