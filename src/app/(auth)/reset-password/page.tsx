// Archivo: src/app/(auth)/reset-password/page.tsx
// Descripción: Página para restablecer contraseña.
// Proyecto: inmovacion (GBS y Asociados), sistema inmobiliario.

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResetPasswordForm from '@/components/ui/ResetPasswordForm';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccess) {
      timer = setTimeout(() => {
        router.push('/login?message=Contraseña restablecida con éxito');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccess, router]);

  return (
    <>
      {showSuccess ? (
        <div className="text-green-600 text-center font-semibold">
          ¡Contraseña restablecida con éxito! Serás redirigido en 3 segundos...
        </div>
      ) : (
        <ResetPasswordForm
          onSuccess={() => setShowSuccess(true)}
          onError={(message) => console.log(message)} // Opcional: podrías mostrar el error visiblemente
        />
      )}
    </>
  );
}


