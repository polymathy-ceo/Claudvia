type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

function getSender() {
  const from = process.env.EMAIL_FROM?.trim() ?? "";
  const match = from.match(/^(.*?)\s*<([^<>]+)>$/);

  if (match) {
    return {
      name: match[1].trim() || "Claudvia",
      email: match[2].trim()
    };
  }

  return {
    name: "Claudvia",
    email: from
  };
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.BREVO_API_KEY &&
    process.env.EMAIL_FROM
  );
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = getSender();

  if (!apiKey || !sender.email) {
    throw new Error(
      "Brevo email is not configured. Check BREVO_API_KEY and EMAIL_FROM."
    );
  }

  const payload: Record<string, unknown> = {
    sender,
    to: [{ email: message.to }],
    subject: message.subject,
    textContent: message.text,
    htmlContent: message.html
  };

  if (message.replyTo) {
    payload.replyTo = { email: message.replyTo };
  }

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000)
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Brevo email request failed (${response.status}): ${details.slice(0, 1000)}`
    );
  }
}
