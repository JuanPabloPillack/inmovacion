'use client'

import React, { useState, useTransition } from 'react'
import { z } from "zod"
import { registerSchema } from '@/lib/zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { registerAction } from '@/actions/auth-action'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const FormRegister = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
      role: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setError(null);
    startTransition(async () => {
      const response = await registerAction(values);
      if (response.error) {
        setError(response.error);
      } else {
        router.push("/dashboard/users");
      }
    });
  }

  return (
    <Card className="w-full max-w-2xl bg-white border border-gray-200 shadow-sm rounded-xl">
      <CardHeader className="border-b border-gray-200 bg-gray-50 rounded-t-xl px-6 py-4">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Registrar nuevo usuario
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Nombre de usuario
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Juan Pérez"
                      {...field}
                      type="text"
                      className="h-11 rounded-lg border-gray-300 focus:border-[#63bae9] focus:ring-[#63bae9]/40"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="usuario@empresa.com"
                      {...field}
                      type="email"
                      className="h-11 rounded-lg border-gray-300 focus:border-[#63bae9] focus:ring-[#63bae9]/40"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Teléfono */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: +54 9 11 2345 6789"
                      {...field}
                      type="tel"
                      className="h-11 rounded-lg border-gray-300 focus:border-[#63bae9] focus:ring-[#63bae9]/40"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="h-11 rounded-lg border-gray-300 focus:border-[#63bae9] focus:ring-[#63bae9]/40"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Confirmar Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Confirmar contraseña
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Repite tu contraseña"
                      {...field}
                      className="h-11 rounded-lg border-gray-300 focus:border-[#63bae9] focus:ring-[#63bae9]/40"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Rol */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Rol
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: admin, user, manager"
                      {...field}
                      type="text"
                      className="h-11 rounded-lg border-gray-300 focus:border-[#63bae9] focus:ring-[#63bae9]/40"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Error general */}
            {error && (
              <p className="text-red-600 text-sm font-medium">{error}</p>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => router.push('/dashboard/users')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#63bae9] hover:bg-[#4da8d6] text-white rounded-lg"
              >
                Registrar usuario
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FormRegister;
