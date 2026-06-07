import { NextResponse } from "next/server";
import { getData, getNeonSql } from "@/lib/neon-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getNeonSql();

    const health = await getData();

    const pages = await sql`
      SELECT COUNT(*)::int AS count
      FROM "Page"
    `;

    const navigation = await sql`
      SELECT COUNT(*)::int AS count
      FROM "NavigationItem"
    `;

    const writings = await sql`
      SELECT COUNT(*)::int AS count
      FROM "Writing"
    `;

    return NextResponse.json({
      ok: true,
      driver: "@neondatabase/serverless",
      database: health[0],
      counts: {
        pages: pages[0]?.count ?? 0,
        navigation: navigation[0]?.count ?? 0,
        writings: writings[0]?.count ?? 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
