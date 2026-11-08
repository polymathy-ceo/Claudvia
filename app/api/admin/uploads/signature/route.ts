
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { ok: false, message: "Cloudinary is not configured." },
      { status: 503 }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "claudvia/updates";

  const signatureParams = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

  const signature = createHash("sha1")
    .update(signatureParams)
    .digest("hex");

  return NextResponse.json({
    ok: true,
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  });
}
