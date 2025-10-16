"use client";
import { useRouter } from "next/navigation";
import FormularioInmueble from "@/components/FormularioInmueble";

export default function NuevoInmueblePage() {
  const router = useRouter();

  return (
    <FormularioInmueble
      onSuccess={() => {
        // Redirige a la página de módulo después de crear
        router.push("/propiedades/modulo");
      }}
    />
  );
}
