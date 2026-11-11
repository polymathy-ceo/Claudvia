import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { listPublishedUpdates, type CompanyUpdate } from "@/lib/updates-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Updates",
  description: "Company announcements and meaningful developments from Claudvia.",
};

export default async function UpdatesPage() {
  let updates: CompanyUpdate[] = [];

  try {
    updates = await listPublishedUpdates();
  } catch {
    updates = [];
  }

  return (
    <>
      <section className="page-hero page-hero--short">
        <div className="container page-hero__inner">
          <p className="eyebrow">Company updates</p>
          <h1>Progress, documented.</h1>
          <p>
            Announcements, changes, and milestones will be published here when
            there is something concrete to share.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container announcement-feed">
          {updates.length ? (
            <div className="announcement-feed__list">
              {updates.map(update => {
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
                  <article className="announcement-post announcement-feed__post" key={update.id}>
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

                    <h2 className="announcement-feed__title">
                      <Link href={`/updates/${update.slug}`}>
                        {update.title}
                      </Link>
                    </h2>

                    {update.summary && (
                      <p className="article-lede">{update.summary}</p>
                    )}

                    <div className="prose announcement-body">
                      {paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>

                    {update.imageUrl && (
                      <figure className="article-featured-image announcement-image">
                        <Link
                          href={`/updates/${update.slug}`}
                          aria-label={`Read ${update.title}`}
                        >
                          <img
                            src={update.imageUrl}
                            alt={update.imageCaption || update.title}
                            loading="lazy"
                          />
                        </Link>
                        {update.imageCaption && (
                          <figcaption>{update.imageCaption}</figcaption>
                        )}
                      </figure>
                    )}

                    {continuationParagraphs.length > 0 && (
                      <div className="prose announcement-continuation">
                        {continuationParagraphs.map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    )}

                    <Link
                      className="text-link announcement-read-more"
                      href={`/updates/${update.slug}`}
                    >
                      Read full announcement <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state empty-state--large">
              <span className="empty-state__mark">—</span>
              <div>
                <h2>No public updates yet</h2>
                <p>
                  There are no announcements published at the moment. We will
                  add dated updates when there is a real development worth
                  communicating.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section section--bordered">
        <div className="container newsletter-inline">
          <div>
            <p className="eyebrow">Email updates</p>
            <h2>Hear about changes directly.</h2>
            <p>
              Subscription requires email confirmation. Email delivery must be
              configured before public sign-ups are enabled.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
