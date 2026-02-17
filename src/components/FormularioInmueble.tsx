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
import { useQuery, useQueryClient } from "@tanstack/react-query";



// -----------------------------------------------------------
//                        TIPOS
// -----------------------------------------------------------
// Se tipan las entidades que vienen desde tu API, para mejorar autocompletado y validaciones.
interface Cliente { id_cliente: number; nombre: string; apellido: string; }
interface TipoInmueble { id_tipo_inmueble: number; nombre: string; }
interface Estado { id_estado: number; nombre: string; }
interface Operacion { id_operacion: number; nombre: string; }
interface ImagenData {
  url: string;        // URL REAL (cuando ya está subida)
  preview?: string;  // blob: solo para mostrar en UI
  principal: boolean;
  file?: File;
}


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
  const queryClient = useQueryClient();
const getInputClass = (fieldName: string) =>
  `w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${
    errores[fieldName]
      ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/30"
      : "border-gray-300 focus:ring-blue-400 focus:border-blue-400"
  }`;

const ErrorMessage = ({ field }: { field: string }) =>
  errores[field] ? (
    <p className="text-sm text-red-600 mt-1.5 leading-tight">
      {errores[field]}
    </p>
  ) : null;


    const clientesQuery = useQuery<Cliente[]>({
  queryKey: ["clientes", "propietarios"],

  queryFn: async () => {
    const includeId = initialData?.id_cliente;

    const url = includeId
      ? `/api/clientes/propietarios?includeId=${includeId}`
      : "/api/clientes/propietarios";

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Error al cargar propietarios");
    }


    return res.json();
  },

  staleTime: 1000 * 60 * 5, // 5 min cache profesional
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

// 🔥 Estado profesional de errores por campo
const [errores, setErrores] = useState<Record<string, string>>({});

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

  const [formValues, setFormValues] = useState({
  titulo: initialData?.titulo ?? "",
  direccion: initialData?.ubicacion?.direccion ?? "",
  ciudad: initialData?.ubicacion?.ciudad ?? "",
  provincia: initialData?.ubicacion?.provincia ?? "",
  superficie_total: initialData?.superficie_total?.toString() ?? "",
  superficie_cubierta: initialData?.superficie_cubierta?.toString() ?? "",
  cantidad_ambientes: initialData?.cantidad_ambientes?.toString() ?? "",
  cantidad_banos: initialData?.cantidad_banos?.toString() ?? "",
  cantidad_dormitorios: initialData?.cantidad_dormitorios?.toString() ?? "",
  cantidad_cocheras: initialData?.cantidad_cocheras?.toString() ?? "",
  cantidad_pisos: initialData?.cantidad_pisos?.toString() ?? "",
  antiguedad: initialData?.antiguedad?.toString() ?? "",
  precio: initialData?.precio?.toString() ?? "",
  detalles: initialData?.detalles ?? "",
});



const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;

  setFormValues((prev) => ({
    ...prev,
    [name]: value,
  }));

  // limpiar error si existe
  if (errores[name]) {
    setErrores((prev) => {
      const n = { ...prev };
      delete n[name];
      return n;
    });
  }
};


  useEffect(() => {
  if (initialData) {
    setSelectedCliente(initialData.id_cliente ?? "");
    setSelectedTipo(initialData.id_tipo_inmueble ?? "");
    setSelectedOperacion(initialData.id_operacion ?? "");
    setSelectedEstado(initialData.id_estado ?? "");
  }
}, [initialData, clientes, tipos, estados, operaciones]);

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
   const nuevas: ImagenData[] = selectedFiles.map((file) => ({
  url: "",                // temporal, obligatorio para cumplir la interfaz
  preview: URL.createObjectURL(file),
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
    if (img.preview) {
      URL.revokeObjectURL(img.preview);
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
  const nuevosErrores: Record<string, string> = {};

  /* SELECTS */
  if (!selectedCliente)
    nuevosErrores.id_cliente = "Debe seleccionar un propietario.";

  if (!selectedTipo)
    nuevosErrores.id_tipo_inmueble = "Debe seleccionar un tipo.";

  if (!selectedEstado)
    nuevosErrores.id_estado = "Debe seleccionar un estado.";

  if (!selectedOperacion)
    nuevosErrores.id_operacion = "Debe seleccionar una operación.";

  /* UBICACIÓN */
  if (!fields.direccion?.toString().trim())
    nuevosErrores.direccion = "La dirección es obligatoria.";

  if (!fields.ciudad?.toString().trim())
    nuevosErrores.ciudad = "La ciudad es obligatoria.";

  if (!fields.provincia?.toString().trim())
    nuevosErrores.provincia = "La provincia es obligatoria.";

  if (!barrioText?.trim())
    nuevosErrores.barrio = "El barrio es obligatorio.";

  /* NUMÉRICOS */
  const supTotal = Number(fields.superficie_total);
  if (!fields.superficie_total)
    nuevosErrores.superficie_total = "Campo obligatorio.";
  else if (isNaN(supTotal) || supTotal <= 0)
    nuevosErrores.superficie_total = "Debe ser mayor a 0.";

  const precio = Number(fields.precio);
  if (!fields.precio)
    nuevosErrores.precio = "Campo obligatorio.";
  else if (isNaN(precio) || precio <= 0)
    nuevosErrores.precio = "Debe ser mayor a 0.";

  /* IMÁGENES */
  if (imagenes.length === 0)
    nuevosErrores.imagenes = "Debe subir al menos una imagen.";

  if (!imagenes.some((i) => i.principal))
    nuevosErrores.imagenes = "Debe elegir una imagen principal.";

  return nuevosErrores;
};



// -----------------------------------------------------------
//                        SUBMIT
// -----------------------------------------------------------

// 🔹 Función que EJECUTA realmente el guardado
const ejecutarSubmit = async () => {
  const fields = formValues;


  // Si el componente está en modo "submitHandler" externo
  if (submitHandler) {
    try {
      const formData = new FormData();

        Object.entries(formValues).forEach(([key, value]) => {
  formData.append(key, value);
});

// 🔥 AGREGAR ESTOS CAMPOS CRÍTICOS
formData.append("id_cliente", String(selectedCliente));
formData.append("id_tipo_inmueble", String(selectedTipo));
formData.append("id_estado", String(selectedEstado));
formData.append("id_operacion", String(selectedOperacion));
formData.append("barrio", barrioText.trim());


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

for (const img of imagenes) {
  // Si es archivo nuevo
  if (img.file instanceof File) {
    const f = new FormData();
    f.append("file", img.file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: f,
    });

    if (!res.ok) {
      throw new Error("Error al subir imagen a Cloudinary");
    }

    const data = await res.json();

    if (!data.url) {
      throw new Error("Cloudinary no devolvió URL");
    }

    uploadedImages.push({
      url: data.url,
      principal: Boolean(img.principal),
    });

  }
  // Si ya existe (modo edición)
  else if (img.url && !img.url.startsWith("blob:")) {

    uploadedImages.push({
      url: img.url,
      principal: Boolean(img.principal),
    });

  }
}

// VALIDACIÓN CRÍTICA
if (uploadedImages.length === 0) {
  throw new Error("Debe subir al menos una imagen válida.");
}





    const toNumberOrNull = (v: any) =>
    v === "" || v === undefined || v === null ? null : Number(v);


    // Payload final
    const payload = {
      ...fields,
      id_cliente: selectedCliente ? Number(selectedCliente) : undefined,
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
      detalles: fields.detalles || "",
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
  title: initialData ? "Inmueble modificado correctamente" : "Inmueble creado correctamente",
  message: initialData
    ? "Los cambios se guardaron con éxito."
    : "El inmueble se creó con éxito.",
  variant: "success",
  onConfirm: async () => {
    // 1. Invalidar cachés (actualizar listas sin recargar página)
    await queryClient.invalidateQueries({ queryKey: ["inmuebles"] });
    await queryClient.invalidateQueries({ queryKey: ["inmueblesArchivados"] });

    // 2. Cerrar el modal
    setModalOpen(false);

    // 3. Redirigir SOLO después de que el usuario confirme
    if (initialData) {
      // Edición → puedes ir al detalle o a la lista
      router.push(`/inmuebles/${initialData.id_inmueble}`); // o "/inmuebles"
    } else {
      // Creación → ir a la lista principal
      router.push("/inmuebles");
    }

    // Opcional: ejecutar callback si existe
    onSuccess?.();
  },
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

  const fields = formValues;

  const nuevosErrores = validarFormulario(fields);

  if (Object.keys(nuevosErrores).length > 0) {
    setErrores(nuevosErrores);

    const primerCampo = Object.keys(nuevosErrores)[0];
    const elemento = document.querySelector(`[name="${primerCampo}"]`);
    elemento?.scrollIntoView({ behavior: "smooth", block: "center" });

    return;
  }

  setErrores({});

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


  if (isLoading && !clientes.length && !tipos.length && !estados.length && !operaciones.length) {
  // Solo mostrar loading inicial si NUNCA cargaron los datos
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
 <form onSubmit={handleSubmit} noValidate className="space-y-8">
    {/* INFORMACIÓN BÁSICA */}
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
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="titulo"
            value={formValues.titulo}
            onChange={handleInputChange}
            className={getInputClass("titulo")}
            required
          />
          <ErrorMessage field="titulo" />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de propiedad <span className="text-red-500">*</span>
          </label>
          <select
            name="id_tipo_inmueble"
            value={selectedTipo}
            onChange={(e) => {
              setSelectedTipo(Number(e.target.value));
              errores.id_tipo_inmueble && setErrores(prev => { const n = { ...prev }; delete n.id_tipo_inmueble; return n; });
            }}
            className={getInputClass("id_tipo_inmueble")}
            required
          >
            <option value="" disabled hidden>Seleccione un tipo</option>
            {tipos.map((t) => (
              <option key={t.id_tipo_inmueble} value={t.id_tipo_inmueble}>
                {t.nombre}
              </option>
            ))}
          </select>
          <ErrorMessage field="id_tipo_inmueble" />
        </div>

        {/* Operación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operación <span className="text-red-500">*</span>
          </label>
          <select
            name="id_operacion"
            value={selectedOperacion}
            onChange={(e) => {
              setSelectedOperacion(Number(e.target.value));
              errores.id_operacion && setErrores(prev => { const n = { ...prev }; delete n.id_operacion; return n; });
            }}
            className={getInputClass("id_operacion")}
            required
          >
            <option value="" disabled hidden>Seleccione una operación</option>
            {operaciones.map((o) => (
              <option key={o.id_operacion} value={o.id_operacion}>
                {o.nombre}
              </option>
            ))}
          </select>
          <ErrorMessage field="id_operacion" />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            name="id_estado"
            value={selectedEstado}
            onChange={(e) => {
              setSelectedEstado(Number(e.target.value));
              errores.id_estado && setErrores(prev => { const n = { ...prev }; delete n.id_estado; return n; });
            }}
            className={getInputClass("id_estado")}
            required
          >
            <option value="" disabled hidden>Seleccione un estado</option>
            {estados.map((e) => (
              <option key={e.id_estado} value={e.id_estado}>
                {e.nombre}
              </option>
            ))}
          </select>
          <ErrorMessage field="id_estado" />
        </div>

        {/* Propietario */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Propietario <span className="text-red-500">*</span>
          </label>
          <select
            name="id_cliente"
            value={selectedCliente}
            onChange={(e) => {
                const val = e.target.value;
                setSelectedCliente(val ? Number(val) : "");
                // limpiar error
                if (errores.id_cliente) {
                  setErrores(prev => { const n = { ...prev }; delete n.id_cliente; return n; });
                }
              }}
            className={getInputClass("id_cliente")}
            required
          >
            <option value="" disabled hidden>Seleccione un propietario</option>
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>
                {c.nombre} {c.apellido}
              </option>
            ))}
          </select>
          <ErrorMessage field="id_cliente" />
        </div>
      </div>
    </div>

    {/* UBICACIÓN */}
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
            Dirección <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="direccion"
            value={formValues.direccion}
            onChange={handleInputChange}
            className={getInputClass("direccion")}
            required
          />
          <ErrorMessage field="direccion" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ciudad"
            value={formValues.ciudad}
            onChange={handleInputChange}
            className={getInputClass("ciudad")}
            required
          />
          <ErrorMessage field="ciudad" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provincia <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="provincia"
            value={formValues.provincia}
            onChange={handleInputChange}
            className={getInputClass("provincia")}
            required
          />
          <ErrorMessage field="provincia" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Barrio <span className="text-red-500">*</span>
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
            onChange={(e) => {
              setBarrioText(e.target.value);
              errores.barrio && setErrores(prev => { const n = { ...prev }; delete n.barrio; return n; });
            }}
            className={getInputClass("barrio")}
            required
          />
          <ErrorMessage field="barrio" />
        </div>
      </div>
    </div>

    {/* CARACTERÍSTICAS */}
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
          { label: "Precio", name: "precio", required: true, step: "0.01", value: initialData?.precio },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              name={field.name}
              value={formValues[field.name as keyof typeof formValues]}
              onChange={handleInputChange}
              step={field.step ?? "1"}
              required={field.required}
              className={getInputClass(field.name)}
            />
            <ErrorMessage field={field.name} />
          </div>
        ))}
      </div>
    </div>

    {/* DETALLES */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Descripción
      </label>
      <textarea
        name="detalles"
        value={formValues.detalles}
        onChange={handleInputChange}
        rows={5}
        className={getInputClass("detalles")}
        placeholder="Ingrese una descripción detallada del inmueble..."
      />
      <ErrorMessage field="detalles" />
    </div>

    {/* IMÁGENES */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Image className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Imágenes</h2>
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700
                 file:mr-4 file:py-2.5 file:px-5
                 file:rounded-lg file:border-0
                 file:text-sm file:font-medium
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100 file:cursor-pointer
                 transition"
      />

      {errores.imagenes && (
        <p className="mt-3 text-sm text-red-600 font-medium">
          {errores.imagenes}
        </p>
      )}

      {imagenes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {imagenes.map((img, index) => (
            <div
              key={index}
              className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${
                img.principal ? "border-blue-500 ring-2 ring-blue-400/50" : "border-gray-200"
              }`}
            >
              <img
                src={img.preview || img.url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetPrincipal(index)}
                  className="px-3 py-1.5 text-xs bg-white text-gray-800 rounded shadow hover:bg-gray-100"
                >
                  {img.principal ? "Principal" : "Hacer principal"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white rounded shadow hover:bg-red-700"
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
    <div className="flex justify-end gap-4 pt-6 pb-4">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center px-8 py-3 rounded-xl font-semibold text-white gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#fcc238" }}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            {submitLabel ?? (initialData ? "Guardar cambios" : "Crear inmueble")}
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
