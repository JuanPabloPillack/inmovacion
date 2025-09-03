// src/app/api/auth/[...nextauth]/route.ts
export const runtime = 'nodejs';
import { handlers } from "../../../../../auth"  // Referring to the auth.ts we just created
export const { GET, POST } = handlers