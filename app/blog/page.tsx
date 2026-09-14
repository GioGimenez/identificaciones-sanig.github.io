import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/blog/PostCard";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Departamento de Identificaciones",
  description:
    "Noticias y novedades de la Oficina Regional San Ignacio - Misiones.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="blog-page">
      <div className="blog-shell">
        <Link href="/" className="back-link">
          ← Volver al inicio
        </Link>
        <p className="eyebrow">Noticias y novedades</p>
        <h1>Blog</h1>
        <p className="blog-intro">
          Información institucional de la Oficina Regional del Departamento de
          Identificaciones de San Ignacio.
        </p>

        {posts.length > 0 ? (
          <div className="blog-grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            Todavía no hay publicaciones disponibles.
          </div>
        )}
      </div>
    </main>
  );
}
