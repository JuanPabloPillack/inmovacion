//  src/components/FormularioInmueble.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Esto indica a Next.js que el componente es del lado del cliente (usa hooks).

import { useState, useEffect, useRef, useCallback } from "react";
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
  Image,
  Images,
  Camera,
} from "lucide-react";
import type { InmuebleEdit } from "@/types/inmuebles";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Modal from "@/components/ui/Modal";
import { useQuery } from "@tanstack/react-query";


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

    const clientesQuery = useQuery<Cliente[]>({
  queryKey: ["clientes", "propietarios"],
  queryFn: async () => {
    const res = await fetch("/api/clientes/propietarios");
    if (!res.ok) throw new Error("Error clientes");
    return res.json();
  },
});


const tiposQuery = useQuery<TipoInmueble[]>({
  queryKey: ["tipos_inmueble"],
  queryFn: async () => {
    const res = await fetch("/api/tipos_inmueble");
    if (!res.ok) throw new Error("Error tipos");
    const data = await res.json();
    return Array.isArray(data) ? data : data.data;
  },
});

const estadosQuery = useQuery<Estado[]>({
  queryKey: ["estados"],
  queryFn: async () => {
    const res = await fetch("/api/estados");
    if (!res.ok) throw new Error("Error estados");
    const data = await res.json();
    return Array.isArray(data) ? data : data.data;
  },
});

const operacionesQuery = useQuery<Operacion[]>({
  queryKey: ["operaciones"],
  queryFn: async () => {
    const res = await fetch("/api/operaciones");
    if (!res.ok) throw new Error("Error operaciones");
    const data = await res.json();
    return Array.isArray(data) ? data : data.data;
  },
});


  // ------------------ ESTADOS ------------------
const clientes = clientesQuery.data ?? [];
const tipos = tiposQuery.data ?? [];
const estados = estadosQuery.data ?? [];
const operaciones = operacionesQuery.data ?? [];

const isLoading =
  clientesQuery.isLoading ||
  tiposQuery.isLoading ||
  estadosQuery.isLoading ||
  operacionesQuery.isLoading;

const isError =
  clientesQuery.isError ||
  tiposQuery.isError ||
  estadosQuery.isError ||
  operacionesQuery.isError;



  // Loading para evitar múltiples envíos
  const [loading, setLoading] = useState(false);



  // Manejo de imágenes: cada imagen tiene URL, si es principal, y el archivo real
  const [imagenes, setImagenes] = useState<ImagenData[]>([]);

  useEffect(() => {
  if (initialData?.imagenes && initialData.imagenes.length > 0) {
    setImagenes(
      initialData.imagenes.map((img) => ({
        url: img.url,
        principal: img.principal,
        // ⚠️ NO file → ya está subida
      }))
    );
  }
}, [initialData]);


  // Estados para selects
  const [selectedCliente, setSelectedCliente] = useState<number | "">(initialData?.id_cliente ?? "");
  const [selectedTipo, setSelectedTipo] = useState<number | "">(initialData?.id_tipo_inmueble ?? "");
  const [selectedOperacion, setSelectedOperacion] = useState<number | "">(initialData?.id_operacion ?? "");
  const [selectedEstado, setSelectedEstado] = useState<number | "">(initialData?.id_estado ?? "");

  // Estado local para el texto del barrio
  const [barrioText, setBarrioText] = useState(initialData?.ubicacion?.barrio ?? "");

  // ------------------ MODAL ------------------
type ModalVariant = "success" | "error" | "warning" | "info";

interface ModalConfig {
  title: string;
  message: string;
  variant: ModalVariant;
  onConfirm?: () => void;
}

