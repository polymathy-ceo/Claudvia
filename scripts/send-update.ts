import { updates } from "../content/updates";
import { sendEmail } from "../lib/email";
import { createUnsubscribeToken, getBaseUrl } from "../lib/security";
import { getStore } from "../lib/store";

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character);
}

async function main() {
  const slugArg = process.argv.find((argument) => argument.startsWith("--slug="));
  const slug = slugArg?.slice("--slug=".length);
  if (!slug) throw new Error("Usage: npm run send:update -- --slug=your-update-slug");

  const update = updates.find((item) => item.slug === slug);
  if (!update) throw new Error(`No published content update exists with slug '${slug}'. Add an approved item to content/updates.ts first.`);

  const store = await getStore();
  const subscribers = await store.listActiveSubscribers();
  if (!subscribers.length) {
    console.log("No confirmed subscribers to email. No messages were sent.");
    return;
  }

  const baseUrl = getBaseUrl();
  const updateUrl = `${baseUrl}/updates/${update.slug}`;
  let sent = 0;
  let failed = 0;

  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${createUnsubscribeToken(subscriber.email)}`;
    try {
      await sendEmail({
        to: subscriber.email,
        subject: `Claudvia update: ${update.title}`,
        text: `${update.title}\n${update.date}\n\n${update.summary}\n\nRead the update: ${updateUrl}\n\nUnsubscribe: ${unsubscribeUrl}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#181a1d;max-width:600px;margin:auto"><p style="letter-spacing:.18em;font-size:12px">CLAUDVIA</p><p style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#666">${escapeHtml(update.category)} · ${escapeHtml(update.date)}</p><h1 style="font-size:25px">${escapeHtml(update.title)}</h1><p>${escapeHtml(update.summary)}</p><p><a href="${updateUrl}">Read the full update →</a></p><hr /><p style="font-size:12px;color:#666">You are receiving this because you confirmed Claudvia email updates. <a href="${unsubscribeUrl}">Unsubscribe</a></p></div>`
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed to send update to subscriber ${subscriber.id}.`, error);
    }
  }

  console.log(`Update email finished. Sent: ${sent}. Failed: ${failed}. Total confirmed subscribers: ${subscribers.length}.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Update email failed.");
  process.exitCode = 1;
});
