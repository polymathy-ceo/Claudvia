import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Subscription confirmed", robots: { index: false, follow: false } };

export default function SubscriptionConfirmedPage() {
  return <section className="section utility-page"><div className="container utility-card"><p className="eyebrow">Confirmed</p><h1>You’re on the list.</h1><p>Your email address is confirmed for Claudvia company updates. Every update email will include an unsubscribe link.</p><Link className="button button--light" href="/">Return home</Link></div></section>;
}
