/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  MapPin,
  Home,
  DollarSign,
  FileText,
  Upload,
  X,
  Star,
} from "lucide-react";
import type { InmuebleEdit } from "@/types/inmuebles";

interface Cliente { id_cliente: number; nombre: string; }
interface TipoInmueble { id_tipo_inmueble: number; nombre: string; }
interface Estado { id_estado: number; nombre: string; }
interface Operacion { id_operacion: number; nombre: string; }
interface ImagenData { url: string; principal: boolean; file?: File; }

interface FormularioInmuebleProps {
  onSuccess?: () => void;
  initialData?: InmuebleEdit;
  submitLabel?: string;
  submitHandler?: (formData: FormData, imagenes: ImagenData[]) => Promise<void>;
  onCancel?: () => void; // ✅ Nueva prop para cancelar (solo en modo edición)
}

export default function FormularioInmueble({
  onSuccess,
  initialData,
  submitLabel,
  submitHandler,
  onCancel,
}: FormularioInmuebleProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tipos, setTipos] = useState<TipoInmueble[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState<ImagenData[]>([]);

  // -- Selects controlados
  const [selectedCliente, setSelectedCliente] = useState<number | "">(
    initialData?.id_cliente ?? ""
  );
  const [selectedTipo, setSelectedTipo] = useState<number | "">(
    initialData?.id_tipo_inmueble ?? ""
  );
  const [selectedOperacion, setSelectedOperacion] = useState<number | "">(
    initialData?.id_operacion ?? ""
  );
  const [selectedEstado, setSelectedEstado] = useState<number | "">(
    initialData?.id_estado ?? ""
  );

  // -- Input de texto libre para barrio
  const [barrioText, setBarrioText] = useState(initialData?.ubicacion?.barrio ?? "");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [c, t, e, o] = await Promise.all([
          fetch("/api/clientes").then((r) => r.json()),
          fetch("/api/tipos_inmueble").then((r) => r.json()),
          fetch("/api/estados").then((r) => r.json()),
          fetch("/api/operaciones").then((r) => r.json()),
        ]);
        setClientes(c);
        setTipos(t);
        setEstados(e);
        setOperaciones(o);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    loadData();

    if (initialData?.imagenes?.length) {
      const imgs = initialData.imagenes.map((img) => ({
        url: img.url,
        principal: img.principal,
      }));
      setImagenes(imgs);
    }

    if (initialData?.ubicacion) {
      setBarrioText(initialData.ubicacion.barrio ?? "");
    }
  }, [initialData]);

  // 📸 Manejo de imágenes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    const nuevas = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      principal: false,
    }));
    setImagenes((prev) => {
      const noTienePrincipal = !prev.some((i) => i.principal);
      if (noTienePrincipal && nuevas.length > 0) nuevas[0].principal = true;
      return [...prev, ...nuevas];
    });
  };

  const handleRemoveFile = (index: number) => {
    const actualizadas = imagenes.filter((_, i) => i !== index);
    if (imagenes[index].principal && actualizadas.length > 0) actualizadas[0].principal = true;
    setImagenes(actualizadas);
  };

  const handleSetPrincipal = (index: number) => {
    setImagenes((prev) =>
      prev.map((img, i) => ({ ...img, principal: i === index }))
    );
  };

  // 📤 Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const fields = Object.fromEntries(formData.entries());

    if (!selectedCliente || !barrioText.trim()) {
      alert("Debe seleccionar un propietario y escribir un barrio");
      return;
    }

    if (submitHandler) {
      try {
        await submitHandler(formData, imagenes);
        onSuccess?.();
      } catch (err: any) {
        console.error("Error en submitHandler:", err);
        alert(err.message || "Error al guardar");
      }
      return;
    }

    setLoading(true);
    try {
      const uploadedImages: { url: string; principal: boolean }[] = [];
      for (const img of imagenes) {
        if (img.file) {
          const form = new FormData();
          form.append("file", img.file);
          const res = await fetch("/api/upload", { method: "POST", body: form });
          if (!res.ok) throw new Error("Error al subir imagen");
          const data = await res.json();
          uploadedImages.push({ url: data.url, principal: img.principal });
        } else {
          uploadedImages.push({ url: img.url, principal: img.principal });
        }
      }

      const payload = {
        ...fields,
        id_cliente: Number(selectedCliente),
        barrio: barrioText.trim(),
        id_tipo_inmueble: Number(fields.id_tipo_inmueble),
        id_estado: Number(fields.id_estado),
        id_operacion: fields.id_operacion ? Number(fields.id_operacion) : undefined,
        superficie_total: fields.superficie_total ? Number(fields.superficie_total) : undefined,
        superficie_cubierta: fields.superficie_cubierta ? Number(fields.superficie_cubierta) : undefined,
        cantidad_ambientes: fields.cantidad_ambientes ? Number(fields.cantidad_ambientes) : undefined,
        cantidad_banos: fields.cantidad_banos ? Number(fields.cantidad_banos) : undefined,
        cantidad_dormitorios: fields.cantidad_dormitorios ? Number(fields.cantidad_dormitorios) : undefined,
        cantidad_cocheras: fields.cantidad_cocheras ? Number(fields.cantidad_cocheras) : undefined,
        cantidad_pisos: fields.cantidad_pisos ? Number(fields.cantidad_pisos) : undefined,
        antiguedad: fields.antiguedad ? Number(fields.antiguedad) : undefined,
        precio: fields.precio ? parseFloat(fields.precio.toString()) : undefined,
        imagenes: uploadedImages,
      };

      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/inmuebles/${initialData.id_inmueble}`
        : "/api/inmuebles";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar inmueble");
      alert("✅ Inmueble guardado con éxito");
      router.push("/propiedades");
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al guardar inmueble");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {initialData ? "Editar Inmueble" : "Crear Inmueble"}
            </h1>
            <p className="text-sm text-gray-500">
              {initialData
                ? "Actualiza la información de la propiedad"
                : "Registra tus propiedades"}
            </p>
          </div>
        </div>
        {/* Formulario */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Información Básica</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  name="titulo"
                  defaultValue={initialData?.titulo ?? ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              {/* Tipo de propiedad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de propiedad</label>
                <select
                  name="id_tipo_inmueble"
                  value={selectedTipo ?? ""}
                  onChange={(e) => setSelectedTipo(Number(e.target.value))}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    selectedTipo === "" ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="" disabled hidden>Seleccione un tipo</option>
                  {tipos.map((t) => (
                    <option key={t.id_tipo_inmueble} value={t.id_tipo_inmueble}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {/* Operación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operación</label>
                <select
                  name="id_operacion"
                  value={selectedOperacion ?? ""}
                  onChange={(e) => setSelectedOperacion(Number(e.target.value))}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    selectedOperacion === "" ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="" disabled hidden>Seleccione una operación</option>
                  {operaciones.map((o) => (
                    <option key={o.id_operacion} value={o.id_operacion}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  name="id_estado"
                  value={selectedEstado ?? ""}
                  onChange={(e) => setSelectedEstado(Number(e.target.value))}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    selectedEstado === "" ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="" disabled hidden>Seleccione un estado</option>
                  {estados.map((e) => (
                    <option key={e.id_estado} value={e.id_estado}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {/* Propietario */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" /> Propietario
                </label>
                <select
                  name="id_cliente"
                  value={selectedCliente}
                  onChange={(e) => setSelectedCliente(Number(e.target.value))}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    selectedCliente === "" ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Seleccione un propietario</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* Ubicación */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Ubicación</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  defaultValue={initialData?.ubicacion?.direccion ?? ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  defaultValue={initialData?.ubicacion?.ciudad ?? ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              {/* Provincia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                <input
                  type="text"
                  name="provincia"
                  defaultValue={initialData?.ubicacion?.provincia ?? ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              {/* Barrio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> Barrio
                </label>
                {/* ✅ Hidden input para enviar el ID del barrio al actualizar (mantiene la relación en BD) */}
                <input
                  type="hidden"
                  name="id_barrio"
                  value={initialData?.ubicacion?.id_barrio ?? ""}
                />
                <input
                  type="text"
                  name="barrio"
                  value={barrioText} // <-- Ya controlado, ahora recibe string (nombre)
                  onChange={(e) => setBarrioText(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>
          </div>
          {/* Características */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Características</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Superficie total (m²)", name: "superficie_total", type: "number" as const, required: true, value: initialData?.superficie_total },
                { label: "Superficie cubierta (m²)", name: "superficie_cubierta", type: "number" as const, value: initialData?.superficie_cubierta },
                { label: "Ambientes", name: "cantidad_ambientes", type: "number" as const, value: initialData?.cantidad_ambientes },
                { label: "Baños", name: "cantidad_banos", type: "number" as const, value: initialData?.cantidad_banos },
                { label: "Dormitorios", name: "cantidad_dormitorios", type: "number" as const, value: initialData?.cantidad_dormitorios },
                { label: "Cocheras", name: "cantidad_cocheras", type: "number" as const, value: initialData?.cantidad_cocheras },
                { label: "Pisos", name: "cantidad_pisos", type: "number" as const, value: initialData?.cantidad_pisos },
                { label: "Antigüedad (años)", name: "antiguedad", type: "number" as const, value: initialData?.antiguedad },
                { label: "Precio", name: "precio", type: "number" as const, value: initialData?.precio },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    {field.name === "precio" && <DollarSign className="w-4 h-4 text-gray-400" />}
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    defaultValue={field.value?.toString() ?? ""}
                    step={field.name === "precio" ? "0.01" : undefined} // <- permite decimales solo para precio
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${field.name === "precio" ? "pl-10" : ""}`}
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Detalles adicionales */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Detalles adicionales</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  name="detalles"
                  defaultValue={initialData?.detalles ?? ""}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
          {/* 📷 Imágenes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <Upload className="w-5 h-5 text-blue-600" /> Imágenes
            </h2>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <div className="flex flex-wrap gap-4 justify-center">
                {imagenes.map((img, i) => (
                  <div key={i} className="relative w-32 h-32 group">
                    <img
                      src={img.file ? URL.createObjectURL(img.file) : img.url}
                      alt="preview"
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                    />
                    {/* Botón eliminar */}
                    <button
                      type="button"
                      onClick={(ev) => { ev.stopPropagation(); handleRemoveFile(i); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* Botón marcar como principal */}
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setImagenes((prev) =>
                          prev.map((imgItem, idx) => ({
                            ...imgItem,
                            principal: idx === i,
                          }))
                        );
                      }}
                      className={`absolute bottom-1 left-1 px-2 py-0.5 text-xs rounded ${
                        img.principal ? "bg-amber-400 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {img.principal ? "Principal" : "Hacer principal"}
                    </button>
                  </div>
                ))}
                {imagenes.length === 0 && (
                  <div className="text-center mt-4 w-full">
                    <p className="text-sm text-gray-500">Haz clic o arrastra imágenes aquí</p>
                  </div>
                )}
              </div>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
          {/* ✅ Botones: Cancelar a la izquierda, Guardar a la derecha */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-semibold text-white transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Guardando..." : submitLabel ?? "Guardar Inmueble"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}