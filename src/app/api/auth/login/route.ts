import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const user = await loginAdmin(parsed.email, parsed.password);

    if (!user) {
      return NextResponse.json({ error: "ভুল ইমেইল বা পাসওয়ার্ড" }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "লগইন ব্যর্থ" },
      { status: 400 }
    );
  }
}
