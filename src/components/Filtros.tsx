"use client";

import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FiltrosInmueble } from "@/types/filtros";

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
  const isAdmin = session?.user?.rol === "admin"; // 👈 se asume que el usuario tiene un campo 'rol'
  const [open, setOpen] = useState(false);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [tipos, setTipos] = useState<TipoInmueble[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);

  useEffect(() => {
    fetch("/api/operaciones")
      .then(res => res.json())
      .then(setOperaciones)
      .catch(err => console.error("Error cargando operaciones:", err));

    fetch("/api/tipos_inmueble")
      .then(res => res.json())
      .then(setTipos)
      .catch(err => console.error("Error cargando tipos:", err));

    if (isAdmin) {
      fetch("/api/estados")
        .then(res => res.json())
        .then(setEstados)
        .catch(err => console.error("Error cargando estados:", err));
    }
  }, [isAdmin]);

  const handleRemove = (key: keyof FiltrosInmueble) => {
    setFiltros(prev => ({ ...prev, [key]: undefined }));
    onApply?.();
  };

  const buscar = () => onApply?.();

  const getOperacionNombre = (id: number) =>
    operaciones.find(op => op.id_operacion === id)?.nombre || "";

  const getTipoNombre = (id: number) =>
    tipos.find(t => t.id_tipo_inmueble === id)?.nombre || "";

  const getEstadoNombre = (id: number) =>
    estados.find(e => e.id_estado === id)?.nombre || "";

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
          {/* Filtro operación (para todos) */}
          <select
            value={filtros.operacionId || ""}
            onChange={e =>
              setFiltros(prev => ({
                ...prev,
                operacionId: Number(e.target.value) || undefined,
              }))
            }
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="">Operación</option>
            {operaciones.map(op => (
              <option key={op.id_operacion} value={op.id_operacion}>
                {op.nombre}
              </option>
            ))}
          </select>

          {/* Filtro tipo */}
          <select
            value={filtros.tipoId || ""}
            onChange={e =>
              setFiltros(prev => ({
                ...prev,
                tipoId: Number(e.target.value) || undefined,
              }))
            }
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="">Tipo de inmueble</option>
            {tipos.map(t => (
              <option key={t.id_tipo_inmueble} value={t.id_tipo_inmueble}>
                {t.nombre}
              </option>
            ))}
          </select>

          {/* Filtro estado (solo para admin) */}
          {isAdmin && (
            <select
              value={filtros.estadoId || ""}
              onChange={e =>
                setFiltros(prev => ({
                  ...prev,
                  estadoId: Number(e.target.value) || undefined,
                }))
              }
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Estado</option>
              {estados.map(est => (
                <option key={est.id_estado} value={est.id_estado}>
                  {est.nombre}
                </option>
              ))}
            </select>
          )}

          {/* Precio mínimo */}
          <input
            type="number"
            placeholder="Precio mínimo"
            value={filtros.precioMin || ""}
            onChange={e =>
              setFiltros(prev => ({
                ...prev,
                precioMin: Number(e.target.value) || undefined,
              }))
            }
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          {/* Precio máximo */}
          <input
            type="number"
            placeholder="Precio máximo"
            value={filtros.precioMax || ""}
            onChange={e =>
              setFiltros(prev => ({
                ...prev,
                precioMax: Number(e.target.value) || undefined,
              }))
            }
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          {/* Botón aplicar */}
          <div className="col-span-full flex justify-end">
            <button
              onClick={buscar}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* Mostrar filtros activos */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filtros.operacionId && (
          <span className="filter-tag">
            Operación: {getOperacionNombre(filtros.operacionId)}
            <button
              onClick={() => handleRemove("operacionId")}
              className="text-sm font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        )}
        {filtros.tipoId && (
          <span className="filter-tag">
            Tipo: {getTipoNombre(filtros.tipoId)}
            <button
              onClick={() => handleRemove("tipoId")}
              className="text-sm font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        )}
        {isAdmin && filtros.estadoId && (
          <span className="filter-tag">
            Estado: {getEstadoNombre(filtros.estadoId)}
            <button
              onClick={() => handleRemove("estadoId")}
              className="text-sm font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        )}
        {filtros.precioMin && (
          <span className="filter-tag">
            Min: ${filtros.precioMin}
            <button
              onClick={() => handleRemove("precioMin")}
              className="text-sm font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        )}
        {filtros.precioMax && (
          <span className="filter-tag">
            Max: ${filtros.precioMax}
            <button
              onClick={() => handleRemove("precioMax")}
              className="text-sm font-bold hover:text-red-500"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
