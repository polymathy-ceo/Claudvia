import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export function safeInternalRedirect(path: string) {
  // Only fixed, same-site paths should be passed to this helper.
  return NextResponse.redirect(new URL(path, getRequestOriginFallback()));
}

function getRequestOriginFallback(): string {
  const value = process.env.APP_BASE_URL;
  if (value) return value;
  return "http://localhost:3000";
}
