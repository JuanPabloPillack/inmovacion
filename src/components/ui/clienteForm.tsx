'use client';

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { editUserSchema } from "@/lib/zod";
import type { EditUserFormValues } from "@/lib/zod";
import { createClient, updateClient } from "@/actions/client-action";

interface ClienteFormProps {
  client?: EditUserFormValues & { id: string, status: "ACTIVE" | "INACTIVE" };
  onSuccess: () => void;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({ client, onSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: client ?? {
      name: "",
      email: "",
      phone: "",
      role: "user",
    },
  });

  const onSubmit = async (values: EditUserFormValues) => {
    setError(null);
    startTransition(async () => {
      try {
        if (client) {
          await updateClient(client.id, values);
        } else {
          // Separar el nombre completo en firstName y lastName
          const [firstName, ...lastNameParts] = values.name.trim().split(" ");
          const lastName = lastNameParts.join(" ");
          await createClient({
            firstName,
            lastName,
            email: values.email,
            phone: values.phone,
            type: "PROPIETARIO",
          }); // tipo default, se puede parametrizar
        }
        onSuccess();
      } catch (err: any) {
        setError(err.message || "Error al guardar cliente");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre" disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Correo electrónico" disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Teléfono" disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <FormControl>
                <select {...field} disabled={isPending} className="w-full p-2 border rounded-md">
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {client ? "Actualizar Cliente" : "Crear Cliente"}
        </Button>
      </form>
    </Form>
  );
};
