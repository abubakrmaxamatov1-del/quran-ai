'use client';

import React from 'react';
// import { Plus_Jakarta_Sans } from 'next/font/google';

interface WelcomeScreenProps {
  onGoogleEnter: () => void;
  onTelegramEnter: () => void;
  loadingProvider?: 'google' | 'telegram' | null;
}

// const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function WelcomeScreen({ onGoogleEnter, onTelegramEnter, loadingProvider = null }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#f0f4f1] px-6 py-10">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col items-center justify-center gap-8">
        <header className="w-full text-center">
          <h1 className="text-gradient text-3xl font-bold tracking-tight">Muallim Abu Bakr</h1>
        </header>

        <main className="w-full">
          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="relative z-10 animate-float">
              <img
                src="/welcome_img.png"
                alt="Muallim Abu Bakr Logo"
                className="h-64 w-64 object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="space-y-4 px-2 text-center">
            <h2 className="text-2xl font-bold text-[#1a3a2a]">Assalomu alaykum!</h2>
            <p className="leading-relaxed text-slate-600">
              Islomiy bilimlar va qulay qiroat olamiga xush kelibsiz. AI yordamchingiz sizga yo&apos;l ko&apos;rsatadi.
            </p>
          </div>
        </main>

        <footer className="w-full max-w-sm space-y-4">
          <button
            onClick={onGoogleEnter}
            disabled={loadingProvider !== null}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm transition-all duration-300 hover:bg-slate-50 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-semibold text-slate-700">
              {loadingProvider === 'google' ? 'Yuklanmoqda...' : 'Google orqali davom etish'}
            </span>
          </button>

          <button
            onClick={onTelegramEnter}
            disabled={loadingProvider !== null}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-[#1a3a2a] to-[#0a0a0a] px-6 py-4 text-white shadow-lg transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            <span className="font-semibold text-white">
              {loadingProvider === 'telegram' ? 'Yuklanmoqda...' : 'Telegram orqali kirish'}
            </span>
          </button>

          <div className="pt-4 text-center">
            <p className="text-sm text-slate-500">
              Hisobingiz yo&apos;qmi? <a className="font-bold text-[#1a3a2a]" href="#">Ro&apos;yxatdan o&apos;tish</a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
