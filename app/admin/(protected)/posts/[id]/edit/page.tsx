import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { getPostById } from "@/lib/posts";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({
  params,
}: EditPostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <main className="admin-page">
      <div className="admin-content">
        <Link href="/admin" className="back-link">
          ← Volver al panel
        </Link>
        <p className="eyebrow">Editar publicación</p>
        <h1>{post.title}</h1>
        <PostForm post={post} />
      </div>
    </main>
  );
}
