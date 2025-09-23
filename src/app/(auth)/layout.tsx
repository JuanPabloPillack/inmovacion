// src/app/auth/layout.tsx
import React from 'react'

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className = 'grid place-items-center min-h-screen'> {children} </div>
  )
}

export default AuthLayout



