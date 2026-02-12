// src/app/(protected)/rendiciones/alta/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Header from "@/components/ui/Header";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Loading from '@/components/ui/Loading';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Modal from "@/components/ui/Modal";

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
}

interface Cobranza {
  id_cobranza: number;
  monto: number;
  concepto: string;
  cliente: { nombre: string; apellido: string };
  genera_recibo: boolean;
  fecha_cobranza?: string;
  mes_ipc?: number;
  anio_ipc?: number;
}

export default function AltaRendicionPage() {

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);

  const [cliente, setCliente] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");

  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteOpen, setClienteOpen] = useState(false);

  const [mesIPC, setMesIPC] = useState("");
  const [anioIPC, setAnioIPC] = useState("");

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
  } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const res = await fetch('/api/clientes');
      if (!res.ok) throw new Error('Error clientes');
      const data = await res.json();
      return Array.isArray(data) ? data : data.clientes ?? [];
    },
  });

  const clientesFiltrados = clientes.filter(c =>
    `${c.nombre} ${c.apellido}`
      .toLowerCase()
      .includes(clienteSearch.toLowerCase())
  );

  const {
    data: cobranzas = [],
    isLoading: loadingCobranzas,
  } = useQuery<Cobranza[]>({
    queryKey: ['cobranzas', cliente, anio, mes],
    enabled: !!cliente,
    placeholderData: (prev) => prev,
    queryFn: async () => {
    const params = new URLSearchParams();

    params.append('sinRendir', '1');     
    params.append('soloActivas', '1');   

    if (cliente) params.append('cliente', cliente);
    if (anio) params.append('anio', anio);
    if (mes) params.append('mes', mes);

    params.append('page', '1');
    params.append('pageSize', '1000');

    const res = await fetch(`/api/cobranzas?${params}`);
    if (!res.ok) throw new Error('Error cobranzas');
    const data = await res.json();
    return data.cobranzas ?? [];
  },
  });

  const queryClient = useQueryClient();

  const guardarMutation = useMutation({
  mutationFn: async () => {

  const res = await fetch("/api/rendiciones", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cobranzas: seleccionadas,
      mes_ipc: mesIPC ? Number(mesIPC) : null,
      anio_ipc: anioIPC ? Number(anioIPC) : null,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error creando rendición");
  }

  // 👇 descargar Excel con el nombre real del backend
  const blob = await res.blob();

  // leer nombre desde Content-Disposition
  const contentDisposition = res.headers.get("Content-Disposition");

  let filename = "Rendicion.xlsx";

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+?)"?$/);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename; // 👈 nombre correcto
  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);

  return true;
},


  onSuccess: () => {
    setModalConfig({
      title: "Rendición creada",
      message: "La rendición se creó correctamente.",
      variant: "success",
      onConfirm: () => {
        setModalOpen(false);
        router.push("/rendiciones");
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


  const toggle = (id: number) => {
    const next = seleccionadas.includes(id)
      ? seleccionadas.filter((x) => x !== id)
      : [...seleccionadas, id];

    setSeleccionadas(next);

    const seleccionadasAhora = cobranzas.filter((c) => next.includes(c.id_cobranza));

    if (seleccionadasAhora.length === 0) {
      setMesIPC("");
      setAnioIPC("");
      return;
    }

    const fechasValidas = seleccionadasAhora
      .map((c) => (c.fecha_cobranza ? new Date(c.fecha_cobranza) : null))
      .filter(Boolean) as Date[];

    if (fechasValidas.length > 0) {
      const masReciente = fechasValidas.reduce((a, b) => (a > b ? a : b));

      setMesIPC(String(masReciente.getMonth() + 1));
      setAnioIPC(String(masReciente.getFullYear()));
    }
  };

  const validarGuardar = () => {
    if (seleccionadas.length === 0) {
      setModalConfig({
        title: "Validación",
        message: "Seleccioná al menos una cobranza.",
        variant: "warning",
      });
      setModalOpen(true);
      return false;
    }

    if ((mesIPC && !anioIPC) || (!mesIPC && anioIPC)) {
      setModalConfig({
        title: "Validación",
        message: "Si usás IPC, debés completar mes y año.",
        variant: "warning",
      });
      setModalOpen(true);
      return false;
    }

    return true;
  };

  if (loadingClientes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Cargando formulario..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <Header />

      <div
        className="bg-gradient-to-br from-white to-gray-50"
        style={{ borderBottom: '1px solid #e5e7eb' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-start gap-6">
            <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: '#63bae9' }}>
              {/* Podrías poner aquí un ícono más específico si tenés uno para rendiciones */}
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#686363' }}>
                Nueva Rendición
              </h1>
              <p className="text-base" style={{ color: '#969696' }}>
                Completa los filtros, selecciona las cobranzas y ajusta IPC si es necesario
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white p-8 rounded-2xl shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
          {loadingClientes && (
              <div className="mb-8">
                <Loading message="Cargando formulario..." size="lg" />
              </div>
            )}

          {!loadingClientes && (
            <>
              <h2 className="font-bold text-xl mb-6" style={{ color: '#686363' }}>
                Filtrar Cobranzas
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                    Año
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:border-[#63bae9]"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    style={{
                      borderColor: anio ? '#63bae9' : '#e5e7eb',
                      backgroundColor: anio ? '#f0f9ff' : 'white',
                    }}
                  >
                    <option value="" disabled hidden>Todos</option>
                    {years.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                    Mes
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:border-[#63bae9]"
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    style={{
                      borderColor: mes ? '#63bae9' : '#e5e7eb',
                      backgroundColor: mes ? '#f0f9ff' : 'white',
                    }}
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

              <h2 className="font-bold text-xl mb-6 mt-12" style={{ color: '#686363' }}>
                Ajuste IPC 
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                    Mes IPC
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:border-[#63bae9]"
                    value={mesIPC}
                    onChange={(e) => setMesIPC(e.target.value)}
                    style={{
                      borderColor: mesIPC ? '#63bae9' : '#e5e7eb',
                      backgroundColor: mesIPC ? '#f0f9ff' : 'white',
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
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#686363' }}>
                    Año IPC
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:border-[#63bae9]"
                    value={anioIPC}
                    onChange={(e) => setAnioIPC(e.target.value)}
                    style={{
                      borderColor: anioIPC ? '#63bae9' : '#e5e7eb',
                      backgroundColor: anioIPC ? '#f0f9ff' : 'white',
                    }}
                  >
                    <option value="" disabled hidden>Ninguno</option>
                    {years.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h2 className="font-bold text-xl mb-6 mt-12" style={{ color: '#686363' }}>
                Seleccionar Cobranzas
              </h2>

              <div className="space-y-4">
                {cliente && loadingCobranzas && (
                    <Loading message="Cargando cobranzas..." size="sm" />
                  )}

                {!cliente && (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                    Seleccioná un cliente para ver sus cobranzas
                  </div>
                )}

                {cliente && !loadingCobranzas && cobranzas.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                    Este cliente no tiene cobranzas pendientes
                  </div>
                )}

                {!loadingCobranzas && cobranzas.map((c) => {
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
                          {c.cliente.nombre} {c.cliente.apellido}
                        </div>
                        <div className="text-gray-600 mt-1">
                          {c.concepto} — <span className="font-bold" style={{ color: '#63bae9' }}>
                            ${c.monto.toLocaleString('es-AR')}
                          </span>
                          {c.fecha_cobranza && (
                            <span className="ml-3 text-sm text-gray-400">
                              ({new Date(c.fecha_cobranza).toLocaleDateString("es-AR")})
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between mt-12 gap-6">
                <button
                  onClick={() => router.push("/rendiciones")}
                  className="w-1/2 px-8 py-4 rounded-xl text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    if (!validarGuardar()) return;

                    setModalConfig({
                      title: "Confirmar rendición",
                      message: `¿Deseás rendir ${seleccionadas.length} cobranzas?`,
                      variant: "warning",
                      onConfirm: () => {
                        guardarMutation.mutate();
                        setModalOpen(false);
                      },
                    });

                    setModalOpen(true);
                  }}
                  disabled={guardarMutation.isPending || seleccionadas.length === 0}
                  className="w-1/2 px-8 py-4 rounded-xl text-lg font-bold text-white flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#fcc238' }}
                >
                  {guardarMutation.isPending ? 'Guardando...' : 'Guardar Rendición'}
                </button>
              </div>
            </>
          )}
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