import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confirm email updates", robots: { index: false, follow: false } };

type PageProps = { searchParams: Promise<{ token?: string }> };

export default async function ConfirmSubscriptionPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  return (
    <section className="section utility-page"><div className="container utility-card"><p className="eyebrow">Email confirmation</p><h1>Confirm your subscription.</h1>{token ? <><p>Select the button below to confirm that you want to receive Claudvia company updates at this email address. This link expires after 24 hours.</p><form action="/api/subscribe/confirm" method="post" className="utility-actions"><input name="token" type="hidden" value={token} /><button className="button button--light" type="submit">Confirm subscription</button></form></> : <p>This confirmation link is incomplete. Return to the website and submit your email address again.</p>}</div></section>
  );
}
