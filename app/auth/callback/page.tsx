'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Google orqali tasdiqlanmoqda...');

  useEffect(() => {
    const finalizeAuth = async () => {
      try {
        const hash = window.location.hash;
        const hasErrorInHash = hash.includes('error=');

        if (hasErrorInHash) {
          setMessage('Google kirishda xatolik. Qayta urinib ko\'ring.');
          setTimeout(() => router.replace('/'), 1400);
          return;
        }

        const { error } = await supabase.auth.getSession();
        if (error) {
          setMessage('Sessiya yaratishda xatolik.');
          setTimeout(() => router.replace('/'), 1400);
          return;
        }

        setMessage('Muvaffaqiyatli! Yo\'naltirilmoqda...');
        router.replace('/');
      } catch (e) {
        setMessage('Kutilmagan xatolik yuz berdi.');
        setTimeout(() => router.replace('/'), 1400);
      }
    };

    finalizeAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-700">{message}</p>
      </div>
    </div>
  );
}
