// src/app/(protected)/propiedades/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/ui/Header";
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

  // 🔹 Estado de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const inmueblesPorPagina = 5;

  // 🔹 Función para buscar inmuebles con filtros
  const buscarInmuebles = useCallback(async () => {
    setLoading(true);
    setError("");
    setPaginaActual(1); // reinicia a la página 1 al aplicar filtros

    try {
      const query = new URLSearchParams();

      if (filtros.tipoId) query.append("tipo", filtros.tipoId.toString());
      if (filtros.estadoId) query.append("estado", filtros.estadoId.toString());
      if (filtros.precioMin) query.append("precioMin", filtros.precioMin);
      if (filtros.precioMax) query.append("precioMax", filtros.precioMax);

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

  // 🔹 Calcular inmuebles visibles
  const indexUltimo = paginaActual * inmueblesPorPagina;
  const indexPrimero = indexUltimo - inmueblesPorPagina;
  const inmueblesActuales = inmuebles.slice(indexPrimero, indexUltimo);

  // 🔹 Total de páginas
  const totalPaginas = Math.ceil(inmuebles.length / inmueblesPorPagina);

  // 🔹 Cambiar de página
  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-gradient-to-br from-[#63bae9]/10 via-white to-[#fcc238]/10">
      {/* Header */}
      <Header />

      {/* Contenido principal */}
      <main className="flex-1 max-w-6xl mx-auto py-10 px-4">
        {/* Filtros */}
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
            <>
              <div className="space-y-6">
                {inmueblesActuales.map((i) => (
                  <InmuebleCard key={i.id_inmueble} inmueble={i} />
                ))}
              </div>

              {/* 🔹 Paginación */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                  >
                    ← Anterior
                  </button>

                  {[...Array(totalPaginas)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => cambiarPagina(index + 1)}
                      className={`px-3 py-2 rounded-lg ${
                        paginaActual === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
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
