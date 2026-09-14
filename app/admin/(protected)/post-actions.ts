"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { deleteBlogImage } from "@/lib/storage";
import { getTursoClient } from "@/lib/turso";
import { getPostById } from "@/lib/posts";
import { requireAdmin } from "@/lib/auth";

type ActionResult = {
  ok: boolean;
  error?: string;
};

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function validId(id: string) {
  return /^[a-zA-Z0-9_-]{1,100}$/.test(id);
}

function validImagePath(path: string) {
  return path.startsWith("posts/") && !path.includes("..");
}

export async function savePost(formData: FormData): Promise<ActionResult> {
  const user = await requireAdmin();
  const db = getTursoClient();

  if (!db) {
    return { ok: false, error: "Turso no está configurado." };
  }

  const id = value(formData, "id") || randomUUID();
  const title = value(formData, "title");
  const slug = slugify(value(formData, "slug") || title);
  const excerpt = value(formData, "excerpt");
  const content = String(formData.get("content") ?? "").trim();
  const imagePath = value(formData, "image_path");
  const imageUrl = value(formData, "image_url");
  const imageAlt = value(formData, "image_alt");
  const status = value(formData, "status") === "published" ? "published" : "draft";

  if (!validId(id)) {
    return { ok: false, error: "Identificador de publicación no válido." };
  }

  if (!title || title.length < 3) {
    return { ok: false, error: "El título debe tener al menos 3 caracteres." };
  }

  if (!slug) {
    return { ok: false, error: "No se pudo generar un slug válido." };
  }

  if (!content || content.length < 10) {
    return { ok: false, error: "El contenido debe tener al menos 10 caracteres." };
  }

  if (!imagePath || !imageUrl || !validImagePath(imagePath)) {
    return { ok: false, error: "Debés cargar una imagen válida." };
  }

  const previous = await getPostById(id);
  const publishedAt =
    status === "published"
      ? previous?.publishedAt ?? new Date().toISOString()
      : null;

  try {
    if (previous) {
      await db.execute({
        sql:
          "UPDATE posts SET slug = ?, title = ?, excerpt = ?, content = ?, " +
          "image_path = ?, image_url = ?, image_alt = ?, status = ?, " +
          "published_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        args: [
          slug,
          title,
          excerpt,
          content,
          imagePath,
          imageUrl,
          imageAlt,
          status,
          publishedAt,
          id,
        ],
      });
    } else {
      await db.execute({
        sql:
          "INSERT INTO posts " +
          "(id, slug, title, excerpt, content, image_path, image_url, " +
          "image_alt, status, author_id, published_at) " +
          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [
          id,
          slug,
          title,
          excerpt,
          content,
          imagePath,
          imageUrl,
          imageAlt,
          status,
          user.id,
          publishedAt,
        ],
      });
    }
  } catch (error) {
    console.error("No se pudo guardar la publicación:", error);
    return {
      ok: false,
      error: "No se pudo guardar. Verificá que el slug no esté repetido.",
    };
  }

  if (previous?.imagePath && previous.imagePath !== imagePath) {
    await deleteBlogImage(previous.imagePath).catch((error) => {
      console.error("No se pudo eliminar la imagen anterior:", error);
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/blog");
  return { ok: true };
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const db = getTursoClient();
  const id = value(formData, "id");

  if (!db || !validId(id)) {
    redirect("/admin");
  }

  const post = await getPostById(id);

  if (!post) {
    redirect("/admin");
  }

  await db.execute({
    sql: "DELETE FROM posts WHERE id = ?",
    args: [id],
  });

  if (post.imagePath) {
    await deleteBlogImage(post.imagePath).catch((error) => {
      console.error("No se pudo eliminar la imagen del artículo:", error);
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/blog");
  redirect("/admin");
}
