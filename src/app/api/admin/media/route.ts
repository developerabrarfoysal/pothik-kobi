import { NextResponse } from "next/server";
import { getMediaLibrary } from "@/lib/actions/media";
import { verifyAdminRequest } from "@/lib/api-auth";

export async function GET() {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getMediaLibrary(1, 100);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
