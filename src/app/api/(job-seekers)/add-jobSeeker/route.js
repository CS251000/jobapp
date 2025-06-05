// app/api/add-jobSeeker/route.js
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  jobSeekerProfiles,
  jobSeekerDesiredJobRoles,
  jobSeekerDesiredJobTypes,
  jobSeekerPreferredJobLocationTypes,
  jobSeekerSkills,
  users,
} from "@/db/schema";

// Helper: delete all join‐table rows for a given seekerId
async function clearExistingJoins(seekerId) {
  await db
    .delete(jobSeekerDesiredJobRoles)
    .where(eq(jobSeekerDesiredJobRoles.jobSeekerProfileId, seekerId));

  await db
    .delete(jobSeekerDesiredJobTypes)
    .where(eq(jobSeekerDesiredJobTypes.jobSeekerProfileId, seekerId));

  await db
    .delete(jobSeekerPreferredJobLocationTypes)
    .where(eq(jobSeekerPreferredJobLocationTypes.jobSeekerProfileId, seekerId));

  await db
    .delete(jobSeekerSkills)
    .where(eq(jobSeekerSkills.jobSeekerProfileId, seekerId));
}

// ──────────────────────────────────────────────────────────────────────────────
// POST: create a brand‐new JobSeeker profile
// ──────────────────────────────────────────────────────────────────────────────
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
    jobRoles,       // Array<string>
    skills,         // Array<string>
    expectedSalary,
    experience,
    availability,   // Array<string>
    startDate,      // ISO date string
    jobLocation,    // Array<string>
    aboutMe,
    willingToRelocate,
    profilePictureUrl,
  } = body;

  try {
    // 1. Ensure “users” table has a row (ignore if it already exists)
    await db
      .insert(users)
      .values({
        clerkUserId: clerkId,
        email: email,
        role: "JobSeeker",
      })
      .onConflictDoNothing({ target: users.clerkUserId });

    // 2. Insert into jobSeekerProfiles; get back the new profile’s ID
    const [inserted] = await db
      .insert(jobSeekerProfiles)
      .values({
        clerkUserId,
        fullName,
        phone,
        resumeFileUrl: resumeUrl,
        email,
        locationCity: city,
        locationState: state,
        zipCode: zip,
        address,
        aboutMe,
        willingToRelocate,
        profilePictureUrl,
        totalYearsOfExperience: experience,
        expectedSalaryMin: expectedSalary,
        availabilityStartDate: startDate,
      })
      .returning({
        jobSeekerProfileId: jobSeekerProfiles.jobSeekerProfileId,
      });

    const seekerId = inserted.jobSeekerProfileId;

    // 3. Insert desired job roles (if any)
    if (Array.isArray(jobRoles) && jobRoles.length > 0) {
      const roleRows = jobRoles.map((roleId) => ({
        jobSeekerProfileId: seekerId,
        desiredJobRoleId: roleId,
      }));
      await db.insert(jobSeekerDesiredJobRoles).values(roleRows);
    }

    // 4. Insert desired job types (if any)
    if (Array.isArray(availability) && availability.length > 0) {
      const typeRows = availability.map((jobType) => ({
        jobSeekerProfileId: seekerId,
        jobType, // e.g. "Full-Time", "Part-Time", etc.
      }));
      await db.insert(jobSeekerDesiredJobTypes).values(typeRows);
    }

    // 5. Insert preferred job location types (if any)
    if (Array.isArray(jobLocation) && jobLocation.length > 0) {
      const locRows = jobLocation.map((locType) => ({
        jobSeekerProfileId: seekerId,
        jobLocationType: locType, // e.g. "Onsite", "Remote", "Hybrid"
      }));
      await db.insert(jobSeekerPreferredJobLocationTypes).values(locRows);
    }

    // 6. Insert skills (if any)
    if (Array.isArray(skills) && skills.length > 0) {
      const skillRows = skills.map((skillId) => ({
        jobSeekerProfileId: seekerId,
        skillId,
        isPrimary: false,
        yearsOfExperience: null,
        proficiencyLevel: null,
      }));
      await db.insert(jobSeekerSkills).values(skillRows);
    }

    return NextResponse.json(
      { message: "Job seeker profile created successfully." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error inserting job seeker (POST):", err);
    return NextResponse.json(
      { error: "Failed to create job seeker profile." },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// PUT: update an existing JobSeeker profile (when “isExisting” is true in frontend)
// ──────────────────────────────────────────────────────────────────────────────
export async function PUT(req) {
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
    jobRoles,       // Array<string>
    skills,         // Array<string>
    expectedSalary,
    experience,
    availability,   // Array<string>
    startDate,      // ISO date string
    jobLocation,    // Array<string>
    aboutMe,
    willingToRelocate,
    profilePictureUrl,
  } = body;

  try {
    // 1. Look up existing profile by clerkUserId
    const existing = await db
      .select({ id: jobSeekerProfiles.jobSeekerProfileId })
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.clerkUserId, clerkId))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: "No profile found to update." },
        { status: 404 }
      );
    }

    const seekerId = existing[0].id;

    // 2. Update the main jobSeekerProfiles row
    await db
      .update(jobSeekerProfiles)
      .set({
        fullName,
        phone,
        resumeFileUrl: resumeUrl,
        email,
        locationCity: city,
        locationState: state,
        zipCode: zip,
        address,
        aboutMe,
        willingToRelocate,
        profilePictureUrl,
        totalYearsOfExperience: experience,
        expectedSalaryMin: expectedSalary,
        availabilityStartDate: startDate,
      })
      .where(eq(jobSeekerProfiles.jobSeekerProfileId, seekerId));

    // 3. Clear out any existing join‐table rows for this seekerId
    await clearExistingJoins(seekerId);

    // 4. Re‐insert desired job roles (if any)
    if (Array.isArray(jobRoles) && jobRoles.length > 0) {
      const roleRows = jobRoles.map((roleId) => ({
        jobSeekerProfileId: seekerId,
        desiredJobRoleId: roleId,
      }));
      await db.insert(jobSeekerDesiredJobRoles).values(roleRows);
    }

    // 5. Re‐insert desired job types (if any)
    if (Array.isArray(availability) && availability.length > 0) {
      const typeRows = availability.map((jobType) => ({
        jobSeekerProfileId: seekerId,
        jobType,
      }));
      await db.insert(jobSeekerDesiredJobTypes).values(typeRows);
    }

    // 6. Re‐insert preferred job location types (if any)
    if (Array.isArray(jobLocation) && jobLocation.length > 0) {
      const locRows = jobLocation.map((locType) => ({
        jobSeekerProfileId: seekerId,
        jobLocationType: locType,
      }));
      await db.insert(jobSeekerPreferredJobLocationTypes).values(locRows);
    }

    // 7. Re‐insert skills (if any)
    if (Array.isArray(skills) && skills.length > 0) {
      const skillRows = skills.map((skillId) => ({
        jobSeekerProfileId: seekerId,
        skillId,
        isPrimary: false,
        yearsOfExperience: null,
        proficiencyLevel: null,
      }));
      await db.insert(jobSeekerSkills).values(skillRows);
    }

    return NextResponse.json(
      { message: "Job seeker profile updated successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating job seeker (PUT):", err);
    return NextResponse.json(
      { error: "Failed to update job seeker profile." },
      { status: 500 }
    );
  }
}
