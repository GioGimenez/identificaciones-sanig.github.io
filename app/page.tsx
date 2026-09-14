import Image from "next/image";
import { getNoticias } from "@/lib/noticias";
import { getPublishedPosts } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import type { Noticia } from "@/lib/site-data";

export const dynamic = "force-dynamic";

const menu = [
  ["Inicio", "#inicio"],
  ["Quiénes Somos", "#nosotros"],
  ["Servicios", "#servicios"],
  ["Noticias", "/blog"],
  ["Galería", "#galeria"],
  ["Ubicación", "#ubicacion"],
  ["Contacto", "#contacto"],
] as const;

function formatFecha(fecha: string) {
  const date = new Date(fecha + "T12:00:00");

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return new Intl.DateTimeFormat("es-PY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function NewsCard({ noticia }: { noticia: Noticia }) {
  return (
    <article className="card noticia">
      <p className="noticia-fecha">{formatFecha(noticia.fecha)}</p>
      <h3>{noticia.titulo}</h3>
      <p>
        <strong>{noticia.lugar}</strong>
      </p>
      <p>{noticia.contenido}</p>
      {noticia.imagen ? (
        <Image
          className="noticia-imagen"
          src={noticia.imagen}
          alt={noticia.imagenAlt}
          width={1200}
          height={800}
          sizes="(max-width: 900px) 100vw, 900px"
        />
      ) : null}
    </article>
  );
}

export default async function Home() {
  const [noticias, posts] = await Promise.all([
    getNoticias(),
    getPublishedPosts(),
  ]);

  return (
    <>
      <header id="inicio" className="site-header">
        <div className="logo-container">
          <Image
            src="/img/logo-policia.jpg"
            alt="Policía Nacional del Paraguay"
            width={90}
            height={90}
            priority
          />
        </div>

        <div className="site-title">
          <h1>Departamento de Identificaciones</h1>
          <h2>Oficina Regional San Ignacio - Misiones</h2>
          <p>Policía Nacional del Paraguay</p>
        </div>

        <div className="logo-container">
          <Image
            src="/img/logo-identificaciones.jpg"
            alt="Departamento de Identificaciones"
            width={90}
            height={90}
            priority
          />
        </div>
      </header>

      <nav className="site-nav" aria-label="Navegación principal">
        <ul>
          {menu.map(([label, href]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <a className="floating-login" href="/admin/login">
        Iniciar sesión
      </a>

      <main>
        <section className="banner">
          <div className="banner-text">
            <p className="eyebrow">Oficina Regional San Ignacio</p>
            <h2>Bienvenidos</h2>
            <p>
              Bienvenidos al portal oficial de la Oficina Regional del
              Departamento de Identificaciones de San Ignacio, Misiones.
            </p>
            <p>
              Trabajamos para garantizar el derecho a la identidad de todos
              los ciudadanos mediante un servicio eficiente, transparente y
              cercano a la comunidad.
            </p>
            <a href="#noticias" className="button">
              Ver noticias
            </a>
          </div>
        </section>

        <section id="nosotros" className="content-section">
          <h2>Quiénes Somos</h2>
          <p className="section-intro">
            El Departamento de Identificaciones es un organismo
            técnico-científico de la Policía Nacional que presta servicios en
            todo el territorio de la República del Paraguay mediante oficinas
            regionales, garantizando el derecho a la identidad de los
            ciudadanos.
          </p>

          <div className="info-grid">
            <article className="card">
              <h3>Misión</h3>
              <p>
                Mantener y organizar el servicio de identificación personal,
                expedir cédulas de identidad, pasaportes, certificados de
                antecedentes y otros documentos relacionados, asegurando la
                protección de los datos personales mediante tecnología y altos
                estándares de seguridad.
              </p>
            </article>
            <article className="card">
              <h3>Visión</h3>
              <p>
                Brindar un servicio moderno, confiable y eficiente, acercando
                la documentación a toda la ciudadanía con procesos seguros y
                atención de excelencia.
              </p>
            </article>
            <article className="card">
              <h3>Valores</h3>
              <p>
                Profesionalismo
                <br />
                Responsabilidad
                <br />
                Confiabilidad
                <br />
                Respeto
              </p>
            </article>
          </div>
        </section>

        <section id="servicios" className="content-section section-muted">
          <h2>Servicios</h2>
          <div className="services-grid">
            <article className="card">
              <h3>🪪 Cédula de Identidad</h3>
              <p>Expedición y renovación de cédulas de identidad.</p>
            </article>
            <article className="card">
              <h3>🛂 Pasaportes</h3>
              <p>Emisión y renovación de pasaportes paraguayos.</p>
            </article>
            <article className="card">
              <h3>📄 Antecedentes Policiales</h3>
              <p>Expedición de certificados de antecedentes policiales.</p>
            </article>
            <article className="card">
              <h3>🚐 Cedulación a Domicilio</h3>
              <p>
                Servicio dirigido a personas con discapacidad, adultos
                mayores y personas en situación de cama que no pueden
                trasladarse hasta la oficina.
              </p>
            </article>
          </div>
        </section>

        <section id="noticias" className="content-section">
          <h2>Noticias</h2>
          {posts.length > 0 ? (
            <>
              <div className="blog-grid home-blog-grid">
                {posts.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <p className="section-link">
                <a href="/blog" className="button">
                  Ver todas las noticias
                </a>
              </p>
            </>
          ) : (
            <div className="news-list">
              {noticias.length > 0 ? (
              noticias.map((noticia) => (
                <NewsCard key={noticia.id} noticia={noticia} />
              ))
              ) : (
                <p className="empty-state">No hay noticias publicadas.</p>
              )}
            </div>
          )}
        </section>

        <section id="galeria" className="content-section section-muted">
          <h2>Galería</h2>
          <p className="section-intro">
            Próximamente compartiremos imágenes de las actividades de la
            Oficina Regional San Ignacio.
          </p>
        </section>

        <section id="ubicacion" className="content-section">
          <h2>Ubicación</h2>
          <p className="section-intro">
            Oficina Regional del Departamento de Identificaciones de San
            Ignacio, Misiones.
          </p>
          <p className="section-link">
            <a
              className="button"
              href="https://maps.app.goo.gl/zo1i8Z3WXWJ8LDju6"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver ubicación en Google Maps
            </a>
          </p>
        </section>
      </main>

      <footer id="contacto" className="site-footer">
        <h2>Contacto</h2>
        <p>
          <strong>Horario de atención:</strong>
        </p>
        <p>Lunes a viernes de 07:00 a 13:00 hs.</p>
        <p>
          <strong>Oficina Regional San Ignacio - Misiones</strong>
        </p>
        <p>Policía Nacional del Paraguay</p>
        <p>© 2026 Departamento de Identificaciones</p>
      </footer>
    </>
  );
}
