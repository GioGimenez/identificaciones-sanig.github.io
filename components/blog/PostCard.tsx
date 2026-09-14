import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/posts";

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

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="blog-card">
      {post.imageUrl ? (
        <Image
          className="blog-card-image"
          src={post.imageUrl}
          alt={post.imageAlt || post.title}
          width={1200}
          height={700}
          sizes="(max-width: 800px) 100vw, 420px"
        />
      ) : null}
      <div className="blog-card-body">
        <p className="post-date">{formatDate(post.publishedAt)}</p>
        <h2>{post.title}</h2>
        <p>{post.excerpt || post.content.slice(0, 180)}</p>
        <Link href={"/blog/" + post.slug} className="read-more">
          Leer artículo →
        </Link>
      </div>
    </article>
  );
}
