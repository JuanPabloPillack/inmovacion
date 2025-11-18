//rendiciones/alta/page
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Header from "@/components/ui/Header";

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
  mes_ipc?: number;
  anio_ipc?: number;
  fecha?: string; // <-- agregamos la fecha de la cobranza
}

export default function AltaRendicionPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadedClientes, setLoadedClientes] = useState(false);

  const [cobranzas, setCobranzas] = useState<Cobranza[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [cliente, setCliente] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");

  const [mesIPC, setMesIPC] = useState("");   
  const [anioIPC, setAnioIPC] = useState("");

  // ---------------------------------------------
  // CARGAR CLIENTES
  // ---------------------------------------------
  const cargarClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.clientes)
        ? data.clientes
        : [];
      setClientes(lista);
      setLoadedClientes(true);
    } catch (e) {
      console.error("❌ Error al cargar clientes:", e);
      toast.error("Error al cargar clientes");
      setLoadedClientes(true);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // ---------------------------------------------
  // CARGAR COBRANZAS
  // ---------------------------------------------
  const cargarCobranzas = async () => {
    if (!loadedClientes || (!cliente && !anio && !mes)) {
      setCobranzas([]);
      setSeleccionadas([]);
      setMesIPC("");
      setAnioIPC("");
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("sinRendir", "1");
      if (cliente) params.append("cliente", cliente);
      if (anio) params.append("anio", anio);
      if (mes) params.append("mes", mes);
      params.append("page", "1");
      params.append("pageSize", "1000");

      const url = `/api/cobranzas?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      const lista: Cobranza[] = Array.isArray(data?.cobranzas) ? data.cobranzas : [];
      setCobranzas(lista);

      if (lista.length === 0) {
        toast("No hay cobranzas con esos filtros");
        setMesIPC("");
        setAnioIPC("");
        setSeleccionadas([]);
        return;
      }

      setSeleccionadas([]);
      setMesIPC("");
      setAnioIPC("");
    } catch (e) {
      console.error("❌ Error al cargar cobranzas:", e);
      toast.error("Error al cargar cobranzas");
    }
  };

  useEffect(() => {
    cargarCobranzas();
  }, [cliente, anio, mes, loadedClientes]);

  // ---------------------------------------------
  // TOGGLE COBRANZA SELECCIONADA + actualizar IPC automáticamente
  // ---------------------------------------------
  const toggle = (id: number) => {
    setSeleccionadas(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];

      const selectedCobranzas = cobranzas.filter(c => next.includes(c.id_cobranza));

      if (selectedCobranzas.length === 1) {
        const c = selectedCobranzas[0];
        setMesIPC(c.mes_ipc ? String(c.mes_ipc) : "");
        setAnioIPC(c.anio_ipc ? String(c.anio_ipc) : "");
      } else if (selectedCobranzas.length > 1) {
        const mesesIPC = Array.from(new Set(selectedCobranzas.map(c => c.mes_ipc).filter(Boolean)));
        const aniosIPC = Array.from(new Set(selectedCobranzas.map(c => c.anio_ipc).filter(Boolean)));

        setMesIPC(mesesIPC.length === 1 ? String(mesesIPC[0]) : "");
        setAnioIPC(aniosIPC.length === 1 ? String(aniosIPC[0]) : "");
      } else {
        setMesIPC("");
        setAnioIPC("");
      }

      return next;
    });
  };

  // ---------------------------------------------
  // GUARDAR RENDICIÓN CON APERTURA DE PDF/Excel
  // ---------------------------------------------
  const guardar = async () => {
    if (seleccionadas.length === 0)
      return toast.error("Seleccioná al menos una cobranza");

    setLoading(true);

    try {
      const payload = {
        cobranzas: seleccionadas,
        fecha_rendicion: new Date(),
        mes_ipc: mesIPC ? Number(mesIPC) : undefined,
        anio_ipc: anioIPC ? Number(anioIPC) : undefined,
      };

      const res = await fetch("/api/rendiciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error desconocido");
      }

      const data = await res.json();
      toast.success("Rendición registrada");

      const baseUrl = window.location.origin;

      if (data.excelUrl) {
        const excelWindow = window.open(`${baseUrl}${data.excelUrl}`, "_blank");
        if (!excelWindow) toast.error("No se pudo abrir el Excel automáticamente");
      }

      if (data.pdfs?.length) {
        data.pdfs.forEach((pdfUrl: string) => {
          const pdfWindow = window.open(`${baseUrl}${pdfUrl}`, "_blank");
          if (!pdfWindow) toast.error(`No se pudo abrir el PDF ${pdfUrl}`);
        });
      }

      setSeleccionadas([]);
      setMesIPC("");
      setAnioIPC("");

    } catch (e: any) {
      console.error("❌ Error al guardar rendición:", e);
      toast.error(e.message || "Error al guardar rendición");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-700">Nueva Rendición</h1>

        <div className="bg-white p-6 rounded-xl shadow space-y-6">

          {/* FILTROS DE COBRANZA */}
          <h2 className="font-semibold text-lg">Filtrar Cobranzas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={cliente}
                onChange={e => setCliente(e.target.value)}
              >
                <option value="">Todos</option>
                {clientes.map(c => (
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
                onChange={e => setAnio(e.target.value)}
              >
                <option value="">Todos</option>
                {years.map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Mes</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={mes}
                onChange={e => setMes(e.target.value)}
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

          {/* IPC OPCIONAL */}
          <h2 className="font-semibold text-lg mt-6">Ajuste IPC (opcional)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Mes IPC</label>
              <select
                key={mesIPC}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={mesIPC}
                onChange={e => setMesIPC(e.target.value)}
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
                key={anioIPC}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={anioIPC}
                onChange={e => setAnioIPC(e.target.value)}
              >
                <option value="">Ninguno</option>
                {years.map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* LISTA DE COBRANZAS */}
          <h2 className="font-semibold text-lg mt-6">Seleccionar Cobranzas</h2>
          <div className="space-y-3">
            {cobranzas.map(c => (
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
                  {c.genera_recibo && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      Genera recibo
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={guardar}
            disabled={loading}
            className="w-full mt-6 px-6 py-3 rounded-lg text-white bg-[#63bae9] hover:opacity-90"
          >
            {loading ? "Guardando..." : "Guardar Rendición"}
          </button>
        </div>
      </div>
    </div>
  );
}
