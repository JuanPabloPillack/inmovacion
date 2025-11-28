// Importamos NextResponse para poder devolver respuestas HTTP en formato JSON
// Importamos 'db' que es nuestra instancia de Prisma para interactuar con la base de datos
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Esta función maneja las solicitudes POST a esta ruta.
// Es decir: cuando el frontend envía una imagen para guardarla en la base de datos.
export async function POST(req: Request) {
  try {
    // Intentamos leer el cuerpo (body) del request como JSON.
    // Esperamos recibir algo como: { inmuebleId: 3, url: "https://...." }
    const { inmuebleId, url } = await req.json();

    // ================================
    //   VALIDACIÓN DE DATOS
    // ================================
    // Si falta algún dato requerido, devolvemos un error 400 -> Bad Request
    if (!inmuebleId || !url) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // ================================
    //   CREACIÓN EN LA BASE DE DATOS
    // ================================
    // Guardamos una nueva imagen usando Prisma.
    // La tabla 'inmuebleImagen' está relacionada con 'inmueble'.
    // Guardamos:
    // - inmuebleId → ID del inmueble dueño de la imagen
    // - url → ruta de la imagen subida
    // - principal → false por defecto, ya que no es la imagen principal
    const imagen = await db.inmuebleImagen.create({
      data: { inmuebleId, url, principal: false },
    });

    // Respondemos con la imagen recién creada y código 201 -> Created
    return NextResponse.json(imagen, { status: 201 });

  } catch (error) {
    // Si ocurre cualquier error inesperado, lo mostramos en consola para debug
    console.error("Error al guardar imagen:", error);

    // Y devolvemos un error 500 -> Internal Server Error
    return NextResponse.json(
      { error: "Error al guardar imagen" },
      { status: 500 }
    );
  }
}
