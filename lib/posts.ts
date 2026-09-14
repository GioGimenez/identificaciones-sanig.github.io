import { getTursoClient } from "@/lib/turso";

export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imagePath: string;
  imageUrl: string;
  imageAlt: string;
  status: PostStatus;
  authorId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nullableText(value: unknown) {
  return typeof value === "string" ? value : null;
}

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: text(row.id),
    slug: text(row.slug),
    title: text(row.title),
    excerpt: text(row.excerpt),
    content: text(row.content),
    imagePath: text(row.image_path),
    imageUrl: text(row.image_url),
    imageAlt: text(row.image_alt),
    status: row.status === "published" ? "published" : "draft",
    authorId: text(row.author_id),
    publishedAt: nullableText(row.published_at),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
  };
}

export async function getAdminPosts() {
  const db = getTursoClient();

  if (!db) {
    return [];
  }

  const result = await db.execute(
    "SELECT id, slug, title, excerpt, content, image_path, image_url, " +
      "image_alt, status, author_id, published_at, created_at, updated_at " +
      "FROM posts ORDER BY created_at DESC",
  );

  return (result.rows as unknown as Record<string, unknown>[]).map(mapPost);
}

export async function getPostById(id: string) {
  const db = getTursoClient();

  if (!db) {
    return null;
  }

  const result = await db.execute({
    sql:
      "SELECT id, slug, title, excerpt, content, image_path, image_url, " +
      "image_alt, status, author_id, published_at, created_at, updated_at " +
      "FROM posts WHERE id = ? LIMIT 1",
    args: [id],
  });

  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapPost(row) : null;
}

export async function getPublishedPosts() {
  const db = getTursoClient();

  if (!db) {
    return [];
  }

  const result = await db.execute(
    "SELECT id, slug, title, excerpt, content, image_path, image_url, " +
      "image_alt, status, author_id, published_at, created_at, updated_at " +
      "FROM posts WHERE status = 'published' " +
      "AND published_at IS NOT NULL AND published_at <= ? " +
      "ORDER BY published_at DESC",
    [new Date().toISOString()],
  );

  return (result.rows as unknown as Record<string, unknown>[]).map(mapPost);
}

export async function getPublishedPostBySlug(slug: string) {
  const db = getTursoClient();

  if (!db) {
    return null;
  }

  const result = await db.execute({
    sql:
      "SELECT id, slug, title, excerpt, content, image_path, image_url, " +
      "image_alt, status, author_id, published_at, created_at, updated_at " +
      "FROM posts WHERE slug = ? AND status = 'published' " +
      "AND published_at IS NOT NULL AND published_at <= ? LIMIT 1",
    args: [slug, new Date().toISOString()],
  });

  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapPost(row) : null;
}
