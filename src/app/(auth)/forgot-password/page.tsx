// Archivo: src/app/(auth)/forgot-password/page.tsx
// Descripción: Página para solicitar restablecimiento de contraseña.
// Proyecto: inmovacion (GBS y Asociados), sistema inmobiliario.

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ForgotPasswordForm from '@/components/ui/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccess) {
      timer = setTimeout(() => {
        setShowSuccess(false);
      }, 30000); // 30 segundos
    }
    return () => clearTimeout(timer);
  }, [showSuccess]);

  return (
    <>
      {showSuccess ? (
        <div className="text-green-600 text-center font-semibold">
          Se ha enviado un correo de restablecimiento. Revisa tu bandeja de entrada!
        </div>
      ) : errorMessage ? (
        <div className="text-red-500 text-center font-semibold">{errorMessage}</div>
      ) : (
        <ForgotPasswordForm
          onSuccess={() => setShowSuccess(true)}
          onError={(message) => setErrorMessage(message)}
        />
      )}
    </>
  );
}