"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Login failed.");
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-login">
        <p className="eyebrow">CLAUDVIA / PRIVATE ACCESS</p>
        <h1>Admin sign in.</h1>
        <p className="admin-muted">Sign in to manage company announcements.</p>
        <form onSubmit={submit} className="admin-form">
          <label>Email address<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          <button className="button button--light" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          {message && <p className="admin-message" role="alert">{message}</p>}
        </form>
        <a className="admin-back" href="/">← Return to Claudvia</a>
      </section>
    </main>
  );
}
