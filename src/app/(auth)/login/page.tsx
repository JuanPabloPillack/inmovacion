// src/app/auth/login/page.tsx
import FormLogin from '@/components/ui/FormLogin';

interface LoginPageProps {
  searchParams: Promise<{ verified?: string }>;
}

/**
 * Página de login que muestra el formulario de autenticación.
 * @param props - Propiedades de la página, incluyendo searchParams.
 * @returns JSX.Element - Formulario de login con estado de verificación.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams; // Resuelve searchParams
  const isVerified = params.verified === 'true'; // Verifica si el correo está verificado

  return <FormLogin isVerified={isVerified} />;
}