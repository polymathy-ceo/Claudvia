import { NextResponse } from "next/server";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { jsonError } from "@/lib/http";
import { createRateLimitBucket, getClientIp, isValidEmail } from "@/lib/security";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character);
}

export async function POST(request: Request) {
  let input: { name?: unknown; email?: unknown; subject?: unknown; message?: unknown; website?: unknown };
  try {
    input = (await request.json()) as typeof input;
  } catch {
    return jsonError("Please submit a valid form.", 400);
  }

  if (typeof input.website === "string" && input.website) {
    return NextResponse.json({ ok: true, message: "Your message has been received." });
  }
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  const allowedSubjects = ["General inquiry", "Partnership proposal", "Business inquiry", "Website feedback"];
  const subject = typeof input.subject === "string" && allowedSubjects.includes(input.subject) ? input.subject : "General inquiry";

  if (name.length < 1 || name.length > 120) return jsonError("Enter a name of 1–120 characters.", 400);
  if (!isValidEmail(email)) return jsonError("Enter a valid email address.", 400);
  if (message.length < 5 || message.length > 5000) return jsonError("Your message must be between 5 and 5,000 characters.", 400);
  if (!isEmailConfigured() || !process.env.CONTACT_EMAIL) {
    return jsonError("Contact delivery is not configured yet. Please try again later.", 503);
  }

  try {
    const store = await getStore();
    const attempts = await store.incrementRateLimit(createRateLimitBucket("contact", getClientIp(request)), Date.now(), 60 * 60 * 1000);
    if (attempts > 5) return jsonError("Too many messages from this connection. Please try again later.", 429);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
    await sendEmail({
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `[Claudvia website] ${subject}`,
      text: `New Claudvia website inquiry\n\nName: ${name}\nEmail: ${email}\nType: ${subject}\n\n${message}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#181a1d"><h1>New website inquiry</h1><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Type:</strong> ${escapeHtml(subject)}</p><hr /><p>${safeMessage}</p></div>`
    });
    return NextResponse.json({ ok: true, message: "Your inquiry has been sent. Thank you for contacting Claudvia." });
  } catch (error) {
    console.error("Claudvia contact submission failed.", error);
    return jsonError("We could not send your inquiry. Please try again later.", 500);
  }
}
