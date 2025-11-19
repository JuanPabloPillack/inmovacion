/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  AlertCircle,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import toast from 'react-hot-toast';

interface Cliente {
  id_cliente: number;
  nombre: string;
  tipo_cliente?: string;
}

interface Contrato {
  id_contrato: number;
  nombre: string;
  inmueble?: { titulo: string };
}

export default function EditarCobranzaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | ''>('');
  const [tipoCliente, setTipoCliente] = useState('');
  const [propiedadVinculada, setPropiedadVinculada] = useState('');

  const [form, setForm] = useState({
    id_contrato: '',
    monto: '',
    fecha_cobranza: '',
    medio_pago: '',
    concepto: '',
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hoy = new Date();
  const siguienteMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 9);
  const fechaDefault = siguienteMes.toISOString().split('T')[0];

  // 🟦 Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch('/api/clientes');
        const data = await res.json();
        setClientes(Array.isArray(data) ? data : data.clientes || []);
      } catch {
        setError('Error al cargar clientes.');
      }
    };
    fetchClientes();
  }, []);

  // 🟨 Cargar cobranza existente
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/cobranzas/${id}`);
        const data = await res.json();
        const c = data.cobranza;

        setSelectedCliente(c.id_cliente);

        setForm({
          id_contrato: c.id_contrato || '',
          monto: c.monto?.toString() || '',
          fecha_cobranza: c.fecha_cobranza?.split('T')[0] || fechaDefault,
          medio_pago: c.medio_pago || '',
          concepto: c.concepto || '',
          observaciones: c.observaciones || '',
        });
      } catch {
        setError('No se pudo cargar la cobranza.');
      }
    };

    fetchData();
  }, [id]);

  // 🟩 Cargar contratos según cliente
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
        setError('Error al cargar contratos.');
      }
    };

    fetchContratos();
  }, [selectedCliente]);

  // 🟦 Tipo de cliente
  useEffect(() => {
    const cli = clientes.find(c => c.id_cliente === selectedCliente);
    setTipoCliente(cli?.tipo_cliente || '');
  }, [selectedCliente, clientes]);

  // 🟩 Mostrar propiedad vinculada
  useEffect(() => {
    const contratoSel = contratos.find(c => c.id_contrato === Number(form.id_contrato));
    setPropiedadVinculada(contratoSel?.inmueble?.titulo || '');
  }, [form.id_contrato, contratos]);

  const handleChange = (e: any) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validar = () => {
    if (!selectedCliente) return 'Debes seleccionar un cliente.';
    if (!form.id_contrato) return 'Debes seleccionar un contrato.';
    if (!form.monto || Number(form.monto) <= 0) return 'Monto inválido.';
    if (!form.medio_pago) return 'Debes indicar un medio de pago.';
    if (!form.concepto) return 'Debes indicar un concepto.';
    return null;
  };

  const handleSubmit = async (e: any) => {
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
        id_contrato: form.id_contrato,
        monto: Number(form.monto),
        fecha_cobranza: form.fecha_cobranza,
        medio_pago: form.medio_pago,
        concepto: form.concepto,
        observaciones: form.observaciones,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error);
    }

    toast.success('Cobranza modificada correctamente.');

    router.refresh();
    setTimeout(() => router.push('/cobranzas'), 1000);

  } catch (e: any) {
    toast.error('Error al modificar.');
    setError(e.message);
  } finally {
    setLoading(false);
  }
};

  // -------------------------------------
  // 🟦 UI — COPIADA DE LA ALTA
  // -------------------------------------

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">

        {error && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 flex gap-2">
            <AlertCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Cliente */}
          <div className="bg-white p-6 rounded-xl shadow">
            <label className="font-semibold mb-2 block">Cliente</label>
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(Number(e.target.value))}
              className="w-full border rounded-xl px-4 py-2"
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Cobranza */}
          <div className="bg-white p-6 rounded-xl shadow border">

            <h2 className="text-lg font-semibold mb-4">Modificar Cobranza</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block font-semibold mb-1">Contrato</label>
                <select
                  name="id_contrato"
                  value={form.id_contrato}
                  onChange={handleChange}
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
                  name="monto"
                  value={form.monto}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Fecha</label>
                <input
                  type="date"
                  name="fecha_cobranza"
                  value={form.fecha_cobranza}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Medio de Pago</label>
                <input
                  type="text"
                  name="medio_pago"
                  value={form.medio_pago}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">Concepto</label>
                <input
                  type="text"
                  name="concepto"
                  value={form.concepto}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">Observaciones</label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 h-24"
                ></textarea>
              </div>

            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end items-center gap-4 mt-4">

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
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
