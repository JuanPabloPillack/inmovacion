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