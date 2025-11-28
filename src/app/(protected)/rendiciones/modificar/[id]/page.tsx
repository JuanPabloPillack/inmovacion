/* eslint-disable @typescript-eslint/no-explicit-any */
// rendiciones/modificar/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Header from "@/components/ui/Header";

/**
 * Interfaces que describen la estructura de los datos
 * que devuelve la API. Esto permite autocompletado y tipado estricto.
 */
interface Cliente {
  id_cliente: number;
  nombre: string;
}

interface Cobranza {
  id_cobranza: number;
  monto: number;
  concepto: string;
  cliente: { nombre: string };
  genera_recibo: boolean;
  fecha?: string;
}

/**
 * Página de modificación de una rendición.
 * Se carga desde: /rendiciones/modificar/[id]
 */
export default function ModificarRendicionPage() {
  const params = useParams();            // Obtiene los params dinámicos de la URL
  const id_rendicion = params?.id;       // Extrae el ID de la rendición

  // Estados principales
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadedClientes, setLoadedClientes] = useState(false); // Saber si clientes ya cargaron

  const [cobranzas, setCobranzas] = useState<Cobranza[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros seleccionados
  const [cliente, setCliente] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");

  // IPC automático
  const [mesIPC, setMesIPC] = useState("");
  const [anioIPC, setAnioIPC] = useState("");

  // Años desde 2020 al actual
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);

  // ====================================================
  // 1. CARGAR CLIENTES
  // ====================================================
  const cargarClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();

      /**
       * La API puede devolver:
       *  → Un array directo
       *  → Un objeto con { clientes: [...] }
       * Por eso este manejo flexible.
       */
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.clientes)
        ? data.clientes
        : [];

      setClientes(lista);
      setLoadedClientes(true);
    } catch (e) {
      toast.error("Error al cargar clientes");
      setLoadedClientes(true);
    }
  };

  // Llama a cargarClientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  // ====================================================
  // 2. CARGAR DATOS DE LA RENDICIÓN
  // ====================================================
  const cargarRendicion = async () => {
    if (!id_rendicion) return;

    try {
      const res = await fetch(`/api/rendiciones/${id_rendicion}`);
      const data = await res.json();

      if (!data?.rendicion) {
        toast.error("Rendición no encontrada");
        return;
      }

      const r = data.rendicion;

      // Carga campos base de la rendición
      setMesIPC(r.mes_ipc ? String(r.mes_ipc) : "");
      setAnioIPC(r.anio_ipc ? String(r.anio_ipc) : "");

      // Cargar cobranzas previamente asociadas
      setSeleccionadas(
        Array.isArray(r.cobranzas)
          ? r.cobranzas.map((c: any) => c.id_cobranza)
          : []
      );

      setCliente(r.id_cliente ? String(r.id_cliente) : "");
      setAnio(r.anio ? String(r.anio) : "");
      setMes(r.mes ? String(r.mes) : "");
    } catch (e) {
      toast.error("Error al cargar rendición");
    }
  };

  useEffect(() => {
    cargarRendicion();
  }, [id_rendicion]);

  // ====================================================
  // 3. CARGAR COBRANZAS SEGÚN FILTROS
  // ====================================================
  const cargarCobranzas = async () => {
    if (!loadedClientes) return; // Esperar a que clientes esté listo

    try {
      // Armado dinámico de query params
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("pageSize", "1000");

      if (cliente) params.append("cliente", cliente);
      if (anio) params.append("anio", anio);
      if (mes) params.append("mes", mes);

      // Para incluir cobranzas ya seleccionadas aunque no coincidan con los filtros nuevos
      params.append("incluirSeleccionadas", "1");
      params.append("rendicionActual", String(id_rendicion));

      const res = await fetch(`/api/cobranzas?${params.toString()}`);
      const data = await res.json();

      /**
       * Mapeamos las cobranzas para agregar la propiedad "fecha"
       * ya que la API usa "fecha_cobranza".
       */
      const lista: Cobranza[] = Array.isArray(data?.cobranzas)
        ? data.cobranzas.map((c: any) => ({
            ...c,
            fecha: c.fecha_cobranza,
          }))
        : [];

      setCobranzas(lista);
    } catch (e) {
      toast.error("Error al cargar cobranzas");
    }
  };

  useEffect(() => {
    cargarCobranzas();
  }, [cliente, anio, mes, loadedClientes]);

  // ====================================================
  // 4. SELECCIONAR / DESELECCIONAR COBRANZAS + IPC AUTO
  // ====================================================
  const toggle = (id: number) => {
    setSeleccionadas((prev) => {
      // Si está seleccionada → se quita, sino se agrega
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      // Obtener las cobranzas seleccionadas actualmente
      const seleccionadasAhora = cobranzas.filter((c) =>
        next.includes(c.id_cobranza)
      );

      // Si no hay ninguna → limpiar IPC
      if (seleccionadasAhora.length === 0) {
        setMesIPC("");
        setAnioIPC("");
        return next;
      }

      // Tomar las fechas válidas de las cobranzas seleccionadas
      const fechasValidas = seleccionadasAhora
        .map((c) => (c.fecha ? new Date(c.fecha) : null))
        .filter(Boolean) as Date[];

      // Selecciona la fecha más reciente para el IPC
      if (fechasValidas.length > 0) {
        const masReciente = fechasValidas.reduce((a, b) => (a > b ? a : b));
        setMesIPC(String(masReciente.getMonth() + 1));
        setAnioIPC(String(masReciente.getFullYear()));
      }

      return next;
    });
  };

  // ====================================================
  // 5. GUARDAR CAMBIOS Y DESCARGAR EXCEL DIRECTO
  // ====================================================
  const guardar = async () => {
    if (seleccionadas.length === 0)
      return toast.error("Seleccioná al menos una cobranza");

    setLoading(true);

    try {
      // Armamos el cuerpo del PUT
      const payload = {
        cobranzas: seleccionadas,
        mes_ipc: mesIPC ? Number(mesIPC) : undefined,
        anio_ipc: anioIPC ? Number(anioIPC) : undefined,
      };

      // Guardar la rendición
      const res = await fetch(`/api/rendiciones/${id_rendicion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error actualizando");
      }

      // Descarga automática del Excel generado
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Rendicion_${id_rendicion}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Rendición modificada y Excel descargado");

      // Redirigir después de 1 segundo
      setTimeout(() => {
        window.location.href = "/rendiciones";
      }, 1000);
    } catch (e: any) {
      toast.error(e.message || "Error guardando");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-700">
          Modificar Rendición
        </h1>

        <div className="bg-white p-6 rounded-xl shadow space-y-6">
          {/* FILTROS */}
          <h2 className="font-semibold text-lg">Filtrar Cobranzas</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
              >
                <option value="">Todos</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={String(c.id_cliente)}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Año</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              >
                <option value="">Todos</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Mes</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
              >
                <option value="">Todos</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {new Date(0, i).toLocaleString("es-AR", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* IPC */}
          <h2 className="font-semibold text-lg mt-6">Ajuste IPC</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Mes IPC</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={mesIPC}
                onChange={(e) => setMesIPC(e.target.value)}
              >
                <option value="">Ninguno</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {new Date(0, i).toLocaleString("es-AR", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Año IPC</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={anioIPC}
                onChange={(e) => setAnioIPC(e.target.value)}
              >
                <option value="">Ninguno</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LISTA COBRANZAS */}
          <h2 className="font-semibold text-lg mt-6">Seleccionar Cobranzas</h2>

          <div className="space-y-3">
            {cobranzas.map((c) => (
              <label
                key={c.id_cobranza}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={seleccionadas.includes(c.id_cobranza)}
                  onChange={() => toggle(c.id_cobranza)}
                />

                <div>
                  <div className="font-semibold">{c.cliente.nombre}</div>

                  <div className="text-sm text-gray-500">
                    {c.concepto} — ${c.monto}
                    {c.fecha && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({new Date(c.fecha).toLocaleDateString("es-AR")})
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* BOTONES */}
          <div className="flex justify-between mt-6 gap-4">
            <button
              onClick={() => (window.location.href = "/rendiciones")}
              className="w-1/2 px-6 py-3 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>

            <button
              onClick={guardar}
              disabled={loading}
              className="w-1/2 px-6 py-3 rounded-lg text-white bg-[#63bae9] hover:opacity-90"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
