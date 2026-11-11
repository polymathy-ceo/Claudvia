import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteUpdate,
  listAdminUpdates,
  saveUpdate
} from "@/lib/updates-store";
import { sendAnnouncementNotifications } from "@/lib/announcement-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function slugify(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    return NextResponse.json({ ok: true, updates: await listAdminUpdates() });
  } catch {
    return NextResponse.json({ ok: false, message: "Could not load updates." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = clean(body.title, 140);
    const slug = slugify(clean(body.slug, 120) || title);
    const category = clean(body.category, 50) || "Company update";
    const summary = clean(body.summary, 300);
    const content = typeof body.content === "string" ? body.content.trim().slice(0, 30000) : "";
    const continuation = typeof body.continuation === "string" ? body.continuation.trim().slice(0, 30000) : "";
    const status = body.status === "published" ? "published" : "draft";
    const id = clean(body.id, 80) || undefined;

    const imageUrl = clean(body.imageUrl, 1000);
    const imagePublicId = clean(body.imagePublicId, 255);
    const imageCaption = clean(body.imageCaption, 180);

    if (!title || !slug || !summary || !content) {
      return NextResponse.json({
        ok: false,
        message: "Title, summary and announcement content are required."
      }, { status: 400 });
    }

    if (content.length < 10) {
      return NextResponse.json({
        ok: false,
        message: "Please add a little more detail to the announcement."
      }, { status: 400 });
    }

    if (imageUrl && !/^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\//.test(imageUrl)) {
      return NextResponse.json({ ok: false, message: "Invalid Cloudinary image URL." }, { status: 400 });
    }

    if (imagePublicId && !imagePublicId.startsWith("claudvia/updates/")) {
      return NextResponse.json({ ok: false, message: "Invalid Cloudinary image ID." }, { status: 400 });
    }

    if (Boolean(imageUrl) !== Boolean(imagePublicId)) {
      return NextResponse.json({
        ok: false,
        message: "Image URL and image ID must both be provided."
      }, { status: 400 });
    }

    const existingUpdates = await listAdminUpdates();
    const previous = id
      ? existingUpdates.find((item) => item.id === id)
      : undefined;

    const isFirstPublication = status === "published" && previous?.status !== "published";

    const update = await saveUpdate({
      id,
      title,
      slug,
      category,
      summary,
      content,
      continuation: continuation || null,
      status,
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
      imageCaption: imageCaption || null
    });

    let notifications: {
      eligible: number;
      sent: number;
      failed: number;
      skipped: number;
    } | null = null;

    let notificationError = false;

    if (isFirstPublication) {
      try {
        notifications = await sendAnnouncementNotifications(update);
      } catch (error) {
        notificationError = true;
        console.error("Claudvia announcement notification process failed.", error);
      }
    }

    return NextResponse.json({
      ok: true,
      update,
      firstPublication: isFirstPublication,
      notifications,
      notificationError
    });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("unique")
      ? "That URL slug is already in use."
      : "Could not save this update. Check that the URL slug is unique.";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = clean(body.id, 80);

    if (!id) {
      return NextResponse.json({ ok: false, message: "Missing update ID." }, { status: 400 });
    }

    await deleteUpdate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Could not delete this update." }, { status: 400 });
  }
}
