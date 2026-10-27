import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { sha256 } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    return NextResponse.redirect(new URL("/unsubscribe?invalid=1", request.url), 303);
  }

  try {
    const store = await getStore();
    const tokenHash = sha256(token);
    const subscriber = await store.getSubscriberByUnsubscribeHash(tokenHash);
    if (!subscriber) return NextResponse.redirect(new URL("/unsubscribe?invalid=1", request.url), 303);
    if (subscriber.status !== "unsubscribed") {
      const updated = await store.unsubscribeByTokenHash(tokenHash, Date.now());
      if (!updated) return NextResponse.redirect(new URL("/unsubscribe?invalid=1", request.url), 303);
    }
    return NextResponse.redirect(new URL("/unsubscribe?success=1", request.url), 303);
  } catch (error) {
    console.error("Claudvia unsubscribe request failed.", error);
    return NextResponse.redirect(new URL("/unsubscribe?invalid=1", request.url), 303);
  }
}
