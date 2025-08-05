import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";

export async function GET() {
  try {
    const categoriesList = await db.select({
      categoryId: categories.categoryId,
      categoryName: categories.categoryName,
    }).from(categories);
    return NextResponse.json(categoriesList);
  } catch (err) {
    console.error("Error fetching job categories:", err);
    return NextResponse.json({ error: "Could not fetch categories" }, { status: 500 });
  }
}


