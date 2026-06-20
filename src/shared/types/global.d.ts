declare global {
  interface Window {
    Buffer: typeof import('buffer').Buffer; // Buffer polyfill
    global: typeof globalThis; // global polyfill
  }
}

// Vite 환경 변수 타입 정의
export interface ImportMetaEnv {
  readonly VITE_GIT_RAW_URL: string;
  readonly VITE_API_BASE_URL?: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
