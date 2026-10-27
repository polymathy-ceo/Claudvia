import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updates } from "@/content/updates";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return updates.map((update) => ({ slug: update.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const update = updates.find((item) => item.slug === slug);
  return update ? { title: update.title, description: update.summary } : { title: "Update not found" };
}

export default async function UpdateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const update = updates.find((item) => item.slug === slug);
  if (!update) notFound();
  return (
    <section className="page-hero page-hero--article"><article className="container article-content"><Link className="back-link" href="/updates">← All updates</Link><p className="eyebrow">{update.category} <span>·</span> {update.date}</p><h1>{update.title}</h1><p className="article-lede">{update.summary}</p><div className="prose article-prose">{update.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article></section>
  );
}
