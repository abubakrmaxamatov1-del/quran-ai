'use client';

import React, { useEffect, useState, use } from 'react';
import { ChevronLeft, BookOpen, Share2, Play, Info } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import Skeleton from 'react-loading-skeleton';

interface Ayat {
  id: number;
  surah_number: number;
  number: number;
  text: string;
  translation: string;
  tafsir: string;
}

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

const ENABLE_SUPABASE_READS = process.env.NEXT_PUBLIC_ENABLE_SUPABASE_READS === 'true';

export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ayats, setAyats] = useState<Ayat[]>([]);
  const [surah, setSurah] = useState<SurahInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAyat, setSelectedAyat] = useState<Ayat | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (ENABLE_SUPABASE_READS) {
          const { data: surahData, error: surahError } = await supabase
            .from('surahs')
            .select('*')
            .eq('number', id)
            .single();

          if (!surahError && surahData) {
            setSurah(surahData);
          }

          const { data: ayatsData, error: ayatsError } = await supabase
            .from('ayats')
            .select('*')
            .eq('surah_number', id)
            .order('number', { ascending: true });

          if (!ayatsError && ayatsData && ayatsData.length > 0) {
            setAyats(ayatsData);
            return;
          }

          console.log('Supabase ayats empty or unavailable, fetching from public API...');
        }

        const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,uz.sodik`);
        const result = await response.json();
        
        if (result.code === 200) {
          const arabicAyahs = result.data[0].ayahs;
          const uzbekAyahs = result.data[1].ayahs;
          
          const formattedAyats = arabicAyahs.map((ayah: any, index: number) => ({
            id: ayah.number,
            surah_number: parseInt(id as string),
            number: ayah.numberInSurah,
            text: ayah.text,
            translation: uzbekAyahs[index].text,
            tafsir: "" // Public API doesn't provide tafsir in this format easily
          }));
          setAyats(formattedAyats);
        } else {
          throw new Error('Public API for ayats failed');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback mock data if everything fails
        setAyats([
          { 
            id: 1, 
            surah_number: 1, 
            number: 1, 
            text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", 
            translation: "Mehribon va rahmli Alloh nomi bilan (boshlayman).", 
            tafsir: "Ushbu oyat Qur'onning birinchi oyati bo'lib, har bir ishni Alloh nomi bilan boshlash kerakligini bildiradi." 
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Surah Header */}
      <div className="sticky top-16 z-40 border-b border-white/50 bg-white/40 backdrop-blur-xl py-4">
        <div className="container mx-auto flex items-center justify-between px-4 max-w-[480px]">
          <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Orqaga</span>
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold text-emerald-gradient">{surah?.englishName || 'Sura'}</h1>
            <p className="text-[10px] text-slate-500 font-medium">{surah?.englishNameTranslation} • {surah?.numberOfAyahs} oyat</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full p-2 text-slate-400 hover:bg-white/60 hover:text-primary transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-8 px-4 max-w-[480px]">
        {loading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-[32px] border border-white/60 bg-white/40 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <Skeleton width={32} height={32} borderRadius={10} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                  <div className="flex gap-2">
                    <Skeleton circle width={32} height={32} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                    <Skeleton circle width={32} height={32} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                  </div>
                </div>
                <div className="mb-6 flex justify-end">
                  <Skeleton width="80%" height={28} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                </div>
                <div className="space-y-2 border-t border-white/40 pt-6">
                  <Skeleton width="100%" height={12} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                  <Skeleton width="90%" height={12} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                  <Skeleton width="75%" height={12} baseColor="#e6ece9" highlightColor="#f5f8f6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Bismillah */}
            {id !== '1' && id !== '9' && (
              <div className="flex justify-center py-8">
                <p className="font-quran text-3xl text-emerald-gradient">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              </div>
            )}

            {ayats.map((ayat) => (
              <div 
                key={ayat.id}
                className="group relative rounded-[32px] border border-white/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-400/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-400/20">
                    {ayat.number}
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full p-2 text-slate-400 dark:text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
                      <Play size={16} />
                    </button>
                    <button 
                      onClick={() => setSelectedAyat(selectedAyat?.id === ayat.id ? null : ayat)}
                      className={`rounded-full p-2 transition-all ${selectedAyat?.id === ayat.id ? 'bg-primary text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:bg-emerald-50 hover:text-primary'}`}
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-6 text-right">
                  <p className="font-quran text-3xl leading-[2.5] text-emerald-gradient md:text-4xl md:leading-[3]">
                    {ayat.text}
                  </p>
                </div>

                <div className="border-t border-white/40 dark:border-slate-800/60 pt-6">
                  <p className="text-slate-700 dark:text-slate-100 leading-relaxed italic font-medium">
                    {ayat.translation}
                  </p>
                </div>

                {/* Tafsir Section */}
                {selectedAyat?.id === ayat.id && (
                  <div className="mt-6 overflow-hidden rounded-2xl bg-emerald-50/50 dark:bg-slate-800/40 p-6 border border-emerald-100/50 dark:border-slate-700/30">
                    <div className="mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                      <BookOpen size={18} />
                      <h4 className="font-bold">Tafsir</h4>
                    </div>
                    <div className="prose prose-emerald dark:prose-invert max-w-none text-zinc-700 dark:text-slate-200">
                      <ReactMarkdown>{String(ayat.tafsir || '')}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
