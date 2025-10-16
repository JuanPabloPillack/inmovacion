// Archivo: src/lib/zod.ts
// Descripción: Esquemas de validación para Inmovación (GBS y Asociados)

import { z, object, string, number } from "zod";

// Expresión regular para validar números de teléfono
const phoneRegex = /^\+?[\d\s\-\(\)\.]{7,20}$/;

export const loginSchema = object({
  email: string().min(1, "El correo electrónico es requerido").email("Introduce un correo válido"),
  password: string().min(1, "La contraseña es requerida").min(8, "Mínimo 8 caracteres").max(32, "Máximo 32 caracteres"),
});

export const registerSchema = object({
  email: string().min(1, "El correo electrónico es requerido").email("Introduce un correo válido"),
  password: string().min(1, "La contraseña es requerida").min(8, "Mínimo 8 caracteres").max(32, "Máximo 32 caracteres"),
  confirmPassword: string().min(1, "Confirma tu contraseña").min(8).max(32),
  name: string().min(1, "El nombre es requerido").max(32),
  phone: string().min(1).max(20).regex(phoneRegex, "Formato de teléfono inválido"),
  role: z.enum(["user", "admin"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: string().min(1, "El correo es requerido").email("Introduce un correo válido"),
});

export const resetPasswordSchema = z.object({
  password: string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: string().min(6, "Confirma tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const editUserSchema = z.object({
  name: string().min(1).max(32),
  email: string().min(1).email().toLowerCase(),
  phone: string().min(1).max(20).regex(phoneRegex),
  role: z.enum(["user", "admin"]),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

// =================== ESCHEMA INMUEBLES ===================

export const inmuebleSchema = object({
  titulo: string().min(3, "El título debe tener al menos 3 caracteres"),
  id_tipo_inmueble: number().min(1, "Selecciona un tipo de inmueble"),
  id_estado: number().min(1, "Selecciona un estado"),
  id_cliente: number().min(1, "Selecciona un cliente"),
  id_barrio: number().min(1, "Selecciona un barrio"),
  direccion: string().min(5, "La dirección debe tener al menos 5 caracteres"),
  ciudad: string().min(3, "La ciudad debe tener al menos 3 caracteres"),
  provincia: string().min(3, "La provincia debe tener al menos 3 caracteres"),
  superficie_total: number().min(1, "La superficie total debe ser mayor a 0"),
  superficie_cubierta: number().min(0, "La superficie cubierta no puede ser negativa").optional(),
  cantidad_ambientes: number().min(0).optional(),
  cantidad_banios: number().min(0).optional(),
  cantidad_cocheras: number().min(0).optional(),
  cantidad_pisos: number().min(0).optional(),
  antiguedad: number().min(0).optional(),
  precio: number().min(0).optional(),
  detalles: string().optional(),
  id_operacion: number().optional(),
});

export type InmuebleFormValues = z.infer<typeof inmuebleSchema>;
