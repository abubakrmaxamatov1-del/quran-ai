'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/search' || pathname === '/profile') return null;

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[60]">
      <div className="relative flex justify-around items-end bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-t border-white/80 dark:border-slate-800/80 px-6 pb-5 pt-3 rounded-t-[32px] shadow-[0_-10px_40px_-15px_rgba(16,185,129,0.15)]">
        
        {/* Home */}
        <Link href="/" className="flex flex-col items-center justify-center gap-1.5 w-16 transition-all hover:-translate-y-1 pb-1">
          <div className={`flex items-center justify-center size-8 rounded-full shadow-inner border transition-all ${isActive('/') ? 'bg-emerald-100/50 dark:bg-emerald-900/30 border-white/60 dark:border-slate-700/60' : 'bg-white/40 dark:bg-slate-800/40 border-white/60 dark:border-slate-700/60'}`}>
            <span className={`material-symbols-outlined text-[22px] bg-clip-text text-transparent bg-gradient-to-br from-green-600 to-green-900 dark:from-green-400 dark:to-emerald-200`}>
              home
            </span>
          </div>
          <p className="text-[10px] font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-br from-green-600 to-green-900 dark:from-green-400 dark:to-emerald-200">
            Asosiy
          </p>
        </Link>

        {/* AI Search - Floating Center */}
        <div className="relative flex flex-col items-center w-24">
          <Link 
            href="/search" 
            className="absolute flex items-center justify-center size-[64px] rounded-full bg-gradient-to-tr from-[#00C853] to-[#69F0AE] text-white shadow-[0_8px_32px_-4px_rgba(0,200,83,0.5)] ring-[6px] ring-white/80 dark:ring-slate-900/80 backdrop-blur-sm transform transition-transform hover:scale-105 bottom-6"
          >
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE7g5amQI3ycz8pS8hVQjxIh8975qRwWdc1HwBsr4O9n6M7leCsFW_jU3G8yU-m1gIIGDf7P_lmXaiXFsqd5IXrjSMa7gwGlYJyjODP87BP1aJRX_TpiQt4PrIV0cih4Jb2iTTAJ-tlRL8Fmjv5Na82anm65e-eyhyB-O0Oo2LMqEOBTuRxynWRlUPaieruFmnyoA4ASCifLQvK-I92Ycp3mED7rcM-szps7oZvIcwcKAZ6oJ1chP400IMETup-IgUhncgQMPlh8s" 
                alt="AI Search Icon" 
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>
          <p className="text-[10px] font-bold text-[#00C853] pb-1 tracking-wide mt-6">
            AI Qidiruv
          </p>
        </div>

        {/* Settings */}
        <Link href="/profile" className="flex flex-col items-center justify-center gap-1.5 w-16 transition-all hover:-translate-y-1 pb-1">
          <div className={`flex items-center justify-center size-8 rounded-full shadow-inner border transition-all ${isActive('/profile') ? 'bg-emerald-100/50 dark:bg-emerald-900/30 border-white/60 dark:border-slate-700/60' : 'bg-white/40 dark:bg-slate-800/40 border-white/60 dark:border-slate-700/60'}`}>
            <span className="material-symbols-outlined text-[22px] bg-clip-text text-transparent bg-gradient-to-br from-green-600 to-green-900 dark:from-green-400 dark:to-emerald-200">
              settings
            </span>
          </div>
          <p className="text-[10px] font-medium tracking-wide text-transparent bg-clip-text bg-gradient-to-br from-green-600 to-green-900 dark:from-green-400 dark:to-emerald-200">
            Sozlamalar
          </p>
        </Link>

      </div>
    </div>
  );
}
