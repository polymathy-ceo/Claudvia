import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, adminCookie, verifyAdminCredentials } from "@/lib/admin-auth";
import { getStore } from "@/lib/store";
import { createRateLimitBucket, getClientIp } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const store = await getStore();
    const bucket = createRateLimitBucket("admin-login", ip);
    if (await store.incrementRateLimit(bucket, Date.now(), 15 * 60 * 1000) > 8) {
      return NextResponse.json({ ok: false, message: "Too many login attempts. Try again in 15 minutes." }, { status: 429 });
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password || password.length > 200) {
      return NextResponse.json({ ok: false, message: "Enter your admin email and password." }, { status: 400 });
    }
    if (!(await verifyAdminCredentials(email, password))) {
      return NextResponse.json({ ok: false, message: "The email or password is incorrect." }, { status: 401 });
    }

    const session = createAdminSession(email);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminCookie.name, session.value, { ...adminCookie.options, maxAge: session.maxAge });
    return response;
  } catch {
    return NextResponse.json({ ok: false, message: "Admin login is not configured or the database is unavailable." }, { status: 503 });
  }
}
