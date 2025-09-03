// Archivo: src/components/ui/ResetPasswordForm.tsx
// Descripción: Componente de formulario para restablecer contraseña.
// Proyecto: inmovacion (GBS y Asociados), sistema inmobiliario.

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { resetPasswordAction } from '@/actions/auth-action'; // Usamos la Server Action
import { resetPasswordSchema } from '@/lib/zod'; // Importamos el esquema
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSuccess: () => void; // Función para notificar cuando el restablecimiento es exitoso
  onError: (message: string) => void; // Función para notificar errores
}

export default function ResetPasswordForm({ onSuccess, onError }: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return <div className="text-red-500 text-center mt-10">Token no válido.</div>;
  }

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    try {
      const result = await resetPasswordAction(token!, values.password); // Usamos ! para aserción de no-null
      if (result.success) {
        onSuccess();
        form.reset();
      } else {
        onError(result.error || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      onError('Error inesperado al procesar la solicitud');
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-[#63bae9]/20 via-white to-[#fcc238]/20 sm:px-6 md:px-8">
      {/* Barra superior decorativa */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#63bae9] to-[#fcc238]" />

      {/* Card principal */}
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white border border-[#e5e5e5] shadow-lg rounded-2xl overflow-hidden">
        {/* Header personalizado */}
        <CardHeader className="bg-gradient-to-r from-[#63bae9] to-[#fcc238] p-4 border-b border-[#969696]">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-white font-sans">
            Restablecer Contraseña
          </h2>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 sm:pt-8">
          {/* Formulario */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#686363] font-sans">
                      Nueva Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Introduce tu nueva contraseña"
                        {...field}
                        className="h-10 sm:h-12 rounded-xl border-[#d4d4d4] focus:border-[#63bae9] focus:ring-[#63bae9]/40 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-[#b91c1c] text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#686363] font-sans">
                      Confirmar Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirma tu nueva contraseña"
                        {...field}
                        className="h-10 sm:h-12 rounded-xl border-[#d4d4d4] focus:border-[#63bae9] focus:ring-[#63bae9]/40 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-[#b91c1c] text-sm" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-10 sm:h-12 bg-[#63bae9] hover:bg-[#4da8d6] text-white font-sans py-2 sm:py-3 rounded-xl shadow-md text-base sm:text-lg transition-all duration-200"
              >
                Restablecer Contraseña
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}