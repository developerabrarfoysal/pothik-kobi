import { NextRequest, NextResponse } from "next/server";
import { parseVideoUrl } from "@/lib/video-utils";
import { verifyAdminRequest } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    const parsed = parseVideoUrl(String(url || ""));
    if (!parsed) {
      return NextResponse.json({ error: "অবৈধ YouTube বা Facebook ভিডিও URL" }, { status: 400 });
    }
    return NextResponse.json({
      video: {
        embedUrl: parsed.embedUrl,
        thumbnail: parsed.thumbnail,
        title: "",
        provider: parsed.provider,
        originalUrl: parsed.originalUrl,
      },
    });
  } catch {
    return NextResponse.json({ error: "অবৈধ অনুরোধ" }, { status: 400 });
  }
}
