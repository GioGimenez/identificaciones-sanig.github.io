import { requireAdmin } from "@/lib/auth";
import { getAdminPosts } from "@/lib/posts";
import { deletePost } from "./post-actions";
import Link from "next/link";
import { logout } from "./actions";

export default async function AdminPage() {
  const user = await requireAdmin();
  const posts = await getAdminPosts();

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Panel administrativo</p>
          <h1>Gestión del blog</h1>
          <p>Sesión iniciada como {user.email}</p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/posts/new" className="button">
            Nueva publicación
          </Link>
          <form action={logout}>
            <button type="submit" className="button button-secondary">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <section className="admin-content card">
        <h2>Publicaciones</h2>
        {posts.length === 0 ? (
          <p>Aún no hay publicaciones. Creá la primera para comenzar.</p>
        ) : (
          <div className="post-list">
            {posts.map((post) => (
              <article className="post-row" key={post.id}>
                <div>
                  <p className="post-status">{post.status}</p>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt || "Sin resumen"}</p>
                </div>
                <div className="post-row-actions">
                  <Link href={"/admin/posts/" + post.id + "/edit"}>
                    Editar
                  </Link>
                  <form action={deletePost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button type="submit" className="text-button">
                      Eliminar
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
