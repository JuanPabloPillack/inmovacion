/* eslint-disable @typescript-eslint/no-explicit-any */
// rendiciones/modificar/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Header from "@/components/ui/Header";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Loading from '@/components/ui/Loading';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Modal from '@/components/ui/Modal';


/**
 * Interfaces que describen la estructura de los datos
 * que devuelve la API. Esto permite autocompletado y tipado estricto.
 */
interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  activo: boolean; // 👈 IMPORTANTE
}


interface Cobranza {
  id_cobranza: number;
  monto: number;
  concepto: string;
  cliente: { nombre: string; apellido: string };
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

  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteOpen, setClienteOpen] = useState(false);

  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);

  const [ipcInicialCargado, setIpcInicialCargado] = useState(false);


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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    variant?: "success" | "error" | "warning" | "info" | "danger";
    onConfirm?: () => void;
  }>({
    title: "",
    message: "",
  });


    const {
    data: clientes = [],
    isLoading: loadingClientes,
    error: errorClientes,
  } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const res = await fetch('/api/clientes');
      if (!res.ok) throw new Error('Error clientes');
      const data = await res.json();
      return Array.isArray(data) ? data : data.clientes ?? [];
    },
  });

const clientesFiltrados = clientes
  .filter(c => c.activo || String(c.id_cliente) === cliente)
  .filter(c =>
    `${c.nombre} ${c.apellido}`
      .toLowerCase()
      .includes(clienteSearch.toLowerCase())
  );




  const {
    data: rendicion,
    isLoading: loadingRendicion,
    error: errorRendicion,
  } = useQuery<any>({

    queryKey: ['rendicion', id_rendicion],
    enabled: !!id_rendicion,
    queryFn: async () => {
      const res = await fetch(`/api/rendiciones/${id_rendicion}`);
      if (!res.ok) throw new Error('Rendición no encontrada');
      return res.json();
    },
  });