const [modalOpen, setModalOpen] = useState(false);
const [modalConfig, setModalConfig] = useState<ModalConfig>({
  title: "",
  message: "",
  variant: "info",
});



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
    const img = imagenes[index];

    // Liberar URL si es un archivo nuevo
    if (img.file) {
      URL.revokeObjectURL(img.url);
    }

    const actualizadas = imagenes.filter((_, i) => i !== index);

    if (img.principal && actualizadas.length > 0) {
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
  /* ------------------ SELECTS OBLIGATORIOS ------------------ */
  if (!selectedCliente) return "Debe seleccionar un propietario.";
  if (!selectedTipo) return "Debe seleccionar un tipo de propiedad.";
  if (!selectedEstado) return "Debe seleccionar un estado.";
  if (!selectedOperacion) return "Debe seleccionar una operación.";

  /* ------------------ UBICACIÓN ------------------ */
  if (!fields.direccion || fields.direccion.toString().trim() === "")
    return "La dirección es obligatoria.";

  if (!barrioText || barrioText.trim() === "")
    return "El barrio es obligatorio.";

  /* ------------------ CAMPOS NUMÉRICOS PRINCIPALES ------------------ */
  const supTotal = Number(fields.superficie_total);
  if (isNaN(supTotal) || supTotal <= 0)
    return "La superficie total debe ser mayor a 0.";

  const supCub = fields.superficie_cubierta
    ? Number(fields.superficie_cubierta)
    : null;

  if (supCub !== null && (isNaN(supCub) || supCub < 0))
    return "La superficie cubierta no puede ser negativa.";

  if (supCub !== null && supCub > supTotal)
    return "La superficie cubierta no puede ser mayor a la superficie total.";

  const precio = Number(fields.precio);
  if (isNaN(precio) || precio <= 0)
    return "El precio debe ser mayor a 0.";

  /* ------------------ CAMPOS NUMÉRICOS SECUNDARIOS ------------------ */
  const validarEnteroNoNegativo = (
    valor: any,
    label: string,
    obligatorio = false
  ) => {
    if (valor === "" || valor === undefined || valor === null) {
      if (obligatorio) return `${label} es obligatorio.`;
      return null;
    }

    const n = Number(valor);
    if (isNaN(n) || n < 0 || !Number.isInteger(n))
      return `${label} debe ser un número entero mayor o igual a 0.`;

    return null;
  };


   const erroresNumericos =
  validarEnteroNoNegativo(fields.cantidad_ambientes, "Cantidad de ambientes", true) ||
  validarEnteroNoNegativo(fields.cantidad_banos, "Cantidad de baños", true) ||
  validarEnteroNoNegativo(fields.cantidad_dormitorios, "Cantidad de dormitorios", true) ||
  validarEnteroNoNegativo(fields.cantidad_cocheras, "Cantidad de cocheras") ||
  validarEnteroNoNegativo(fields.cantidad_pisos, "Cantidad de pisos");


  if (erroresNumericos) return erroresNumericos;

  /* ------------------ ANTIGÜEDAD ------------------ */
  if (fields.antiguedad !== "" && fields.antiguedad !== undefined) {
    const ant = Number(fields.antiguedad);
    if (isNaN(ant) || ant < 0 || ant > 150)
      return "La antigüedad debe estar entre 0 y 150 años.";
  }

  /* ------------------ IMÁGENES ------------------ */
  if (imagenes.length === 0)
    return "Debe subir al menos una imagen.";

  if (!imagenes.some((i) => i.principal))
    return "Debe seleccionar una imagen principal.";

  if (imagenes.length > 10)
    return "No se pueden subir más de 10 imágenes.";

  for (const img of imagenes) {
    if (img.file) {
      if (!img.file.type.startsWith("image/"))
        return "Solo se permiten archivos de imagen.";

      const maxSizeMB = 5;
      if (img.file.size > maxSizeMB * 1024 * 1024)
        return `Cada imagen debe pesar menos de ${maxSizeMB}MB.`;
    }
  }

  /* ------------------ TEXTO ------------------ */
  if (fields.titulo && fields.titulo.toString().length > 150)
    return "El título no puede superar los 150 caracteres.";

  if (fields.detalles && fields.detalles.toString().length > 1000)
    return "La descripción no puede superar los 1000 caracteres.";

  return null; // ✔ Todo OK
};


// -----------------------------------------------------------
//                        SUBMIT
// -----------------------------------------------------------

