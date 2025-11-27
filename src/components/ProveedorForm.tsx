// =============================================================
// src/components/ProveedorForm.tsx
// =============================================================

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectItem, SelectContent, SelectValue
} from "@/components/ui/select";

import { proveedorSchema, ProveedorFormValues } from "@/lib/zod";

interface Props {
  onSubmit: (data: ProveedorFormValues) => Promise<void>;
  initialData?: Partial<ProveedorFormValues>;
  tiposServicio: { id_tipo_servicio: number; nombre: string }[];
  modo?: "crear" | "editar";
  onFormDirtyChange?: (dirty: boolean) => void;
}

export default function ProveedorForm({
  onSubmit,
  initialData,
  tiposServicio,
  modo = "crear",
  onFormDirtyChange,
}: Props) {

  const form = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombre_razon_social: initialData?.nombre_razon_social ?? "",
      cuit_cuil: initialData?.cuit_cuil ?? "",
      correo_contacto: initialData?.correo_contacto ?? "",
      telefono_contacto: initialData?.telefono_contacto ?? "",
      direccion: initialData?.direccion ?? "",
      tipoServicioId: initialData?.tipoServicioId
        ? String(initialData.tipoServicioId)
        : "",
      datos_bancarios: initialData?.datos_bancarios ?? "",
      observaciones: initialData?.observaciones ?? "",
    },
  });

  useEffect(() => {
    onFormDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        <FormField
          control={form.control}
          name="nombre_razon_social"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre / Razón Social</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cuit_cuil"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CUIT / CUIL</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="correo_contacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefono_contacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipoServicioId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de servicio</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
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

        <FormField
          control={form.control}
          name="datos_bancarios"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datos bancarios</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
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
