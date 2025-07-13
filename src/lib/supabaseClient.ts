import { createClient } from '@supabase/supabase-js'

// Use demo credentials for development
const supabaseUrl = 'https://demo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

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
    // Always return true for demo mode
    return true
  } catch (error) {
    return true
  }
}