import { NextResponse } from "next/server";
import { db } from "@/db";
import { desiredJobRoles } from "@/db/schema";

export async function GET() {
  try {
    const roles = await db.select({
      desiredJobRoleId: desiredJobRoles.desiredJobRoleId,
      roleName: desiredJobRoles.roleName,
    }).from(desiredJobRoles);
    return NextResponse.json(roles);
  } catch (err) {
    console.error("Error fetching desired job roles:", err);
    return NextResponse.json({ error: "Could not fetch roles" }, { status: 500 });
  }
}
