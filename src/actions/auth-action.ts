'use server';
import { date, email, success, z } from "zod"
import { loginSchema, registerSchema } from "@/lib/zod"
import { signIn } from "../../auth";
import { AuthError } from "next-auth";
import { error } from "console";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const loginAction = async (values: z.infer<typeof loginSchema>) =>{
    try {
        await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    return {success: true};
    } catch (error) {
        if (error instanceof AuthError) {
            return {error: error.cause?.err?.message};
        }
        return {error: 'error 500'}
    }

}

export const registerAction = async (values: z.infer<typeof registerSchema>) => {
try {
        const {data,success} = registerSchema.safeParse(values);

        if (!success) {
            return{
                error: "Datos inválidos",
            }
        }

        //verificar si el usuario ya existe
        const user = await db.user.findUnique({
            where: {
                email: data.email,
            }
        });

        if (user) {
            return {
                error: "El usuario ya existe"
            }
        }

        //hash de contraseña
        const passwordHash = await bcrypt.hash(data.password,10);

        //crear el usuario
        await db.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: passwordHash,
            }
        });

        await signIn("credentials", {
            email:data.email,
            password: data.password,
            redirect:false,
        });

        return {success: true};
    
    } catch (error) {
        if (error instanceof AuthError) {
            return {error: error.cause?.err?.message};
        }
        return {error: 'error 500'}
    }
}