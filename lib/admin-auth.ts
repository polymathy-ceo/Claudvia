import { createHmac, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "claudvia_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

function sessionSecret(): string {
  const secret = process.env.CLAUDVIA_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("CLAUDVIA_TOKEN_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = process.env.CLAUDVIA_ADMIN_EMAIL?.trim().toLowerCase();
  const encoded = process.env.CLAUDVIA_ADMIN_PASSWORD_HASH;
  if (!expectedEmail || !encoded) return false;
  if (email.trim().toLowerCase() !== expectedEmail) return false;

  const [algorithm, salt, expectedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex || !/^[a-f0-9]{128}$/i.test(expectedHex)) return false;

  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createAdminSession(email: string): { value: string; maxAge: number } {
  const payload = Buffer.from(JSON.stringify({
    email: email.trim().toLowerCase(),
    expiresAt: Date.now() + SESSION_SECONDS * 1000
  })).toString("base64url");
  return { value: `${payload}.${sign(payload)}`, maxAge: SESSION_SECONDS };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  if (!value) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string; expiresAt?: number;
    };
    const configuredEmail = process.env.CLAUDVIA_ADMIN_EMAIL?.trim().toLowerCase();
    return Boolean(
      configuredEmail &&
      decoded.email === configuredEmail &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export const adminCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_SECONDS
  }
};
