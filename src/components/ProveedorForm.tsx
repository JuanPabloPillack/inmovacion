// src/components/ui/ProveedorForm.tsx

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

// ==========================
// VALIDACIÓN DEL FORMULARIO
// ==========================
const proveedorSchema = z.object({
  nombre_razon_social: z.string().min(3, "Mínimo 3 caracteres"),
  cuit_cuil: z.string().min(11, "CUIT/CUIL inválido"),
  correo_contacto: z.string().email().optional().or(z.literal("")),
  telefono_contacto: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
  tipoServicioId: z.string(),
  datos_bancarios: z.string().optional().or(z.literal("")),
  observaciones: z.string().optional().or(z.literal("")),
});

export type ProveedorFormValues = z.infer<typeof proveedorSchema>;

// ==========================
// PROPS DEL COMPONENTE
// ==========================
interface ProveedorFormProps {
  onSubmit: (data: ProveedorFormValues) => Promise<void>;
  initialData?: Partial<ProveedorFormValues>;
  tiposServicio: { id_tipo_servicio: number; nombre: string }[];
  modo?: "crear" | "editar";

  // NUEVAS PROPS
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onFormDirtyChange?: (dirty: boolean) => void;
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function ProveedorForm({
  onSubmit,
  initialData,
  tiposServicio,
  modo = "crear",
  onSuccess,
  onError,
  onFormDirtyChange,
}: ProveedorFormProps) {
  const form = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombre_razon_social: initialData?.nombre_razon_social || "",
      cuit_cuil: initialData?.cuit_cuil || "",
      correo_contacto: initialData?.correo_contacto || "",
      telefono_contacto: initialData?.telefono_contacto || "",
      direccion: initialData?.direccion || "",
      tipoServicioId: initialData?.tipoServicioId || "",
      datos_bancarios: initialData?.datos_bancarios || "",
      observaciones: initialData?.observaciones || "",
    },
  });

  // Notificar si el form está dirty
  useEffect(() => {
    if (onFormDirtyChange) {
      onFormDirtyChange(form.formState.isDirty);
    }
  }, [form.formState.isDirty, onFormDirtyChange]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          try {
            await onSubmit(data);
            onSuccess?.();
          } catch (err: any) {
            onError?.(err?.message || "Error desconocido");
          }
        })}
        className="space-y-6"
      >
        {/* Nombre / Razón Social */}
        <FormField
          control={form.control}
          name="nombre_razon_social"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre / Razón Social</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez SRL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CUIT */}
        <FormField
          control={form.control}
          name="cuit_cuil"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CUIT / CUIL</FormLabel>
              <FormControl>
                <Input placeholder="20304567891" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Correo */}
        <FormField
          control={form.control}
          name="correo_contacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input placeholder="correo@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Teléfono */}
        <FormField
          control={form.control}
          name="telefono_contacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="+54 11 1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dirección */}
        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Calle 123, Ciudad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo Servicio */}
        <FormField
          control={form.control}
          name="tipoServicioId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de servicio</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposServicio.map((ts) => (
                      <SelectItem
                        key={ts.id_tipo_servicio}
                        value={String(ts.id_tipo_servicio)}
                      >
                        {ts.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Datos bancarios */}
        <FormField
          control={form.control}
          name="datos_bancarios"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datos bancarios</FormLabel>
              <FormControl>
                <Textarea placeholder="CBU, Alias, Banco..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Observaciones */}
        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas adicionales..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {modo === "crear" ? "Crear proveedor" : "Guardar cambios"}
        </Button>
      </form>
    </Form>
  );
}