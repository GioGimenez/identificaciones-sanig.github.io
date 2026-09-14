import { getCurrentUser } from "@/lib/auth";
import { deleteBlogImage, uploadBlogImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const image = formData.get("image");
  const postId = formData.get("postId");

  if (!(image instanceof File)) {
    return Response.json(
      { error: "Debés enviar un archivo de imagen." },
      { status: 400 },
    );
  }

  try {
    const result = await uploadBlogImage(
      image,
      typeof postId === "string" ? postId : undefined,
    );

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("No se pudo cargar la imagen:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Error de carga." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as { path?: unknown };

  if (typeof body.path !== "string") {
    return Response.json({ error: "Falta la ruta de la imagen." }, { status: 400 });
  }

  try {
    await deleteBlogImage(body.path);
    return Response.json({ deleted: true });
  } catch (error) {
    console.error("No se pudo eliminar la imagen:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Error de eliminación." },
      { status: 400 },
    );
  }
}
