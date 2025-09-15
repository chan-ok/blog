// 브라우저 환경 감지
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// 로컬스토리지 안전하게 사용
export function getLocalStorage(key: string, defaultValue?: string): string | null {
  if (!isBrowser()) return defaultValue || null;

  try {
    return localStorage.getItem(key) || defaultValue || null;
  } catch {
    return defaultValue || null;
  }
}

export function setLocalStorage(key: string, value: string): boolean {
  if (!isBrowser()) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeLocalStorage(key: string): boolean {
  if (!isBrowser()) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// 세션스토리지 안전하게 사용
export function getSessionStorage(key: string, defaultValue?: string): string | null {
  if (!isBrowser()) return defaultValue || null;

  try {
    return sessionStorage.getItem(key) || defaultValue || null;
  } catch {
    return defaultValue || null;
  }
}

export function setSessionStorage(key: string, value: string): boolean {
  if (!isBrowser()) return false;

  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

// 쿠키 관련 유틸리티
export function getCookie(name: string): string | null {
  if (!isBrowser()) return null;

  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export function setCookie(name: string, value: string, days: number = 7): void {
  if (!isBrowser()) return;

  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + expirationDate.toUTCString();

  document.cookie = `${name}=${value};${expires};path=/`;
}

// 디바이스 정보
export function isMobileDevice(): boolean {
  if (!isBrowser()) return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isTouchSupported(): boolean {
  if (!isBrowser()) return false;

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// 네트워크 상태
export function isOnline(): boolean {
  if (!isBrowser()) return true;

  return navigator.onLine;
}

export function watchNetworkStatus(callback: (isOnline: boolean) => void): () => void {
  if (!isBrowser()) return () => {};

  const onlineListener = () => callback(true);
  const offlineListener = () => callback(false);

  window.addEventListener('online', onlineListener);
  window.addEventListener('offline', offlineListener);

  return () => {
    window.removeEventListener('online', onlineListener);
    window.removeEventListener('offline', offlineListener);
  };
}

// 클립보드
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser()) return false;

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // 폴백 방법
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}

// 스크롤 관련
export function scrollToTop(): void {
  if (!isBrowser()) return;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function scrollToElement(elementId: string): void {
  if (!isBrowser()) return;

  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}