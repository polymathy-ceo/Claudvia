import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

type PageProps = { searchParams: Promise<{ token?: string; success?: string; invalid?: string }> };

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token, success, invalid } = await searchParams;
  return (
    <section className="section utility-page"><div className="container utility-card">
      <p className="eyebrow">Email preferences</p>
      {success === "1" ? <><h1>You’re unsubscribed.</h1><p>This address has been removed from future Claudvia update emails.</p><Link className="button button--light" href="/">Return home</Link></> : invalid === "1" || !token ? <><h1>This link can’t be used.</h1><p>The unsubscribe link is missing or no longer valid. You can contact Claudvia if you need help.</p><Link className="button button--light" href="/contact">Contact Claudvia</Link></> : <><h1>Stop receiving updates?</h1><p>Confirm below to unsubscribe this email address from future Claudvia company updates.</p><form action="/api/subscribe/unsubscribe" method="post" className="utility-actions"><input name="token" type="hidden" value={token} /><button className="button button--light" type="submit">Unsubscribe</button></form></>}
    </div></section>
  );
}
