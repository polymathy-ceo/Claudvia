export type DocumentationPage = {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const documentation: DocumentationPage[] = [
  {
    slug: "company-overview",
    title: "Company overview",
    summary: "What Claudvia is, what this website represents, and how company information is maintained.",
    updated: "27 October 2026",
    sections: [
      {
        heading: "About Claudvia",
        paragraphs: [
          "Claudvia is a technology venture being developed around useful software, digital products, developer tools, and—over time—technology infrastructure.",
          "The company is at an early stage. This website communicates current direction and published information; it does not imply that every concept on the roadmap is already available or that the business has completed legal registration or trademark clearance."
        ]
      },
      {
        heading: "How to read product information",
        paragraphs: [
          "Each ecosystem item should be described as available, in development, under evaluation, or planned. A roadmap item is not a public service, and no launch date should be assumed unless a dated announcement explicitly states one."
        ]
      },
      {
        heading: "Company updates",
        paragraphs: [
          "Announcements are published in the Updates section when there is a meaningful change, release, decision, or milestone to communicate. Content is maintained as structured files in the project repository until a content-management workflow is justified."
        ]
      }
    ]
  },
  {
    slug: "ecosystem-status",
    title: "Ecosystem and availability status",
    summary: "How Claudvia distinguishes current work from future ideas.",
    updated: "27 October 2026",
    sections: [
      {
        heading: "Current focus",
        paragraphs: [
          "The immediate project is the Claudvia company website and its information architecture. This codebase is a development foundation; it is not a claim that the public website or its email services are already live."
        ]
      },
      {
        heading: "Future areas of exploration",
        paragraphs: [
          "A code-hosting and collaboration platform, application hosting, developer APIs, messaging services, and supporting infrastructure are longer-term areas of interest. They are not represented as available products here.",
          "Any future service description should include its real availability, supported capabilities, operational requirements, and material limitations."
        ]
      }
    ]
  },
  {
    slug: "updates-subscriptions",
    title: "Email updates and subscriptions",
    summary: "How the newsletter is designed to collect consent and manage subscribers.",
    updated: "27 October 2026",
    sections: [
      {
        heading: "Consent and confirmation",
        paragraphs: [
          "Subscriptions are intended for people who actively enter an email address and agree to receive Claudvia company updates. A confirmation message is sent before an address becomes an active subscriber.",
          "Confirmation links expire after 24 hours and are stored as hashes in the application database. Opening a link displays a confirmation page; a separate action is required to complete confirmation."
        ]
      },
      {
        heading: "Unsubscribing",
        paragraphs: [
          "Every subscription email should contain an unsubscribe link. Unsubscribing changes the address status so it is excluded from future broadcasts. The subscription system is not enabled for public collection until database persistence and email delivery are configured."
        ]
      },
      {
        heading: "Data and retention",
        paragraphs: [
          "The proposed system stores the email address, subscription status, consent timestamp, consent-text version, and the timestamps needed to administer confirmation and unsubscribe requests. It hashes IP addresses for rate limiting rather than storing raw IP addresses in the rate-limit table.",
          "Before public launch, Claudvia should publish a complete privacy notice identifying the operator, contact channel, retention approach, service providers, and applicable rights. This technical description is not a substitute for legal advice or a complete privacy notice."
        ]
      }
    ]
  },
  {
    slug: "technical-direction",
    title: "Technical direction",
    summary: "Principles for keeping the website lightweight, portable, and maintainable.",
    updated: "27 October 2026",
    sections: [
      {
        heading: "Architecture",
        paragraphs: [
          "The website uses Next.js App Router and TypeScript with plain CSS to avoid unnecessary client-side dependencies. Company updates and documentation live in structured content files.",
          "In local development, subscriber test records can be stored in a local JSON file. Production startup requires a configured PostgreSQL database so data is not silently written to an ephemeral serverless filesystem."
        ]
      },
      {
        heading: "Portability and ownership",
        paragraphs: [
          "The project keeps application logic separate from its persistence adapter and email transport. That makes it easier to move providers or later operate services on infrastructure Claudvia controls, while recognizing that reliable hosting still requires computing resources, networking, security, backups, and maintenance."
        ]
      }
    ]
  }
];
