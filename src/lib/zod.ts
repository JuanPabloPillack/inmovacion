// Archivo: src/lib/zod.ts
// Descripción: Esquemas de validación para inmovacion.
// Proyecto: inmovacion (GBS y Asociados), sistema inmobiliario.

import { object, string, z } from "zod";

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
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ message: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  name: string({ message: 'Name is required' })
    .min(1, 'Name is required')
    .max(32, 'Name must be less than 32 characters'),
  phone: string({ message: 'Phone is required' })
    .min(1, 'El teléfono es requerido')
    .max(20, 'El teléfono no puede exceder 20 caracteres'), // Ejemplo para un número largo
  confirmPassword: string({ message: 'Confirm password is required' })
    .min(1, 'Confirma tu contraseña')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(32, 'La contraseña no puede exceder 32 caracteres'),
  role: z.enum(["user", "admin"], { message: 'Debe seleccionar un rol válido (user o admin)' }) // Ajustado a enum
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Introduce un correo válido'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});