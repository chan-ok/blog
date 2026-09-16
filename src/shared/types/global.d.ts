// Vite 환경 변수 타입 정의
interface ImportMetaEnv {
  readonly VITE_GIT_RAW_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
