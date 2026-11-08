import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedUpdate } from "@/lib/updates-store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const update = await getPublishedUpdate(slug).catch(() => null);

  return update
    ? { title: update.title, description: update.summary }
    : { title: "Update not found" };
}

export default async function UpdateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const update = await getPublishedUpdate(slug).catch(() => null);

  if (!update) notFound();

  const paragraphs = update.content
    .split(/\n\s*\n/)
    .map(text => text.trim())
    .filter(Boolean);

  return (
    <section className="page-hero page-hero--article">
      <article className="container article-content">
        <Link className="back-link" href="/updates">
          ← All updates
        </Link>

        <p className="eyebrow">
          {update.category}
          <span> · </span>
          {update.publishedAt
            ? new Date(update.publishedAt).toLocaleDateString("en", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </p>

        <h1>{update.title}</h1>
        <p className="article-lede">{update.summary}</p>

        {update.imageUrl && (
          <figure className="article-featured-image">
            <img
              src={update.imageUrl}
              alt={update.imageCaption || update.title}
            />
            {update.imageCaption && (
              <figcaption>{update.imageCaption}</figcaption>
            )}
          </figure>
        )}

        <div className="prose article-prose">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </section>
  );
}
