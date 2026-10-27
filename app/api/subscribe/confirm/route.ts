import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getBaseUrl, sha256, createUnsubscribeToken } from "@/lib/security";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    return NextResponse.redirect(new URL("/subscribe/invalid", request.url), 303);
  }

  try {
    const store = await getStore();
    const tokenHash = sha256(token);
    const subscriber = await store.getSubscriberByConfirmationHash(tokenHash);
    const now = Date.now();
    if (!subscriber || subscriber.status !== "pending" || !subscriber.confirmationExpiresAt || subscriber.confirmationExpiresAt <= now) {
      return NextResponse.redirect(new URL("/subscribe/invalid", request.url), 303);
    }

    const activated = await store.activateByConfirmationHash(tokenHash, now);
    if (!activated) return NextResponse.redirect(new URL("/subscribe/invalid", request.url), 303);

    try {
      const unsubscribeUrl = `${getBaseUrl()}/unsubscribe?token=${createUnsubscribeToken(subscriber.email)}`;
      await sendEmail({
        to: subscriber.email,
        subject: "You're subscribed to Claudvia updates",
        text: `Your email address is confirmed. You will receive occasional company updates from Claudvia. To unsubscribe, open: ${unsubscribeUrl}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#181a1d;max-width:560px;margin:auto"><p style="letter-spacing:.18em;font-size:12px">CLAUDVIA</p><h1 style="font-size:25px">Subscription confirmed</h1><p>Your email address is confirmed. You will receive occasional company updates from Claudvia.</p><p><a href="${unsubscribeUrl}">Unsubscribe from future updates</a></p></div>`
      });
    } catch (error) {
      // Subscription remains active; failure of this optional receipt does not undo confirmation.
      console.error("Claudvia subscription receipt could not be sent.", error);
    }

    return NextResponse.redirect(new URL("/subscribe/confirmed", request.url), 303);
  } catch (error) {
    console.error("Claudvia subscription confirmation failed.", error);
    return NextResponse.redirect(new URL("/subscribe/invalid", request.url), 303);
  }
}
