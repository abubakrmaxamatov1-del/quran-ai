import { useEffect, useState } from 'react';
import { TelegramUser, getTelegramUser, isInTelegramWebApp } from '@/lib/telegram-utils';

export function useTelegramUser() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebApp, setIsWebApp] = useState(false);

  useEffect(() => {
    setIsWebApp(isInTelegramWebApp());
    const telegramUser = getTelegramUser();
    setUser(telegramUser);
    setIsLoading(false);
  }, []);

  return {
    user,
    isLoading,
    isWebApp,
    displayName: user?.first_name
      ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
      : 'Foydalanuvchi',
  };
}
