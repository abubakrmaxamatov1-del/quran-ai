'use client';

import { useEffect, useState } from 'react';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import Link from 'next/link';

interface UserInfo {
  full_name?: string;
  phone_number?: string;
}

export default function DashboardPage() {
  const { user, displayName, isWebApp, isLoading } = useTelegramUser();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setInfoLoading(false);
      return;
    }

    // Fetch user registration info from Supabase
    async function fetchUserInfo() {
      if (!user) return;
      try {
        const response = await fetch(`/api/telegram/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setInfoLoading(false);
      }
    }

    fetchUserInfo();
  }, [user?.id]);

  if (isLoading || infoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!isWebApp && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold">Telegramdan ochilishi kerak</h1>
          <p className="text-gray-600">Iltimos, @muallimabubakr_ilova_bot orqali ro\'yxatdan o\'ting.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-gray-600">Xush kelibsiz! 👋</p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-lg font-bold">Profil Ma\'lumotlari</h2>
          
          <div className="space-y-3">
            {user?.id && (
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Telegram ID</span>
                <span className="font-semibold">{user.id}</span>
              </div>
            )}
            
            {user?.username && (
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Username</span>
                <span className="font-semibold">@{user.username}</span>
              </div>
            )}
            
            {user?.language_code && (
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Til</span>
                <span className="font-semibold">{user.language_code.toUpperCase()}</span>
              </div>
            )}

            {userInfo?.full_name && (
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">To\'liq Ism</span>
                <span className="font-semibold">{userInfo.full_name}</span>
              </div>
            )}

            {userInfo?.phone_number && (
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Telefon</span>
                <span className="font-semibold">{userInfo.phone_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Registration Status */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-700 font-semibold">✅ Siz ro\'yxatdan o\'tdingiz</p>
          <p className="text-green-600 text-sm mt-2">Endi Muallim Abu Bakr ilovasidan to\'la foydalana olasiz</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition">
              📖 Qur\'on o\'qish
            </button>
          </Link>
          
          <Link href="/search">
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition">
              🔍 Qidirish
            </button>
          </Link>
        </div>

        {/* Version Info */}
        <p className="text-center text-gray-500 text-xs">
          Muallim Abu Bakr v1.0.0
        </p>
      </div>
    </main>
  );
}
