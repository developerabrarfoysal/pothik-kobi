import { NextRequest, NextResponse } from "next/server";
import { uploadMedia } from "@/lib/actions/media";
import { verifyAdminRequest } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const asset = await uploadMedia(formData);
    return NextResponse.json({ success: true, asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "আপলোড ব্যর্থ";
    const status = message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
