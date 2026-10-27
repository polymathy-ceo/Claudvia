import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { documentation } from "@/content/docs";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return documentation.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = documentation.find((item) => item.slug === slug);
  return doc ? { title: doc.title, description: doc.summary } : { title: "Document not found" };
}

export default async function DocumentationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = documentation.find((item) => item.slug === slug);
  if (!doc) notFound();
  return (
    <section className="page-hero page-hero--article"><article className="container article-content"><Link className="back-link" href="/docs">← Documentation</Link><p className="eyebrow">Reference · Updated {doc.updated}</p><h1>{doc.title}</h1><p className="article-lede">{doc.summary}</p><div className="prose article-prose">{doc.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>)}</div></article></section>
  );
}
