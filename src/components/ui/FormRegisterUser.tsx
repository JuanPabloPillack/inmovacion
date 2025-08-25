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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { registerAction } from '@/actions/auth-action'
import { useRouter } from 'next/navigation'

const FormRegister = () => {
  const [error, setError] = useState<string | null >(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
    // 1. Define your form.
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setError(null);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    startTransition(async () => {
      const response =await registerAction(values);
      if (response.error) {
        setError(response.error);
      } else{
        router.push("/dashboard");
      }

    });
    
  }
    
    return (
    <div className = 'max-w-52'>
        <h1>Registrar un Usuario</h1>
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de usuario</FormLabel>
              <FormControl>
                <Input placeholder="Introduce un nombre para el nuevo usuario..." {...field}  type='text'/>
              </FormControl>
              <FormDescription>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input placeholder="Introduce un correo electrónico para iniciar sesión con ese usuario..." {...field} />
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
                <Input placeholder="Introduce una contraseña para iniciar sesión con ese usuario..." type='password' {...field} />
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
          Registrar Usuario
          </Button>
      </form>
    </Form>
    </div>
  )
}

export default FormRegister