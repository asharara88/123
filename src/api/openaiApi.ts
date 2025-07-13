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

// Initialize OpenAI client only if API key is available
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
   * Generate a response using OpenAI API
   */
  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      // Check if OpenAI client is initialized
      if (!openai) {
        // Try to use Supabase Edge Function instead
        return await this.generateResponseViaEdgeFunction(prompt, context);
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
      console.error('Error in OpenAI API:', err);
      logError('Error in OpenAI API', err);
      
      const apiError: ApiError = {
        type: ErrorType.SERVER,
        message: err instanceof Error ? err.message : 'Failed to generate response',
        originalError: err,
      };
      throw apiError;
    }
  },

  /**
   * Generate a response using Supabase Edge Function
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
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ];
      
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
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Edge Function error: ${response.status}`);
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