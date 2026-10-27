import Link from "next/link";
import { Brand } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__main">
        <div className="site-footer__identity">
          <Brand compact />
          <p>Built Beyond Limits.</p>
          <p className="muted">Software, digital products, and infrastructure—built with intent.</p>
        </div>
        <div className="site-footer__links">
          <span className="eyebrow">Explore</span>
          <Link href="/about">About Claudvia</Link>
          <Link href="/ecosystem">Ecosystem status</Link>
          <Link href="/updates">Company updates</Link>
          <Link href="/docs">Documentation</Link>
        </div>
        <div className="site-footer__links">
          <span className="eyebrow">Get in touch</span>
          <Link href="/contact">Contact and inquiries</Link>
          <Link href="/docs/updates-subscriptions">Email subscriptions</Link>
          <Link href="/privacy">Privacy overview</Link>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Claudvia. All rights reserved.</span>
        <span className="footer-note">An early-stage technology venture. Availability is stated honestly on each page.</span>
      </div>
    </footer>
  );
}
