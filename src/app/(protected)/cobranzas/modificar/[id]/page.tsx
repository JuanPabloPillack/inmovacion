/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect} from 'react';
import { Save, AlertCircle, Trash2, DollarSign, User } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import Loading from '@/components/ui/Loading';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Modal from "@/components/ui/Modal";
import { useQuery } from '@tanstack/react-query';


// Tipos
interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  tipoCliente?: {
    nombre: string;
  };
}

interface Contrato {
  id_contrato: number;
  nombre: string;
  inmueble?: {
    titulo: string;
  };
}

interface CobranzaForm {
  id_contrato: number;
  monto: string;
  fecha_cobranza: string;
  medio_pago: string;
  concepto: string;
  observaciones: string;
}

export default function EditarCobranzaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [selectedCliente, setSelectedCliente] = useState<number | ''>('');
  const [tipoCliente, setTipoCliente] = useState('');

  const hoy = new Date();
  const siguienteMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 9);
  const fechaDefault = siguienteMes.toISOString().split('T')[0];
  

  const [cobranza, setCobranza] = useState<CobranzaForm>({
    id_contrato: 0,
    monto: '',
    fecha_cobranza: fechaDefault,
    medio_pago: '',
    concepto: '',
    observaciones: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    variant?: "success" | "error" | "warning" | "info" | "danger";
    onConfirm?: () => void;
  }>({ title: "", message: "" });

  const [clienteSearch, setClienteSearch] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);

  // Cargar clientes
 const {
    data: clientes = [],
    isLoading: loadingClientes,
    error: clientesError
  } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      return Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.clientes)
            ? data.clientes
            : [];
    },
  });


 // Cargar cobranza
  const {
    data: cobranzaData,
    isLoading: loadingCobranza,
    error: cobranzaError
  } = useQuery({
    queryKey: ['cobranza', id],
    queryFn: async () => {
      const res = await fetch(`/api/cobranzas/${id}`);
      const data = await res.json();
      return data.cobranza;
    },
    enabled: !!id,
  });

  useEffect(() => {
  if (!cobranzaData || !clientes.length) return;
  if (!cobranzaData.id_cliente) return; // 👈 guard extra

  setSelectedCliente(cobranzaData.id_cliente);

  const cliente = clientes.find((c) => c.id_cliente === cobranzaData.id_cliente);
  if (cliente) {
    setClienteSearch(`${cliente.apellido}, ${cliente.nombre}`);
  }

  setCobranza({
    id_contrato: cobranzaData.id_contrato ?? 0,
    monto: String(cobranzaData.monto ?? ''),
    fecha_cobranza: cobranzaData.fecha_cobranza?.split('T')[0] || fechaDefault,
    medio_pago: cobranzaData.medio_pago || '',
    concepto: cobranzaData.concepto || '',
    observaciones: cobranzaData.observaciones || '',
  });
}, [cobranzaData, clientes]);



  // Cargar contratos al cambiar cliente
  const {
    data: contratos = [],
    isLoading: loadingContratos,
    error: contratosError
  } = useQuery<Contrato[]>({
    queryKey: ['contratos', selectedCliente],
    queryFn: async () => {
      const res = await fetch(`/api/contracts?id_cliente=${selectedCliente}`);
      const data = await res.json();
      return Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.contratos)
            ? data.contratos
            : [];
    },
    enabled: !!selectedCliente,
  });

  // Tipo cliente
  useEffect(() => {
    if (!selectedCliente || !clientes.length) return;

    const cliente = clientes.find(
      (c) => c.id_cliente === selectedCliente
    );

    setTipoCliente(cliente?.tipoCliente?.nombre || '');
  }, [selectedCliente, clientes]);


  const validar = () => {
    if (!selectedCliente) return 'Debes seleccionar un cliente.';
    if (!cobranza.id_contrato) return 'Debes seleccionar un contrato.';
    if (!cobranza.monto || Number(cobranza.monto) <= 0) return 'Monto inválido.';
    if (!cobranza.medio_pago) return 'Debes indicar un medio de pago.';
    if (!cobranza.concepto) return 'Debes indicar un concepto.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const err = validar();
    if (err) return setError(err);

    try {
      setLoading(true);

      const res = await fetch(`/api/cobranzas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: selectedCliente,
          ...cobranza,
          monto: Number(cobranza.monto),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al modificar');

      setModalConfig({
        title: "Cobranza modificada",
        message: "La cobranza se actualizó correctamente.",
        variant: "success",
        onConfirm: () => {
          setModalOpen(false);
          router.push('/cobranzas');
        },
      });
      setModalOpen(true);

    } catch (e: any) {
      setModalConfig({
        title: "Error al modificar",
        message: e.message || "Ocurrió un error inesperado.",
        variant: "error",
      });
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (loadingClientes || loadingCobranza) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loading message="Cargando cobranza..." size="lg" />
    </div>
  );
}


  const clientesFiltrados = clientes.filter((c) => {
    const fullName = `${c.nombre} ${c.apellido}`.toLowerCase();
    return fullName.includes(clienteSearch.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-8 py-8 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#e8f6fc]">
            <DollarSign className="w-7 h-7 text-[#63bae9]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-700">Modificar Cobranza</h1>
            <p className="text-sm mt-1 text-gray-500">
              Edita los datos de la cobranza registrada
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Cliente */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Cliente</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar cliente
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={clienteSearch}
                    onChange={(e) => {
                      setClienteSearch(e.target.value);
                      setShowClienteDropdown(true);
                    }}
                    onFocus={() => setShowClienteDropdown(true)}
                    placeholder="Buscar cliente por nombre o apellido"
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#63bae9]"
                  />

                  {showClienteDropdown && clienteSearch && (
                    <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {clientesFiltrados.map((c) => (
                        <button
                          key={c.id_cliente}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-[#f0f9ff]"
                          onClick={() => {
                            setSelectedCliente(c.id_cliente);
                            setClienteSearch(`${c.apellido}, ${c.nombre}`);
                            setShowClienteDropdown(false);
                          }}
                        >
                          {c.apellido}, {c.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de cliente
                </label>
                <input
                  type="text"
                  readOnly
                  value={tipoCliente}
                  className="w-full px-4 py-2.5 border rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Cobranza */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Datos de la cobranza
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contrato
                </label>
                <select
                  value={cobranza.id_contrato}
                  onChange={(e) =>
                    setCobranza(prev => ({ ...prev, id_contrato: Number(e.target.value) }))
                  }
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#63bae9]"
                  required
                >
                  <option value={0} disabled hidden>
                    Selecciona contrato
                  </option>
                  {contratos.map((ct) => (
                    <option key={ct.id_contrato} value={ct.id_contrato}>
                      {ct.nombre} {ct.inmueble ? `- ${ct.inmueble.titulo}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                </label>
                <input
                  type="number"
                  min={1}
                  value={cobranza.monto}
                  onChange={(e) =>
                    setCobranza(prev => ({ ...prev, monto: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#63bae9]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de cobranza
                </label>
                <input
                  type="date"
                  value={cobranza.fecha_cobranza}
                  onChange={(e) =>
                    setCobranza(prev => ({ ...prev, fecha_cobranza: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#63bae9]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medio de pago
                </label>
                <input
                  type="text"
                  value={cobranza.medio_pago}
                  onChange={(e) =>
                    setCobranza(prev => ({ ...prev, medio_pago: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#63bae9]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concepto
                </label>
                <input
                  type="text"
                  value={cobranza.concepto}
                  onChange={(e) =>
                    setCobranza(prev => ({ ...prev, concepto: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#63bae9]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={cobranza.observaciones}
                  onChange={(e) =>
                    setCobranza(prev => ({ ...prev, observaciones: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#63bae9] min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push('/cobranzas')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#fcc238] text-white rounded-xl font-bold hover:bg-[#e0b02f] transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Guardando...' : <><Save size={20} /> Guardar Cambios</>}
            </button>
          </div>
        </form>
      </main>

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
