import type { Metadata } from "next";
import Link from "next/link";
import { documentation } from "@/content/docs";

export const metadata: Metadata = { title: "Documentation", description: "Company information, ecosystem status, subscription practices, and technical direction." };

export default function DocumentationIndexPage() {
  return (
    <>
      <section className="page-hero page-hero--short"><div className="container page-hero__inner"><p className="eyebrow">Documentation</p><h1>Clear information.<br /><span>Kept current.</span></h1><p>A growing reference for Claudvia's identity, ecosystem status, and technical approach.</p></div></section>
      <section className="section"><div className="container docs-grid">{documentation.map((doc, index) => <article className="doc-card" key={doc.slug}><span className="doc-card__number">{String(index + 1).padStart(2, "0")}</span><p className="eyebrow">Updated {doc.updated}</p><h2><Link href={`/docs/${doc.slug}`}>{doc.title}</Link></h2><p>{doc.summary}</p><Link className="text-link" href={`/docs/${doc.slug}`}>Read documentation <span aria-hidden="true">→</span></Link></article>)}</div></section>
      <section className="section section--bordered"><div className="container callout-line"><div><p className="eyebrow">Documentation principle</p><h2>No invented capabilities.</h2><p>Documents should describe actual behavior, current availability, and known limitations. Details will be revised as the company changes.</p></div><Link className="button button--light" href="/contact">Ask a question <span aria-hidden="true">↗</span></Link></div></section>
    </>
  );
}
