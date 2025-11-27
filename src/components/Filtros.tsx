/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FiltrosInmueble } from "@/types/filtros";
import { SlidersHorizontal, DollarSign } from "lucide-react";

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

export default function Filtros({ filtros, setFiltros, onApply }: FiltrosProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.rol === "admin";

  const [open, setOpen] = useState(false);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [tipos, setTipos] = useState<TipoInmueble[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);

  // ------------------ FETCH DATA ------------------
  useEffect(() => {
    fetch("/api/operaciones")
      .then((res) => res.json())
      .then(setOperaciones)
      .catch((err) => console.error("Error cargando operaciones:", err));

    fetch("/api/tipos_inmueble")
      .then((res) => res.json())
      .then(setTipos)
      .catch((err) => console.error("Error cargando tipos:", err));

    if (isAdmin) {
      fetch("/api/estados")
        .then((res) => res.json())
        .then(setEstados)
        .catch((err) => console.error("Error cargando estados:", err));
    }
  }, [isAdmin]);

  // ------------------ HANDLERS ------------------
  const handleRemove = (key: keyof FiltrosInmueble) => {
    setFiltros((prev) => ({ ...prev, [key]: undefined }));
    onApply?.();
  };

  const buscar = () => onApply?.();

  const handleChange = (field: keyof FiltrosInmueble, value: any) => {
    setFiltros((prev) => ({ ...prev, [field]: value }));
  };

  // ------------------ GET NAMES ------------------
  const getOperacionNombre = (id: number) =>
    operaciones.find((op) => op.id_operacion === id)?.nombre || "";

  const getTipoNombre = (id: number) =>
    tipos.find((t) => t.id_tipo_inmueble === id)?.nombre || "";

  const getEstadoNombre = (id: number) =>
    estados.find((e) => e.id_estado === id)?.nombre || "";

  return (
    <div className="w-full">

      {/* ------------------ HEADER ------------------ */}
      <div
        className="bg-white border shadow-sm p-4 rounded-xl cursor-pointer transition flex justify-between items-center hover:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-700 text-lg">Filtros</h3>
        </div>
        <span className="text-gray-600">{open ? "▲" : "▼"}</span>
      </div>

      {/* ------------------ CONTENT ------------------ */}
      {open && (
        <div className="bg-white shadow-sm rounded-xl border p-6 mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Operación */}
          <div>
            <label className="text-sm text-gray-600 font-medium mb-1 block">
              Tipo de operación
            </label>
            <select
              value={filtros.operacionId || ""}
              onChange={(e) =>
                handleChange(
                  "operacionId",
                  Number(e.target.value) || undefined
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Todas</option>
              {operaciones.map((op) => (
                <option key={op.id_operacion} value={op.id_operacion}>
                  {op.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="text-sm text-gray-600 font-medium mb-1 block">
              Tipo de inmueble
            </label>
            <select
              value={filtros.tipoId || ""}
              onChange={(e) =>
                handleChange("tipoId", Number(e.target.value) || undefined)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Todos</option>
              {tipos.map((t) => (
                <option key={t.id_tipo_inmueble} value={t.id_tipo_inmueble}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado admin */}
          {isAdmin && (
            <div>
              <label className="text-sm text-gray-600 font-medium mb-1 block">
                Estado
              </label>
              <select
                value={filtros.estadoId || ""}
                onChange={(e) =>
                  handleChange(
                    "estadoId",
                    Number(e.target.value) || undefined
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Todos</option>
                {estados.map((est) => (
                  <option key={est.id_estado} value={est.id_estado}>
                    {est.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Precio mínimo */}
          <div>
            <label className="text-sm text-gray-600 font-medium mb-1 block">
              Precio mínimo
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={0}
                value={filtros.precioMin || ""}
                onChange={(e) =>
                  handleChange("precioMin", Number(e.target.value) || undefined)
                }
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Precio máximo */}
          <div>
            <label className="text-sm text-gray-600 font-medium mb-1 block">
              Precio máximo
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={0}
                value={filtros.precioMax || ""}
                onChange={(e) =>
                  handleChange("precioMax", Number(e.target.value) || undefined)
                }
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Botón aplicar */}
          <div className="col-span-full flex justify-end">
            <button
              onClick={buscar}
              className="px-5 py-2 rounded-lg bg-[#63bae9] text-white font-medium hover:bg-[#57a9d3] transition shadow-sm"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* ------------------ TAGS DE FILTROS ACTIVOS ------------------ */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filtros.operacionId && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            Operación: {getOperacionNombre(filtros.operacionId)}
            <button
              onClick={() => handleRemove("operacionId")}
              className="font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        )}

        {filtros.tipoId && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            Tipo: {getTipoNombre(filtros.tipoId)}
            <button
              onClick={() => handleRemove("tipoId")}
              className="font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        )}

        {isAdmin && filtros.estadoId && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            Estado: {getEstadoNombre(filtros.estadoId)}
            <button
              onClick={() => handleRemove("estadoId")}
              className="font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        )}

        {filtros.precioMin && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            Min: ${filtros.precioMin}
            <button
              onClick={() => handleRemove("precioMin")}
              className="font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        )}

        {filtros.precioMax && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            Max: ${filtros.precioMax}
            <button
              onClick={() => handleRemove("precioMax")}
              className="font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
