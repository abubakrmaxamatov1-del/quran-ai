import type { Metadata } from 'next';
// import { Lexend } from 'next/font/google';
import './globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Image from 'next/image';

// const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

export const metadata: Metadata = {
  title: 'Muallim Abu Bakr - Quran Al-Kareem',
  description: 'Quran oyatlarini arabcha matni, o\'zbekcha tarjimasi va tafsiri bilan o\'qing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&display=swap" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const useDark = savedTheme ? savedTheme === 'dark' : prefersDark;
                document.documentElement.classList.toggle('dark', useDark);
              } catch (e) {}
            })();`
          }}
        />
        <script src="https://telegram.org/js/telegram-web-app.js" defer></script>
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-slate-100 flex justify-center font-display antialiased">
        <div className="relative flex h-auto min-h-screen w-full max-w-[480px] flex-col overflow-x-hidden shadow-2xl bg-gradient-to-b from-[#f0fdf4] to-white dark:from-slate-950 dark:to-slate-900">
          {/* Background Pattern Overlay */}
          <div className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none select-none z-0">
            <Image 
              src="data:image/png;base64,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" 
              alt="Pattern" 
              fill
              className="object-cover"
            />
          </div>
          
          {/* Glow effect */}
          <div className="fixed top-[20%] right-[-10%] w-[60%] h-[40%] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 z-0 pointer-events-none"></div>

          <div className="global-shell-header">
            <Header />
          </div>
          <main className="relative z-10 flex-1 pb-32">
            {children}
          </main>
          <div className="global-shell-bottomnav">
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
