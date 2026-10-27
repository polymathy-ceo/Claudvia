# Claudvia — Company Website

A mobile-first, dark premium company website built with Next.js App Router, TypeScript, and plain CSS. The code is deliberately portable and contains no public visitor accounts or dashboard.

## What's included

- Home, About, Ecosystem, Updates, Documentation, and Contact sections.
- Structured announcement and documentation content in `content/`.
- Responsive navigation and accessible newsletter/contact forms.
- Email-only newsletter architecture with consent records, duplicate prevention, confirmation links, unsubscribe links, expiring one-use confirmation tokens, rate limiting, and a hidden honeypot field.
- A manual update-email script that only sends when explicitly run.
- Local JSON persistence for development so the project can be explored without setting up a database immediately.
- A PostgreSQL adapter for production. Public deployments must use persistent PostgreSQL; serverless local files are intentionally rejected.

## Run on Android / Termux

From the project directory:

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` in your phone browser. `npm run dev` already uses Webpack for Android/Termux compatibility.

The local JSON store appears under `data/` after the first subscription-related request. It is development data and is excluded from Git.

## Email delivery

Newsletter confirmation and contact delivery are intentionally not presented as live until SMTP has been configured. Fill the SMTP values in `.env.local` using a mail service you are authorized to use. Keep all credentials on the server and never put them in a `NEXT_PUBLIC_` variable. `APP_BASE_URL` must match the site origin used in confirmation links.

The newsletter form returns a clear configuration message when email delivery is not configured. Do not collect public subscriptions until delivery is ready.

## Production requirements — do not deploy yet without these

1. Set `CLAUDVIA_DATABASE_URL` to a persistent PostgreSQL database and configure SSL as required by that provider.
2. Set `CLAUDVIA_TOKEN_SECRET` and `CLAUDVIA_RATE_LIMIT_SECRET` to long random values (at least 32 characters each).
3. Configure SMTP, `EMAIL_FROM`, `CONTACT_EMAIL`, `APP_BASE_URL`, and `NEXT_PUBLIC_SITE_URL`.
4. Review the chosen hosting/database/email providers' current free-tier, commercial-use, data-retention, and sending limits before launch.
5. Set the real production URL only after a domain/host has been chosen. No domain has been assumed or purchased.

Production startup fails closed if the persistent database or token secret is missing. This avoids silently losing subscriptions in ephemeral serverless storage.

## Content updates

- Add or revise company announcements in `content/updates.ts`.
- Add or revise documentation entries in `content/docs.ts`.
- No CMS or public admin account is created at this stage. Content changes go through Git until a real need for a CMS exists.

To email an announcement to all confirmed subscribers, run this manually from the project root after the update is published and email is configured:

```sh
npm run send:update -- --slug=your-update-slug
```

This sends one message per confirmed subscriber. The script checks that the slug exists and asks for no credentials in the terminal; email is sent only because the operator explicitly ran the command. Use a test inbox first and follow applicable email/privacy rules before any real broadcast.

## Verification commands

```sh
npm run typecheck
npm run build
```

No deployment is configured by this repository. No production service is claimed to be live.
