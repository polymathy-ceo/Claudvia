import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type SubscriberStatus = "pending" | "active" | "unsubscribed";

export type Subscriber = {
  id: string;
  email: string;
  status: SubscriberStatus;
  consentedAt: number;
  consentTextVersion: string;
  createdAt: number;
  updatedAt: number;
  confirmationTokenHash: string | null;
  confirmationExpiresAt: number | null;
  unsubscribeTokenHash: string;
  confirmedAt: number | null;
  unsubscribedAt: number | null;
};

type LocalState = {
  subscribers: Subscriber[];
  rateLimits: Record<string, { windowStartedAt: number; attempts: number }>;
};

export interface Store {
  getSubscriberByEmail(email: string): Promise<Subscriber | null>;
  getSubscriberByConfirmationHash(tokenHash: string): Promise<Subscriber | null>;
  getSubscriberByUnsubscribeHash(tokenHash: string): Promise<Subscriber | null>;
  savePendingSubscriber(subscriber: Subscriber): Promise<boolean>;
  activateByConfirmationHash(tokenHash: string, now: number): Promise<boolean>;
  unsubscribeByTokenHash(tokenHash: string, now: number): Promise<boolean>;
  incrementRateLimit(bucket: string, now: number, windowMs: number): Promise<number>;
  listActiveSubscribers(): Promise<Subscriber[]>;
}

const localPath = path.join(process.cwd(), "data", "dev-store.json");
let storePromise: Promise<Store> | null = null;

