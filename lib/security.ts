import { createHash, createHmac, randomBytes } from "node:crypto";

export const CONSENT_TEXT_VERSION = "2026-10-27";

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function createConfirmationToken(): string {
  return randomBytes(32).toString("hex");
}

function tokenSecret(): string {
  const value = process.env.CLAUDVIA_TOKEN_SECRET;
  if (process.env.NODE_ENV === "production" && (!value || value.length < 32)) {
    throw new Error("CLAUDVIA_TOKEN_SECRET must be set to at least 32 characters in production.");
  }
  return value || "local-development-secret-not-for-production";
}

export function createUnsubscribeToken(email: string): string {
  return createHmac("sha256", tokenSecret())
    .update(`claudvia:unsubscribe:${email.trim().toLowerCase()}`)
    .digest("hex");
}

export function createRateLimitBucket(scope: string, clientIp: string): string {
  const secret = process.env.CLAUDVIA_RATE_LIMIT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("CLAUDVIA_RATE_LIMIT_SECRET must be set to at least 32 characters in production.");
  }
  return createHmac("sha256", secret || "local-development-rate-limit-salt")
    .update(`${scope}:${clientIp}`)
    .digest("hex");
}

export function getBaseUrl(): string {
  const raw = process.env.APP_BASE_URL;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("APP_BASE_URL must be configured in production.");
    }
    return "http://localhost:3000";
  }

  const parsed = new URL(raw);
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("APP_BASE_URL must use HTTPS in production.");
  }
  return raw.replace(/\/+$/, "");
}

export function getClientIp(request: Request): string {
  // On deployment, use the trusted reverse proxy's forwarding header.
  // Do not use this as a security boundary on a server that accepts arbitrary proxy headers.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function isValidEmail(email: string): boolean {
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
