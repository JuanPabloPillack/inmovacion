// Archivo: src/app/(protected)/dashboard/page.tsx
// Descripción: Página de dashboard que muestra la sesión del usuario autenticado, es nada más para pruebas, no es un dashboard real.
// Proyecto: inmovacion (GBS y Asociados), sistema inmobiliario.

import LogoutButton from "@/components/ui/LogoutButton"
import { auth } from "../../../../auth"
 
export default async function DashBoardPage() {
  const session = await auth()
 
  if (!session) {
    return <div>No Autenticado</div>
  }
 
  return (
    <div className="container">
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <LogoutButton />
    </div>
  )
}