import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { listPublishedUpdates } from "@/lib/updates-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let latestUpdates: Awaited<ReturnType<typeof listPublishedUpdates>> = [];

  try {
    latestUpdates = (await listPublishedUpdates()).slice(0, 2);
  } catch (error) {
    console.error("Could not load homepage announcements.", error);
  }

  return (
    <>
      <section className="hero">
        <div className="hero__grid" aria-hidden="true" />
        <div className="container hero__content">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--line"><span className="status-dot" /> An independent technology venture</p>
            <h1>Technology built with <span>intent.</span></h1>
            <p className="hero__description">
              Claudvia is being built around useful software, digital products, developer tools, and technology infrastructure that can grow with the needs of the people who use it.
            </p>
            <div className="button-row">
              <Link className="button button--light" href="/about">Discover Claudvia <span aria-hidden="true">↗</span></Link>
              <Link className="button button--quiet" href="/ecosystem">Explore the ecosystem</Link>
            </div>
            <p className="hero__note">Early-stage development · Current availability is stated openly</p>
          </div>
          <div className="hero__visual" aria-label="Abstract geometric Claudvia emblem" role="img">
            <div className="orbit orbit--one" />
            <div className="orbit orbit--two" />
            <div className="orbit orbit--three" />
            <div className="hero__monogram">
              <svg viewBox="0 0 180 180" aria-hidden="true">
                <path d="M117 27H69L35 61V119L69 153H117" />
                <path d="M72 46 108 134 151 45" />
              </svg>
            </div>
            <span className="visual-caption">C / V — Geometric identity</span>
          </div>
        </div>
        <div className="container hero__bottomline">
          <span>01 / A foundation for what comes next</span>
          <span>Built Beyond Limits.</span>
        </div>
      </section>

      <section className="section section--intro">
        <div className="container intro-grid">
          <div>
            <p className="eyebrow">The direction</p>
            <h2>Build the right things.<br /><span>Build them to last.</span></h2>
          </div>
          <div className="intro-copy">
            <p>Our goal is to develop technology that solves real problems and earns trust through clarity, useful design, and dependable engineering.</p>
            <p>We are starting with a clear company foundation. Products and services will be introduced as they become real—not as promises on a roadmap.</p>
            <Link className="text-link" href="/ecosystem">See what is current and what is planned <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="section section--bordered">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A growing focus</p>
              <h2>Four principles. One direction.</h2>
            </div>
            <p className="section-heading__aside">A practical foundation for a long-term technology company.</p>
          </div>
          <div className="principle-grid">
            <article className="principle-card"><span className="principle-card__number">01</span><h3>Useful by design</h3><p>Build for genuine needs, not feature lists. Clarity comes before complexity.</p></article>
            <article className="principle-card"><span className="principle-card__number">02</span><h3>Engineering with care</h3><p>Prioritize security, maintainability, and performance from the start.</p></article>
            <article className="principle-card"><span className="principle-card__number">03</span><h3>Honest availability</h3><p>Communicate what exists today and what remains an idea or work in progress.</p></article>
            <article className="principle-card"><span className="principle-card__number">04</span><h3>Ownership over time</h3><p>Keep systems portable so more of the technology can be understood and operated in-house as resources allow.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container ecosystem-preview">
          <div className="ecosystem-preview__copy">
            <div className="ecosystem-preview__image" role="img" aria-label="Close-up view of modern technology hardware" />
            <p className="eyebrow">The ecosystem</p>
            <h2>Start with the foundation.<br /><span>Expand with purpose.</span></h2>
            <p>Claudvia’s longer-term direction includes software, developer tooling, APIs, and infrastructure. Each area will be described clearly as it moves from research to active development and, if ready, public availability.</p>
            <Link className="text-link" href="/ecosystem">View ecosystem status <span aria-hidden="true">→</span></Link>
          </div>
          <div className="status-list">
            <div className="status-list__item"><span className="status-list__index">01</span><div><h3>Company website</h3><p>The current foundation project</p></div><span className="status-label status-label--current">In development</span></div>
            <div className="status-list__item"><span className="status-list__index">02</span><div><h3>Developer platform</h3><p>Code hosting and collaboration concepts</p></div><span className="status-label">Future exploration</span></div>
            <div className="status-list__item"><span className="status-list__index">03</span><div><h3>Hosting and infrastructure</h3><p>Long-term systems research</p></div><span className="status-label">Future exploration</span></div>
            <div className="status-list__item"><span className="status-list__index">04</span><div><h3>Claudvia SMS</h3><p>Messaging and OTP APIs</p></div><span className="status-label">Future exploration</span></div>
          </div>
        </div>
      </section>

      <section className="section section--bordered section--updates">
        <div className="container">
          <div className="section-heading">
            <div><p className="eyebrow">From Claudvia</p><h2>Updates, when there is something to share.</h2></div>
          </div>
          {latestUpdates.length ? (
            <div className="update-grid">
              {latestUpdates.map((update) => (
                <article className="update-card" key={update.id}>
                  {update.imageUrl ? (
                    <Link href={`/updates/${update.slug}`} aria-label={`Read ${update.title}`}>
                      <img
                        src={update.imageUrl}
                        alt={update.imageCaption || update.title}
                        loading="lazy"
                        style={{ width: "100%", height: "auto", borderRadius: "12px", marginBottom: "18px" }}
                      />
                    </Link>
                  ) : null}
                  <p className="eyebrow">{update.category} <span>·</span> {update.publishedAt ? new Date(update.publishedAt).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" }) : ""}</p>
                  <h3><Link href={`/updates/${update.slug}`}>{update.title}</Link></h3>
                  <p>{update.summary}</p>
                  <Link className="text-link" href={`/updates/${update.slug}`}>Read update <span aria-hidden="true">→</span></Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state"><span className="empty-state__mark">—</span><div><h3>No public announcements yet</h3><p>We will publish updates here when there is a meaningful company development to report.</p></div></div>
          )}
          <div className="updates-view-all">
            <Link className="button button--quiet" href="/updates">
              View all updates <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section newsletter-section">
        <div className="container newsletter-panel">
          <div className="newsletter-panel__copy">
            <p className="eyebrow">Stay informed</p>
            <h2>Only meaningful updates.</h2>
            <p>Receive occasional company announcements by email. No account is needed, and every message will include an unsubscribe option.</p>
          </div>
          <div className="newsletter-panel__form"><NewsletterForm compact /></div>
        </div>
      </section>
    </>
  );
}
