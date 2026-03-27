// Telegram WebApp Types
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            is_bot: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
          auth_date?: number;
          hash?: string;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          onClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: string) => void;
          notificationOccurred: (type: string) => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramInitData {
  user?: TelegramUser;
  auth_date?: number;
  hash?: string;
}

/**
 * Get the Telegram WebApp instance
 */
export function getTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp;
}

/**
 * Initialize Telegram WebApp
 */
export function initTelegramWebApp() {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
  }
}

/**
 * Get current user data from Telegram WebApp
 */
export function getTelegramUser(): TelegramUser | null {
  const webApp = getTelegramWebApp();
  if (!webApp) return null;
  
  const user = webApp.initDataUnsafe?.user;
  return user || null;
}

/**
 * Get Telegram init data
 */
export function getTelegramInitData(): TelegramInitData | null {
  const webApp = getTelegramWebApp();
  if (!webApp) return null;
  
  return {
    user: webApp.initDataUnsafe?.user,
    auth_date: webApp.initDataUnsafe?.auth_date,
    hash: webApp.initDataUnsafe?.hash,
  };
}

/**
 * Get raw init data string for server verification
 */
export function getTelegramInitDataString(): string {
  const webApp = getTelegramWebApp();
  return webApp?.initData || '';
}

/**
 * Show main button and set click handler
 */
export function setMainButton(text: string, onClick: () => void) {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  
  webApp.MainButton.setText(text);
  webApp.MainButton.show();
  webApp.MainButton.onClick(onClick);
}

/**
 * Hide main button
 */
export function hideMainButton() {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  
  webApp.MainButton.hide();
}

/**
 * Show progress on main button
 */
export function showMainButtonProgress() {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  
  webApp.MainButton.showProgress();
}

/**
 * Hide progress on main button
 */
export function hideMainButtonProgress() {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  
  webApp.MainButton.hideProgress();
}

/**
 * Close WebApp
 */
export function closeTelegramWebApp() {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  
  webApp.close();
}

/**
 * Send data to bot
 */
export function sendDataToBot(data: any) {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  
  webApp.sendData(JSON.stringify(data));
}

/**
 * Check if running in Telegram WebApp
 */
export function isInTelegramWebApp(): boolean {
  return getTelegramWebApp() !== null && getTelegramWebApp() !== undefined;
}

/**
 * Setup back button handler
 */
export function setBackButton(onBack: () => void) {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  
  webApp.BackButton.show();
  webApp.BackButton.onClick(onBack);
}

/**
 * Hide back button
 */
export function hideBackButton() {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  
  webApp.BackButton.hide();
}

/**
 * Trigger haptic feedback (vibration)
 */
export function triggerHaptic(type: 'impact' | 'notification' | 'selection' = 'impact') {
  const webApp = getTelegramWebApp();
  if (!webApp?.HapticFeedback) return;
  
  switch (type) {
    case 'impact':
      webApp.HapticFeedback.impactOccurred('medium');
      break;
    case 'notification':
      webApp.HapticFeedback.notificationOccurred('success');
      break;
    case 'selection':
      webApp.HapticFeedback.selectionChanged();
      break;
  }
}
