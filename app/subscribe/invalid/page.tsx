import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Confirmation link unavailable", robots: { index: false, follow: false } };

export default function SubscriptionInvalidPage() {
  return <section className="section utility-page"><div className="container utility-card"><p className="eyebrow">Confirmation link</p><h1>This link can’t be used.</h1><p>The link may have expired or already been used. Submit your email address again to request a fresh confirmation message.</p><Link className="button button--light" href="/">Return home</Link></div></section>;
}
