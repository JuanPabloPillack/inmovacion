// Archivo: src/lib/zod.ts
// Descripción: Esquemas de validación para inmovacion.
// Proyecto: inmovacion (GBS y Asociados), sistema inmobiliario.

import { z, object, string } from "zod";

// Expresión regular para validar números de teléfono
// Permite: +código de país, dígitos, espacios, guiones, paréntesis, y puntos
// Ejemplos válidos: +5491123456789, (011) 1234-5678, +1 555 123 4567
const phoneRegex = /^\+?[\d\s\-\(\)\.]{7,20}$/;

export const loginSchema = object({
  email: string({ message: "Email is required" })
    .min(1, "El correo electrónico es requerido")
    .email("Introduce un correo válido"),
  password: string({ message: "Password is required" })
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña tiene como mínimo 8 caracteres")
    .max(32, "La contraseña como máximo tiene 32 caracteres"),
});

export const registerSchema = object({
  email: string({ message: "Email is required" })
    .min(1, "El correo electrónico es requerido")
    .email("Introduce un correo válido"),
  password: string({ message: "Password is required" })
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(32, "La contraseña no puede exceder 32 caracteres"),
  name: string({ message: "Name is required" })
    .min(1, "El nombre es requerido")
    .max(32, "El nombre no puede exceder 32 caracteres"),
  phone: string({ message: "Phone is required" })
    .min(1, "El teléfono es requerido")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(phoneRegex, "Formato de teléfono inválido"),
  confirmPassword: string({ message: "Confirm password is required" })
    .min(1, "Confirma tu contraseña")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(32, "La contraseña no puede exceder 32 caracteres"),
  role: z.enum(["user", "admin"], { message: "Debe seleccionar un rol válido (user o admin)" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Introduce un correo válido"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirma tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const editUserSchema = z.object({
  name: z.string()
    .min(1, "El nombre es requerido")
    .max(32, "El nombre no puede exceder 32 caracteres"),
  email: z.string()
    .min(1, "El correo es requerido")
    .email("Introduce un correo válido")
    .toLowerCase(),
  phone: z.string()
    .min(1, "El teléfono es requerido")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(phoneRegex, "Formato de teléfono inválido"),
  role: z.enum(["user", "admin"], {
    message: "Debe seleccionar un rol válido",
  }),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;