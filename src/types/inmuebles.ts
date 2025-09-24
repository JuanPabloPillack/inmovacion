export interface InmuebleDTO {
  id_inmueble: number;
  id_tipo_inmueble: number;
  id_ubicacion: number;
  id_estado: number;
  estado: string;
  id_cliente: number;
  precio: number;
  superficie_total: number;
  superficie_cubierta: number | null;
  cantidad_ambientes: number | null;
  antiguedad: number | null;
  foto?: string | null;
  fotoPrincipal: string;
  detalles?: string | null;
  titulo: string; 
  archivado?: boolean;


  tipo_inmueble: {
    id_tipo_inmueble: number;
    nombre: string;
  };

  ubicacion: {
    id_ubicacion: number;
    direccion: string;
    ciudad: string | null;
    provincia: string | null;
    id_barrio: number | null;
    barrio?: {
      id_barrio: number;
      nombre: string;
      id_localidad: number;
      localidad: {
        id_localidad: number;
        nombre: string;
      };
    } | null;
  };

  imagenes: {
    id: number;
    url: string;
    inmuebleId: number;
    principal: boolean;
  }[];
}
