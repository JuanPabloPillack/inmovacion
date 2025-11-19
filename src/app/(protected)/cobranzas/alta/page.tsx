/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { Save, AlertCircle, FileCheck2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';

interface Cliente {
  id_cliente: number;
  nombre: string;
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

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch('/api/clientes');
        const data = await res.json();
        setClientes(Array.isArray(data) ? data : data.clientes || []);
      } catch {
        setError('Error al cargar los clientes.');
      }
    };
    fetchClientes();
  }, []);

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

  useEffect(() => {
    const cliente = clientes.find(c => c.id_cliente === selectedCliente);
    setTipoCliente(cliente?.tipo_cliente || '');
  }, [selectedCliente, clientes]);

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

  const validar = () => {
    if (!selectedCliente) return 'Debes seleccionar un cliente.';
    for (const c of cobranzas) {
      if (!c.id_contrato) return 'Debes seleccionar un contrato.';
      if (!c.monto || Number(c.monto) <= 0) return 'Monto inválido.';
      if (!c.medio_pago) return 'Falta medio de pago.';
      if (!c.concepto) return 'Falta concepto.';
    }
    return null;
  };

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
      if (!res.ok) throw new Error(data.error);

      setMensaje('Cobranzas registradas correctamente.');

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

      router.refresh();
      router.push('/cobranzas');

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-5xl mx-auto px-8 py-10">

        {error && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 flex gap-2">
            <AlertCircle />
            {error}
          </div>
        )}

        {mensaje && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-800 flex gap-2">
            <FileCheck2 />
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="bg-white p-6 rounded-xl shadow">
            <label className="font-semibold mb-2 block">Cliente</label>
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(Number(e.target.value))}
              className="w-full border rounded-xl px-4 py-2"
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {cobranzas.map((c, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow border">

              <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Cobranza #{index + 1}</h2>

                {cobranzas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarCobranza(index)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 size={18} /> Quitar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block font-semibold mb-1">Contrato</label>
                  <select
                    value={c.id_contrato}
                    onChange={(e) => handleCobranzaChange(index, 'id_contrato', Number(e.target.value))}
                    className="w-full border rounded-xl px-4 py-2"
                  >
                    <option value="">Selecciona contrato</option>
                    {contratos.map(ct => (
                      <option key={ct.id_contrato} value={ct.id_contrato}>
                        {ct.nombre} {ct.inmueble ? `- ${ct.inmueble.titulo}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Monto</label>
                  <input
                    type="number"
                    value={c.monto}
                    onChange={(e) => handleCobranzaChange(index, 'monto', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Fecha</label>
                  <input
                    type="date"
                    value={c.fecha_cobranza}
                    onChange={(e) => handleCobranzaChange(index, 'fecha_cobranza', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Medio de Pago</label>
                  <input
                    type="text"
                    value={c.medio_pago}
                    onChange={(e) => handleCobranzaChange(index, 'medio_pago', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1">Concepto</label>
                  <input
                    type="text"
                    value={c.concepto}
                    onChange={(e) => handleCobranzaChange(index, 'concepto', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1">Observaciones</label>
                  <textarea
                    value={c.observaciones}
                    onChange={(e) => handleCobranzaChange(index, 'observaciones', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2 h-24"
                  ></textarea>
                </div>

              </div>
            </div>
          ))}
          {/* Botón agregar */}
          <button
            type="button"
            onClick={agregarCobranza}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl"
          >
            <Plus size={18} /> Agregar cobranza
          </button>

          {/* CONTENEDOR DE ACCIONES ALINEADAS A LA DERECHA */}
          <div className="flex justify-end gap-4">

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-40"
            >
              <Save size={20} />
              {loading ? 'Guardando...' : 'Guardar Cobranzas'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/cobranzas')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-400 transition"
            >
              Cancelar
            </button>

          </div>




        </form>
      </main>
    </div>
  );
}
