import { object, string } from "zod"
 
export const loginSchema = object({
  email: string({ message: "Email is required" })
    .min(1, "El correo electrónico es requerido")
    .email("Introduce un correo válido"),
  password: string({ message: "Password is required" })
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña tiene como mínimo 8 caracteres")
    .max(32, "La contraseña como máximo tiene 32 caracteres"),
})

export const registerSchema = object({
  email: string({ message: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ message: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
    name: string({message: 'Name is required'})
    .min(1, 'Name is required')
    .max(32, 'Name must be less than 32 characters')
})