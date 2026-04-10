'use client';

import React from 'react';

interface WelcomeScreenProps {
  onGoogleEnter: () => void;
  onTelegramEnter: () => void;
  loadingProvider?: 'google' | 'telegram' | null;
}

export default function WelcomeScreen({ onGoogleEnter, onTelegramEnter, loadingProvider = null }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-gradient-to-b from-[#f0fdf4] via-white to-[#ecfdf5]">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-15%] w-[50%] h-[50%] bg-emerald-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[80px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[30%] h-[30%] bg-green-200/20 rounded-full blur-[60px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-6 py-6">
        
        {/* Header */}
        <header className="w-full text-center">
          <div className="inline-flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium uppercase tracking-widest text-emerald-700/70">
              Quran Al-Kareem
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        </header>

        {/* Main Section */}
        <main className="flex w-full flex-col items-center gap-4 py-4">
          {/* Logo with enhanced styling */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow ring */}
            <div className="absolute h-44 w-44 rounded-full bg-gradient-to-br from-emerald-200/50 to-green-100/30 blur-2xl" />
            {/* Inner subtle ring */}
            <div className="absolute h-36 w-36 rounded-full border border-emerald-200/50" />
            
            {/* Logo image with float animation */}
            <div className="relative z-10 animate-float">
              <img
                src="/welcome_img.png"
                alt="Muallim Abu Bakr Logo"
                className="h-40 w-40 object-contain drop-shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Title and description */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#1a3a2a]">
              Muallim Abu Bakr
            </h1>
            <h2 className="text-lg font-semibold text-emerald-700">
              Assalomu alaykum!
            </h2>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-500">
              Islomiy bilimlar va qulay qiroat olamiga xush kelibsiz. AI yordamchingiz sizga yo&apos;l ko&apos;rsatadi.
            </p>
          </div>
        </main>

        {/* Footer with buttons */}
        <footer className="w-full space-y-3 pb-8 mt-auto">
          {/* Google Button */}
          <button
            onClick={onGoogleEnter}
            disabled={loadingProvider !== null}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-slate-300 hover:bg-white hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-medium text-slate-700">
              {loadingProvider === 'google' ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Yuklanmoqda...
                </span>
              ) : 'Google orqali davom etish'}
            </span>
          </button>

          {/* Telegram Button */}
          <button
            onClick={onTelegramEnter}
            disabled={loadingProvider !== null}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a3a2a] via-[#234d38] to-[#1a3a2a] px-6 py-4 text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Subtle shine effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            
            <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            <span className="relative font-medium">
              {loadingProvider === 'telegram' ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Yuklanmoqda...
                </span>
              ) : 'Telegram orqali kirish'}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">yoki</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Registration link */}
          <p className="text-center text-sm text-slate-500">
            Hisobingiz yo&apos;qmi?{' '}
            <button className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
              Ro&apos;yxatdan o&apos;tish
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
}
