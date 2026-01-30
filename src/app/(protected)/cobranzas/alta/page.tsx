/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, FileCheck2, Plus, Trash2, FileSignature, DollarSign, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Loading from '@/components/ui/Loading';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Modal from "@/components/ui/Modal";

// Tipos (sin cambios)
interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  tipo_cliente?: string;
}

interface Contrato {
  id_contrato: number;
  nombre: string;
  inmueble?: {
    titulo: string;
  };
}

export default function NuevaCobranzaPage() {
  const router = useRouter();

  // Estados principales
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | ''>('');
  const [tipoCliente, setTipoCliente] = useState('');

  const hoy = new Date();
  const siguienteMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 9);
  const fechaDefault = siguienteMes.toISOString().split('T')[0];

  const [cobranzas, setCobranzas] = useState([
    {
      id_contrato: '',
      monto: '',
      fecha_cobranza: fechaDefault,
      medio_pago: '',
      concepto: '',
      observaciones: '',
    },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Modal
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

  const [clienteSearch, setClienteSearch] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);

  // Cargar clientes al montar
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch('/api/clientes');
        const data = await res.json();
        setClientes(Array.isArray(data) ? data : data.clientes || []);
      } catch {
        setError('Error al cargar los clientes.');
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchClientes();
  }, []);

  // Cargar contratos al cambiar cliente
  useEffect(() => {
    if (!selectedCliente) {
      setContratos([]);
      return;
    }

    const fetchContratos = async () => {
      try {
        const res = await fetch(`/api/contracts?id_cliente=${selectedCliente}`);
        const data = await res.json();
        setContratos(Array.isArray(data) ? data : data.contratos || []);
      } catch {
        setError('Error al cargar contratos del cliente.');
        setContratos([]);
      }
    };

    fetchContratos();
  }, [selectedCliente]);

  // Actualizar tipo de cliente
  useEffect(() => {
    const cliente = clientes.find(c => c.id_cliente === selectedCliente);
    setTipoCliente(cliente?.tipo_cliente || '');
  }, [selectedCliente, clientes]);

  // Handlers
  const handleCobranzaChange = (index: number, field: string, value: any) => {
    const updated = [...cobranzas];
    (updated as any)[index][field] = value;
    setCobranzas(updated);
  };

  const agregarCobranza = () => {
    setCobranzas([
      ...cobranzas,
      {
        id_contrato: '',
        monto: '',
        fecha_cobranza: fechaDefault,
        medio_pago: '',
        concepto: '',
        observaciones: '',
      },
    ]);
  };

  const eliminarCobranza = (index: number) => {
    if (cobranzas.length === 1) return;
    setCobranzas(cobranzas.filter((_, i) => i !== index));
  };

  // Validaciones (sin cambios)
  const validar = () => {
    if (!selectedCliente) return 'Debes seleccionar un cliente.';
    const hoyISO = new Date().toISOString().split('T')[0];
    const maxFecha = new Date();
    maxFecha.setFullYear(maxFecha.getFullYear() + 2);
    const maxFechaISO = maxFecha.toISOString().split('T')[0];

    for (const c of cobranzas) {
      if (!c.id_contrato) return 'Debes seleccionar un contrato.';
      if (!c.monto) return 'El monto es obligatorio.';
      if (isNaN(Number(c.monto))) return 'El monto debe ser numérico.';
      if (Number(c.monto) <= 0) return 'El monto debe ser mayor a 0.';
      if (Number(c.monto) > 99999999) return 'El monto es demasiado grande.';
      if (!c.fecha_cobranza) return 'Debes ingresar una fecha.';
      if (c.fecha_cobranza < hoyISO) return 'La fecha no puede ser anterior a hoy.';
      if (c.fecha_cobranza > maxFechaISO) return 'La fecha no puede ser mayor a 2 años.';
      if (!c.medio_pago.trim()) return 'El medio de pago es obligatorio.';
      if (c.medio_pago.length < 3) return 'El medio de pago debe tener al menos 3 caracteres.';
      if (!/^[a-zA-Z0-9 áéíóúÁÉÍÓÚ.-]+$/.test(c.medio_pago))
        return 'El medio de pago contiene caracteres no válidos.';
      if (!c.concepto.trim()) return 'El concepto es obligatorio.';
      if (c.concepto.length < 3) return 'El concepto debe tener al menos 3 caracteres.';
      if (!/^[a-zA-Z0-9 áéíóúÁÉÍÓÚ.-]+$/.test(c.concepto))
        return 'El concepto contiene caracteres no válidos.';
      if (c.observaciones && c.observaciones.length > 300)
        return 'Las observaciones no pueden superar los 300 caracteres.';
    }
    return null;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    const err = validar();
    if (err) return setError(err);

    try {
      setLoading(true);

      const res = await fetch('/api/cobranzas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: selectedCliente,
          cobranzas,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      setModalConfig({
        title: "Cobranzas registradas",
        message: "Las cobranzas se guardaron correctamente.",
        variant: "success",
        onConfirm: () => {
          setModalOpen(false);
          router.push('/cobranzas');
        },
      });
      setModalOpen(true);

      // Reset
      setSelectedCliente('');
      setTipoCliente('');
      setContratos([]);
      setCobranzas([
        {
          id_contrato: '',
          monto: '',
          fecha_cobranza: fechaDefault,
          medio_pago: '',
          concepto: '',
          observaciones: '',
        },
      ]);
    } catch (e: any) {
      setModalConfig({
        title: "Error al guardar",
        message: e.message || "Ocurrió un error inesperado.",
        variant: "error",
      });
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Cargando datos para nueva cobranza..." size="lg" />
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

      {/* Header de página - igual estilo que FormularioInmueble */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-8 py-8 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#e8f6fc]">
            <DollarSign className="w-7 h-7 text-[#63bae9]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-700">Nueva Cobranza</h1>
            <p className="text-sm mt-1 text-gray-500">
              Registra los detalles de la nueva cobranza
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {/* Alertas */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECCIÓN: Cliente */}
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
                    placeholder="Buscar cliente por nombre o apellido"
                    value={clienteSearch}
                    onChange={(e) => {
                      setClienteSearch(e.target.value);
                      setShowClienteDropdown(true);
                    }}
                    onFocus={() => setShowClienteDropdown(true)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63bae9]"
                    required
                  />

                  {showClienteDropdown && clienteSearch && (
                    <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {clientesFiltrados.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">
                          No hay coincidencias
                        </div>
                      ) : (
                        clientesFiltrados.map((c) => (
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
                        ))
                      )}
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
                  value={tipoCliente}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN: Cobranzas */}
          {cobranzas.map((c, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Cobranza #{index + 1}
                  </h2>
                </div>

                {cobranzas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarCobranza(index)}
                    className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-medium"
                  >
                    <Trash2 size={18} /> Quitar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contrato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contrato
                  </label>
                  <select
                    value={c.id_contrato}
                    onChange={(e) =>
                      handleCobranzaChange(index, 'id_contrato', Number(e.target.value))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63bae9] focus:border-[#63bae9]"
                    required
                  >
                    <option value="">Selecciona contrato</option>
                    {contratos.map((ct) => (
                      <option key={ct.id_contrato} value={ct.id_contrato}>
                        {ct.nombre} {ct.inmueble ? `- ${ct.inmueble.titulo}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={c.monto}
                      onChange={(e) =>
                        handleCobranzaChange(index, 'monto', e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63bae9] focus:border-[#63bae9]"
                      required
                    />
                  </div>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de cobranza
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    max={
                      new Date(new Date().setFullYear(new Date().getFullYear() + 2))
                        .toISOString()
                        .split('T')[0]
                    }
                    value={c.fecha_cobranza}
                    onChange={(e) =>
                      handleCobranzaChange(index, 'fecha_cobranza', e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63bae9] focus:border-[#63bae9]"
                    required
                  />
                </div>

                {/* Medio de pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medio de pago
                  </label>
                  <input
                    type="text"
                    minLength={3}
                    maxLength={50}
                    value={c.medio_pago}
                    onChange={(e) =>
                      handleCobranzaChange(index, 'medio_pago', e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63bae9] focus:border-[#63bae9]"
                    required
                  />
                </div>

                {/* Concepto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concepto
                  </label>
                  <input
                    type="text"
                    minLength={3}
                    maxLength={80}
                    value={c.concepto}
                    onChange={(e) =>
                      handleCobranzaChange(index, 'concepto', e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63bae9] focus:border-[#63bae9]"
                    required
                  />
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    maxLength={300}
                    value={c.observaciones}
                    onChange={(e) =>
                      handleCobranzaChange(index, 'observaciones', e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63bae9] focus:border-[#63bae9] min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Botón agregar cobranza */}
          <button
            type="button"
            onClick={agregarCobranza}
            className="flex items-center gap-2 px-6 py-3 bg-[#63bae9] text-white rounded-xl font-medium hover:bg-[#57a9d3] transition shadow-sm"
          >
            <Plus size={18} /> Agregar otra cobranza
          </button>

          {/* Botones finales */}
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
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar Cobranzas
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Modal de éxito/error */}
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