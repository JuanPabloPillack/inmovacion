// Archivo: src/lib/mail.ts
// Descripción: Envío de correos para inmovacion.
// Proyecto: inmovacion (GBS y Asociados), sistema inmobiliario.

import { Resend } from 'resend';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export const sendEmailVerification = async (email: string, token: string, isResetPassword: boolean = false) => {
    try {
        let subject = '';
        let htmlContent = '';

        if (isResetPassword) {
            subject = 'Restablecimiento de contraseña';
            htmlContent = `<p>Haz clic aquí para restablecer tu contraseña:</p><a href="${process.env.NEXTAUTH_URL}/reset-password?token=${token}">Restablecer contraseña</a>`;
        } else {
            subject = 'Verificación de correo electrónico';
            htmlContent = `<p>Verifica tu correo electrónico</p><a href="${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}">VERIFICAR CORREO ELECTRÓNICO</a>`;
        }

        await resend.emails.send({
            from: 'NextAuth js <onboarding@resend.dev>',
            to: email,
            subject: subject,
            html: htmlContent,
        });

        return { success: true };
    } catch (error) {
        console.log(error);
        return { error: true };
    }
};