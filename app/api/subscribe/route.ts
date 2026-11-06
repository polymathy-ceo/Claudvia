import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { jsonError } from "@/lib/http";
import { createConfirmationToken, createRateLimitBucket, createUnsubscribeToken, getBaseUrl, getClientIp, isValidEmail, sha256, CONSENT_TEXT_VERSION } from "@/lib/security";
import { getStore, type Subscriber } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let input: { email?: unknown; consent?: unknown; website?: unknown };
  try {
    input = (await request.json()) as typeof input;
  } catch {
    return jsonError("Please submit a valid form.", 400);
  }

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const consent = input.consent === true;
  const honeypot = typeof input.website === "string" ? input.website : "";
  if (honeypot) {
    return NextResponse.json({ ok: true, message: "If this address can be subscribed, check its inbox for instructions." });
  }
  if (!isValidEmail(email)) return jsonError("Enter a valid email address.", 400);
  if (!consent) return jsonError("Please agree to receive Claudvia company updates by email.", 400);
  if (!isEmailConfigured()) {
    return jsonError("Email confirmation is not configured yet, so subscriptions are not being collected. Please try again later.", 503);
  }

  try {
    const store = await getStore();
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;

    const ipBucket = createRateLimitBucket("subscribe-ip", getClientIp(request));
    if (await store.incrementRateLimit(ipBucket, now, windowMs) > 30) {
      return jsonError("Too many attempts. Please try again later.", 429);
    }

    const emailBucket = createRateLimitBucket("subscribe-email", email);
    if (await store.incrementRateLimit(emailBucket, now, windowMs) > 5) {
      return jsonError("Too many attempts. Please try again later.", 429);
    }

    const existing = await store.getSubscriberByEmail(email);
    if (existing?.status === "active") {
      return NextResponse.json({ ok: true, message: "If this address can be subscribed, check its inbox for instructions." });
    }

    const confirmationToken = createConfirmationToken();
    const unsubscribeToken = createUnsubscribeToken(email);
    const subscriber: Subscriber = {
      id: existing?.id ?? randomUUID(),
      email,
      status: "pending",
      consentedAt: now,
      consentTextVersion: CONSENT_TEXT_VERSION,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      confirmationTokenHash: sha256(confirmationToken),
      confirmationExpiresAt: now + 24 * 60 * 60 * 1000,
      unsubscribeTokenHash: sha256(unsubscribeToken),
      confirmedAt: null,
      unsubscribedAt: null
    };

    const saved = await store.savePendingSubscriber(subscriber);
    if (!saved) {
      return NextResponse.json({ ok: true, message: "If this address can be subscribed, check its inbox for instructions." });
    }

    const baseUrl = getBaseUrl();
    const confirmationUrl = `${baseUrl}/subscribe/confirm?token=${confirmationToken}`;
    await sendEmail({
      to: email,
      subject: "Confirm your Claudvia email updates",
      text: `You requested email updates from Claudvia. Confirm your subscription within 24 hours by opening this link:\n\n${confirmationUrl}\n\nIf you did not request this, you can ignore this email. No updates will be sent unless you confirm.`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#181a1d;max-width:560px;margin:auto"><p style="letter-spacing:.18em;font-size:12px">CLAUDVIA</p><h1 style="font-size:25px">Confirm your email updates</h1><p>You requested occasional company updates from Claudvia. Confirm within 24 hours to activate this subscription.</p><p><a href="${confirmationUrl}" style="display:inline-block;background:#f1f1f1;color:#111;padding:12px 18px;text-decoration:none;font-weight:bold">Confirm subscription</a></p><p>If you did not request this, ignore this email. No updates will be sent unless you confirm.</p></div>`
    });

    return NextResponse.json({ ok: true, message: "Check your inbox for a confirmation link. Your subscription is not active until you confirm it." });
  } catch (error) {
    console.error(
  "Claudvia subscription request failed:",
  error instanceof Error
    ? `${error.name}: ${error.message}`
    : String(error)
);
    return jsonError("We could not process this request. Please try again later.", 500);
  }
}
