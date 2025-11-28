//  src/components/FormularioInmueble.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Esto indica a Next.js que el componente es del lado del cliente (usa hooks).

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // Para redirecciones sin recargar página.
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

// -----------------------------------------------------------
//                        TIPOS
// -----------------------------------------------------------
// Se tipan las entidades que vienen desde tu API, para mejorar autocompletado y validaciones.
interface Cliente { id_cliente: number; nombre: string; apellido: string; }
interface TipoInmueble { id_tipo_inmueble: number; nombre: string; }
interface Estado { id_estado: number; nombre: string; }
interface Operacion { id_operacion: number; nombre: string; }
interface ImagenData { url: string; principal: boolean; file?: File; }

// Props del componente, flexibles para usarlo en "crear" y en "editar".
interface FormularioInmuebleProps {
  onSuccess?: () => void;
  initialData?: InmuebleEdit;
  submitLabel?: string;
  submitHandler?: (formData: FormData, imagenes: ImagenData[]) => Promise<void>;
  onCancel?: () => void;
}

// -----------------------------------------------------------
//                     COMPONENTE PRINCIPAL
// -----------------------------------------------------------
export default function FormularioInmueble({
  onSuccess, //Función que se ejecuta cuando el formulario termina con éxito
  initialData, //define si es crear o editar
  submitLabel, //Texto del botón de envío
  submitHandler, //Función que procesa el formulario: crear o editar el inmueble. Se pasa desde el padre
  onCancel, //Función para manejar el botón "Cancelar" (cerrar modal, volver atrás, etc)
}: FormularioInmuebleProps) {
  const router = useRouter();

  // Referencia al formulario, útil para capturar datos con FormData
  const formRef = useRef<HTMLFormElement>(null);

  // ------------------ ESTADOS ------------------
  // Listas obtenidas desde tus endpoints
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tipos, setTipos] = useState<TipoInmueble[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);

  // Loading para evitar múltiples envíos
  const [loading, setLoading] = useState(false);

  // Manejo de imágenes: cada imagen tiene URL, si es principal, y el archivo real
  const [imagenes, setImagenes] = useState<ImagenData[]>([]);

  // Estados para selects
  const [selectedCliente, setSelectedCliente] = useState<number | "">(initialData?.id_cliente ?? "");
  const [selectedTipo, setSelectedTipo] = useState<number | "">(initialData?.id_tipo_inmueble ?? "");
  const [selectedOperacion, setSelectedOperacion] = useState<number | "">(initialData?.id_operacion ?? "");
  const [selectedEstado, setSelectedEstado] = useState<number | "">(initialData?.id_estado ?? "");

  // Estado local para el texto del barrio
  const [barrioText, setBarrioText] = useState(initialData?.ubicacion?.barrio ?? "");

  // -----------------------------------------------------------
  //               CARGA DE DATOS INICIALES
  // -----------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        // Se ejecutan las 4 llamadas en paralelo con Promise.all
        const [propRaw, tRaw, eRaw, oRaw] = await Promise.all([
          fetch("/api/clientes/propietarios").then((r) => r.json()),
          fetch("/api/tipos_inmueble").then((r) => r.json()),
          fetch("/api/estados").then((r) => r.json()),
          fetch("/api/operaciones").then((r) => r.json()),
        ]);

        console.log("DEBUG propietarios desde API:", propRaw);

        // Cada endpoint puede devolver array directo o { data: [] }
        setClientes(Array.isArray(propRaw) ? propRaw : []);
        setTipos(Array.isArray(tRaw) ? tRaw : tRaw.data || []);
        setEstados(Array.isArray(eRaw) ? eRaw : eRaw.data || []);
        setOperaciones(Array.isArray(oRaw) ? oRaw : oRaw.data || []);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    loadData();

    // Si estamos editando, cargamos imágenes iniciales
    if (initialData?.imagenes?.length) {
      setImagenes(
        initialData.imagenes.map((img) => ({
          url: img.url,
          principal: img.principal,
        }))
      );
    }
  }, [initialData]);

  // -----------------------------------------------------------
  //                   MANEJO DE IMÁGENES
  // -----------------------------------------------------------

  // Cuando se seleccionan nuevas imágenes desde el input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    // Convertimos archivos en objetos ImagenData
    const nuevas = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file), // URL temporal para previsualizar
      file,
      principal: false,
    }));

    setImagenes((prev) => {
      // Si no había una imagen principal, se asigna la primera nueva
      const sinPrincipal = !prev.some((i) => i.principal);
      if (sinPrincipal && nuevas.length > 0) nuevas[0].principal = true;
      return [...prev, ...nuevas];
    });
  };

  // Eliminar una imagen por índice
  const handleRemoveFile = (index: number) => {
    const actualizadas = imagenes.filter((_, i) => i !== index);

    // Si se elimina la imagen principal, asignar la primera disponible
    if (imagenes[index].principal && actualizadas.length > 0) {
      actualizadas[0].principal = true;
    }

    setImagenes(actualizadas);
  };

  // Marcar una imagen como principal
  const handleSetPrincipal = (index: number) => {
    setImagenes((prev) =>
      prev.map((img, i) => ({ ...img, principal: i === index }))
    );
  };

  // -----------------------------------------------------------
  //                     VALIDACIONES
  // -----------------------------------------------------------
  const validarFormulario = (fields: any) => {
    if (!selectedCliente) return "Debe seleccionar un propietario.";
    if (!selectedTipo) return "Debe seleccionar un tipo de propiedad.";
    if (!selectedEstado) return "Debe seleccionar un estado.";

    if (!barrioText.trim()) return "El barrio es obligatorio.";

    if (!fields.direccion || fields.direccion.toString().trim() === "")
      return "La dirección es obligatoria.";

    const supTotal = Number(fields.superficie_total);
    if (!supTotal || supTotal <= 0) return "Superficie total debe ser mayor a 0.";

    const supCub = Number(fields.superficie_cubierta);
    if (supCub && supCub > supTotal)
      return "La superficie cubierta no puede ser mayor a la superficie total.";

    const precio = Number(fields.precio);
    if (!precio || precio <= 0) return "El precio debe ser mayor a 0.";

    if (imagenes.length === 0) return "Debe subir al menos una imagen.";
    if (!imagenes.some((i) => i.principal))
      return "Debe seleccionar una imagen principal.";

    return null;
  };

  // -----------------------------------------------------------
  //                        SUBMIT
  // -----------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene recarga del formulario
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const fields = Object.fromEntries(formData.entries());

    // Validaciones previas
    const error = validarFormulario(fields);
    if (error) {
      alert(error);
      return;
    }

    // Si el componente está en modo "submitHandler" externo (edición desde otro lado)
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

    // Modo normal: crear o editar inmueble
    setLoading(true);
    try {
      const uploadedImages: { url: string; principal: boolean }[] = [];

      // Subir archivos a /api/upload
      for (const img of imagenes) {
        if (img.file) {
          const f = new FormData();
          f.append("file", img.file);

          const res = await fetch("/api/upload", { method: "POST", body: f });
          if (!res.ok) throw new Error("Error al subir imagen");

          const data = await res.json();
          uploadedImages.push({ url: data.url, principal: img.principal });
        } else {
          uploadedImages.push({ url: img.url, principal: img.principal });
        }
      }

      // Construcción del payload final
      const payload = {
        ...fields,
        id_cliente: Number(selectedCliente),
        barrio: barrioText.trim(),
        id_tipo_inmueble: Number(selectedTipo),
        id_estado: Number(selectedEstado),
        id_operacion: selectedOperacion ? Number(selectedOperacion) : null,
        superficie_total: Number(fields.superficie_total),
        superficie_cubierta: fields.superficie_cubierta ? Number(fields.superficie_cubierta) : null,
        cantidad_ambientes: Number(fields.cantidad_ambientes),
        cantidad_banos: Number(fields.cantidad_banos),
        cantidad_dormitorios: Number(fields.cantidad_dormitorios),
        cantidad_cocheras: Number(fields.cantidad_cocheras),
        cantidad_pisos: Number(fields.cantidad_pisos),
        antiguedad: fields.antiguedad ? Number(fields.antiguedad) : null,
        precio: Number(fields.precio),
        imagenes: uploadedImages,
      };

      // Decidir si es POST o PUT
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

  // =====================================================
  //     RENDER
  // =====================================================
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ENCABEZADO */}
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

        {/* FORMULARIO */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* -------------------------------------- */}
          {/* INFORMACIÓN BÁSICA */}
          {/* -------------------------------------- */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  name="titulo"
                  defaultValue={initialData?.titulo ?? ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de propiedad
                </label>
                <select
                  name="id_tipo_inmueble"
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border rounded-lg"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  {tipos.map((t) => (
                    <option key={t.id_tipo_inmueble} value={t.id_tipo_inmueble}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operación
                </label>
                <select
                  name="id_operacion"
                  value={selectedOperacion}
                  onChange={(e) => setSelectedOperacion(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border rounded-lg"
                >
                  <option value="">Seleccione una operación</option>
                  {operaciones.map((o) => (
                    <option key={o.id_operacion} value={o.id_operacion}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="id_estado"
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border rounded-lg"
                  required
                >
                  <option value="">Seleccione un estado</option>
                  {estados.map((e) => (
                    <option key={e.id_estado} value={e.id_estado}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Propietario */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Propietario
                </label>
                <select
                  name="id_cliente"
                  value={selectedCliente}
                  onChange={(e) => setSelectedCliente(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border rounded-lg"
                  required
                >
                  <option value="">Seleccione un propietario</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre} {c.apellido}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* -------------------------------------- */}
          {/* UBICACIÓN */}
          {/* -------------------------------------- */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  defaultValue={initialData?.ubicacion?.direccion ?? ""}
                  className="w-full px-4 py-2.5 border rounded-lg"
                  required
                />
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  defaultValue={initialData?.ubicacion?.ciudad ?? ""}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>

              {/* Provincia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <input
                  type="text"
                  name="provincia"
                  defaultValue={initialData?.ubicacion?.provincia ?? ""}
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>

              {/* Barrio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barrio
                </label>
                <input
                  type="hidden"
                  name="id_barrio"
                  value={initialData?.ubicacion?.id_barrio ?? ""}
                />
                <input
                  type="text"
                  name="barrio"
                  value={barrioText}
                  onChange={(e) => setBarrioText(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* -------------------------------------- */}
          {/* CARACTERÍSTICAS */}
          {/* -------------------------------------- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Características</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Superficie total (m²)", name: "superficie_total", type: "number", required: true, value: initialData?.superficie_total },
                { label: "Superficie cubierta (m²)", name: "superficie_cubierta", type: "number", value: initialData?.superficie_cubierta },
                { label: "Ambientes", name: "cantidad_ambientes", type: "number", value: initialData?.cantidad_ambientes },
                { label: "Baños", name: "cantidad_banos", type: "number", value: initialData?.cantidad_banos },
                { label: "Dormitorios", name: "cantidad_dormitorios", type: "number", value: initialData?.cantidad_dormitorios },
                { label: "Cocheras", name: "cantidad_cocheras", type: "number", value: initialData?.cantidad_cocheras },
                { label: "Pisos", name: "cantidad_pisos", type: "number", value: initialData?.cantidad_pisos },
                { label: "Antigüedad (años)", name: "antiguedad", type: "number", value: initialData?.antiguedad },
                { label: "Precio", name: "precio", type: "number", value: initialData?.precio },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    defaultValue={field.value ?? ""}
                    step={field.name === "precio" ? "0.01" : undefined}
                    className="w-full px-4 py-2.5 border rounded-lg"
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* -------------------------------------- */}
          {/* DETALLES ADICIONALES */}
          {/* -------------------------------------- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Detalles adicionales</h2>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="detalles"
                defaultValue={initialData?.detalles ?? ""}
                rows={4}
                className="w-full px-4 py-2.5 border rounded-lg"
              />
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
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleRemoveFile(i);
                        }}
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
                          img.principal
                            ? "bg-amber-400 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {img.principal ? "Principal" : "Hacer principal"}
                      </button>
                    </div>
                  ))}

                  {/* Texto inicial si no hay imágenes */}
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


          {/* BOTONES */}
        <div className="flex justify-end gap-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : submitLabel ?? "Guardar"}
          </button>
        </div>

        </form>
      </div>
    </div>
  );
}
