'use client'

import React, { useState, useTransition } from 'react'
import { z } from "zod"
import { loginSchema } from '@/lib/zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { loginAction } from '@/actions/auth-action'
import { useRouter } from 'next/navigation'

const FormLogin = () => {
  const [error, setError] = useState<string | null >(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
    // 1. Define your form.
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError(null);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    startTransition(async () => {
      const response =await loginAction(values);
      if (response.error) {
        setError(response.error);
      } else{
        router.push("/dashboard");
      }

    });
    
  }
    
    return (
    <div className = 'max-w-52'>
        <h1>Inicio de sesión</h1>
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input placeholder="Introduce tu correo electrónico para iniciar sesión... (ej. taniamelero@gmail.com)" {...field} />
              </FormControl>
              <FormDescription>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input placeholder="Introduce tu contraseña para iniciar sesión... (ej. taniamelero321)" type='password' {...field} />
              </FormControl>
              <FormDescription>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {
          error && <FormMessage> {error} </FormMessage>
        }
        <Button 
        type="submit" 
        disabled = {isPending}
        >
          Iniciar Sesión
          </Button>
      </form>
    </Form>
    </div>
  )
}

export default FormLogin