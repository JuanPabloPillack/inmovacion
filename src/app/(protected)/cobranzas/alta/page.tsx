// src/app/(protected)/cobranzas/alta/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, FileCheck2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';

// ----------------------------------------------------------
// Tipos para tipar la respuesta de APIs
// ----------------------------------------------------------
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

  // =========================================
  //  ESTADOS PRINCIPALES
  // =========================================

  // Lista de clientes cargados desde la API
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Lista de contratos filtrados por cliente
  const [contratos, setContratos] = useState<Contrato[]>([]);

  // Cliente seleccionado en el formulario
  const [selectedCliente, setSelectedCliente] = useState<number | ''>('');

  // Tipo de cliente (propietario, inquilino, otro)
  const [tipoCliente, setTipoCliente] = useState('');

  // Fecha por defecto → día 9 del mes siguiente
  const hoy = new Date();
  const siguienteMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 9);
  const fechaDefault = siguienteMes.toISOString().split('T')[0];

  // Lista dinámica de cobranzas (permite agregar varias)
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

  // Mensajes de la UI
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  //     CARGAR CLIENTES AL MONTAR LA PÁGINA
  // ==========================================================
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch('/api/clientes'); // Llamada al backend
        const data = await res.json();

        // La API a veces responde { clientes: [...] } o directamente []
        setClientes(Array.isArray(data) ? data : data.clientes || []);
      } catch {
        setError('Error al cargar los clientes.');
      }
    };

    fetchClientes();
  }, []);

  // ==========================================================
  //   CARGAR CONTRATOS CUANDO EL USUARIO CAMBIA EL CLIENTE
  // ==========================================================
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

  // ==========================================================
  //   ACTUALIZA TIPO DE CLIENTE AUTOMÁTICAMENTE
  // ==========================================================
  useEffect(() => {
    const cliente = clientes.find(c => c.id_cliente === selectedCliente);
    setTipoCliente(cliente?.tipo_cliente || '');
  }, [selectedCliente, clientes]);

  // ==========================================================
  //   HANDLERS PARA CONTROLAR EL FORM
  // ==========================================================

  // Actualiza un campo de una cobranza concreta
  const handleCobranzaChange = (index: number, field: string, value: any) => {
    const updated = [...cobranzas];
    (updated as any)[index][field] = value;
    setCobranzas(updated);
  };

  // Agregar una nueva fila de cobranza
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

  // Eliminar una cobranza (si hay más de una)
  const eliminarCobranza = (index: number) => {
    if (cobranzas.length === 1) return;
    setCobranzas(cobranzas.filter((_, i) => i !== index));
  };

  // ==========================================================
  //   VALIDACIONES (todas las cobranzas son revisadas)
  // ==========================================================
  const validar = () => {
    if (!selectedCliente) return 'Debes seleccionar un cliente.';

    // Fechas límites
    const hoyISO = new Date().toISOString().split('T')[0];
    const maxFecha = new Date();
    maxFecha.setFullYear(maxFecha.getFullYear() + 2);
    const maxFechaISO = maxFecha.toISOString().split('T')[0];

    // Validamos una por una
    for (const c of cobranzas) {
      if (!c.id_contrato) return 'Debes seleccionar un contrato.';

      if (!c.monto) return 'El monto es obligatorio.';
      if (isNaN(Number(c.monto))) return 'El monto debe ser numérico.';
      if (Number(c.monto) <= 0) return 'El monto debe ser mayor a 0.';
      if (Number(c.monto) > 99999999) return 'El monto es demasiado grande.';

      if (!c.fecha_cobranza) return 'Debes ingresar una fecha.';
      if (c.fecha_cobranza < hoyISO)
        return 'La fecha no puede ser anterior a hoy.';
      if (c.fecha_cobranza > maxFechaISO)
        return 'La fecha no puede ser mayor a 2 años.';

      if (!c.medio_pago.trim()) return 'El medio de pago es obligatorio.';
      if (c.medio_pago.length < 3)
        return 'El medio de pago debe tener al menos 3 caracteres.';
      if (!/^[a-zA-Z0-9 áéíóúÁÉÍÓÚ.-]+$/.test(c.medio_pago))
        return 'El medio de pago contiene caracteres no válidos.';

      if (!c.concepto.trim()) return 'El concepto es obligatorio.';
      if (c.concepto.length < 3)
        return 'El concepto debe tener al menos 3 caracteres.';
      if (!/^[a-zA-Z0-9 áéíóúÁÉÍÓÚ.-]+$/.test(c.concepto))
        return 'El concepto contiene caracteres no válidos.';

      if (c.observaciones && c.observaciones.length > 300)
        return 'Las observaciones no pueden superar los 300 caracteres.';
    }

    return null;
  };

  // ==========================================================
  //   SUBMIT DEL FORMULARIO (envía todas las cobranzas juntas)
  // ==========================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setMensaje(null);

    // 1) Validar antes de enviar
    const err = validar();
    if (err) return setError(err);

    try {
      setLoading(true);

      // 2) Enviar todo al backend
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

      // 3) Mensaje de éxito
      setMensaje('Cobranzas registradas correctamente.');

      // 4) Reset del formulario
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

      // 5) Refrescar pantallas y redirigir
      router.refresh();
      router.push('/cobranzas');

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  //   RENDER
  // ============================
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

          {/* CLIENTE */}
          <div className="bg-white p-6 rounded-xl shadow">
            <label className="font-semibold mb-2 block">Cliente</label>
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(Number(e.target.value))}
              className="w-full border rounded-xl px-4 py-2"
              required
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* COBRANZAS */}
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

                {/* CONTRATO */}
                <div>
                  <label className="block font-semibold mb-1">Contrato</label>
                  <select
                    value={c.id_contrato}
                    onChange={(e) => handleCobranzaChange(index, 'id_contrato', Number(e.target.value))}
                    className="w-full border rounded-xl px-4 py-2"
                    required
                  >
                    <option value="">Selecciona contrato</option>
                    {contratos.map(ct => (
                      <option key={ct.id_contrato} value={ct.id_contrato}>
                        {ct.nombre} {ct.inmueble ? `- ${ct.inmueble.titulo}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MONTO */}
                <div>
                  <label className="block font-semibold mb-1">Monto</label>
                  <input
                    type="number"
                    min="1"
                    max="99999999"
                    step="0.01"
                    value={c.monto}
                    onChange={(e) => handleCobranzaChange(index, 'monto', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                    required
                  />
                </div>

                {/* FECHA */}
                <div>
                  <label className="block font-semibold mb-1">Fecha</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    max={
                      new Date(new Date().setFullYear(new Date().getFullYear() + 2))
                        .toISOString()
                        .split("T")[0]
                    }
                    value={c.fecha_cobranza}
                    onChange={(e) => handleCobranzaChange(index, 'fecha_cobranza', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                    required
                  />
                </div>

                {/* MEDIO DE PAGO */}
                <div>
                  <label className="block font-semibold mb-1">Medio de Pago</label>
                  <input
                    type="text"
                    minLength={3}
                    maxLength={50}
                    pattern="[A-Za-z0-9 áéíóúÁÉÍÓÚ.-]+"
                    value={c.medio_pago}
                    onChange={(e) => handleCobranzaChange(index, 'medio_pago', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                    required
                  />
                </div>

                {/* CONCEPTO */}
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1">Concepto</label>
                  <input
                    type="text"
                    minLength={3}
                    maxLength={80}
                    pattern="[A-Za-z0-9 áéíóúÁÉÍÓÚ.-]+"
                    value={c.concepto}
                    onChange={(e) => handleCobranzaChange(index, 'concepto', e.target.value)}
                    className="w-full border rounded-xl px-4 py-2"
                    required
                  />
                </div>

                {/* OBSERVACIONES */}
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1">Observaciones</label>
                  <textarea
                    maxLength={300}
                    value={c.observaciones}
                    onChange={(e) =>
                      handleCobranzaChange(index, 'observaciones', e.target.value)
                    }
                    className="w-full border rounded-xl px-4 py-2 h-24"
                  ></textarea>
                </div>

              </div>
            </div>
          ))}

          {/* BOTÓN AGREGAR */}
          <button
            type="button"
            onClick={agregarCobranza}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl"
          >
            <Plus size={18} /> Agregar cobranza
          </button>

          {/* BOTONES DERECHA */}
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
