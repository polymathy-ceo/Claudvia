import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", description: "Learn about Claudvia's mission, principles, and current stage." };

export default function AboutPage() {
  return (
    <>
      <section className="page-hero"><div className="container page-hero__inner"><p className="eyebrow">About Claudvia</p><h1>A technology venture<br /><span>built with intent.</span></h1><p>We are working toward a company that develops useful software and, over time, builds more of the tools and infrastructure behind it.</p></div></section>
      <section className="section"><div className="container content-grid"><div><p className="eyebrow">Our mission</p><h2>Make technology<br /><span>more useful and owned.</span></h2></div><div className="prose"><p>Claudvia’s mission is to develop software, digital products, and developer tools that help people create and operate technology more effectively.</p><p>The long-term direction also includes building more of the underlying systems where it is practical—without confusing ambition with what is already available. Reliable infrastructure takes time, expertise, hardware or cloud resources, security work, and ongoing maintenance.</p><p>We are starting with a simple company website and a disciplined approach to documenting what we build.</p></div></div></section>
      <section className="section section--bordered"><div className="container"><div className="section-heading"><div><p className="eyebrow">Our principles</p><h2>How we intend to work.</h2></div></div><div className="value-grid"><article><span>01</span><h3>Be clear</h3><p>Describe products and services accurately, including limitations and current availability.</p></article><article><span>02</span><h3>Build in stages</h3><p>Ship coherent, useful foundations before taking on systems that are too large to maintain.</p></article><article><span>03</span><h3>Respect trust</h3><p>Handle user information carefully, protect credentials, and make opt-in and opt-out choices clear.</p></article><article><span>04</span><h3>Keep learning</h3><p>Choose tools based on the problem, and keep architecture understandable enough to evolve.</p></article></div></div></section>
      <section className="section"><div className="container content-grid content-grid--compact"><div><p className="eyebrow">Where we are now</p><h2>Foundation first.</h2></div><div className="prose"><p>Claudvia is at an early development stage. The immediate focus is the company's public information website, including its content structure and email update workflow.</p><p>The Claudvia name, tagline, and visual identity are working brand choices. This website does not claim that legal registration or trademark clearance is complete.</p></div></div></section>
    </>
  );
}
