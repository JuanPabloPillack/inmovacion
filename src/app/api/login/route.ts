// Archivo: src/app/api/login/route.ts
// Descripción: Ruta API de Next.js (App Router) para probar la conexión a la base de datos 'gbs_y_asociados'.
// Utiliza Prisma para consultar la tabla 'Usuario' y devuelve un mensaje JSON confirmando la conexión.
// Proyecto:inmovacion (GBS y Asociados), sistema inmobiliario para gestionar clientes, inmuebles y transacciones y ofrecer servicios a los clientes externos.
// Contexto: Usa Next.js con Turbopack y Prisma para interactuar con una base de datos MySQL.

import { NextResponse } from 'next/server'; // Importa NextResponse para crear respuestas HTTP
import { prisma } from '@/lib/prisma'; // Importa la instancia de PrismaClient desde src/lib/prisma.ts

/**
 * Maneja solicitudes GET a la ruta /api/login.
 * Prueba la conexión a la base de datos consultando todos los registros de la tabla 'Usuario'.
 * @returns {Promise<NextResponse>} Respuesta JSON con un mensaje de éxito si la consulta es exitosa.
 * @throws {Error} Si la conexión a la base de datos falla, lanza un error no manejado (causa un HTTP 500).
 */

export async function GET() {
  // Consulta todos los registros de la tabla 'Usuario' usando Prisma
  const user = await prisma.usuario.findMany();
  
  // Imprime los usuarios en la consola del servidor para depuración
  console.log(user);
  
  // Verifica si la consulta devolvió un resultado (arreglo, incluso vacío)
  if (user) {
    // Devuelve un mensaje JSON indicando que la conexión a la base de datos fue exitosa
    return NextResponse.json({
      message: 'conectado a la BD',
    });
  }
}