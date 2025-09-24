"use client";

import Link from "next/link";

export default function ModuloPropiedadesPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 grid gap-6 md:grid-cols-2">
      {/* Nuevo Inmueble */}
      <Link href="/propiedades/nuevo" className="block">
        <div className="h-48 flex flex-col justify-center items-center bg-white shadow-lg rounded-xl hover:shadow-2xl transition-shadow cursor-pointer p-6">
          <h2 className="text-2xl font-bold mb-2">Nuevo Inmueble</h2>
          <p className="text-gray-600 text-center">
            Haz clic acá para agregar un nuevo inmueble
          </p>
        </div>
      </Link>

      {/* Baja Inmueble */}
      <Link href="/propiedades/baja" className="block">
        <div className="h-48 flex flex-col justify-center items-center bg-white shadow-lg rounded-xl hover:shadow-2xl transition-shadow cursor-pointer p-6">
          <h2 className="text-2xl font-bold mb-2">Baja Inmueble</h2>
          <p className="text-gray-600 text-center">
            Haz clic acá para archivar los inmuebles existentes
          </p>
        </div>
      </Link>
    </div>
  );
}
