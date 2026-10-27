import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy overview", description: "A plain-language overview of the data handled by Claudvia's website." };

export default function PrivacyPage() {
  return (
    <>
      <section className="page-hero page-hero--short"><div className="container page-hero__inner"><p className="eyebrow">Privacy overview</p><h1>Data handled<br /><span>with care.</span></h1><p>This is an initial technical overview of the intended website data flows, not a final legal privacy notice.</p></div></section>
      <section className="section"><article className="container article-content"><div className="prose article-prose">
        <section><h2>Information you provide</h2><p>If you use the email subscription form, the system is designed to store your email address, subscription status, consent timestamp, and the version of the consent text you accepted. Your address becomes active only after you confirm through an emailed link.</p><p>If you send a contact inquiry, the form sends the name, reply email, inquiry type, and message to the configured business inbox. Contact delivery is not operational until the site owner configures a destination and email transport.</p></section>
        <section><h2>Security and abuse prevention</h2><p>Subscription confirmation tokens are stored as hashes, expire after 24 hours, and are consumed when confirmed. Rate-limit buckets use hashed identifiers rather than storing raw client IP addresses in the rate-limit table. Technical hosting logs may still process connection metadata, depending on the eventual hosting provider.</p></section>
        <section><h2>Messages and choices</h2><p>Confirmed subscribers may receive company updates. Every update email is designed to include an unsubscribe link. Unsubscribing changes the subscription status so the address is excluded from later update broadcasts.</p></section>
        <section><h2>Service providers and storage</h2><p>The deployed website will depend on the hosting, persistent database, and email-delivery services selected for launch. Those providers, their relevant terms, and any applicable cross-border data transfers should be identified here before the public site begins collecting information.</p></section>
        <section><h2>Before public launch</h2><p>This page must be completed with the responsible operator's legal/contact details, purposes and legal bases, retention periods, applicable rights and complaint routes, provider disclosures, and a procedure for privacy requests. Do not treat this initial technical summary as a complete compliance statement.</p><p>For now, use the <Link href="/contact">Contact page</Link> for general inquiries. A dedicated privacy contact channel should be published before public collection begins.</p></section>
      </div></article></section>
    </>
  );
}
