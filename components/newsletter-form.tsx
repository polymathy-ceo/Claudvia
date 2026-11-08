"use client";

import { FormEvent, useEffect, useState } from "react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const confirmed = document.cookie
      .split("; ")
      .some((cookie) => cookie === "claudvia_subscribed=1");

    setSubscribed(confirmed);
    setSubscriptionChecked(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, website })
      });

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      setMessage(
        data.message ||
        (response.ok
          ? "Request received."
          : "We couldn't process that request.")
      );

      if (response.ok) {
        setSuccess(true);
        setEmail("");
        setConsent(false);
        setWebsite("");
      }
    } catch {
      setMessage(
        "The request could not reach the server. Please try again later."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!subscriptionChecked) {
    return null;
  }

  if (subscribed) {
    return (
      <p className="form-message form-message--success" role="status">
        You're already on the list. Thank you for staying connected with Claudvia.
      </p>
    );
  }

  return (
    <form
      className={`newsletter-form${compact ? " newsletter-form--compact" : ""}`}
      onSubmit={handleSubmit}
    >
      <label
        className="sr-only"
        htmlFor={compact ? "newsletter-email-compact" : "newsletter-email"}
      >
        Email address
      </label>

      <div className="newsletter-form__row">
        <input
          autoComplete="email"
          id={compact ? "newsletter-email-compact" : "newsletter-email"}
          inputMode="email"
          maxLength={254}
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />

        <button className="button button--light" disabled={busy} type="submit">
          {busy ? "Submitting…" : "Get updates"}
        </button>
      </div>

      <div className="consent-row">
        <input
          checked={consent}
          id={compact ? "newsletter-consent-compact" : "newsletter-consent"}
          onChange={(event) => setConsent(event.target.checked)}
          required
          type="checkbox"
        />

        <label htmlFor={compact ? "newsletter-consent-compact" : "newsletter-consent"}>
          I agree to receive company updates by email. I can unsubscribe at any time.
        </label>
      </div>

      <div className="honeypot" aria-hidden="true">
        <label
          htmlFor={compact ? "newsletter-website-compact" : "newsletter-website"}
        >
          Leave this field empty
        </label>

        <input
          autoComplete="off"
          id={compact ? "newsletter-website-compact" : "newsletter-website"}
          name="website"
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          value={website}
        />
      </div>

      {message ? (
        <p
          className={`form-message${success ? " form-message--success" : ""}`}
          role="status"
        >
          {message}
        </p>
      ) : null}

      <p className="fine-print">
        We only collect addresses for the updates you request. See{" "}
        <a href="/docs/updates-subscriptions">how subscriptions work</a>.
      </p>
    </form>
  );
}
