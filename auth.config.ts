// auth.config.ts
import type { NextAuthConfig } from "next-auth";

// Solo configuración básica para el middleware
// NO importar db, bcrypt, ni nada relacionado con Prisma aquí
export default {
  pages: {
    signIn: "/login",
  },
  providers: [], // Los providers van en auth.ts
} satisfies NextAuthConfig;