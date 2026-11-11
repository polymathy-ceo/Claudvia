
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export type CompanyUpdate = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  continuation: string | null;
  status: "draft" | "published";
  imageUrl: string | null;
  imagePublicId: string | null;
  imageCaption: string | null;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
};

type Row = Record<string, unknown>;

type SqlClient = {
  query: (query: string, params?: unknown[]) => Promise<Row[]>;
};

let initPromise: Promise<SqlClient> | null = null;

async function database(): Promise<SqlClient> {
  const url = process.env.CLAUDVIA_DATABASE_URL;

  if (!url) {
    throw new Error("CLAUDVIA_DATABASE_URL is not configured.");
  }

  if (!initPromise) {
    initPromise = (async () => {
      const sql = neon(url) as unknown as SqlClient;

      await sql.query(`
        CREATE TABLE IF NOT EXISTS claudvia_updates (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          summary TEXT NOT NULL,
          content TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL,
          published_at BIGINT,
          image_url TEXT,
          image_public_id TEXT,
          image_caption TEXT
        )
      `);

      await sql.query(`
        ALTER TABLE claudvia_updates
        ADD COLUMN IF NOT EXISTS image_url TEXT,
        ADD COLUMN IF NOT EXISTS image_public_id TEXT,
        ADD COLUMN IF NOT EXISTS image_caption TEXT,
        ADD COLUMN IF NOT EXISTS continuation TEXT
      `);

      await sql.query(
        "CREATE INDEX IF NOT EXISTS claudvia_updates_public_idx ON claudvia_updates(status, published_at DESC)"
      );

      return sql;
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

function mapRow(row: Row): CompanyUpdate {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    category: String(row.category),
    summary: String(row.summary),
    content: String(row.content),
    continuation: row.continuation == null ? null : String(row.continuation),
    status: row.status as "draft" | "published",
    imageUrl: row.image_url == null ? null : String(row.image_url),
    imagePublicId: row.image_public_id == null ? null : String(row.image_public_id),
    imageCaption: row.image_caption == null ? null : String(row.image_caption),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    publishedAt: row.published_at == null ? null : Number(row.published_at),
  };
}

export async function listPublishedUpdates(): Promise<CompanyUpdate[]> {
  const sql = await database();

  const rows = await sql.query(
    "SELECT * FROM claudvia_updates WHERE status = 'published' ORDER BY published_at DESC"
  );

  return rows.map(mapRow);
}

export async function getPublishedUpdate(
  slug: string
): Promise<CompanyUpdate | null> {
  const sql = await database();

  const rows = await sql.query(
    "SELECT * FROM claudvia_updates WHERE slug = $1 AND status = 'published' LIMIT 1",
    [slug]
  );

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function listAdminUpdates(): Promise<CompanyUpdate[]> {
  const sql = await database();

  const rows = await sql.query(
    "SELECT * FROM claudvia_updates ORDER BY updated_at DESC"
  );

  return rows.map(mapRow);
}

export async function saveUpdate(input: {
  id?: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  continuation?: string | null;
  status: "draft" | "published";
  imageUrl?: string | null;
  imagePublicId?: string | null;
  imageCaption?: string | null;
}): Promise<CompanyUpdate> {
  const sql = await database();
  const now = Date.now();
  const id = input.id || randomUUID();
  const publishedAt = input.status === "published" ? now : null;

  const rows = await sql.query(
    `INSERT INTO claudvia_updates
      (id, slug, title, category, summary, content, continuation, status,
       image_url, image_public_id, image_caption,
       created_at, updated_at, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12,$13)
     ON CONFLICT (id) DO UPDATE SET
       slug=EXCLUDED.slug,
       title=EXCLUDED.title,
       category=EXCLUDED.category,
       summary=EXCLUDED.summary,
       content=EXCLUDED.content,
       continuation=EXCLUDED.continuation,
       status=EXCLUDED.status,
       image_url=EXCLUDED.image_url,
       image_public_id=EXCLUDED.image_public_id,
       image_caption=EXCLUDED.image_caption,
       updated_at=EXCLUDED.updated_at,
       published_at=CASE
         WHEN EXCLUDED.status='draft' THEN NULL
         WHEN claudvia_updates.status='published' THEN claudvia_updates.published_at
         ELSE EXCLUDED.published_at
       END
     RETURNING *`,
    [
      id,
      input.slug,
      input.title,
      input.category,
      input.summary,
      input.content,
      input.continuation || null,
      input.status,
      input.imageUrl || null,
      input.imagePublicId || null,
      input.imageCaption || null,
      now,
      publishedAt,
    ]
  );

  if (!rows[0]) {
    throw new Error("The update could not be saved.");
  }

  return mapRow(rows[0]);
}

export async function deleteUpdate(id: string): Promise<void> {
  const sql = await database();

  await sql.query(
    "DELETE FROM claudvia_updates WHERE id = $1",
    [id]
  );
}
