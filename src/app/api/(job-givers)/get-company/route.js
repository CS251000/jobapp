import { NextResponse } from 'next/server'
import { db } from '@/db'
import { companyProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const uploaderId = searchParams.get('uploaderId')

    if (!uploaderId) {
      return NextResponse.json(
        { error: '`uploaderId` query parameter is required.' },
        { status: 400 }
      )
    }

    const rows = await db
      .select({
        companyId:      companyProfiles.companyId,
        companyName:    companyProfiles.companyName??"",
        contactPerson:  companyProfiles.contactPerson??"",
        email:          companyProfiles.email??"",
        phone:          companyProfiles.phone??"",
        website:        companyProfiles.website??"",
        address:        companyProfiles.address??"",
        city:           companyProfiles.city??"",
        state:          companyProfiles.state??"",
        zipCode:        companyProfiles.zipCode??"",
        companyLogoUrl: companyProfiles.companyLogoUrl??"",
        aboutCompany:   companyProfiles.aboutCompany??"",
      })
      .from(companyProfiles)
      .where(eq(companyProfiles.clerkUserId, uploaderId))
      .limit(1)

    const company = rows[0] || null

    if (!company) {
      return NextResponse.json({ isExisting: false }, { status: 200 })
    }

    return NextResponse.json(
      {
        isExisting: true,
        companyId:       company.companyId,
        companyName:     company.companyName,
        contactPerson:   company.contactPerson   ?? null,
        email:           company.email           ?? null,
        phone:           company.phone           ?? null,
        website:         company.website         ?? null,
        address:         company.address         ?? null,
        city:            company.city            ?? null,
        state:           company.state           ?? null,
        zipCode:         company.zipCode         ?? null,
        companyLogoUrl:  company.companyLogoUrl  ?? null,
        aboutCompany:    company.aboutCompany    ?? null,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error in GET /api/get-company:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
