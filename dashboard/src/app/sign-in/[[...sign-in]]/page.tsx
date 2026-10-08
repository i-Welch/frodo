import { AuthView } from '@neondatabase/auth/react';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthView pathname="sign-in" />
    </div>
  );
}
