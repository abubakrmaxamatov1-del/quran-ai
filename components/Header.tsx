'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  if (pathname === '/search' || pathname === '/profile' || pathname.startsWith('/surah/')) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/50 dark:border-slate-800/50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-[480px]">
        <Link href="/" className="flex shrink-0 items-center justify-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-sm shadow-[0_0_15px_rgba(0,200,83,0.15)] size-[52.8px]">
          <div className="relative size-full p-1">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE7g5amQI3ycz8pS8hVQjxIh8975qRwWdc1HwBsr4O9n6M7leCsFW_jU3G8yU-m1gIIGDf7P_lmXaiXFsqd5IXrjSMa7gwGlYJyjODP87BP1aJRX_TpiQt4PrIV0cih4Jb2iTTAJ-tlRL8Fmjv5Na82anm65e-eyhyB-O0Oo2LMqEOBTuRxynWRlUPaieruFmnyoA4ASCifLQvK-I92Ycp3mED7rcM-szps7oZvIcwcKAZ6oJ1chP400IMETup-IgUhncgQMPlh8s" 
              alt="Logo" 
              fill
              className="object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </Link>

        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 ml-4 text-emerald-gradient">
          Muallim Abu Bakr
        </h2>

        <div className="flex w-12 items-center justify-end">
          <button className="flex size-11 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-white/60 dark:border-slate-700/60 shadow-sm">
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
        </div>
      </div>
    </header>
  );
}
