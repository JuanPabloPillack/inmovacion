'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { signOut } from 'next-auth/react'
import { redirect } from 'next/dist/server/api-utils'

const LogoutButton = () => {
  
  const handleClick = async () => {
    await signOut({
        // redirect: "login"
    })
  }

    return (
    <div>
        <Button onClick={handleClick}>Cerrar Sesión</Button>
    </div>
  )
}

export default LogoutButton