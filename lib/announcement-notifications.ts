import { neon } from "@neondatabase/serverless";
import { sendEmail } from "@/lib/email";
import { createUnsubscribeToken, getBaseUrl } from "@/lib/security";
import { getStore } from "@/lib/store";
import type { CompanyUpdate } from "@/lib/updates-store";

type SqlClient = {
  query: (query: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
};

let databasePromise: Promise<SqlClient> | null = null;

async function database(): Promise<SqlClient> {
  if (!databasePromise) {
    const url = process.env.CLAUDVIA_DATABASE_URL;
    if (!url) throw new Error("CLAUDVIA_DATABASE_URL is not configured.");

    databasePromise = (async () => {
      const sql = neon(url) as unknown as SqlClient;

      await sql.query(`
        CREATE TABLE IF NOT EXISTS claudvia_announcement_deliveries (
          update_id TEXT NOT NULL,
          subscriber_id TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
          attempts INTEGER NOT NULL DEFAULT 1,
          error_message TEXT,
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL,
          sent_at BIGINT,
          PRIMARY KEY (update_id, subscriber_id)
        )
      `);

      return sql;
    })().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

export async function sendAnnouncementNotifications(update: CompanyUpdate) {
  const sql = await database();
  const store = await getStore();
  const subscribers = await store.listActiveSubscribers();

  const result = {
    eligible: subscribers.length,
    sent: 0,
    failed: 0,
    skipped: 0
  };

  if (!subscribers.length) return result;

  const baseUrl = getBaseUrl();
  const announcementUrl = `${baseUrl}/updates/${encodeURIComponent(update.slug)}`;

  let nextIndex = 0;

  async function processSubscriber() {
    while (nextIndex < subscribers.length) {
      const subscriber = subscribers[nextIndex++];
      const now = Date.now();

      const claimed = await sql.query(
        `INSERT INTO claudvia_announcement_deliveries
          (update_id, subscriber_id, status, attempts, created_at, updated_at)
         VALUES ($1, $2, 'pending', 1, $3, $3)
         ON CONFLICT (update_id, subscriber_id) DO NOTHING
         RETURNING subscriber_id`,
        [update.id, subscriber.id, now]
      );

      if (!claimed.length) {
        result.skipped++;
        continue;
      }

      const unsubscribeUrl =
        `${baseUrl}/unsubscribe?token=${createUnsubscribeToken(subscriber.email)}`;

      const imageBlock = update.imageUrl
        ? `<p><img src="${escapeHtml(update.imageUrl)}" alt="${escapeHtml(update.imageCaption || update.title)}" style="display:block;width:100%;max-width:520px;height:auto;border-radius:12px;margin:24px 0"></p>`
        : "";

      try {
        await sendEmail({
          to: subscriber.email,
          subject: `Claudvia update: ${update.title}`,
          text: [
            "CLAUDVIA",
            update.title,
            update.summary,
            `Read the full announcement: ${announcementUrl}`,
            `Unsubscribe: ${unsubscribeUrl}`
          ].join("\n\n"),
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.7;color:#181a1d;max-width:600px;margin:auto;padding:24px">
              <p style="letter-spacing:.18em;font-size:12px">CLAUDVIA</p>
              <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#777">${escapeHtml(update.category)}</p>
              <h1 style="font-size:28px;line-height:1.2">${escapeHtml(update.title)}</h1>
              <p>${escapeHtml(update.summary)}</p>
              ${imageBlock}
              <p><a href="${escapeHtml(announcementUrl)}">Read the full announcement</a></p>
              <hr style="border:0;border-top:1px solid #ddd;margin:28px 0">
              <p style="font-size:12px;color:#777">You received this because you confirmed your subscription to Claudvia updates.</p>
              <p style="font-size:12px"><a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe from future updates</a></p>
            </div>
          `
        });

        await sql.query(
          `UPDATE claudvia_announcement_deliveries
           SET status = 'sent', sent_at = $3, updated_at = $3, error_message = NULL
           WHERE update_id = $1 AND subscriber_id = $2`,
          [update.id, subscriber.id, Date.now()]
        );

        result.sent++;
      } catch (error) {
        const message = error instanceof Error ? error.message.slice(0, 500) : "Email delivery failed.";

        await sql.query(
          `UPDATE claudvia_announcement_deliveries
           SET status = 'failed', error_message = $3, updated_at = $4
           WHERE update_id = $1 AND subscriber_id = $2`,
          [update.id, subscriber.id, message, Date.now()]
        );

        result.failed++;
        console.error("Claudvia announcement email failed.", {
          updateId: update.id,
          subscriberId: subscriber.id
        });
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(3, subscribers.length) },
      () => processSubscriber()
    )
  );

  return result;
}
