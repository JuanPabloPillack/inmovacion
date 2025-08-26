/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Filtros from "@/components/Filtros";
import InmuebleCard from "@/components/InmuebleCard";
import { Inmueble } from "@/types/inmuebles";
import { FiltrosInmueble } from "@/types/filtros";

export default function InmueblesPage() {
  const [filtros, setFiltros] = useState<FiltrosInmueble>({
    localidad: "",
    tipo: "",
    precioMin: "",
    precioMax: "",
  });

  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const buscarInmuebles = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams(filtros as any).toString();
      const res = await fetch(`/api/inmuebles?${query}`);
      if (!res.ok) throw new Error("Error al obtener inmuebles");
      const data: Inmueble[] = (await res.json()).map((i: any) => ({
  ...i,
  fotoPrincipal: i.fotoPrincipal || i.foto || "/placeholder.jpg",
}));

      setInmuebles(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setInmuebles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarInmuebles();
  }, []);

  if (loading) return <p>Cargando inmuebles...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="py-4 text-sm text-gray-500">Home / Inmuebles</div>
      <div className="sticky top-0 z-20 bg-white shadow-md rounded-xl p-4 mb-6">
        <Filtros filtros={filtros} setFiltros={setFiltros} onApply={buscarInmuebles} />
      </div>

      {inmuebles.length === 0 ? (
        <p>No hay inmuebles disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inmuebles.map((i) => (
            <InmuebleCard key={i.id_inmueble} inmueble={i} />
          ))}
        </div>
      )}
    </section>
  );
}
