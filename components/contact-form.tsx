"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General inquiry");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, website })
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      setFeedback(data.message || (response.ok ? "Message received." : "We couldn't send your message."));
      if (response.ok) {
        setName(""); setEmail(""); setSubject("General inquiry"); setMessage(""); setWebsite("");
      }
    } catch {
      setFeedback("The request could not reach the server. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="contact-name">Your name</label>
          <input id="contact-name" maxLength={120} onChange={(event) => setName(event.target.value)} required value={name} />
        </div>
        <div className="field">
          <label htmlFor="contact-email">Email address</label>
          <input autoComplete="email" id="contact-email" inputMode="email" maxLength={254} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="contact-subject">Inquiry type</label>
        <select id="contact-subject" onChange={(event) => setSubject(event.target.value)} value={subject}>
          <option>General inquiry</option>
          <option>Partnership proposal</option>
          <option>Business inquiry</option>
          <option>Website feedback</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" maxLength={5000} onChange={(event) => setMessage(event.target.value)} required rows={6} value={message} />
        <span className="field-hint">Please do not send passwords, payment details, or other sensitive information.</span>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input autoComplete="off" id="contact-website" onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} value={website} />
      </div>
      <button className="button button--light" disabled={busy} type="submit">{busy ? "Sending…" : "Send inquiry"}</button>
      {feedback ? <p className="form-message" role="status">{feedback}</p> : null}
      <p className="fine-print">This form can deliver messages once the site owner configures a destination inbox and SMTP delivery.</p>
    </form>
  );
}
