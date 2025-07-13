import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Legacy function - kept for backward compatibility but simplified
export const testConnection = async (): Promise<boolean> => {
  try {
    // Test connection by getting session
    const { error } = await supabase.auth.getSession()
    return !error
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return false
  }
}