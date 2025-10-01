/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/ui/Header"; // 👈 importamos el Header
import Filtros from "@/components/Filtros";
import InmuebleCard from "@/components/InmuebleCard";
import { InmuebleDTO } from "@/types/inmuebles";
import { FiltrosInmueble } from "@/types/filtros";

export default function PropiedadesPage() {
  // 🔹 Estado de filtros
  const [filtros, setFiltros] = useState<FiltrosInmueble>({
    estadoId: undefined,
    tipoId: undefined,
    precioMin: "",
    precioMax: "",
  });

  // 🔹 Estado de datos y UI
  const [inmuebles, setInmuebles] = useState<InmuebleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Función para buscar inmuebles con filtros
  const buscarInmuebles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams();

      if (filtros.tipoId) query.append("tipo", filtros.tipoId.toString());
      if (filtros.estadoId) query.append("estado", filtros.estadoId.toString());
      if (filtros.precioMin) query.append("precioMin", filtros.precioMin);
      if (filtros.precioMax) query.append("precioMax", filtros.precioMax);

      // ✅ fetch correcto hacia el endpoint de la API
      const res = await fetch(`/api/inmuebles?${query.toString()}`);

      if (!res.ok) throw new Error("Error al obtener inmuebles");

      const data: InmuebleDTO[] = await res.json();
      setInmuebles(data);
    } catch (err: any) {
      console.error("❌ Error en buscarInmuebles:", err);
      setError(err.message);
      setInmuebles([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // 🔹 Cargar inmuebles al montar la página y cuando cambien los filtros
  useEffect(() => {
    buscarInmuebles();
  }, [buscarInmuebles]);

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-gradient-to-br from-[#63bae9]/10 via-white to-[#fcc238]/10">
      {/* Header */}
      <Header />

      {/* Contenido principal */}
      <main className="flex-1 max-w-6xl mx-auto py-10 px-4">
        {/* Formulario de filtros */}
        <Filtros filtros={filtros} setFiltros={setFiltros} onApply={buscarInmuebles} />

        {/* Contenido */}
        <div className="space-y-6 mt-6">
          {loading ? (
            <p className="text-center">⏳ Cargando inmuebles...</p>
          ) : error ? (
            <p className="text-center text-red-500">❌ {error}</p>
          ) : inmuebles.length === 0 ? (
            <p className="text-center">No hay inmuebles disponibles con este filtro.</p>
          ) : (
            <div className="space-y-6">
              {inmuebles.map((i) => (
                <InmuebleCard key={i.id_inmueble} inmueble={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#63bae9] text-white py-6 text-center mt-auto">
        <p className="text-sm">
          © 2025 Inmovación - GBS y Asociados. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
