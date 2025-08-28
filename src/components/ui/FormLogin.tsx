// Archivo: src/components/ui/FormLogin.tsx
// Descripción: Formulario de login para next-inmovacion con diseño personalizado.
// Proyecto: next-inmovacion (GBS y Asociados), sistema inmobiliario.

'use client';

import React, { useState, useTransition } from 'react';
import { z } from 'zod';
import { loginSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginAction } from '@/actions/auth-action';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

const FormLogin = ({ isVerified }: { isVerified: boolean }) => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError(null);
    startTransition(async () => {
      const response = await loginAction(values);
      if (response.error) {
        setError(response.error);
      } else {
        router.push('/dashboard');
      }
    });
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-[#63bae9]/20 via-white to-[#fcc238]/20">
      {/* Barra superior decorativa */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#63bae9] to-[#fcc238]" />

      {/* Card principal */}
      <Card className="w-full max-w-xl bg-white border border-[#e5e5e5] shadow-lg rounded-2xl overflow-hidden">
        {/* Header personalizado */}
        <div className="bg-gradient-to-r from-[#63bae9] to-[#fcc238] p-4">
          <h2 className="text-2xl font-bold text-center text-white font-sans">
            Iniciar Sesión
          </h2>
        </div>

        <CardContent className="space-y-8 pt-8">
          {/* Mensajes dinámicos */}
          {isVerified && (
            <p className="text-center text-[#63bae9] text-base font-sans bg-[#e6f7fd] rounded-md p-3">
              Tu correo ha sido verificado, ya puedes iniciar sesión.
            </p>
          )}
          {error === 'Por favor, revisa la verificación de correo electrónico' && (
            <p className="text-center text-[#b91c1c] text-base font-sans bg-[#fdecec] rounded-md p-3">
              Revisa tu correo para verificar tu cuenta.
            </p>
          )}

          {/* Formulario */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#686363] font-sans">
                      Correo Electrónico
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ej. usuario@gmail.com"
                        {...field}
                        className="h-12 rounded-xl border-[#d4d4d4] focus:border-[#63bae9] focus:ring-[#63bae9]/40 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-[#b91c1c] text-sm" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#686363] font-sans">
                      Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Introduce tu contraseña"
                        {...field}
                        className="h-12 rounded-xl border-[#d4d4d4] focus:border-[#63bae9] focus:ring-[#63bae9]/40 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-[#b91c1c] text-sm" />
                  </FormItem>
                )}
              />

              {/* Error general */}
              {error &&
                error !== 'Por favor, revisa la verificación de correo electrónico' && (
                  <FormMessage className="text-[#b91c1c] text-base">{error}</FormMessage>
                )}

              {/* Botón login */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#63bae9] hover:bg-[#4da8d6] text-white font-sans py-3 rounded-xl shadow-md text-lg transition-all duration-200"
              >
                Iniciar Sesión
              </Button>
            </form>
          </Form>

          {/* Links secundarios */}
          <div className="text-center mt-6 space-y-3">
            <a href="/forgot-password" className="text-sm text-[#686363] hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormLogin;
