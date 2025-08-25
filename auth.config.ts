
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

        //verificación email

        if (!user.emailVerified) {
          
          const verifyTokenExist = await db.verificationToken.findFirst({
            where: {
              identifier : user.email
            }
          });


          //si existe un token lo eliminamos
          if (verifyTokenExist?.identifier) {
            await db.verificationToken.delete({
              where:{
                identifier : user.email
              }
            });
          }

          const token = nanoid();

          await db.verificationToken.create({
            data: {
              identifier: user.email,
              token,
              expires: new Date(Date.now() + 1000 *60 *60 *24)
            }
          });

          //enviar email de verificación con resend

          const response = await sendEmailVerification(user.email, token);
          throw new Error("Por favor, revisa la verificación de correo electrónico");

        }

        return user;
      },
    }),],
} satisfies NextAuthConfig;