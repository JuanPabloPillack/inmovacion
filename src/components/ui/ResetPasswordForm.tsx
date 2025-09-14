'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { resetPasswordAction } from '@/actions/auth-action';
import { resetPasswordSchema } from '@/lib/zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Shield, Lock, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function ResetPasswordForm({ onSuccess, onError }: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      setError('Token no válido');
      onError('Token no válido');
      return;
    }
    setError(null);
    setIsPending(true);
    try {
      const result = await resetPasswordAction(token, values.password);
      if (result.success) {
        setIsSuccess(true);
        onSuccess();
        form.reset();
      } else {
        const errorMessage = result.error || 'Error al restablecer la contraseña';
        setError(errorMessage);
        onError(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Error inesperado al procesar la solicitud';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsPending(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 sm:p-6">
        <Alert variant="destructive" className="max-w-xl mx-auto border-red-200 bg-red-50/50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 text-sm">
            Token no válido. Por favor, solicita un nuevo enlace de restablecimiento.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 sm:p-6">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#63bae9]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#fcc238]/10 rounded-full blur-3xl" />
        </div>

        <Card className="w-full max-w-xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="text-center space-y-6">
              {/* Icono de éxito */}
              <div className="mx-auto w-16 h-16 bg-[#63bae9]/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#63bae9]" />
              </div>

              {/* Mensaje de éxito */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#686363]">
                  ¡Contraseña Restablecida!
                </h3>
                <p className="text-[#969696] text-sm leading-relaxed">
                  Tu contraseña ha sido actualizada con éxito. Ahora puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 sm:p-6">
      {/* Barra superior decorativa */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#63bae9] to-[#fcc238]" />

      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#63bae9]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#fcc238]/10 rounded-full blur-3xl" />
      </div>

      {/* Card principal */}
      <Card className="w-full max-w-xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
        {/* Header con branding */}
        <CardHeader className="bg-gradient-to-r from-[#63bae9]/5 via-[#fcc238]/5 to-transparent rounded-t-lg border-b border-slate-200/50">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-[#63bae9]/10 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-[#686363]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#686363]">
                Restablecer Contraseña
              </h2>
              <p className="text-[#969696] text-sm mt-1">
                GBS y Asociados - Sistema de Gestión
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Alerta de error */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50/50 max-w-xl mx-auto">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Formulario */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[#686363] font-medium">
                      <Lock className="h-4 w-4 text-[#63bae9]" />
                      Nueva Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Introduce tu nueva contraseña"
                        {...field}
                        disabled={isPending}
                        className="h-12 rounded-xl border-[#969696]/20 focus:border-[#63bae9] focus:ring-[#63bae9]/20 transition-all duration-200 text-[#686363] placeholder-[#969696] bg-slate-50/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm flex items-center gap-1">
                      {form.formState.errors.password?.message && (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {form.formState.errors.password?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[#686363] font-medium">
                      <Lock className="h-4 w-4 text-[#63bae9]" />
                      Confirmar Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirma tu nueva contraseña"
                        {...field}
                        disabled={isPending}
                        className="h-12 rounded-xl border-[#969696]/20 focus:border-[#63bae9] focus:ring-[#63bae9]/20 transition-all duration-200 text-[#686363] placeholder-[#969696] bg-slate-50/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm flex items-center gap-1">
                      {form.formState.errors.confirmPassword?.message && (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {form.formState.errors.confirmPassword?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-gradient-to-r from-[#63bae9] to-[#63bae9]/90 hover:from-[#63bae9]/90 hover:to-[#63bae9]/80 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-70"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Restableciendo...
                  </>
                ) : (
                  'Restablecer Contraseña'
                )}
              </Button>
            </form>
          </Form>

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