"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { FiltrosInmueble } from "@/types/filtros";

interface FiltrosProps {
  filtros: FiltrosInmueble;
  setFiltros: Dispatch<SetStateAction<FiltrosInmueble>>;
  onApply?: () => void;
}

export default function Filtros({ filtros, setFiltros, onApply }: FiltrosProps) {
  const [open, setOpen] = useState(false);

  const handleRemove = (key: keyof FiltrosInmueble) => {
    setFiltros((prev) => ({ ...prev, [key]: "" }));
    onApply?.();
  };

  const buscar = () => onApply?.();

  return (
    <div className="w-full max-w-6xl mx-auto my-6">
      {/* Encabezado filtros */}
      <div
        className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 transition"
        onClick={() => setOpen(!open)}
      >
        <h3 className="font-semibold text-gray-800 text-lg">Filtros</h3>
        <span className="text-gray-600">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="bg-white shadow-md rounded-xl p-6 mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtro estado */}
          <select
            value={filtros.estado}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, estado: e.target.value as "" | "alquiler" | "venta" }))
            }
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="" disabled hidden>
              Estado
            </option>
            <option value="alquiler">Alquiler</option>
            <option value="venta">Venta</option>
          </select>

          {/* Filtro tipo */}
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros((prev) => ({ ...prev, tipo: e.target.value }))}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="" disabled hidden>
              Tipo
            </option>
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
            <option value="lote">Lote</option>
            <option value="duplex">Duplex</option>
          </select>

          {/* Filtro precio mínimo */}
          <input
            type="number"
            placeholder="Precio mínimo"
            value={filtros.precioMin}
            onChange={(e) => setFiltros((prev) => ({ ...prev, precioMin: e.target.value }))}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          {/* Filtro precio máximo */}
          <input
            type="number"
            placeholder="Precio máximo"
            value={filtros.precioMax}
            onChange={(e) => setFiltros((prev) => ({ ...prev, precioMax: e.target.value }))}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          {/* Botón aplicar */}
          <div className="col-span-full flex justify-end">
            <button
              onClick={buscar}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* Mostrar filtros activos */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filtros.estado && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            Estado: {filtros.estado}
            <button onClick={() => handleRemove("estado")} className="font-bold hover:text-red-500">
              ×
            </button>
          </span>
        )}
        {filtros.tipo && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            Tipo: {filtros.tipo}
            <button onClick={() => handleRemove("tipo")} className="font-bold hover:text-red-500">
              ×
            </button>
          </span>
        )}
        {filtros.precioMin && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            Min: ${filtros.precioMin}
            <button onClick={() => handleRemove("precioMin")} className="font-bold hover:text-red-500">
              ×
            </button>
          </span>
        )}
        {filtros.precioMax && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            Max: ${filtros.precioMax}
            <button onClick={() => handleRemove("precioMax")} className="font-bold hover:text-red-500">
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
