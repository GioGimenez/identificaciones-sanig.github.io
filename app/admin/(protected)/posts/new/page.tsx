import Link from "next/link";
import { PostForm } from "@/components/admin/PostForm";

export default function NewPostPage() {
  return (
    <main className="admin-page">
      <div className="admin-content">
        <Link href="/admin" className="back-link">
          ← Volver al panel
        </Link>
        <p className="eyebrow">Nueva publicación</p>
        <h1>Crear artículo</h1>
        <PostForm />
      </div>
    </main>
  );
}
