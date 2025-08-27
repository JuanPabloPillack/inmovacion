// types/filtros.ts
export interface FiltrosInmueble {
  estado: "" | "alquiler" | "venta";
  tipo: string;
  precioMin: string;
  precioMax: string;
}
