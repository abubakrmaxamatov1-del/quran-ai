'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';

interface Profile {
  id: string;
  full_name: string | null;
  telegram_id: number | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          
          // Fetch additional profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white/60 p-8 backdrop-blur-lg shadow-xl">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Skeleton circle width={96} height={96} baseColor="#e6ece9" highlightColor="#f5f8f6" />
              <div className="w-full space-y-2">
                <Skeleton width={220} height={24} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                <Skeleton width={180} height={16} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                <Skeleton width={140} height={22} borderRadius={999} baseColor="#e6ece9" highlightColor="#f5f8f6" />
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <Skeleton width={210} height={22} baseColor="#e6ece9" highlightColor="#f5f8f6" />
              <Skeleton count={3} height={14} baseColor="#e6ece9" highlightColor="#f5f8f6" />
              <Skeleton width={190} height={42} borderRadius={12} baseColor="#e6ece9" highlightColor="#f5f8f6" />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="rounded-2xl border border-white/60 bg-white/40 p-4 text-center backdrop-blur-sm">
                  <Skeleton width={90} height={10} className="mx-auto" baseColor="#e6ece9" highlightColor="#f5f8f6" />
                  <Skeleton width={40} height={24} className="mx-auto mt-2" baseColor="#e6ece9" highlightColor="#f5f8f6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Abu Bakr Siddiq';
  const userName = user?.email ? `@${String(user.email).split('@')[0]}` : '@abubakr_muallim';

  const handleShare = async () => {
    const shareData = {
      title: 'Muallim Abu Bakr',
      text: 'Quron ilovasini sinab ko\'ring',
      url: typeof window !== 'undefined' ? window.location.origin : ''
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (shareData.url) {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-28 dark:text-slate-100">
      <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-[#f0fdf4]/80 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 w-full max-w-[480px] items-center justify-between px-4">
          <button
            onClick={() => router.back()}
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            aria-label="Orqaga"
          >
            <span className="material-symbols-outlined text-2xl text-slate-900 dark:text-slate-100">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight text-emerald-gradient">Sozlamalar</h1>
          <div className="size-10" />
        </div>
      </header>

      <main className="mt-4 space-y-6 px-4">
        <div className="glass-card flex items-center justify-between rounded-[20px] p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">person</span>
              </div>
              <div className="absolute bottom-0 right-0 flex size-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm">
                <span className="material-symbols-outlined text-[10px] font-bold text-white">edit</span>
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-gradient">{displayName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{userName}</p>
            </div>
          </div>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm dark:bg-slate-700">Profil</button>
        </div>

        <div className="space-y-3">
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-gradient opacity-70">Ilova sozlamalari</p>
          <div className="glass-card divide-y divide-slate-100/50 rounded-[20px]">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">dark_mode</span>
                </div>
                <span className="text-sm font-semibold text-emerald-gradient">Ilova ko&apos;rinishi</span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 transition-all dark:bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>

            <div className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">format_size</span>
                </div>
                <span className="text-sm font-semibold text-emerald-gradient">Matn hajmi</span>
              </div>
              <div className="px-2">
                <input
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-500 dark:bg-slate-700"
                  type="range"
                  min={12}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
                <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  <span>A</span>
                  <span>Katta ({fontSize})</span>
                </div>
              </div>
            </div>

            <button className="flex w-full items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">language</span>
                </div>
                <span className="text-sm font-semibold text-emerald-gradient">Tilni tanlash</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <span>O&apos;zbekcha</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-gradient opacity-70">Yordam</p>
          <div className="glass-card divide-y divide-slate-100/50 rounded-[20px] dark:divide-slate-700/60">
            <button className="flex w-full items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">info</span>
                </div>
                <span className="text-sm font-semibold text-emerald-gradient">Biz haqimizda</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-500">chevron_right</span>
            </button>

            <button onClick={handleShare} className="flex w-full items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">share</span>
                </div>
                <span className="text-sm font-semibold text-emerald-gradient">Ilovani ulashish</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-500">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 pb-12 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Muallim Abu Bakr v2.4.0</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#059669] to-[#000000] px-10 py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Tizimdan chiqish
          </button>
        </div>
      </main>
    </div>
  );
}
