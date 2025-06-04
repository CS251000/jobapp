// app/api/company-profile/route.js

import { NextResponse } from "next/server"
import { db } from "@/db"
import { users, companyProfiles } from "@/db/schema"

export async function POST(req) {
  const body = await req.json()
  const {
    clerkId,
    companyName,
    contactPerson,
    email,
    phone,
    website,
    address,
    city,
    state,
    zip,
    companyLogoUrl,
    aboutCompany,
  } = body

  if (!clerkId || !companyName) {
    return NextResponse.json(
      { error: "Missing required fields: `clerkId` and `companyName`." },
      { status: 400 }
    )
  }

  try {
    let returnedCompanyId = null

    // Wrap in a transaction so we can do an upsert and grab the companyId
    await db.transaction(async (tx) => {
      // 1. Upsert into users
      await tx
        .insert(users)
        .values({
          clerkUserId: clerkId,
          email: email || null,
          role: "JobGiver",
        })
        .onConflictDoNothing({ target: users.clerkUserId })

      // 2. Upsert into company_profiles and return companyId
      const [companyRow] = await tx
        .insert(companyProfiles)
        .values({
          clerkUserId: clerkId,
          companyName,
          contactPerson: contactPerson || null,
          email: email || null,
          phone: phone || null,
          website: website || null,
          address: address || null,
          city: city || null,
          state: state || null,
          zipCode: zip || null,
          companyLogoUrl: companyLogoUrl || null,
          aboutCompany: aboutCompany || null,
        })
        .onConflictDoUpdate({
          target: companyProfiles.clerkUserId,
          set: {
            companyName,
            contactPerson: contactPerson || null,
            email: email || null,
            phone: phone || null,
            website: website || null,
            address: address || null,
            city: city || null,
            state: state || null,
            zipCode: zip || null,
            companyLogoUrl: companyLogoUrl || null,
            aboutCompany: aboutCompany || null,
          },
        })
        .returning({
          companyId: companyProfiles.companyId,
        })

      returnedCompanyId = companyRow.companyId
    })

    return NextResponse.json(
      {
        message: "Company profile saved successfully.",
        companyId: returnedCompanyId,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("Error in add/update company profile:", err)
    return NextResponse.json(
      { error: "Internal server error while saving company profile." },
      { status: 500 }
    )
  }
}
