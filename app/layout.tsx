import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Claudvia — Built Beyond Limits.",
    template: "%s | Claudvia"
  },
  description: "Claudvia is a technology venture focused on useful software, digital products, developer tools, and technology infrastructure over time.",
  applicationName: "Claudvia",
  verification: {
    google: "9aiwWr6tCKm6_F2ccTjWxjPldItJLDQn49wO7aOXKQA"
  },
  openGraph: {
    type: "website",
    siteName: "Claudvia",
    title: "Claudvia — Built Beyond Limits.",
    description: "Software, digital products, and technology infrastructure—built with intent."
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#090a0c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <ScrollReveal />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
