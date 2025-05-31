// app/api/skills/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { skills as skillsTable } from "@/db/schema";

export async function GET() {
  try {
    const allSkills = await db
      .select({
        skillId: skillsTable.skillId,
        skillName: skillsTable.skillName,
      })
      .from(skillsTable);

    return NextResponse.json(allSkills);
  } catch (err) {
    console.error("Error fetching skills:", err);
    return NextResponse.json(
      { error: "Could not fetch skills" },
      { status: 500 }
    );
  }
}
