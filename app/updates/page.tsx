import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { updates } from "@/content/updates";

export const metadata: Metadata = { title: "Updates", description: "Company announcements and meaningful developments from Claudvia." };

export default function UpdatesPage() {
  return (
    <>
      <section className="page-hero page-hero--short"><div className="container page-hero__inner"><p className="eyebrow">Company updates</p><h1>Progress, documented.</h1><p>Announcements, changes, and milestones will be published here when there is something concrete to share.</p></div></section>
      <section className="section"><div className="container">{updates.length ? <div className="update-list">{updates.map((update) => <article className="update-list__item" key={update.slug}><div className="update-list__meta"><span>{update.date}</span><span>{update.category}</span></div><div><h2><Link href={`/updates/${update.slug}`}>{update.title}</Link></h2><p>{update.summary}</p><Link className="text-link" href={`/updates/${update.slug}`}>Read announcement <span aria-hidden="true">→</span></Link></div></article>)}</div> : <div className="empty-state empty-state--large"><span className="empty-state__mark">—</span><div><h2>No public updates yet</h2><p>There are no announcements published at the moment. We will add dated updates when there is a real development worth communicating.</p></div></div>}</div></section>
      <section className="section section--bordered"><div className="container newsletter-inline"><div><p className="eyebrow">Email updates</p><h2>Hear about changes directly.</h2><p>Subscription requires email confirmation. Email delivery must be configured before public sign-ups are enabled.</p></div><NewsletterForm /></div></section>
    </>
  );
}
