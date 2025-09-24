// types/client.ts
export type ClientType = "PROPIETARIO" | "COMPRADOR" | "INQUILINO";
export type ClientStatus = "ACTIVE" | "INACTIVE";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  type: ClientType;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}
