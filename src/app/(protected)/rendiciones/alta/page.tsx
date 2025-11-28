// src/app/(protected)/rendiciones/alta/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Header from "@/components/ui/Header";

/* ==========================================================
   📌 Interfaces para tipar los datos recibidos desde la API
   ========================================================== */
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
  fecha_cobranza?: string;
  mes_ipc?: number;
  anio_ipc?: number;
}

/* ==========================================================
   📌 Componente principal de la página
   ========================================================== */
export default function AltaRendicionPage() {
  // Lista de clientes para el filtro
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadedClientes, setLoadedClientes] = useState(false); // evita llamar cobranzas antes de cargar clientes

  // Lista de cobranzas filtradas
  const [cobranzas, setCobranzas] = useState<Cobranza[]>([]);

  // IDs de cobranzas seleccionadas para rendición
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);

  // Flags de carga
  const [loading, setLoading] = useState(false);

  // Filtros
  const [cliente, setCliente] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");

  // Valores de IPC auto–calculados o ingresados
  const [mesIPC, setMesIPC] = useState("");
  const [anioIPC, setAnioIPC] = useState("");

  // Lista de años disponibles desde 2020 hasta hoy
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);

  /* ==========================================================
     📌 1) CARGAR CLIENTES DESDE LA API
     ========================================================== */
  const cargarClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();

      // La API puede devolver: [clientes] o { clientes: [...] }
      const lista: Cliente[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.clientes)
        ? data.clientes
        : [];

      setClientes(lista);
    } catch (e) {
      console.error("❌ Error al cargar clientes:", e);
      toast.error("Error al cargar clientes");
    } finally {
      setLoadedClientes(true);
    }
  };

  // Se carga una sola vez al montar la página
  useEffect(() => {
    cargarClientes();
  }, []);

  /* ==========================================================
     📌 2) VALIDACIONES SUAVES mientras el usuario filtra
     ========================================================== */
  const validarFiltros = () => {
    if (anio && Number(anio) < 2020) {
      toast("⚠ El año es muy bajo, ¿estás segura?");
    }

    if (mes && (Number(mes) < 1 || Number(mes) > 12)) {
      toast("⚠ El mes no es válido");
    }
  };

  /* ==========================================================
     📌 3) CARGAR COBRANZAS según los filtros
     ========================================================== */
  const cargarCobranzas = async () => {
    // Evita llamar antes de tener clientes cargados
    if (!loadedClientes) return;

    validarFiltros();

    // Si no hay filtros → limpio todo
    if (!cliente && !anio && !mes) {
      setCobranzas([]);
      setSeleccionadas([]);
      setMesIPC("");
      setAnioIPC("");
      return;
    }

    try {
      const params = new URLSearchParams();

      // Solo cobranzas sin rendir
      params.append("sinRendir", "1");

      // Filtros dinámicos
      if (cliente) params.append("cliente", cliente);
      if (anio) params.append("anio", anio);
      if (mes) params.append("mes", mes);

      // Evitamos paginación
      params.append("page", "1");
      params.append("pageSize", "1000");

      const url = `/api/cobranzas?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      // Normalización de cobranzas
      const lista: Cobranza[] = Array.isArray(data?.cobranzas)
        ? data.cobranzas.map((c: any) => ({
            ...c,
            fecha_cobranza: c.fecha_cobranza,
          }))
        : [];

      setCobranzas(lista);
      setSeleccionadas([]);
      setMesIPC("");
      setAnioIPC("");

      if (lista.length === 0) toast("No hay cobranzas con esos filtros");
    } catch (e) {
      console.error("❌ Error al cargar cobranzas:", e);
      toast.error("Error al cargar cobranzas");
    }
  };

  // Refiltra cada vez que cambian los filtros o se cargan clientes
  useEffect(() => {
    cargarCobranzas();
  }, [cliente, anio, mes, loadedClientes]);

  /* ==========================================================
     📌 4) SELECCIONAR/Deseleccionar UNA COBRANZA
         + Cálculo automático del IPC sugerido
     ========================================================== */
  const toggle = (id: number) => {
    // Agregar o quitar la cobranza
    const next = seleccionadas.includes(id)
      ? seleccionadas.filter((x) => x !== id)
      : [...seleccionadas, id];

    setSeleccionadas(next);

    // Obtener cobranzas seleccionadas
    const seleccionadasAhora = cobranzas.filter((c) => next.includes(c.id_cobranza));

    // Si se deseleccionó todo → limpias IPC
    if (seleccionadasAhora.length === 0) {
      setMesIPC("");
      setAnioIPC("");
      return;
    }

    // Tomar solo las fechas existentes
    const fechasValidas = seleccionadasAhora
      .map((c) => (c.fecha_cobranza ? new Date(c.fecha_cobranza) : null))
      .filter(Boolean) as Date[];

    // Si alguna tienen fecha → tomar la más reciente
    if (fechasValidas.length > 0) {
      const masReciente = fechasValidas.reduce((a, b) => (a > b ? a : b));

      setMesIPC(String(masReciente.getMonth() + 1)); // meses empiezan en 0
      setAnioIPC(String(masReciente.getFullYear()));
    }
  };

  /* ==========================================================
     📌 5) VALIDACIONES DURAS al guardar
     ========================================================== */
  const validarGuardar = () => {
    if (seleccionadas.length === 0) {
      toast.error("Seleccioná al menos una cobranza");
      return false;
    }

    if ((mesIPC && !anioIPC) || (!mesIPC && anioIPC)) {
      toast.error("Si usás IPC, debés completar mes y año");
      return false;
    }

    if (anioIPC && Number(anioIPC) < 2020) {
      toast.error("Año IPC inválido");
      return false;
    }

    if (mesIPC && (Number(mesIPC) < 1 || Number(mesIPC) > 12)) {
      toast.error("Mes IPC inválido");
      return false;
    }

    return true;
  };

  /* ==========================================================
     📌 6) GUARDAR RENDICIÓN + DESCARGAR AUTOMÁTICAMENTE EL EXCEL
     ========================================================== */
  const guardar = async () => {
    if (!validarGuardar()) return;

    setLoading(true);

    try {
      const payload = {
        cobranzas: seleccionadas,
        fecha_rendicion: new Date(),
        mes_ipc: mesIPC ? Number(mesIPC) : undefined,
        anio_ipc: anioIPC ? Number(anioIPC) : undefined,
      };

      // Enviamos la rendición al backend
      const res = await fetch("/api/rendiciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error desconocido");
      }

      // El backend devuelve un archivo Excel
      const blob = await res.blob();

      // Fuerzo descarga del archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rendicion.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Rendición registrada y Excel descargado");

      // Redirige automáticamente después de descargar
      setTimeout(() => {
        window.location.href = "/rendiciones";
      }, 1000);
    } catch (e: any) {
      console.error("❌ Error al guardar rendición:", e);
      toast.error(e.message || "Error al guardar rendición");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-700">Nueva Rendición</h1>

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
          <h2 className="font-semibold text-lg mt-6">Ajuste IPC (opcional)</h2>
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
                    {c.fecha_cobranza && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({new Date(c.fecha_cobranza).toLocaleDateString("es-AR")})
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
              {loading ? "Guardando..." : "Guardar Rendición"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
