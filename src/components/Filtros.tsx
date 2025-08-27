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
    <div className="w-full">
      {/* Encabezado filtros */}
      <div
        className="bg-gray-200 p-4 rounded-xl shadow-md cursor-pointer hover:bg-gray-300 transition flex justify-between items-center"
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
              className="filter-tag hover:bg-blue-500 transition"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* Mostrar filtros activos */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filtros.estado && (
          <span className="filter-tag">
            Estado: {filtros.estado}
            <button onClick={() => handleRemove("estado")} className="text-sm font-bold hover:text-red-500">
              ×
            </button>
          </span>
        )}
        {filtros.tipo && (
          <span className="filter-tag">
            Tipo: {filtros.tipo}
            <button onClick={() => handleRemove("tipo")} className="text-sm font-bold hover:text-red-500">
              ×
            </button>
          </span>
        )}
        {filtros.precioMin && (
          <span className="filter-tag">
            Min: ${filtros.precioMin}
            <button onClick={() => handleRemove("precioMin")} className="text-sm font-bold hover:text-red-500">
              ×
            </button>
          </span>
        )}
        {filtros.precioMax && (
          <span className="filter-tag">
            Max: ${filtros.precioMax}
            <button onClick={() => handleRemove("precioMax")} className="text-sm font-bold hover:text-red-500">
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
}