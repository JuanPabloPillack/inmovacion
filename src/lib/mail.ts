import { error } from "console";
import {Resend} from "resend";
import { email, success } from "zod";
const resend = new Resend(process.env.AUTH_RESEND_KEY);

export const sendEmailVerification = async (email: string, token: string) => {
    try {
        await resend.emails.send({
            from: 'NextAuth js <onboarding@resend.dev>',
            to: email,
            subject: 'Verificación de correo electrónico',
            html: `<p>Verificar tu correo electrónico</p><a href= "${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token} ">VERIFICAR CORREO ELECTRÓNICO</a>`
        });
        return{
            success: true
        }
    } catch (error) {
        console.log(error)
        return {
            error: true
        }
    }
}