import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/posts";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("es-PY", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return { title: "Artículo no encontrado" };
  }

  return {
    title: post.title + " | Departamento de Identificaciones",
    description: post.excerpt || post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="article-page">
      <article className="article-shell">
        <Link href="/blog" className="back-link">
          ← Volver al blog
        </Link>
        <p className="post-date">{formatDate(post.publishedAt)}</p>
        <h1>{post.title}</h1>
        {post.imageUrl ? (
          <Image
            className="article-image"
            src={post.imageUrl}
            alt={post.imageAlt || post.title}
            width={1400}
            height={820}
            priority
            sizes="(max-width: 900px) 100vw, 900px"
          />
        ) : null}
        <p className="article-excerpt">{post.excerpt}</p>
        <div className="article-content">{post.content}</div>
      </article>
    </main>
  );
}