async function readLocalState(): Promise<LocalState> {
  await mkdir(path.dirname(localPath), { recursive: true });
  try {
    const raw = await readFile(localPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    return {
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
      rateLimits: parsed.rateLimits && typeof parsed.rateLimits === "object" ? parsed.rateLimits : {}
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { subscribers: [], rateLimits: {} };
    }
    throw error;
  }
}

async function writeLocalState(state: LocalState): Promise<void> {
  await mkdir(path.dirname(localPath), { recursive: true });
  const temporaryPath = `${localPath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(state, null, 2), { encoding: "utf8", mode: 0o600 });
  await rename(temporaryPath, localPath);
}

class LocalJsonStore implements Store {
  async getSubscriberByEmail(email: string): Promise<Subscriber | null> {
    const state = await readLocalState();
    return state.subscribers.find((item) => item.email === email) ?? null;
  }

  async getSubscriberByConfirmationHash(tokenHash: string): Promise<Subscriber | null> {
    const state = await readLocalState();
    return state.subscribers.find((item) => item.confirmationTokenHash === tokenHash) ?? null;
  }

  async getSubscriberByUnsubscribeHash(tokenHash: string): Promise<Subscriber | null> {
    const state = await readLocalState();
    return state.subscribers.find((item) => item.unsubscribeTokenHash === tokenHash) ?? null;
  }

  async savePendingSubscriber(subscriber: Subscriber): Promise<boolean> {
    const state = await readLocalState();
    const index = state.subscribers.findIndex((item) => item.email === subscriber.email);
    if (index >= 0) {
      if (state.subscribers[index].status === "active") return false;
      state.subscribers[index] = { ...subscriber, id: state.subscribers[index].id };
    } else {
      state.subscribers.push(subscriber);
    }
    await writeLocalState(state);
    return true;
  }

  async activateByConfirmationHash(tokenHash: string, now: number): Promise<boolean> {
    const state = await readLocalState();
    const subscriber = state.subscribers.find(
      (item) => item.confirmationTokenHash === tokenHash && item.status === "pending"
    );
    if (!subscriber || !subscriber.confirmationExpiresAt || subscriber.confirmationExpiresAt <= now) {
      return false;
    }
    subscriber.status = "active";
    subscriber.confirmedAt = now;
    subscriber.updatedAt = now;
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationExpiresAt = null;
    await writeLocalState(state);
    return true;
  }

  async unsubscribeByTokenHash(tokenHash: string, now: number): Promise<boolean> {
    const state = await readLocalState();
    const subscriber = state.subscribers.find((item) => item.unsubscribeTokenHash === tokenHash);
    if (!subscriber || subscriber.status === "unsubscribed") return false;
    subscriber.status = "unsubscribed";
    subscriber.unsubscribedAt = now;
    subscriber.updatedAt = now;
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationExpiresAt = null;
    await writeLocalState(state);
    return true;
  }

  async incrementRateLimit(bucket: string, now: number, windowMs: number): Promise<number> {
    const state = await readLocalState();
    const current = state.rateLimits[bucket];
    if (!current || current.windowStartedAt <= now - windowMs) {
      state.rateLimits[bucket] = { windowStartedAt: now, attempts: 1 };
    } else {
      current.attempts += 1;
    }
    // Keep only a short window of hashed rate-limit buckets in development storage.
    for (const [key, value] of Object.entries(state.rateLimits)) {
      if (value.windowStartedAt < now - 7 * 24 * 60 * 60 * 1000) delete state.rateLimits[key];
    }
    await writeLocalState(state);
    return state.rateLimits[bucket].attempts;
  }

  async listActiveSubscribers(): Promise<Subscriber[]> {
    const state = await readLocalState();
    return state.subscribers.filter((item) => item.status === "active");
  }
}

function toSubscriber(row: Record<string, unknown>): Subscriber {
  const numberOrNull = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    return Number(value);
  };
  return {
    id: String(row.id),
    email: String(row.email),
    status: row.status as SubscriberStatus,
    consentedAt: Number(row.consented_at),
    consentTextVersion: String(row.consent_text_version),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    confirmationTokenHash: row.confirmation_token_hash == null ? null : String(row.confirmation_token_hash),
    confirmationExpiresAt: numberOrNull(row.confirmation_expires_at),
    unsubscribeTokenHash: String(row.unsubscribe_token_hash),
    confirmedAt: numberOrNull(row.confirmed_at),
    unsubscribedAt: numberOrNull(row.unsubscribed_at)
  };
}

class PostgresStore implements Store {
  constructor(private readonly pool: import("pg").Pool) {}

  async getSubscriberByEmail(email: string): Promise<Subscriber | null> {
    const result = await this.pool.query("SELECT * FROM claudvia_subscribers WHERE email = $1 LIMIT 1", [email]);
    return result.rows[0] ? toSubscriber(result.rows[0] as Record<string, unknown>) : null;
  }

  async getSubscriberByConfirmationHash(tokenHash: string): Promise<Subscriber | null> {
    const result = await this.pool.query(
      "SELECT * FROM claudvia_subscribers WHERE confirmation_token_hash = $1 LIMIT 1",
      [tokenHash]
    );
    return result.rows[0] ? toSubscriber(result.rows[0] as Record<string, unknown>) : null;
  }

  async getSubscriberByUnsubscribeHash(tokenHash: string): Promise<Subscriber | null> {
    const result = await this.pool.query(
      "SELECT * FROM claudvia_subscribers WHERE unsubscribe_token_hash = $1 LIMIT 1",
      [tokenHash]
    );
    return result.rows[0] ? toSubscriber(result.rows[0] as Record<string, unknown>) : null;
  }

  async savePendingSubscriber(subscriber: Subscriber): Promise<boolean> {
    const result = await this.pool.query(
      `INSERT INTO claudvia_subscribers (
        id, email, status, consented_at, consent_text_version, created_at, updated_at,
        confirmation_token_hash, confirmation_expires_at, unsubscribe_token_hash, confirmed_at, unsubscribed_at
      ) VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8, $9, NULL, NULL)
      ON CONFLICT (email) DO UPDATE SET
        status = 'pending', consented_at = EXCLUDED.consented_at,
        consent_text_version = EXCLUDED.consent_text_version, updated_at = EXCLUDED.updated_at,
        confirmation_token_hash = EXCLUDED.confirmation_token_hash,
        confirmation_expires_at = EXCLUDED.confirmation_expires_at,
        unsubscribe_token_hash = EXCLUDED.unsubscribe_token_hash, unsubscribed_at = NULL
      WHERE claudvia_subscribers.status <> 'active'
      RETURNING id`,
      [
        subscriber.id,
        subscriber.email,
        subscriber.consentedAt,
        subscriber.consentTextVersion,
        subscriber.createdAt,
        subscriber.updatedAt,
        subscriber.confirmationTokenHash,
        subscriber.confirmationExpiresAt,
        subscriber.unsubscribeTokenHash
      ]
    );
    return result.rowCount === 1;
  }

  async activateByConfirmationHash(tokenHash: string, now: number): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE claudvia_subscribers SET status = 'active', confirmed_at = $2, updated_at = $2,
        confirmation_token_hash = NULL, confirmation_expires_at = NULL
       WHERE confirmation_token_hash = $1 AND status = 'pending' AND confirmation_expires_at > $2
       RETURNING id`,
      [tokenHash, now]
    );
    return result.rowCount === 1;
  }

  async unsubscribeByTokenHash(tokenHash: string, now: number): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE claudvia_subscribers SET status = 'unsubscribed', unsubscribed_at = $2, updated_at = $2,
        confirmation_token_hash = NULL, confirmation_expires_at = NULL
       WHERE unsubscribe_token_hash = $1 AND status <> 'unsubscribed'
       RETURNING id`,
      [tokenHash, now]
    );
    return result.rowCount === 1;
  }

  async incrementRateLimit(bucket: string, now: number, windowMs: number): Promise<number> {
    const result = await this.pool.query(
      `INSERT INTO claudvia_rate_limits (bucket, window_started_at, attempts)
       VALUES ($1, $2, 1)
       ON CONFLICT (bucket) DO UPDATE SET
         window_started_at = CASE WHEN claudvia_rate_limits.window_started_at <= $3 THEN EXCLUDED.window_started_at ELSE claudvia_rate_limits.window_started_at END,
         attempts = CASE WHEN claudvia_rate_limits.window_started_at <= $3 THEN 1 ELSE claudvia_rate_limits.attempts + 1 END
       RETURNING attempts`,
      [bucket, now, now - windowMs]
    );
    return Number(result.rows[0]?.attempts ?? 1);
  }

  async listActiveSubscribers(): Promise<Subscriber[]> {
    const result = await this.pool.query(
      "SELECT * FROM claudvia_subscribers WHERE status = 'active' ORDER BY confirmed_at ASC"
    );
    return result.rows.map((row) => toSubscriber(row as Record<string, unknown>));
  }
}

async function createStore(): Promise<Store> {
  const connectionString = process.env.CLAUDVIA_DATABASE_URL;
  if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Production requires CLAUDVIA_DATABASE_URL pointing to persistent PostgreSQL storage.");
    }
    return new LocalJsonStore();
  }

  if (process.env.NODE_ENV === "production" && (!process.env.CLAUDVIA_TOKEN_SECRET || process.env.CLAUDVIA_TOKEN_SECRET.length < 32)) {
    throw new Error("Set CLAUDVIA_TOKEN_SECRET to at least 32 characters before production use.");
  }

  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString,
    ssl: process.env.CLAUDVIA_DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
    max: 5,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 30000
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS claudvia_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'unsubscribed')),
      consented_at BIGINT NOT NULL,
      consent_text_version TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      confirmation_token_hash TEXT,
      confirmation_expires_at BIGINT,
      unsubscribe_token_hash TEXT NOT NULL,
      confirmed_at BIGINT,
      unsubscribed_at BIGINT
    )
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS claudvia_subscribers_status_idx ON claudvia_subscribers(status)");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS claudvia_rate_limits (
      bucket TEXT PRIMARY KEY,
      window_started_at BIGINT NOT NULL,
      attempts INTEGER NOT NULL
    )
  `);
  await pool.query("DELETE FROM claudvia_rate_limits WHERE window_started_at < $1", [Date.now() - 7 * 24 * 60 * 60 * 1000]);
  return new PostgresStore(pool);
}

export async function getStore(): Promise<Store> {
  if (!storePromise) storePromise = createStore();
  return storePromise;
}
