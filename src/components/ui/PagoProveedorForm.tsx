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
// VALIDACIÓN DEL FORM
// ==========================
const pagoSchema = z.object({
  proveedorId: z.string().min(1, "Seleccione un proveedor"),
  medioPagoId: z.string().min(1, "Seleccione un medio de pago"),
  estadoPagoId: z.string().min(1, "Seleccione un estado"),
  concepto: z.string().min(3, "Mínimo 3 caracteres"),
  importe: z.string().min(1, "Ingrese un monto"),
  responsable: z.string().min(3, "Ingrese el nombre del responsable"),
  comprobante: z.string().optional().or(z.literal("")),
  fecha_pago: z.string().optional(),
});

export type PagoProveedorFormValues = z.infer<typeof pagoSchema>;

interface Props {
  proveedores: any[];
  mediosPago: any[];
  estadosPago: any[];
  modo?: "crear" | "editar";
  onSubmit: (data: PagoProveedorFormValues) => Promise<void>;
  initialData?: Partial<PagoProveedorFormValues>;
  onFormDirtyChange?: (dirty: boolean) => void;
}

export default function PagoProveedorForm({
  proveedores,
  mediosPago,
  estadosPago,
  modo = "crear",
  onSubmit,
  initialData,
  onFormDirtyChange,
}: Props) {
  const form = useForm<PagoProveedorFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      proveedorId: initialData?.proveedorId || "",
      medioPagoId: initialData?.medioPagoId || "",
      estadoPagoId: initialData?.estadoPagoId || "",
      concepto: initialData?.concepto || "",
      importe: initialData?.importe || "",
      responsable: initialData?.responsable || "",
      comprobante: initialData?.comprobante || "",
      fecha_pago: initialData?.fecha_pago || "",
    },
  });

  // Detectar si el form cambió
  useEffect(() => {
    onFormDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onFormDirtyChange]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >

        {/* PROVEEDOR */}
        <FormField
          control={form.control}
          name="proveedorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((p) => (
                      <SelectItem key={p.id_proveedor} value={String(p.id_proveedor)}>
                        {p.nombre_razon_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CONCEPTO */}
        <FormField
          control={form.control}
          name="concepto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Reparación, servicio técnico..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* IMPORTE */}
        <FormField
          control={form.control}
          name="importe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importe</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* MEDIO DE PAGO */}
        <FormField
          control={form.control}
          name="medioPagoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medio de pago</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un medio" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediosPago.map((m) => (
                      <SelectItem key={m.id_medio_pago} value={String(m.id_medio_pago)}>
                        {m.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ESTADO */}
        <FormField
          control={form.control}
          name="estadoPagoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosPago.map((e) => (
                      <SelectItem key={e.id_estado_pago} value={String(e.id_estado_pago)}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* RESPONSABLE */}
        <FormField
          control={form.control}
          name="responsable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsable</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del responsable" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* COMPROBANTE */}
        <FormField
          control={form.control}
          name="comprobante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comprobante (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="URL o detalle del comprobante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {modo === "crear" ? "Registrar pago" : "Guardar cambios"}
        </Button>
      </form>
    </Form>
  );
}
