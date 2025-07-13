import { supabase } from '../lib/supabaseClient'
import { logError, logInfo, logWarning } from './logger'

// Connection error event handling
const connectionErrorHandlers: Array<(event: CustomEvent) => void> = []

export function onConnectionError(handler: (event: CustomEvent) => void) {
  connectionErrorHandlers.push(handler)
  
  const eventHandler = (event: Event) => {
    handler(event as CustomEvent)
  }
  
  window.addEventListener('supabase-connection-error', eventHandler)
  
  return () => {
    const index = connectionErrorHandlers.indexOf(handler)
    if (index > -1) {
      connectionErrorHandlers.splice(index, 1)
    }
    window.removeEventListener('supabase-connection-error', eventHandler)
  }
}

function dispatchConnectionError(error: any, context?: any) {
  const event = new CustomEvent('supabase-connection-error', {
    detail: { 
      message: error?.message || 'Unknown connection error',
      error, 
      context, 
      timestamp: new Date().toISOString() 
    }
  })
  window.dispatchEvent(event)
}

// Detect if we're in a WebContainer environment
export const isWebContainerEnvironment = (): boolean => {
  return typeof window !== 'undefined' && (
    window.location.hostname.includes('webcontainer') || 
    window.location.hostname.includes('stackblitz') || 
    window.location.hostname.includes('codesandbox') || 
    window.location.hostname.includes('gitpod') || 
    window.location.hostname.includes('replit') || 
    window.location.hostname.includes('glitch') || 
    window.location.hostname.includes('local-credentialless') ||
    window.location.hostname.includes('localhost') ||
    window.location.hostname === 'biowell.ai' ||
    // Check if we're in a preview environment
    window.location.hostname.includes('preview')
  )
}

// Simple connection test with timeout and better error handling
export const testConnection = async (timeoutMs: number = 3000): Promise<boolean> => {
  try {
    // Skip connection test in WebContainer environments or if offline
    if (isWebContainerEnvironment()) {
      logInfo('WebContainer environment detected - skipping network test', {})
      return true
    }
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false
    }

    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    
    try {
      // Use Supabase client's built-in health check instead of raw fetch
      const { error } = await supabase.auth.getSession()
      clearTimeout(timeoutId)
      
      // If we can get session without error, connection is working
        return false
      }
      
      // Try a simple REST API call as fallback
      try {
        const { error } = await supabase.from('profiles').select('count').limit(1)
        return !error
      } catch {
        return false
      }
    }
    
  } catch (error: any) {
    // Silently handle all connection errors
    return false
  }
}

// Enhanced connection check with retry logic and better error handling
export const checkSupabaseConnection = async (maxAttempts: number = 1): Promise<boolean> => {
  // Skip connection check if environment variables are missing or placeholders
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    logWarning('Supabase environment variables not configured', {})
    return false
  }
  
  // Check for placeholder values
  const isPlaceholderUrl = supabaseUrl?.includes('your-project-ref.supabase.co') || 
                          supabaseUrl?.includes('your-project.supabase.co') ||
                          supabaseUrl?.includes('placeholder') ||
                          !supabaseUrl
  
  const isPlaceholderKey = supabaseAnonKey?.includes('your-anon-key-here') ||
                          supabaseAnonKey?.includes('placeholder') ||
                          supabaseAnonKey?.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here') ||
                          !supabaseAnonKey
  
  if (isPlaceholderUrl || isPlaceholderKey) {
    logWarning('Placeholder Supabase credentials detected - skipping connection test', {})
    return false
  }

  // Check if we're in a WebContainer environment
  if (isWebContainerEnvironment()) {
    logInfo('WebContainer environment detected - assuming Supabase connection is available', {})
    return true
  }
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const isConnected = await testConnection(2000) // Reduced timeout to 2 seconds
      
      if (isConnected) {
        if (attempt > 1) {
          logInfo('Supabase connection restored', { attempt })
        } else {
          logInfo('Supabase connection verified', {})
        }
        return true
      }
      
      // If this isn't the last attempt, wait before retrying
        attempt,
        maxAttempts,
        willRetry: attempt < maxAttempts,
        timestamp: new Date().toISOString(),
        supabaseUrl: supabaseUrl ? 'configured' : 'missing',
        supabaseKey: supabaseAnonKey ? 'configured' : 'missing',
        error: {
          message: error?.message || 'Unknown error',
          name: error?.name || 'Error',
          details: error?.toString() || 'No details available'
        }
      }
      
      logError(`Supabase connection attempt ${attempt} failed`, attemptInfo)
      
      const isLastAttempt = attempt === maxAttempts
      
      if (isLastAttempt) {
        dispatchConnectionError(error, { attempt, maxAttempts })
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }
  
  return false
}

// Lightweight connection status check (doesn't throw errors)
export const isSupabaseConnected = async (): Promise<boolean> => {
  try {
    // In WebContainer environments, assume connection works if credentials are configured
    if (isWebContainerEnvironment()) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      return !!(supabaseUrl && supabaseAnonKey)
    }
    
    // Quick auth session check (doesn't require network if session is cached)
    const { error } = await supabase.auth.getSession()
    
    if (!error) {
      return true
    }
    
    // If session check fails, do a lightweight connection test
    return await testConnection(1000) // 1 second timeout for status checks
    
  } catch (error) {
    // Silently fail for status checks
  timestamp: string
}> => {
  const timestamp = new Date().toISOString()
  
  try {
    const connected = await isSupabaseConnected()
    return { connected, timestamp }
  } catch (error: any) {
    return { 
      connected: false, 
      error: error.message,
      timestamp 
    }
  }
}

// Initialize connection check (called once on app start)
export const initializeConnection = async (): Promise<boolean> => {
  logInfo('Initializing Supabase connection...', {})
  
  try {

    const isConnected = await checkSupabaseConnection(1) // Only 1 attempt on startup
    
    if (isConnected) {
      logInfo('Supabase connection initialized successfully', {})
    } else {
      logInfo('Supabase connection unavailable - app will run in offline mode', {})
    }
    
    return isConnected
  } catch (error: any) {
    logInfo('Connection initialization completed with limited connectivity', { 
      note: 'App will continue to function with reduced features'
    })
    return false
  }
}