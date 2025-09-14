// Archivo: src/actions/getUsers.ts
// Descripción: Acción para obtener la lista de usuarios.
// Proyecto: inmovacion (GBS y Asociados), sistema inmobiliario.
'use server';
import { db } from "@/lib/db";

export async function getUsers() {
  const users = await db.user.findMany();
  return users;
}