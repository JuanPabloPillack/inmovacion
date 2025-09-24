/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import InmuebleCard from "@/components/InmuebleCard";
import type { InmuebleDTO } from "@/types/inmuebles";

export default function BajaPage() {
  const [inmuebles, setInmuebles] = useState<InmuebleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInmuebles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inmuebles/baja");
      const data = await res.json();
      setInmuebles(data);
    } catch (err: any) {
      console.error(err);
      setError("Error al cargar inmuebles");
    } finally {
      setLoading(false);
    }
  };

  const toggleArchivado = async (id_inmueble: number, archivado: boolean) => {
    try {
      await fetch("/api/inmuebles/baja", {
        method: "PUT",
        body: JSON.stringify({ id_inmueble, archivado }),
        headers: { "Content-Type": "application/json" },
      });
      fetchInmuebles(); // refrescar listado
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInmuebles();
  }, []);

  if (loading) return <p>⏳ Cargando inmuebles...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {inmuebles.map((i) => (
        <div key={i.id_inmueble} className="border p-4 rounded-md">
          <InmuebleCard inmueble={i} />
          <button
            className={`mt-2 px-3 py-1 rounded ${i.archivado ? "bg-green-500" : "bg-red-500"} text-white`}
            onClick={() => toggleArchivado(i.id_inmueble, !i.archivado)}
          >
            {i.archivado ? "Desarchivar" : "Archivar"}
          </button>
        </div>
      ))}
    </div>
  );
}
