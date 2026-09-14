import { noticiasIniciales, type Noticia } from "@/lib/site-data";
import { getTursoClient } from "@/lib/turso";

function asText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export async function getNoticias(): Promise<Noticia[]> {
  const turso = getTursoClient();

  if (!turso) {
    return noticiasIniciales;
  }

  try {
    const result = await turso.execute(
      "SELECT id, fecha, titulo, lugar, contenido, imagen, imagen_alt " +
        "FROM noticias WHERE publicada = 1 ORDER BY fecha DESC",
    );

    return (result.rows as unknown as Record<string, unknown>[]).map(
      (row) => ({
        id: typeof row.id === "number" ? row.id : asText(row.id),
        fecha: asText(row.fecha),
        titulo: asText(row.titulo),
        lugar: asText(row.lugar),
        contenido: asText(row.contenido),
        imagen: asText(row.imagen),
        imagenAlt: asText(row.imagen_alt),
      }),
    );
  } catch (error) {
    console.error(
      "No se pudieron cargar las noticias desde Turso. Se usará el respaldo local.",
      error,
    );
    return noticiasIniciales;
  }
}
