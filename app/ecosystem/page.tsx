import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ecosystem", description: "The current state of Claudvia projects and longer-term areas of exploration." };

const items = [
  { number: "01", title: "Company website", status: "In development", className: "status-label--current", description: "The current project: a responsive company information platform with updates, documentation, contact, and an opt-in email subscription architecture.", reality: "This repository provides a development foundation. The website and delivery services are not described as live until separately configured and deployed." },
  { number: "02", title: "Developer platform", status: "Future exploration", className: "", description: "A possible code-hosting and collaboration platform covering repositories, source browsing, history, project documentation, and collaboration workflows.", reality: "No public repository-hosting service is available under Claudvia at this stage." },
  { number: "03", title: "Application hosting and infrastructure", status: "Future exploration", className: "", description: "Long-term research into deploying applications, managing environments, logs, domains, certificates, databases, and storage on systems Claudvia can increasingly control.", reality: "Operating reliable hosting requires compute, networking, persistent storage, security, backups, and operational capacity." },
  { number: "04", title: "Developer APIs and tools", status: "Future exploration", className: "", description: "Potential APIs and tools that may help developers build, connect, and operate applications.", reality: "Specific capabilities and availability will be published only when there is a real product to describe." },
  { number: "05", title: "Claudvia SMS", status: "Future exploration", className: "", description: "An area of interest for SMS delivery and OTP verification APIs for developers and businesses.", reality: "Real messaging requires authorized gateway or telecom access and usually incurs per-message or other provider charges." }
];

export default function EcosystemPage() {
  return (
    <>
      <section className="page-hero"><div className="container page-hero__inner"><p className="eyebrow">The Claudvia ecosystem</p><h1>A direction, not<br /><span>a list of promises.</span></h1><p>Our ecosystem will grow when products become useful and maintainable. This page distinguishes the current work from areas that remain future exploration.</p></div></section>
      <section className="section"><div className="container ecosystem-list">{items.map((item) => <article className="ecosystem-row" key={item.number}><div className="ecosystem-row__number">{item.number}</div><div className="ecosystem-row__main"><div className="ecosystem-row__heading"><h2>{item.title}</h2><span className={`status-label ${item.className}`}>{item.status}</span></div><p className="ecosystem-row__description">{item.description}</p><p className="ecosystem-row__reality">{item.reality}</p></div></article>)}</div></section>
      <section className="section section--bordered"><div className="container callout-line"><div><p className="eyebrow">How to follow progress</p><h2>Real developments belong in Updates.</h2><p>When something changes materially, we will publish a dated announcement rather than relying on vague roadmap language.</p></div><Link className="button button--light" href="/updates">Read company updates <span aria-hidden="true">↗</span></Link></div></section>
    </>
  );
}
