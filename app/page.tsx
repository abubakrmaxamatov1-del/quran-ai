'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import WelcomeScreen from '@/components/WelcomeScreen';
import Skeleton from 'react-loading-skeleton';

interface Surah {
  id: number;
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

const ENABLE_SUPABASE_READS = process.env.NEXT_PUBLIC_ENABLE_SUPABASE_READS === 'true';

export default function HomePage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [authLoading, setAuthLoading] = useState<'google' | 'telegram' | null>(null);

  useEffect(() => {
    document.body.setAttribute('data-welcome-active', showWelcome ? 'true' : 'false');

    return () => {
      document.body.removeAttribute('data-welcome-active');
    };
  }, [showWelcome]);

  useEffect(() => {
    const bootstrapAuthState = async () => {
      try {
        const tgUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser) {
          setShowWelcome(false);
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setShowWelcome(false);
          return;
        }
      } catch (error) {
        console.error('Auth bootstrap error:', error);
      }
      setShowWelcome(true);
    };

    bootstrapAuthState();

    async function fetchSurahs() {
      setLoading(true);
      try {
        if (ENABLE_SUPABASE_READS) {
          const { data, error } = await supabase
            .from('surahs')
            .select('*')
            .order('number', { ascending: true });

          if (!error && data && data.length > 0) {
            setSurahs(data);
            return;
          }
          console.log('Supabase is empty or unavailable, fetching from public API...');
        }

        // Public API fallback (default path)
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const result = await response.json();
        
        if (result.code === 200) {
          const formattedSurahs = result.data.map((s: any) => ({
            id: s.number,
            number: s.number,
            name: s.name,
            englishName: s.englishName,
            englishNameTranslation: s.englishNameTranslation,
            numberOfAyahs: s.numberOfAyahs,
            revelationType: s.revelationType
          }));
          setSurahs(formattedSurahs);
        } else {
          throw new Error('Public API failed');
        }
      } catch (error) {
        console.error('Error fetching surahs:', error);
        // Final fallback to small mock if everything fails
        setSurahs([
          { id: 1, number: 1, name: "الفاتحة", englishName: "Al-Fatiha", englishNameTranslation: "Fotiha", numberOfAyahs: 7, revelationType: "Meccan" },
          { id: 2, number: 2, name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "Baqara", numberOfAyahs: 286, revelationType: "Medinan" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchSurahs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnter = () => {
    setShowWelcome(false);
  };

  const handleGoogleEnter = async () => {
    try {
      setAuthLoading('google');
      const appUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      const redirectTo = `${appUrl}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        }
      });

      if (error) {
        console.error('Google login error:', error.message);
        setAuthLoading(null);
      }
    } catch (error) {
      console.error('Google login failed:', error);
      setAuthLoading(null);
    }
  };

  const handleTelegramEnter = async () => {
    try {
      setAuthLoading('telegram');
      const tg = (window as any)?.Telegram?.WebApp;

      if (tg?.initDataUnsafe?.user) {
        tg.ready?.();
        handleEnter();
        return;
      }

      const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'muallimabubakr_ilova_bot';
      const botUrl = `https://t.me/${botUsername}?startapp=home`;
      window.open(botUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Telegram entry failed:', error);
    } finally {
      setAuthLoading(null);
    }
  };

  if (showWelcome) {
    return (
      <WelcomeScreen
        onGoogleEnter={handleGoogleEnter}
        onTelegramEnter={handleTelegramEnter}
        loadingProvider={authLoading}
      />
    );
  }

  return (
    <div className="relative z-10 flex flex-col gap-3 px-4 pt-4">
      {loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="rounded-[20px] border border-white/60 bg-white/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton circle width={32} height={32} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                  <div className="space-y-2">
                    <Skeleton width={120} height={12} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                    <Skeleton width={170} height={10} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                  </div>
                </div>
                <Skeleton width={56} height={16} baseColor="#e6ece9" highlightColor="#f5f8f6" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        surahs.map((surah, index) => (
          <div
            key={surah.id}
          >
            <Link 
              href={`/surah/${surah.number}`}
              className="flex items-center gap-4 px-4 min-h-[72px] py-3 justify-between bg-white/60 backdrop-blur-lg border border-white/80 rounded-[20px] shadow-sm cursor-pointer hover:bg-white/80 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-emerald-600 to-black text-white font-bold text-sm shadow-md border border-white/20">
                  {surah.number}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-base font-semibold leading-none text-emerald-gradient">
                    {surah.englishName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-500 text-xs font-medium leading-none">
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} Oyat
                    </p>
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xl font-quran text-emerald-gradient font-medium drop-shadow-sm">
                  {surah.name}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