// 🔹 Función que EJECUTA realmente el guardado
const ejecutarSubmit = async () => {
  if (!formRef.current) return;

  const formData = new FormData(formRef.current);
  const fields = Object.fromEntries(formData.entries());

  // Si el componente está en modo "submitHandler" externo
  if (submitHandler) {
    try {
      await submitHandler(formData, imagenes);
      onSuccess?.();
    } catch (err: any) {
      console.error("Error en submitHandler:", err);
      setModalConfig({
        title: "Error",
        message: err.message || "Error al guardar",
        variant: "error",
      });
      setModalOpen(true);
    }
    return;
  }

  // Modo normal: crear o editar inmueble
  setLoading(true);
  try {
    const uploadedImages: { url: string; principal: boolean }[] = [];

    // Subir imágenes
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

    const toNumberOrNull = (v: any) =>
    v === "" || v === undefined || v === null ? null : Number(v);


    // Payload final
    const payload = {
      ...fields,
      id_cliente: Number(selectedCliente),
      barrio: barrioText.trim(),
      id_tipo_inmueble: Number(selectedTipo),
      id_estado: Number(selectedEstado),
      id_operacion: selectedOperacion ? Number(selectedOperacion) : null,
      superficie_total: Number(fields.superficie_total),
      superficie_cubierta: fields.superficie_cubierta
        ? Number(fields.superficie_cubierta)
        : null,
      cantidad_ambientes: toNumberOrNull(fields.cantidad_ambientes),
      cantidad_banos: toNumberOrNull(fields.cantidad_banos),
      cantidad_dormitorios: toNumberOrNull(fields.cantidad_dormitorios),
      cantidad_cocheras: toNumberOrNull(fields.cantidad_cocheras),
      cantidad_pisos: toNumberOrNull(fields.cantidad_pisos),
      antiguedad: toNumberOrNull(fields.antiguedad),

      precio: Number(fields.precio),
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

    // ✅ Éxito
    setModalConfig({
      title: initialData ? "Inmueble modificado" : "Inmueble creado",
      message: initialData
        ? "Los cambios se guardaron correctamente."
        : "El inmueble se creó correctamente.",
      variant: "success",
      onConfirm: () => router.push("/propiedades"),
    });
    setModalOpen(true);


  } catch (error: any) {
    console.error("Error:", error);
    setModalConfig({
      title: "Error",
      message: error.message || "Error al guardar inmueble",
      variant: "error",
    });
    setModalOpen(true);
  } finally {
    setLoading(false);
  }
};

// 🔹 Función que VALIDA y PIDE CONFIRMACIÓN
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!formRef.current) return;

  const formData = new FormData(formRef.current);
  const fields = Object.fromEntries(formData.entries());

  // Validaciones previas
  const error = validarFormulario(fields);
  if (error) {
    setModalConfig({
      title: "Formulario incompleto",
      message: error,
      variant: "warning",
    });
    setModalOpen(true);
    return;
  }

  // Confirmación
  setModalConfig({
    title: initialData ? "Confirmar cambios" : "Confirmar creación",
    message: initialData
      ? "¿Desea guardar los cambios realizados en este inmueble?"
      : "¿Desea crear este nuevo inmueble?",
    variant: "info",
    onConfirm: ejecutarSubmit,
  });
  setModalOpen(true);
};

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando formulario...
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los datos del formulario.
        </AlertDescription>
      </Alert>
    );
  }



  // =====================================================
  //     RENDER
  // =====================================================
  return (
  <form
    ref={formRef}
    onSubmit={handleSubmit}
    noValidate
    className="space-y-6"
  >


  

    {/* -------------------------------------- */}
    {/* INFORMACIÓN BÁSICA */}
    {/* -------------------------------------- */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Información Básica
        </h2>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operación
          </label>
          <select
            name="id_operacion"
            value={selectedOperacion}
            onChange={(e) => setSelectedOperacion(Number(e.target.value))}
            className="w-full px-4 py-2.5 border rounded-lg"
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
            <option value="" disabled hidden>Seleccione un propietario</option>
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
          { label: "Superficie total (m²)", name: "superficie_total", required: true, value: initialData?.superficie_total },
          { label: "Superficie cubierta (m²)", name: "superficie_cubierta", value: initialData?.superficie_cubierta },
          { label: "Ambientes", name: "cantidad_ambientes", value: initialData?.cantidad_ambientes },
          { label: "Baños", name: "cantidad_banos", value: initialData?.cantidad_banos },
          { label: "Dormitorios", name: "cantidad_dormitorios", value: initialData?.cantidad_dormitorios },
          { label: "Cocheras", name: "cantidad_cocheras", value: initialData?.cantidad_cocheras },
          { label: "Pisos", name: "cantidad_pisos", value: initialData?.cantidad_pisos },
          { label: "Antigüedad (años)", name: "antiguedad", value: initialData?.antiguedad },
          { label: "Precio", name: "precio", value: initialData?.precio, step: "0.01" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            <input
              type="number"
              name={field.name}
              defaultValue={field.value ?? ""}
              step={field.step}
              required={field.required}
              className="w-full px-4 py-2.5 border rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>

    {/* -------------------------------------- */}
    {/* DETALLES */}
    {/* -------------------------------------- */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
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

   {/* -------------------------------------- */}
{/* IMÁGENES */}
{/* -------------------------------------- */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
      <Image className="w-5 h-5 text-blue-600" />
    </div>
    <h2 className="text-lg font-semibold text-gray-800">
      Imágenes
    </h2>
  </div>

  {/* Input */}
  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleFileChange}
    className="block w-full text-sm text-gray-700
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-medium
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100"
  />

  {/* Preview */}
  {imagenes.length > 0 && (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {imagenes.map((img, index) => (
        <div
          key={index}
          className={`relative group w-full h-32 rounded-xl overflow-hidden border
            ${img.principal ? "ring-2 ring-blue-500" : ""}`}
        >
          <img
            src={img.url}
            alt={`Imagen ${index + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleSetPrincipal(index)}
              className="px-3 py-1 text-xs bg-white rounded-md hover:bg-blue-100"
            >
              {img.principal ? "Principal" : "Hacer principal"}
            </button>

            <button
              type="button"
              onClick={() => handleRemoveFile(index)}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>



    {/* BOTONES */}
    <div className="flex justify-end gap-4 pt-4">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="h-12 px-6 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex px-6 py-4 rounded-xl font-bold text-white 
                  items-center justify-center gap-3 
                  transition-all duration-200 shadow-md hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#fcc238" }}
      >

      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Creando inmueble...
        </>
      ) : (
        <>
          <FileText className="w-5 h-5" />
          {submitLabel ?? "Crear inmueble"}
        </>
      )}
    </button>
    </div>

    <Modal
    isOpen={modalOpen}
    onClose={() => setModalOpen(false)}
    title={modalConfig.title}
    message={modalConfig.message}
    variant={modalConfig.variant}
    onConfirm={modalConfig.onConfirm}
  />

  </form>
);
}
