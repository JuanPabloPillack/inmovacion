/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import Filtros from "../components/Filtros";
import InmuebleCard from "../components/InmuebleCard";
import { InmuebleDTO } from "@/types/inmuebles";
import { FiltrosInmueble } from "@/types/filtros";

export default function HomePage() {
  const [filtros, setFiltros] = useState<FiltrosInmueble>({
    estado: "",
    tipo: "",
    precioMin: "",
    precioMax: "",
  });

  const [inmuebles, setInmuebles] = useState<InmuebleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const buscarInmuebles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams();
      if (filtros.tipo) query.append("tipo", filtros.tipo);
      if (filtros.estado) query.append("estado", filtros.estado);
      if (filtros.precioMin) query.append("precioMin", filtros.precioMin);
      if (filtros.precioMax) query.append("precioMax", filtros.precioMax);

      const res = await fetch(`/api/inmuebles?${query.toString()}`);
      if (!res.ok) throw new Error("Error al obtener inmuebles");
      const data: InmuebleDTO[] = await res.json();
      setInmuebles(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setInmuebles([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    buscarInmuebles();
  }, [buscarInmuebles]);

  return (
    <div className="main-content max-w-6xl mx-auto py-8 px-4">
      <Filtros filtros={filtros} setFiltros={setFiltros} onApply={buscarInmuebles} />
      <div className="space-y-6">
        {loading ? (
          <p className="text-center">Cargando inmuebles...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
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
    </div>
  );
}