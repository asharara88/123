import OpenAI from 'openai';
import { ApiError, ErrorType } from './apiClient';
import { logError } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';

// System prompt for direct OpenAI API calls
const SYSTEM_PROMPT = `You are Biowell AI, a personalized health coach focused on providing evidence-based health advice and supplement recommendations.

Your role is to:
- Provide personalized health advice based on user data and goals
- Make evidence-based supplement and lifestyle recommendations
- Help users understand their health metrics and trends
- Suggest actionable steps for health optimization

Guidelines:
- Always base recommendations on scientific research
- Consider the user's health data, goals, and conditions
- Be honest about limitations of current research
- Avoid making diagnostic or strong medical claims
- Defer to healthcare professionals for medical issues
- Focus on lifestyle, nutrition, exercise, and well-researched supplements
- Provide specific, actionable advice when possible
- Maintain a supportive and encouraging tone

Remember: You're a coach and guide, not a replacement for medical care.`;

// Initialize OpenAI client
let openai: OpenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Only for development
    });
  }
} catch (error) {
  console.warn('Failed to initialize OpenAI client:', error);
}

export const openaiApi = {
  /**
   * Generate a response using OpenAI API with fallback to Edge Function
   */
  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    // First try direct OpenAI API if available
    if (openai) {
      try {
        return await this.generateResponseDirect(prompt, context);
      } catch (err) {
        console.error('Direct OpenAI API failed, trying Edge Function:', err);
        logError('Direct OpenAI API failed', err);
        
        // Fall back to Edge Function
        try {
          return await this.generateResponseViaEdgeFunction(prompt, context);
        } catch (edgeErr) {
          console.error('Edge Function also failed:', edgeErr);
          logError('Edge Function also failed', edgeErr);
          throw this.createApiError(err, edgeErr);
        }
      }
    } else {
      // No direct API key, try Edge Function
      try {
        return await this.generateResponseViaEdgeFunction(prompt, context);
      } catch (edgeErr) {
        console.error('Edge Function failed:', edgeErr);
        logError('Edge Function failed', edgeErr);
        throw this.createApiError(null, edgeErr);
      }
    }
  },

  /**
   * Create a standardized API error with setup guidance
   */
  createApiError(directError: any, edgeError: any): ApiError {
    let message = 'Failed to generate response';
    let setupRequired = false;
    
    // Check if it's a configuration issue
    if (edgeError && typeof edgeError === 'object') {
      if (edgeError.message?.includes('OpenAI API key') || 
          edgeError.message?.includes('Authentication required')) {
        message = 'OpenAI API is not properly configured. Please check your API key settings.';
        setupRequired = true;
      } else if (edgeError.message?.includes('quota') || 
                 edgeError.message?.includes('billing')) {
        message = 'OpenAI API quota exceeded. Please check your billing and usage limits.';
      } else if (edgeError.message?.includes('rate limit')) {
        message = 'OpenAI API rate limit exceeded. Please try again later.';
      }
    }
    
    const apiError: ApiError = {
      type: setupRequired ? ErrorType.AUTHENTICATION : ErrorType.SERVER,
      message,
      originalError: edgeError || directError,
      setupRequired
    };
    
    return apiError;
  },
  /**
   * Generate response using direct OpenAI API
   */
  async generateResponseDirect(prompt: string, context?: Record<string, any>): Promise<string> {
    if (!openai) {
      throw new Error('OpenAI client is not initialized');
    }

    try {
      // Prepare messages for the API
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT }
      ];
      
      // Add context if provided
      if (context) {
        messages.push({
          role: 'system',
          content: `Context: ${JSON.stringify(context)}`
        });
      }
      
      // Add user prompt
      messages.push({
        role: 'user',
        content: prompt
      });
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      // Extract and return the response
      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response generated');
      }
      
      return content;
    } catch (err) {
      console.error('Error in direct OpenAI API:', err);
      throw err;
    }
  },

  /**
   * Generate response using Supabase Edge Function
   */
  async generateResponseViaEdgeFunction(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }
      
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required to use Edge Function');
      }
      
      // Prepare messages for the API
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT }
      ];
      
      // Add context if provided
      if (context) {
        messages.push({
          role: 'system',
          content: `Context: ${JSON.stringify(context)}`
        });
      }
      
      // Add user prompt
      messages.push({
        role: 'user',
        content: prompt
      });
      
      // Call the Edge Function
      const response = await fetch(
        `${supabaseUrl}/functions/v1/openai-proxy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ messages, context })
        }
      );
      
      if (!response.ok) {
        let errorMessage = `Edge Function error: ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorMessage;
          } else {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
        } catch (parseErr) {
          // Ignore parsing errors, use default error message
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response generated';
    } catch (err) {
      console.error('Error in Edge Function:', err);
      logError('Error in Edge Function', err);
      
      const apiError: ApiError = {
        type: ErrorType.SERVER,
        message: err instanceof Error ? err.message : 'Failed to generate response via Edge Function',
        originalError: err,
      };
      throw apiError;
    }
  },
  
  /**
   * Process onboarding conversation
   */
  async processOnboarding(messages: any[]): Promise<string> {
    try {
      // Check if OpenAI client is initialized
      if (!openai) {
        throw new Error('OpenAI client is not initialized. Please check your API key.');
      }
      
      // Format messages for the API
      const formattedMessages = [
        { role: 'system', content: 'You are an onboarding assistant for a health app. Help the user complete their profile with friendly, concise questions.' },
        ...messages
      ];
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 300
      });
      
      // Extract and return the response
      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response generated');
      }
      
      return content;
    } catch (err) {
      logError('Error processing onboarding', err);
      throw err;
    }
  },
  
  /**
   * Extract structured data from onboarding conversation
   */
  async extractOnboardingData(messages: any[]): Promise<any> {
    try {
      // Check if OpenAI client is initialized
      if (!openai) {
        throw new Error('OpenAI client is not initialized. Please check your API key.');
      }
      
      // Format messages for the API
      const formattedMessages = [
        { 
          role: 'system', 
          content: 'Extract structured data from this onboarding conversation. Return a JSON object with fields like firstName, lastName, gender, mainGoal, healthGoals, supplementHabits, etc.' 
        },
        ...messages
      ];
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: formattedMessages,
        temperature: 0,
        response_format: { type: 'json_object' }
      });
      
      // Extract and parse the response
      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No data extracted');
      }
      
      return JSON.parse(content);
    } catch (err) {
      logError('Error extracting onboarding data', err);
      throw err;
    }
  }
};