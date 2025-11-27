// src/types/inmuebles.ts
import { InmuebleImagen } from "@/generated/prisma";

export interface InmuebleDTO {
  id_inmueble: number;
  id_tipo_inmueble: number;
  id_ubicacion: number;
  id_estado: number;
  id_cliente: number | null;
  id_operacion: number | null;
  precio: number | null;
  superficie_total: number;
  superficie_cubierta: number | null;
  cantidad_ambientes: number | null;
  cantidades_banos?: number;
  cantidad_banos: number | null;
  cantidad_dormitorios: number | null;
  cantidad_cocheras: number | null;
  cantidad_pisos: number | null;
  antiguedad: number | null;

  foto?: string | null;
  fotoPrincipal: string;
  detalles?: string | null;
  titulo: string;
  archivado?: boolean;

  // Relaciones
  tipo_inmueble?: { id_tipo_inmueble: number; nombre: string };
  operacion: { id_operacion: number; nombre: string } | null;

  ubicacion?: {
    id_ubicacion: number;
    direccion: string;
    ciudad: string | null;
    provincia: string | null;
    id_barrio: number | null;
    barrio?: {
      id_barrio: number;
      nombre: string;
      id_localidad: number;
      localidad: { id_localidad: number; nombre: string };
    } | null;
  };

  estado?: { id_estado: number; nombre: string };
  cliente?: { id_cliente: number; nombre: string } | null;

  imagenes?: InmuebleImagen[];

  estadoNombre?: "venta" | "alquiler";

  createdAt?: string;
  updatedAt?: string;

  createdBy?: { id_usuario: string; nombre: string } | null;
  updatedBy?: { id_usuario: string; nombre: string } | null;
}


export interface InmuebleEdit {
  id_inmueble: number;
  titulo: string;
  id_tipo_inmueble: number;
  id_operacion?: number;
  id_estado: number;
  id_cliente: number | null;

  ubicacion?: {
    id_ubicacion: number;
    direccion: string;
    ciudad?: string;
    provincia?: string;
    id_barrio: number | null;
    barrio?: string; // ✅ Agregado: Campo string para input texto (no ID)
  };

  superficie_total: number;
  superficie_cubierta?: number;
  cantidad_ambientes?: number;
  cantidad_banos?: number;
  cantidad_dormitorios?: number;
  cantidad_cocheras?: number;
  cantidad_pisos?: number;
  antiguedad?: number;
  precio?: number;
  detalles?: string;
  imagenes?: { url: string; principal: boolean }[];
}