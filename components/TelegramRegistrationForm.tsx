'use client';

import { useState, useEffect } from 'react';
import { TelegramUser, getTelegramUser, initTelegramWebApp, setMainButton, showMainButtonProgress, hideMainButtonProgress } from '@/lib/telegram-utils';

interface RegistrationFormProps {
  onComplete?: (data: any) => void;
}

export default function TelegramRegistrationForm({ onComplete }: RegistrationFormProps) {
  const [step, setStep] = useState<'name' | 'phone' | 'complete'>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegramWebApp();
    
    // Get user data from Telegram
    const user = getTelegramUser();
    setTelegramUser(user);
    
    // Pre-fill name if available
    if (user?.first_name) {
      setName(user.first_name + (user.last_name ? ' ' + user.last_name : ''));
    }
  }, []);

  useEffect(() => {
    if (step === 'name') {
      setMainButton('Davom etish', handleNameSubmit);
    } else if (step === 'phone') {
      setMainButton('Ro\'yxatdan o\'tish', handlePhoneSubmit);
    }
  }, [step, name, phone]);

  const handleNameSubmit = async () => {
    if (name.trim().length < 2) {
      setError('Ism kamida 2 ta harf bo\'lishi kerak');
      return;
    }
    setError('');
    setStep('phone');
  };

  const handlePhoneSubmit = async () => {
    if (!phone.trim()) {
      setError('Telefon raqamini kiriting');
      return;
    }

    setLoading(true);
    showMainButtonProgress();
    setError('');

    try {
      const response = await fetch('/api/telegram/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: telegramUser?.id,
          username: telegramUser?.username,
          first_name: telegramUser?.first_name,
          last_name: telegramUser?.last_name,
          full_name: name,
          phone_number: phone,
        }),
      });

      if (!response.ok) {
        throw new Error('Ro\'yxatdan o\'tish xatosi');
      }

      setStep('complete');
      if (onComplete) {
        onComplete({
          name,
          phone,
          telegramUser,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
      hideMainButtonProgress();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl font-bold">Muallim Abu Bakr</h1>
        <p className="text-gray-500">Ro\'yxatdan o\'tish</p>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 justify-center">
        <div className={`h-2 w-12 rounded-full ${step === 'name' || step === 'phone' || step === 'complete' ? 'bg-blue-500' : 'bg-gray-300'}`} />
        <div className={`h-2 w-12 rounded-full ${step === 'phone' || step === 'complete' ? 'bg-blue-500' : 'bg-gray-300'}`} />
        <div className={`h-2 w-12 rounded-full ${step === 'complete' ? 'bg-blue-500' : 'bg-gray-300'}`} />
      </div>

      {/* Name Step */}
      {step === 'name' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ismingiz</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Ismingizni kiriting"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {/* Phone Step */}
      {step === 'phone' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Telefon raqami</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError('');
              }}
              placeholder="+998 XX XXX XX XX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">Misol: +998 (90) 123-45-67</p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <div className="space-y-4 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold">Ro\'yxatdan o\'tdingiz!</h2>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Ism:</span> {name}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Telefon:</span> {phone}
            </p>
          </div>
          <p className="text-gray-600 text-sm">Muallim ilovasini ishlatishni boshlashingiz mumkin</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      )}
    </div>
  );
}
