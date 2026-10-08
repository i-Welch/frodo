import { AuthView } from '@neondatabase/auth/react';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthView pathname="sign-up" />
    </div>
  );
}
