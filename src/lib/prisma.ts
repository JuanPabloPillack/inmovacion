import { PrismaClient } from '@prisma/client'; // Importa PrismaClient desde el paquete oficial de Prisma

/**
 * Extiende el objeto globalThis para incluir una propiedad opcional 'prisma' que almacena la instancia de PrismaClient.
 * Esto permite mantener una única instancia en entornos globales, especialmente en desarrollo.
 */
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Instancia singleton de PrismaClient para interactuar con la base de datos.
 * Reutiliza una instancia existente en global.prisma si está definida, o crea una nueva.
 * @type {PrismaClient}
 */

export const prisma = global.prisma || new PrismaClient();

// Almacena la instancia en global.prisma solo en entornos no productivos (desarrollo o pruebas)
// Esto evita problemas con recarga en caliente en Next.js, manteniendo una única conexión a la base de datos
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;