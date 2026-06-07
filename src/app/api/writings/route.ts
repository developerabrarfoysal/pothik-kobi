import { NextRequest, NextResponse } from "next/server";
import { getPublishedWritings } from "@/lib/queries/public";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") || undefined;
  const limit = Number(searchParams.get("limit")) || 10;

  const writings = await getPublishedWritings({ categorySlug: category, limit });
  return NextResponse.json({ writings });
}
