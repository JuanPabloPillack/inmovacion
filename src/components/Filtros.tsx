/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { SlidersHorizontal, DollarSign, X } from "lucide-react";
import { FiltrosInmueble } from "@/types/filtros";

/* =====================
   TIPOS
===================== */

interface Operacion {
  id_operacion: number;
  nombre: string;
}

interface TipoInmueble {
  id_tipo_inmueble: number;
  nombre: string;
}

interface Estado {
  id_estado: number;
  nombre: string;
}

interface FiltrosProps {
  filtros: FiltrosInmueble;
  setFiltros: Dispatch<SetStateAction<FiltrosInmueble>>;
  onApply?: () => void;
}

/* =====================
   COMPONENTE
===================== */

export default function Filtros({
  filtros,
  setFiltros,
  onApply,
}: FiltrosProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.rol === "admin";

  const [open, setOpen] = useState(false);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [tipos, setTipos] = useState<TipoInmueble[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);

  /* =====================
     CARGA DE DATOS
  ===================== */

  useEffect(() => {
    fetch("/api/operaciones")
      .then((res) => res.json())
      .then(setOperaciones)
      .catch(() => console.error("Error cargando operaciones"));

    fetch("/api/tipos_inmueble")
      .then((res) => res.json())
      .then(setTipos)
      .catch(() => console.error("Error cargando tipos"));

    if (isAdmin) {
      fetch("/api/estados")
        .then((res) => res.json())
        .then(setEstados)
        .catch(() => console.error("Error cargando estados"));
    }
  }, [isAdmin]);

  /* =====================
     HANDLERS
  ===================== */

  const handleChange = <K extends keyof FiltrosInmueble>(
    field: K,
    value: FiltrosInmueble[K]
  ) => {
    setFiltros((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemove = (field: keyof FiltrosInmueble) => {
    setFiltros((prev) => ({ ...prev, [field]: undefined }));
    onApply?.();
  };

  const aplicar = () => onApply?.();

  /* =====================
     HELPERS
  ===================== */

  const getOperacionNombre = (id: number) =>
    operaciones.find((o) => o.id_operacion === id)?.nombre ?? "";

  const getTipoNombre = (id: number) =>
    tipos.find((t) => t.id_tipo_inmueble === id)?.nombre ?? "";

  const getEstadoNombre = (id: number) =>
    estados.find((e) => e.id_estado === id)?.nombre ?? "";

  /* =====================
     RENDER
  ===================== */

  return (
    <div className="w-full">
      {/* HEADER */}
      <div
        onClick={() => setOpen((v) => !v)}
        className="bg-white border shadow-sm p-5 rounded-xl cursor-pointer flex justify-between items-center hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#63bae9]/10 text-[#63bae9]">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-700 text-lg">
            Filtrar inmuebles
          </h3>
        </div>

        <span className="text-sm text-gray-500 font-medium">
          {open ? "Ocultar" : "Mostrar"}
        </span>
      </div>

      {/* CONTENIDO */}
      {open && (
        <div className="bg-white border shadow-sm rounded-xl p-6 mt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Operación */}
            <select
              className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#63bae9]"
              value={filtros.operacionId ?? ""}
              onChange={(e) =>
                handleChange(
                  "operacionId",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            >
              <option value="">Operación</option>
              {operaciones.map((o) => (
                <option key={o.id_operacion} value={o.id_operacion}>
                  {o.nombre}
                </option>
              ))}
            </select>

            {/* Tipo */}
            <select
              className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#63bae9]"
              value={filtros.tipoId ?? ""}
              onChange={(e) =>
                handleChange(
                  "tipoId",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            >
              <option value="">Tipo inmueble</option>
              {tipos.map((t) => (
                <option key={t.id_tipo_inmueble} value={t.id_tipo_inmueble}>
                  {t.nombre}
                </option>
              ))}
            </select>

            {/* Estado */}
            {isAdmin && (
              <select
                className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#63bae9]"
                value={filtros.estadoId ?? ""}
                onChange={(e) =>
                  handleChange(
                    "estadoId",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              >
                <option value="">Estado</option>
                {estados.map((e) => (
                  <option key={e.id_estado} value={e.id_estado}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            )}

            {/* Precio mínimo */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={0}
                placeholder="Precio mínimo"
                value={filtros.precioMin ?? ""}
                onChange={(e) =>
                  handleChange(
                    "precioMin",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#63bae9]"
              />
            </div>

            {/* Precio máximo */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={0}
                placeholder="Precio máximo"
                value={filtros.precioMax ?? ""}
                onChange={(e) =>
                  handleChange(
                    "precioMax",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#63bae9]"
              />
            </div>

            {/* Aplicar */}
            <div className="col-span-full flex justify-end">
              <button
                onClick={aplicar}
                className="px-6 py-2.5 bg-[#63bae9] text-white rounded-lg font-medium hover:bg-[#57a9d3] flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAGS ACTIVOS */}
      {(filtros.operacionId ||
        filtros.tipoId ||
        filtros.estadoId ||
        filtros.precioMin ||
        filtros.precioMax) && (
        <div className="flex flex-wrap gap-2.5 mt-4">
          {filtros.operacionId && (
            <Tag
              label={getOperacionNombre(filtros.operacionId)}
              onRemove={() => handleRemove("operacionId")}
            />
          )}

          {filtros.tipoId && (
            <Tag
              label={getTipoNombre(filtros.tipoId)}
              onRemove={() => handleRemove("tipoId")}
            />
          )}

          {isAdmin && filtros.estadoId && (
            <Tag
              label={`Estado: ${getEstadoNombre(filtros.estadoId)}`}
              onRemove={() => handleRemove("estadoId")}
            />
          )}

          {filtros.precioMin && (
            <Tag
              label={`Mín: $${filtros.precioMin.toLocaleString()}`}
              onRemove={() => handleRemove("precioMin")}
            />
          )}

          {filtros.precioMax && (
            <Tag
              label={`Máx: $${filtros.precioMax.toLocaleString()}`}
              onRemove={() => handleRemove("precioMax")}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* =====================
   TAG COMPONENT
===================== */

function Tag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#63bae9]/10 text-[#63bae9] rounded-lg text-sm font-medium shadow-sm">
      {label}
      <button onClick={onRemove}>
        <X className="w-4 h-4 hover:text-red-600" />
      </button>
    </span>
  );
}
