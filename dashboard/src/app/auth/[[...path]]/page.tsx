'use client';

import { AuthView } from '@neondatabase/auth-ui';
import { useParams } from 'next/navigation';

export default function AuthPage() {
  const params = useParams<{ path?: string[] }>();
  const path = params.path?.join('/') ?? 'sign-in';
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-4"><AuthView path={path} /></main>;
}
