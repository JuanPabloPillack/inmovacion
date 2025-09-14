'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPasswordAction } from '@/actions/auth-action';
import { forgotPasswordSchema } from '@/lib/zod';
import { 
  Mail, 
  ArrowLeft, 
  Send, 
  Loader2, 
  Building2, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Clock
} from 'lucide-react';
import Link from 'next/link';

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function ForgotPasswordForm({
  onSuccess,
  onError,
}: ForgotPasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await forgotPasswordAction(values.email);
        if (result.success) {
          setIsSuccess(true);
          onSuccess();
          form.reset();
        } else {
          const errorMessage = result.error || 'Error al enviar el correo';
          setError(errorMessage);
          onError(errorMessage);
        }
      } catch (err) {
        const errorMessage = 'Error inesperado. Por favor, intenta nuevamente.';
        setError(errorMessage);
        onError(errorMessage);
      }
    });
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#63bae9]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#fcc238]/10 rounded-full blur-3xl" />
        </div>

        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="text-center space-y-6">
              {/* Icono de éxito */}
              <div className="mx-auto w-16 h-16 bg-[#63bae9]/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#63bae9]" />
              </div>

              {/* Mensaje de éxito */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#686363]">
                  ¡Correo Enviado!
                </h3>
                <p className="text-[#969696] text-sm leading-relaxed">
                  Hemos enviado un enlace de restablecimiento a tu correo electrónico. 
                  Revisa tu bandeja de entrada y sigue las instrucciones.
                </p>
              </div>

              {/* Información adicional */}
              <Alert className="text-left border-[#63bae9]/20 bg-[#63bae9]/10">
                <Clock className="h-4 w-4 text-[#63bae9]" />
                <AlertDescription className="text-[#686363] text-sm">
                  El enlace expirará en 1 hora por seguridad. Si no recibes el correo, 
                  revisa tu carpeta de spam.
                </AlertDescription>
              </Alert>

              {/* Botón para volver */}
              <Link href="/login">
                <Button className="w-full h-12 bg-gradient-to-r from-[#63bae9] to-[#63bae9]/90 hover:from-[#63bae9]/90 hover:to-[#63bae9]/80 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#63bae9]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#fcc238]/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
        {/* Header con branding */}
        <CardHeader className="bg-gradient-to-r from-[#63bae9]/5 via-[#fcc238]/5 to-transparent rounded-t-lg border-b border-slate-200/50">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-[#63bae9]/10 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-[#686363]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#686363]">
                Recuperar Contraseña
              </h2>
              <p className="text-[#969696] text-sm mt-1">
                GBS y Asociados - Sistema de Gestión
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Descripción */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-[#63bae9]/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#63bae9]" />
            </div>
            <p className="text-[#969696] text-sm leading-relaxed">
              Ingresa tu correo electrónico y te enviaremos un enlace seguro 
              para restablecer tu contraseña.
            </p>
          </div>

          {/* Alerta de error */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50/50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Formulario */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[#686363] font-medium">
                      <Mail className="h-4 w-4 text-[#63bae9]" />
                      Correo Electrónico
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="tu-correo@empresa.com"
                        disabled={isPending}
                        className="h-12 rounded-xl border-[#969696]/20 focus:border-[#63bae9] focus:ring-[#63bae9]/20 transition-all duration-200 text-[#686363] placeholder-[#969696] bg-slate-50/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm flex items-center gap-1">
                      {form.formState.errors.email?.message && (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {form.formState.errors.email?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              {/* Botón de envío */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-gradient-to-r from-[#63bae9] to-[#63bae9]/90 hover:from-[#63bae9]/90 hover:to-[#63bae9]/80 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-70"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando enlace...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Enlace de Recuperación
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Información de seguridad */}
          <Alert className="border-[#63bae9]/20 bg-[#63bae9]/10">
            <Shield className="h-4 w-4 text-[#63bae9]" />
            <AlertDescription className="text-[#686363] text-sm">
              <strong>Seguridad:</strong> El enlace será válido por 1 hora y solo 
              puede usarse una vez por motivos de seguridad.
            </AlertDescription>
          </Alert>

          {/* Link para volver */}
          <div className="text-center pt-4 border-t border-[#969696]/50">
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-[#686363] hover:text-[#63bae9] transition-colors duration-200 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="px-8 pb-6">
          <div className="text-center text-xs text-[#969696] border-t border-[#969696]/50 pt-4">
            © 2025 GBS y Asociados. Todos los derechos reservados.
          </div>
        </div>
      </Card>
    </div>
  );
}