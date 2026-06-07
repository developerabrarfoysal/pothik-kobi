import { NextRequest, NextResponse } from "next/server";
import { submitContactForm } from "@/lib/actions/admin";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = await checkRateLimit(`contact:${ip}`, 5, 60);

  if (!rate.success) {
    return NextResponse.json(
      { error: "অনেক বার চেষ্টা করা হয়েছে। পরে আবার চেষ্টা করুন।" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    await submitContactForm(body);
    return NextResponse.json({ success: true, message: "আপনার বার্তা পাঠানো হয়েছে" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "বার্তা পাঠাতে ব্যর্থ" },
      { status: 400 }
    );
  }
}
