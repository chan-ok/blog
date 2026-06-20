interface Window {
  Buffer: typeof import('buffer').Buffer; // Buffer polyfill
  global: typeof globalThis; // global polyfill
}

// Vite 환경 변수 타입 정의
interface ImportMetaEnv {
  readonly VITE_GIT_RAW_URL: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
