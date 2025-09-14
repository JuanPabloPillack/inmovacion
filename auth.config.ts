// auth.config.ts
import { loginSchema } from "@/lib/zod";
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { use } from "react";
import { sendEmailVerification } from "@/lib/mail";
// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
     
      authorize: async (credentials) => {
        const {data, success} = loginSchema.safeParse(credentials);

        if (!success) {
          throw new Error("Credenciales Inválidas");
        }
        //verificar si existe el usuario en la BD
        const user = await db.user.findUnique({
          where: {
            email: data.email,
          }

        });
        if (!user || !user.password) {
          throw new Error("Usuario no encontrado");
        }

        //verificar si la contraseña es correcta
        const isValid = await bcrypt.compare(data.password, user.password);

        if (!isValid) {
          throw new Error("Contraseña Incorrecta");
        }

   
        if (user.status === "inactive") {
    throw new Error("Tu cuenta está inactiva. Contacta a un administrador.");
  }
        

        return user;
      },
    }),],
} satisfies NextAuthConfig;