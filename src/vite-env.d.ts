/// <reference types="vite/client" />

type ViteFirebaseEnvVar = string

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: ViteFirebaseEnvVar
  readonly VITE_FIREBASE_AUTH_DOMAIN: ViteFirebaseEnvVar
  readonly VITE_FIREBASE_PROJECT_ID: ViteFirebaseEnvVar
  readonly VITE_FIREBASE_STORAGE_BUCKET: ViteFirebaseEnvVar
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: ViteFirebaseEnvVar
  readonly VITE_FIREBASE_APP_ID: ViteFirebaseEnvVar
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
