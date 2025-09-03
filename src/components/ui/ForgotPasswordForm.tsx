'use client';

import React from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPasswordAction } from '@/actions/auth-action';
import { forgotPasswordSchema } from '@/lib/zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function ForgotPasswordForm({
  onSuccess,
  onError,
}: ForgotPasswordFormProps) {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    const result = await forgotPasswordAction(values.email);
    if (result.success) {
      onSuccess();
      form.reset();
    } else {
      onError(result.error || 'Error al enviar el correo');
    }
  }

   return (
  <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-[#63bae9]/20 via-white to-[#fcc238]/20 sm:px-6 md:px-8">
    {/* Barra superior decorativa */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#63bae9] to-[#fcc238]" />

    {/* Card principal */}
    <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white border border-[#e5e5e5] shadow-lg rounded-2xl overflow-hidden">
      {/* Header personalizado */}
      <CardHeader className="bg-gradient-to-r from-[#63bae9] to-[#fcc238] p-4">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-white font-sans">
          ¿Olvidaste tu contraseña?
        </h2>
      </CardHeader>

      <CardContent className="space-y-6 pt-6 sm:pt-8">
        {/* Formulario */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
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
                      placeholder="usuario@empresa.com"
                      {...field}
                      type="email"
                      className="h-10 sm:h-12 rounded-xl border-[#d4d4d4] focus:border-[#63bae9] focus:ring-[#63bae9]/40 text-base"
                    />
                  </FormControl>
                  <FormMessage className="text-[#b91c1c] text-sm" />
                </FormItem>
              )}
            />

            {/* Botón */}
            <Button
              type="submit"
              className="w-full h-10 sm:h-12 bg-[#63bae9] hover:bg-[#4da8d6] text-white font-sans py-2 sm:py-3 rounded-xl shadow-md text-base sm:text-lg transition-all duration-200"
            >
              Enviar enlace de restablecimiento
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  </div>
);
}
