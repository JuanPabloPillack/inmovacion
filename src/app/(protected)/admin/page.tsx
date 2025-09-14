import React from 'react'
import { auth } from '../../../../auth'
import LogoutButton from '@/components/ui/LogoutButton'
const AdminPage = async () => {
  
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return <div>No estás autenticado como administrador</div>
  }
  return (
    <div className="container">
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <LogoutButton />
    </div>
  )
}

export default AdminPage