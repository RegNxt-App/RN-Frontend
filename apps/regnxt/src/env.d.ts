/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_FAST_API_BACKEND: string;
  readonly VITE_ORCHESTRA_API_BACKED: string;
  readonly VITE_TEST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
