import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact", description: "Send a business inquiry, partnership proposal, or website feedback to Claudvia." };

export default function ContactPage() {
  const publicContactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <>
      <section className="page-hero page-hero--short"><div className="container page-hero__inner"><p className="eyebrow">Contact Claudvia</p><h1>Start a useful<br /><span>conversation.</span></h1><p>For business inquiries, considered partnership proposals, or feedback about this website, send a message below.</p></div></section>
      <section className="section"><div className="container contact-layout"><div className="contact-sidebar"><p className="eyebrow">Before you write</p><h2>Keep it clear.<br /><span>Keep it relevant.</span></h2><p>Share enough context for us to understand your request. Please do not include passwords, payment details, or confidential material in the form.</p><div className="contact-sidebar__note"><span className="status-dot" /><span>Contact delivery is available after the site owner configures an inbox and email transport.</span></div>{publicContactEmail ? <div className="contact-email"><span className="eyebrow">Email</span><a href={`mailto:${publicContactEmail}`}>{publicContactEmail}</a></div> : null}</div><div className="contact-card"><h2>Send an inquiry</h2><ContactForm /></div></div></section>
    </>
  );
}
