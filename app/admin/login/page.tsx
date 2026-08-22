'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

const inputClass =
  'min-w-0 w-full rounded-sm bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-accent outline-none transition-colors';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [adminKey, setAdminKey] = useState('');
  const [authChecking, setAuthChecking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedKey = adminKey.trim();
    setAuthError(null);

    if (!submittedKey) {
      setAuthError('Enter the admin password');
      return;
    }

    setAuthChecking(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': submittedKey,
        },
      });

      if (!res.ok) {
        setAuthError('Invalid admin password');
        return;
      }

      const next = searchParams.get('next') || '/admin';
      router.replace(next.startsWith('/admin') ? next : '/admin');
      router.refresh();
    } catch {
      setAuthError('Unable to verify password');
    } finally {
      setAuthChecking(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <section className="flex flex-1 items-center justify-center px-6 pt-36 md:pt-52">
        <form
          onSubmit={handleAuthSubmit}
          className="w-full max-w-md space-y-6 border border-white/10 bg-surface/40 p-8 backdrop-blur-md"
        >
          <div className="space-y-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-accent sm:tracking-[0.5em]">Admin Access</p>
            <h1 className="font-heading text-3xl italic text-white">Enter admin password</h1>
            <p className="text-sm text-white/50">Required before the control panel can load.</p>
          </div>
          <input
            type="password"
            className={inputClass}
            placeholder="Admin password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            autoComplete="current-password"
            required
          />
          {authError && <p className="text-center text-xs text-red-400">{authError}</p>}
          <button
            type="submit"
            disabled={authChecking}
            className="w-full bg-accent py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-black disabled:opacity-50 sm:tracking-[0.4em]"
          >
            {authChecking ? 'Checking...' : 'Unlock'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
