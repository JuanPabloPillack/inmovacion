// types/user.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Opcional
  role: "user" | "admin";
  status: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}