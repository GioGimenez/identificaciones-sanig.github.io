"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Post } from "@/lib/posts";
import { savePost } from "@/app/admin/(protected)/post-actions";

type PostFormProps = {
  post?: Post;
};

export function PostForm({ post }: PostFormProps) {
  const [id] = useState(() => post?.id ?? crypto.randomUUID());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    let uploadedPath = "";

    try {
      const form = new FormData(event.currentTarget);
      form.set("id", id);
      const fileInput = event.currentTarget.elements.namedItem(
        "image",
      ) as HTMLInputElement | null;
      const file = fileInput?.files?.[0];

      if (file && file.size > 0) {
        const uploadData = new FormData();
        uploadData.set("image", file);
        uploadData.set("postId", id);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadResult.error ?? "No se pudo cargar la imagen.");
        }

        uploadedPath = uploadResult.path;
        form.set("image_path", uploadResult.path);
        form.set("image_url", uploadResult.url);
      }

      const result = await savePost(form);

      if (!result.ok) {
        if (uploadedPath) {
          await fetch("/api/admin/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: uploadedPath }),
          });
          uploadedPath = "";
        }
        throw new Error(result.error ?? "No se pudo guardar la publicación.");
      }

      window.location.assign("/admin");
    } catch (submitError) {
      if (uploadedPath) {
        await fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: uploadedPath }),
        }).catch(() => undefined);
      }
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Ocurrió un error inesperado.",
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <input type="hidden" name="image_path" defaultValue={post?.imagePath} />
      <input type="hidden" name="image_url" defaultValue={post?.imageUrl} />

      <label htmlFor="title">Título</label>
      <input
        id="title"
        name="title"
        defaultValue={post?.title}
        required
        minLength={3}
      />

      <label htmlFor="slug">Slug</label>
      <input
        id="slug"
        name="slug"
        defaultValue={post?.slug}
        placeholder="se-genera-desde-el-titulo"
      />

      <label htmlFor="excerpt">Resumen</label>
      <textarea
        id="excerpt"
        name="excerpt"
        defaultValue={post?.excerpt}
        rows={3}
      />

      <label htmlFor="content">Contenido</label>
      <textarea
        id="content"
        name="content"
        defaultValue={post?.content}
        rows={12}
        required
        minLength={10}
      />

      <label htmlFor="image_alt">Texto alternativo de la imagen</label>
      <input
        id="image_alt"
        name="image_alt"
        defaultValue={post?.imageAlt}
        required
      />

      <label htmlFor="image">
        Imagen principal {post ? "(opcional para conservar la actual)" : ""}
      </label>
      {post?.imageUrl ? (
        <img
          className="post-image-preview"
          src={post.imageUrl}
          alt={post.imageAlt}
        />
      ) : null}
      <input
        id="image"
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={!post}
      />

      <label htmlFor="status">Estado</label>
      <select id="status" name="status" defaultValue={post?.status ?? "draft"}>
        <option value="draft">Borrador</option>
        <option value="published">Publicado</option>
      </select>

      <button type="submit" className="button" disabled={pending}>
        {pending ? "Guardando..." : post ? "Guardar cambios" : "Crear publicación"}
      </button>
    </form>
  );
}
