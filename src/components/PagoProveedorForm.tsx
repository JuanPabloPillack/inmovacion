"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Building2,
  CreditCard,
  CheckCircle,
  FileText,
  DollarSign,
  User,
  AlertCircle,
} from "lucide-react";

// ==========================
// VALIDACIÓN
// ==========================
const pagoSchema = z.object({
  proveedorId: z.string().min(1, "Seleccione un proveedor"),
  medioPagoId: z.string().min(1, "Seleccione un medio de pago"),
  estadoPagoId: z.string().min(1, "Seleccione un estado"),
  concepto: z.string().min(3, "Mínimo 3 caracteres"),
  importe: z.string().min(1, "Ingrese un monto"),
  responsable: z.string().min(3, "Ingrese el nombre del responsable"),
  comprobante: z.string().optional().or(z.literal("")),
});

type PagoProveedorFormValues = z.infer<typeof pagoSchema>;

interface Props {
  proveedores: any[];
  mediosPago: any[];
  estadosPago: any[];
  modo?: "crear" | "editar";
  onSubmit: (data: any) => void;
  initialData?: Partial<PagoProveedorFormValues>;
  onFormDirtyChange?: (dirty: boolean) => void;
}

export default function PagoProveedorForm({
  proveedores = [],
  mediosPago = [],
  estadosPago = [],
  modo = "crear",
  onSubmit,
  initialData,
  onFormDirtyChange,
}: Props) {

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PagoProveedorFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      proveedorId: initialData?.proveedorId || "",
      medioPagoId: initialData?.medioPagoId || "",
      estadoPagoId: initialData?.estadoPagoId || "",
      concepto: initialData?.concepto || "",
      importe: initialData?.importe || "",
      responsable: initialData?.responsable || "",
      comprobante: initialData?.comprobante || "",
    },
  });

  useEffect(() => {
    onFormDirtyChange?.(isDirty);
  }, [isDirty]);

  const submitHandler = (data: any) => {
    onSubmit({
      ...data,
      proveedorId: Number(data.proveedorId),
      medioPagoId: Number(data.medioPagoId),
      estadoPagoId: Number(data.estadoPagoId),
      importe: Number(data.importe),
    });
  };

  return (
    <div className="max-w-3xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl rounded-xl">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#63bae9]/5 via-[#fcc238]/5 to-transparent rounded-t-lg border-b border-slate-200/50 p-6">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-[#63bae9]" />
          <h2 className="text-xl font-semibold text-[#686363]">
            {modo === "crear" ? "Nuevo Pago a Proveedor" : "Editar Pago"}
          </h2>
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Proveedor */}
            <div>
              <label className="flex items-center gap-2 text-[#686363] font-medium text-sm sm:text-base mb-2">
                <Building2 className="h-4 w-4 text-[#63bae9]" />
                Proveedor *
              </label>
              <select
                {...register("proveedorId")}
                className="h-12 w-full rounded-xl border border-[#969696]/20 bg-slate-50/50 px-3 focus:border-[#63bae9] focus:ring-2 focus:ring-[#63bae9]/20 text-[#686363]"
              >
                <option value="">Seleccionar</option>
                {proveedores.map((p) => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>
                    {p.nombre_razon_social}
                  </option>
                ))}
              </select>
              {errors.proveedorId && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.proveedorId.message}
                </p>
              )}
            </div>

            {/* Medio de pago */}
            <div>
              <label className="flex items-center gap-2 text-[#686363] font-medium text-sm sm:text-base mb-2">
                <CreditCard className="h-4 w-4 text-[#63bae9]" />
                Medio de pago *
              </label>
              <select
                {...register("medioPagoId")}
                className="h-12 w-full rounded-xl border border-[#969696]/20 bg-slate-50/50 px-3 focus:border-[#63bae9] focus:ring-2 focus:ring-[#63bae9]/20 text-[#686363]"
              >
                <option value="">Seleccionar</option>
                {mediosPago.map((m) => (
                  <option key={m.id_medio_pago} value={m.id_medio_pago}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              {errors.medioPagoId && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.medioPagoId.message}
                </p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center gap-2 text-[#686363] font-medium text-sm sm:text-base mb-2">
                <CheckCircle className="h-4 w-4 text-[#63bae9]" />
                Estado *
              </label>
              <select
                {...register("estadoPagoId")}
                className="h-12 w-full rounded-xl border border-[#969696]/20 bg-slate-50/50 px-3 focus:border-[#63bae9] focus:ring-2 focus:ring-[#63bae9]/20 text-[#686363]"
              >
                <option value="">Seleccionar</option>
                {estadosPago.map((e) => (
                  <option key={e.id_estado_pago} value={e.id_estado_pago}>
                    {e.nombre}
                  </option>
                ))}
              </select>
              {errors.estadoPagoId && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.estadoPagoId.message}
                </p>
              )}
            </div>

            {/* Importe */}
            <div>
              <label className="flex items-center gap-2 text-[#686363] font-medium text-sm sm:text-base mb-2">
                <DollarSign className="h-4 w-4 text-[#63bae9]" />
                Importe *
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("importe")}
                className="h-12 rounded-xl border-[#969696]/20 focus:border-[#63bae9] focus:ring-[#63bae9]/20 bg-slate-50/50"
              />
              {errors.importe && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.importe.message}
                </p>
              )}
            </div>

            {/* Concepto */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-[#686363] font-medium text-sm sm:text-base mb-2">
                <FileText className="h-4 w-4 text-[#63bae9]" />
                Concepto *
              </label>
              <Input
                {...register("concepto")}
                className="h-12 rounded-xl border-[#969696]/20 focus:border-[#63bae9] focus:ring-[#63bae9]/20 bg-slate-50/50"
              />
              {errors.concepto && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.concepto.message}
                </p>
              )}
            </div>

            {/* Responsable */}
            <div>
              <label className="flex items-center gap-2 text-[#686363] font-medium text-sm sm:text-base mb-2">
                <User className="h-4 w-4 text-[#63bae9]" />
                Responsable *
              </label>
              <Input
                {...register("responsable")}
                className="h-12 rounded-xl border-[#969696]/20 focus:border-[#63bae9] focus:ring-[#63bae9]/20 bg-slate-50/50"
              />
              {errors.responsable && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.responsable.message}
                </p>
              )}
            </div>

            {/* Comprobante */}
            <div>
              <label className="flex items-center gap-2 text-[#686363] font-medium text-sm sm:text-base mb-2">
                <FileText className="h-4 w-4 text-[#63bae9]" />
                Comprobante
              </label>
              <Input
                {...register("comprobante")}
                className="h-12 rounded-xl border-[#969696]/20 focus:border-[#63bae9] focus:ring-[#63bae9]/20 bg-slate-50/50"
              />
            </div>

          </div>

          {/* BOTÓN */}
          <div className="flex justify-end pt-6 border-t border-[#969696]/20">
            <Button
              type="submit"
              className="h-12 px-8 bg-gradient-to-r from-[#63bae9] to-[#63bae9]/90 hover:from-[#63bae9]/90 hover:to-[#63bae9]/80 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              {modo === "crear" ? "Registrar Pago" : "Guardar Cambios"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
