/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_ELEVENLABS_API_KEY: string
  readonly VITE_SPOONACULAR_API_KEY: string
  readonly VITE_NUTRITIONIX_API_KEY: string
  readonly VITE_NUTRITIONIX_APP_ID: string
  readonly VITE_APP_NAME: string
  readonly NODE_ENV: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}