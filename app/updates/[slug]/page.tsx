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

  const continuationParagraphs = (update.continuation || "")
    .split(/\n\s*\n/)
    .map(text => text.trim())
    .filter(Boolean);

  const date = update.publishedAt
    ? new Date(update.publishedAt).toLocaleDateString("en", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <section className="page-hero page-hero--article">
      <article className="container article-content announcement-post">
        <Link className="back-link" href="/updates">
          ← All updates
        </Link>

        <header className="announcement-author">
          <img
            className="announcement-avatar"
            src="/og-image.jpg"
            alt="Claudvia"
            width={48}
            height={48}
          />
          <div className="announcement-byline">
            <strong>Claudvia</strong>
            <span>{date}{date ? " · " : ""}{update.category}</span>
          </div>
        </header>

        <h1>{update.title}</h1>

        {update.summary && (
          <p className="article-lede">{update.summary}</p>
        )}

        <div className="prose article-prose announcement-body">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {update.imageUrl && (
          <figure className="article-featured-image announcement-image">
            <img
              src={update.imageUrl}
              alt={update.imageCaption || update.title}
            />
            {update.imageCaption && (
              <figcaption>{update.imageCaption}</figcaption>
            )}
          </figure>
        )}

        {continuationParagraphs.length > 0 && (
          <div className="prose article-prose announcement-continuation">
            {continuationParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