useEffect(() => {
  if (!rendicion) return;

  const r = rendicion;

  const cobranzasRendicion = Array.isArray(r.cobranzas) ? r.cobranzas : [];

  const ids = cobranzasRendicion.map((c: any) => c.id_cobranza);

  setSeleccionadas(ids);

  if (cobranzasRendicion.length > 0) {
    const cli = cobranzasRendicion[0].cliente;
    if (cli) {
      setCliente(String(cli.id_cliente));
      setClienteSearch(`${cli.nombre} ${cli.apellido}`);
    }
  }

  // ✅ usar IPC guardado
  if (r.mes_ipc && r.anio_ipc) {
    setMesIPC(String(r.mes_ipc));
    setAnioIPC(String(r.anio_ipc));
  } else {
    setMesIPC("");
    setAnioIPC("");
  }

  setIpcInicialCargado(true);

}, [rendicion]);



  const {
    data: cobranzas = [],
    isLoading: loadingCobranzas,
    error: errorCobranzas,
  } = useQuery<Cobranza[]>({
    queryKey: ['cobranzas', cliente, anio, mes, id_rendicion],
    enabled: !!cliente || !!id_rendicion,
    placeholderData: (prev) => prev,   // ✅ MISMO COMPORTAMIENTO QUE ALTA
    queryFn: async () => {
      const params = new URLSearchParams();

      params.append('page', '1');
      params.append('pageSize', '1000');

      // 🔥 MISMO FILTRO QUE ALTA
      params.append('sinRendir', '1');
      params.append('soloActivas', '1');

      // 🔥 EXTRA SOLO PARA MODIFICAR
      params.append('incluirSeleccionadas', '1');
      params.append('rendicionActual', String(id_rendicion));

      if (cliente) params.append('cliente', cliente);
      if (anio) params.append('anio', anio);
      if (mes) params.append('mes', mes);


      const res = await fetch(`/api/cobranzas?${params}`);
      if (!res.ok) throw new Error('Error cobranzas');

      const data = await res.json();
      return data.cobranzas ?? [];
    },
  });

  const [ipcManual, setIpcManual] = useState(false);



  useEffect(() => {

  if (!ipcInicialCargado) return;

  if (ipcManual) return; // 🔥 ESTE ES EL FIX

  if (!cobranzas) return;

  const seleccionadasAhora = cobranzas.filter(c =>
    seleccionadas.includes(c.id_cobranza)
  );

  if (seleccionadasAhora.length === 0) {
    setMesIPC("");
    setAnioIPC("");
    return;
  }

  const fechasValidas = seleccionadasAhora
  .map(c =>
    (c as any).fecha_cobranza
      ? new Date((c as any).fecha_cobranza)
      : null
  )
  .filter(Boolean) as Date[];


  if (fechasValidas.length === 0) return;

  const masReciente = fechasValidas.reduce((a, b) => (a > b ? a : b));

  setMesIPC(String(masReciente.getMonth() + 1));
  setAnioIPC(String(masReciente.getFullYear()));

}, [seleccionadas, cobranzas, ipcInicialCargado, ipcManual]);




  const queryClient = useQueryClient();

  const guardarMutation = useMutation({
    mutationFn: async () => {

      const payload = {
        cobranzas: seleccionadas,
        mes_ipc: mesIPC ? Number(mesIPC) : null,
        anio_ipc: anioIPC ? Number(anioIPC) : null,
      };

      const res = await fetch(`/api/rendiciones/${id_rendicion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error actualizando rendición");
      }

      const blob = await res.blob();

      // descargar Excel
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `Rendicion_${id_rendicion}.xlsx`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

      return true;
    },

    onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["rendiciones"] });

    setModalConfig({
      title: "Rendición modificada",
      message: "La rendición se modificó correctamente.",
      variant: "success",
      onConfirm: () => {
        setModalOpen(false);
        window.location.href = "/rendiciones";
      },
    });

    setModalOpen(true);
  },

  onError: (e: any) => {
    setModalConfig({
      title: "Error",
      message: e.message,
      variant: "error",
    });
    setModalOpen(true);
  },
});





  // ====================================================
  // 4. SELECCIONAR / DESELECCIONAR COBRANZAS + IPC AUTO
  // ====================================================
  const toggle = (id: number) => {
  setSeleccionadas(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
  );
};



  if (loadingClientes || loadingRendicion) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loading message="Cargando rendición..." size="lg" />
    </div>
  );
}


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
              <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                Cliente
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={clienteSearch}
                  onChange={(e) => {
                    setClienteSearch(e.target.value);
                    setClienteOpen(true);
                  }}
                  onFocus={() => setClienteOpen(true)}
                  placeholder="Buscar cliente..."
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:border-[#63bae9]"
                  style={{
                    borderColor: cliente ? '#63bae9' : '#e5e7eb',
                    backgroundColor: cliente ? '#f0f9ff' : 'white',
                  }}
                />

                {clienteOpen && clienteSearch && (
                  <div className="absolute z-10 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-auto mt-1">
                    {clientesFiltrados.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500">Sin resultados</div>
                    ) : (
                      clientesFiltrados.map(c => (
                        <div
                          key={c.id_cliente}
                          onClick={() => {
                              setCliente(String(c.id_cliente));
                              setClienteSearch(`${c.nombre} ${c.apellido}`);
                              setClienteOpen(false);

                              setSeleccionadas([]);

                              // 🔥 reset IPC como en Alta
                              setMesIPC("");
                              setAnioIPC("");
                              setIpcManual(false);
                            }}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          {c.nombre} {c.apellido}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Año</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              >
                <option value="" disabled hidden>Todos</option>
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
                <option value="" disabled hidden>Todos</option>
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
                onChange={(e) => {
                  setMesIPC(e.target.value);
                  setIpcManual(true);
                }}
              >
                <option value="" disabled hidden>Ninguno</option>
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
                onChange={(e) => {
                  setAnioIPC(e.target.value);
                  setIpcManual(true);
                }}
              >
                <option value="" disabled hidden>Ninguno</option>
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
            {cobranzas.map((c) => {
                const isSelected = seleccionadas.includes(c.id_cobranza);

                return (
                  <label
                    key={c.id_cobranza}
                    className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#f0f9ff] border-[#63bae9]'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(c.id_cobranza)}
                      className="mt-1.5 w-5 h-5"
                    />

                    <div className="flex-1">
                      <div className="font-semibold text-lg" style={{ color: '#686363' }}>
                        {c.cliente?.nombre} {c.cliente?.apellido}
                      </div>

                      <div className="text-gray-600 mt-1">
                        {c.concepto} —{" "}
                        <span className="font-bold" style={{ color: '#63bae9' }}>
                          ${c.monto.toLocaleString("es-AR")}
                        </span>

                        {(c as any).fecha_cobranza && (
                          <span className="ml-3 text-sm text-gray-400">
                            ({new Date((c as any).fecha_cobranza).toLocaleDateString("es-AR")})
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
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
              onClick={() => {
                if (seleccionadas.length === 0) {
                  setModalConfig({
                    title: "Validación",
                    message: "Seleccioná al menos una cobranza.",
                    variant: "warning",
                  });
                  setModalOpen(true);
                  return;
                }

                setModalConfig({
                  title: "Confirmar cambios",
                  message: `¿Deseás modificar la rendición #${id_rendicion} con ${seleccionadas.length} cobranzas?`,
                  variant: "warning",
                  onConfirm: () => {
                    guardarMutation.mutate();
                    setModalOpen(false);
                  },
                });

                setModalOpen(true);
              }}
              disabled={guardarMutation.isPending}
              className="w-1/2 px-8 py-4 rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: '#63bae9' }}
            >
              {guardarMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}
