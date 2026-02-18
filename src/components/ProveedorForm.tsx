"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { proveedorSchema, ProveedorFormValues } from "@/lib/zod";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Briefcase,
  AlignLeft,
  AlertCircle,
} from "lucide-react";


interface Props {

  onSubmit:
  (data: ProveedorFormValues) => void;

  initialData?:
  Partial<ProveedorFormValues>;

  tiposServicio:
  { id_tipo_servicio: number; nombre: string }[];

  modo?: "crear" | "editar";

  onFormDirtyChange?:
  (dirty: boolean) => void;

}


// ===========================
// VALIDACIÓN CUIT
// ===========================

function validarCUIT(cuit: string) {

  if (!/^\d{11}$/.test(cuit))
    return false;

  const coeficientes =
    [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  const numeros =
    cuit.split("").map(Number);

  const suma =
    coeficientes.reduce(
      (acc, coef, i) =>
        acc + coef * numeros[i],
      0
    );

  const resto =
    suma % 11;

  const digito =
    resto === 0
      ? 0
      : resto === 1
        ? 9
        : 11 - resto;

  return digito === numeros[10];

}


// ===========================
// COMPONENT
// ===========================

export default function ProveedorForm({

  onSubmit,

  initialData,

  tiposServicio = [],

  modo = "crear",

  onFormDirtyChange,

}: Props) {


  const {

    register,

    handleSubmit,

    setValue,

    watch,

    formState: {
      errors,
      isDirty,
    },

  } =
    useForm<ProveedorFormValues>({

      resolver:
        zodResolver(proveedorSchema),

      mode: "onChange",

      defaultValues: {

        nombre_razon_social:
          initialData?.nombre_razon_social ?? "",

        cuit_cuil:
          initialData?.cuit_cuil ?? "",

        correo_contacto:
          initialData?.correo_contacto ?? "",

        telefono_contacto:
          initialData?.telefono_contacto ?? "",

        direccion:
          initialData?.direccion ?? "",

        tipoServicioId:
          initialData?.tipoServicioId
            ? String(initialData.tipoServicioId)
            : "",

        datos_bancarios:
          initialData?.datos_bancarios ?? "",

        observaciones:
          initialData?.observaciones ?? "",

      },

    });


  const telefono =
    watch("telefono_contacto");


  useEffect(() => {

    onFormDirtyChange?.(isDirty);

  }, [isDirty, onFormDirtyChange]);


  const inputErrorClass =
    "border-red-500 focus:border-red-500 focus:ring-red-500";


  // ===========================
  // SUBMIT
  // ===========================

  const submitHandler =
    (data: ProveedorFormValues) => {

      onSubmit({

        ...data,

        cuit_cuil:
          data.cuit_cuil?.replace(/-/g, "")
          || "",

      });

    };


  // ===========================
  // UI
  // ===========================

  return (

    <div className="max-w-3xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">


      {/* HEADER */}

      <div className="bg-gradient-to-r from-[#63bae9]/5 via-[#fcc238]/5 to-transparent rounded-t-lg border-b p-6">

        <div className="flex items-center gap-3">

          <Building2 className="h-6 w-6 text-[#63bae9]" />

          <h2 className="text-xl font-semibold text-[#686363]">

            {modo === "crear"
              ? "Nuevo Proveedor"
              : "Editar Proveedor"}

          </h2>

        </div>

      </div>


      <div className="p-8">

        <form
          onSubmit={
            handleSubmit(submitHandler)
          }
          className="space-y-6"
        >


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


            {/* Nombre */}

            <div>

              <label className="flex items-center gap-2 font-medium mb-2">

                <Building2 className="h-4 w-4 text-[#63bae9]" />

                Nombre / Razón Social *

              </label>

              <Input

                {...register("nombre_razon_social")}

                className={
                  errors.nombre_razon_social
                    ? inputErrorClass
                    : ""
                }

              />

              {errors.nombre_razon_social && (

                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">

                  <AlertCircle className="h-3 w-3" />

                  {
                    errors.nombre_razon_social.message
                  }

                </p>

              )}

            </div>


            {/* CUIT */}

            <div>

              <label className="flex items-center gap-2 font-medium mb-2">

                <CreditCard className="h-4 w-4 text-[#63bae9]" />

                CUIT / CUIL *

              </label>


              <Input

                {...register(
                  "cuit_cuil",
                  {

                    validate:
                      (value) => {

                        if (!value)
                          return true;

                        const limpio =
                          value.replace(/-/g, "");

                        if (!/^\d+$/.test(limpio))
                          return "Solo números";

                        if (limpio.length !== 11)
                          return "Debe tener 11 dígitos";

                        if (!validarCUIT(limpio))
                          return "CUIT inválido";

                        return true;

                      },

                  }
                )}

                className={
                  errors.cuit_cuil
                    ? inputErrorClass
                    : ""
                }

              />

              {errors.cuit_cuil && (

                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">

                  <AlertCircle className="h-3 w-3" />

                  {
                    errors.cuit_cuil.message
                  }

                </p>

              )}

            </div>


            {/* Correo */}

            <div>

              <label className="flex items-center gap-2 font-medium mb-2">

                <Mail className="h-4 w-4 text-[#63bae9]" />

                Correo

              </label>

              <Input

                {...register("correo_contacto")}

                className={
                  errors.correo_contacto
                    ? inputErrorClass
                    : ""
                }

              />

              {errors.correo_contacto && (

                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">

                  <AlertCircle className="h-3 w-3" />

                  {
                    errors.correo_contacto.message
                  }

                </p>

              )}

            </div>


            {/* Teléfono */}

            <div>

              <label className="flex items-center gap-2 font-medium mb-2">

                <Phone className="h-4 w-4 text-[#63bae9]" />

                Teléfono

              </label>


              <PhoneInput

                international

                defaultCountry="AR"

                value={telefono}

                onChange={(value) =>

                  setValue(
                    "telefono_contacto",
                    value || "",
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    }
                  )

                }

              />

              {errors.telefono_contacto && (

                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">

                  <AlertCircle className="h-3 w-3" />

                  {
                    errors.telefono_contacto.message
                  }

                </p>

              )}

            </div>


            {/* Dirección */}

            <div className="md:col-span-2">

              <label className="flex items-center gap-2 font-medium mb-2">

                <MapPin className="h-4 w-4 text-[#63bae9]" />

                Dirección

              </label>

              <Input

                {...register("direccion")}

                className={
                  errors.direccion
                    ? inputErrorClass
                    : ""
                }

              />

            </div>


            {/* Tipo servicio */}

            <div className="md:col-span-2">

              <label className="flex items-center gap-2 font-medium mb-2">
                <Briefcase className="h-4 w-4 text-[#63bae9]" />
                Tipo de servicio *
              </label>

              <select
                {...register("tipoServicioId", {
                  required: "El tipo de servicio es obligatorio",
                })}
                className={errors.tipoServicioId ? inputErrorClass : ""}
              >
                <option value="">
                  Seleccionar
                </option>

                {Array.isArray(tiposServicio) && tiposServicio.map(ts => (
                  <option
                    key={ts.id_tipo_servicio}
                    value={String(ts.id_tipo_servicio)}
                  >
                    {ts.nombre}
                  </option>
                ))}
              </select>

              {errors.tipoServicioId && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.tipoServicioId.message}
                </p>
              )}

            </div>

            {/* Datos bancarios */}

            <div className="md:col-span-2">

              <label className="flex items-center gap-2 font-medium mb-2">

                <CreditCard className="h-4 w-4 text-[#63bae9]" />

                Datos bancarios

              </label>

              <Textarea

                {...register("datos_bancarios")}

              />

            </div>


            {/* Observaciones */}

            <div className="md:col-span-2">

              <label className="flex items-center gap-2 font-medium mb-2">

                <AlignLeft className="h-4 w-4 text-[#63bae9]" />

                Observaciones

              </label>

              <Textarea

                {...register("observaciones")}

              />

            </div>


          </div>


          <div className="flex justify-end pt-6 border-t">

            <Button type="submit">

              {modo === "crear"
                ? "Crear Proveedor"
                : "Guardar Cambios"}

            </Button>

          </div>


        </form>

      </div>

    </div>

  );

}
