// app/api/job-seekers/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  jobSeekerProfiles,
  jobSeekerDesiredJobRoles,
  jobSeekerDesiredJobTypes,
  jobSeekerPreferredJobLocationTypes,
  jobSeekerSkills,
  users,
  skills,
  desiredJobRoles,
} from "@/db/schema";

export async function GET(req) {
  try {
    const allSeekers = await db.query.jobSeekerProfiles.findMany({
      with: {
        user: true,
        desiredRoles: {
          with: {
            role: true,
          },
        },
        desiredTypes: true,
        preferredLocationTypes: true,
        jobSeekerSkills: {
          with: {
            skill: true,
          },
        },
      },
      orderBy: (profiles, { asc }) => asc(profiles.fullName),
    });

    return NextResponse.json(allSeekers);
  } catch (err) {
    console.error("Error fetching all job seekers:", err);
    return NextResponse.json(
      { error: "Internal server error while fetching job seekers." },
      { status: 500 }
    );
  }
}
