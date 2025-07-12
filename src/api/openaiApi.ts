// src/api/openaiApi.ts
import { ApiError, ErrorType } from './apiClient';
import { logError } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';
import { openaiRateLimiter, createUserRateLimiter } from '../utils/rateLimiter';
import { isWebContainerEnvironment } from '../utils/supabaseConnection';
import { isWebContainerEnvironment } from '../utils/supabaseConnection';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  context?: string;
  response_format?: { type: string };
}

export const openaiApi = {
  async createChatCompletion(messages: ChatMessage[], options: ChatCompletionOptions = {}) {
    try {
      // Check if we're in a WebContainer environment (StackBlitz, CodeSandbox, etc.)
      const isWebContainer = isWebContainerEnvironment();
      
      // If in WebContainer, use a mock response instead of trying to call the Edge Function
      if (isWebContainer) {
        console.log('WebContainer environment detected - using mock OpenAI response');
        
        // Create a mock response based on the last user message
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        const userContent = lastUserMessage?.content || '';
        
        // Generate a contextual mock response
        let mockResponse = "I'm your Biowell health coach. How can I help you today?";
        
        if (userContent.toLowerCase().includes('sleep')) {
          mockResponse = "Based on your interest in sleep improvement, I recommend Magnesium Glycinate (green-tier) at 300-400mg before bed to support deeper sleep and muscle relaxation. L-Theanine (green-tier) at 200mg can also help with sleep onset without causing grogginess. For best results, maintain a consistent sleep schedule and avoid screens 1 hour before bedtime.";
        } else if (userContent.toLowerCase().includes('energy')) {
          mockResponse = "To boost your energy levels naturally, I recommend B-Complex vitamins (green-tier) in the morning to support cellular energy production. Rhodiola Rosea (yellow-tier) at 200-400mg daily can help combat fatigue and improve mental performance under stress. Also consider optimizing your sleep quality and staying properly hydrated throughout the day.";
        } else if (userContent.toLowerCase().includes('stress') || userContent.toLowerCase().includes('anxiety')) {
          mockResponse = "For stress management, Ashwagandha (green-tier) at 300-600mg daily has strong evidence for reducing cortisol levels. L-Theanine (green-tier) at 200mg can promote relaxation without sedation. Combining these supplements with regular meditation, deep breathing exercises, and adequate sleep will provide the best results for stress reduction.";
        } else if (userContent.toLowerCase().includes('muscle') || userContent.toLowerCase().includes('workout')) {
          mockResponse = "For muscle building and recovery, Creatine Monohydrate (green-tier) at 5g daily is one of the most well-researched supplements. Whey Protein Isolate (green-tier) at 20-30g post-workout provides essential amino acids for muscle repair. For optimal results, ensure you're in a slight caloric surplus and following a progressive resistance training program.";
        }
        
        // Return a mock response object that matches the OpenAI API response structure
        return {
          choices: [
            {
              message: {
                content: mockResponse
              }
            }
          ]
        };
      }
      
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession(); 
      
      // Rate limiting check
      const userId = session?.user?.id || 'anonymous';
      const rateLimitKey = createUserRateLimiter(userId, 'openai');
      
      if (!openaiRateLimiter.isAllowed(rateLimitKey)) {
        throw {
          type: ErrorType.VALIDATION,
          message: 'Rate limit exceeded. Please wait before making another request.',
          status: 429
        } as ApiError;
      }
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization if we have a session
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      // Always include the anon key
      headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        console.error('Environment check:', {
          hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          url: import.meta.env.VITE_SUPABASE_URL ? 
            import.meta.env.VITE_SUPABASE_URL.substring(0, 20) + '...' : 'undefined'
        });
        throw new Error('Missing Supabase URL configuration. Please check your .env file and restart the development server.');
      }

      if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase anon key configuration. Please check your .env file and restart the development server.');
      }
      
      let response;
      try {
        // Log the request in development mode only
        if (import.meta.env.DEV) {
          console.log('Making request to Edge Function:', `${supabaseUrl}/functions/v1/openai-proxy`);
        }
        
        response = await fetch(
          `${supabaseUrl}/functions/v1/openai-proxy`,
          {
            method: 'POST',
            headers,
            credentials: 'omit',
            body: JSON.stringify({ 
              messages,
              context: options.context,
              options: {
                temperature: options.temperature,
                max_tokens: options.max_tokens,
                model: options.model || 'gpt-4',
                response_format: options.response_format,
              },
            }),
          }
        );
      } catch (networkError) {
        console.error('Network request failed:', networkError);
        logError('Network request failed', networkError);
        
        // Provide more specific error messages based on the error type
        let errorMessage = 'Unable to reach AI service.';

        if (networkError instanceof TypeError && networkError.message.includes('Failed to fetch')) { 
          if (isWebContainerEnvironment()) {
            errorMessage = 'Network request failed in WebContainer environment. The app will use mock responses instead.';
          } else {
            errorMessage = 'Connection failed. This usually means the Supabase Edge Function is not deployed. Please deploy the openai-proxy function to your Supabase project.';
          }
          
          // Add more specific CORS error detection
          if (networkError.message.includes('CORS') || 
              (typeof window !== 'undefined' && window.console && 
               window.console.error && 
               window.console.error.toString().includes('CORS'))) {
            errorMessage = 'CORS error detected. The Supabase Edge Function needs to be updated with proper CORS headers.';
          }
        }
        
        throw {
          type: ErrorType.NETWORK,
          message: errorMessage,
          originalError: networkError,
          setupRequired: true
        } as ApiError;
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: { message: `HTTP error! status: ${response.status}` } };
        }
        
        let errorMessage = 'AI service request failed';
        
        if (errorData.error && errorData.error.message) {
          if (errorData.error.message.includes('API key')) {
            errorMessage = 'AI service is not properly configured. Please ensure the OpenAI API key is set correctly.';
          } else if (errorData.error.message.includes('rate limit')) {
            errorMessage = 'Too many requests. Please try again in a moment.';
          } else if (errorData.error.message.includes('quota')) {
            errorMessage = 'Service temporarily unavailable. Please try again later.';
          } else if (errorData.error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
          } else {
            errorMessage = errorData.error.message;
          }
        } else if (response.status === 404) {
          errorMessage = 'The OpenAI Edge Function is not deployed. Please deploy the openai-proxy function to your Supabase project.';
        } else if (response.status === 500) {
          errorMessage = 'Internal server error. Please check your OpenAI API key configuration and Edge Function deployment.';
        }
        
        console.error('Edge Function error:', { 
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        logError('Edge Function error', { 
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        const apiError: ApiError = {
          type: ErrorType.SERVER,
          message: errorMessage,
          status: response.status,
          originalError: errorData,
        };

        // Convert certain status codes to authentication errors
        if (response.status === 401 || response.status === 403) {
          apiError.type = ErrorType.AUTHENTICATION;
        }

        throw apiError;
      }

      const data = await response.json();
      console.log('OpenAI API request successful');
      return data;
    } catch (err) {
      if (err instanceof Error || (err && typeof err === 'object' && 'type' in err)) {
        throw err; // Re-throw if already a proper Error object or ApiError
      }
      throw new Error('Unexpected error communicating with AI service');
    }
  },
  
  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      // If in WebContainer, provide a direct mock response without going through createChatCompletion
      if (isWebContainerEnvironment()) {
        console.log('WebContainer environment detected - using direct mock response');
        
        // Generate a contextual mock response based on the prompt
        let mockResponse = "I'm your Biowell health coach. How can I help you today?";
        
        if (prompt.toLowerCase().includes('sleep')) {
          mockResponse = "Based on your interest in sleep improvement, I recommend Magnesium Glycinate (green-tier) at 300-400mg before bed to support deeper sleep and muscle relaxation. L-Theanine (green-tier) at 200mg can also help with sleep onset without causing grogginess. For best results, maintain a consistent sleep schedule and avoid screens 1 hour before bedtime.";
        } else if (prompt.toLowerCase().includes('energy')) {
          mockResponse = "To boost your energy levels naturally, I recommend B-Complex vitamins (green-tier) in the morning to support cellular energy production. Rhodiola Rosea (yellow-tier) at 200-400mg daily can help combat fatigue and improve mental performance under stress. Also consider optimizing your sleep quality and staying properly hydrated throughout the day.";
        } else if (prompt.toLowerCase().includes('stress') || prompt.toLowerCase().includes('anxiety')) {
          mockResponse = "For stress management, Ashwagandha (green-tier) at 300-600mg daily has strong evidence for reducing cortisol levels. L-Theanine (green-tier) at 200mg can promote relaxation without sedation. Combining these supplements with regular meditation, deep breathing exercises, and adequate sleep will provide the best results for stress reduction.";
        } else if (prompt.toLowerCase().includes('muscle') || prompt.toLowerCase().includes('workout')) {
          mockResponse = "For muscle building and recovery, Creatine Monohydrate (green-tier) at 5g daily is one of the most well-researched supplements. Whey Protein Isolate (green-tier) at 20-30g post-workout provides essential amino acids for muscle repair. For optimal results, ensure you're in a slight caloric surplus and following a progressive resistance training program.";
        }
        
        return mockResponse;
      }
      
      // Format messages for the API
      const messages: ChatMessage[] = [
        { role: 'user', content: prompt }
      ];
      
      // Call the createChatCompletion method with context in options
      const data = await this.createChatCompletion(messages, { 
        context: context ? JSON.stringify(context) : undefined 
      });
      
      // Extract and return the response
      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from AI service');
      }
      
      return data.choices[0].message.content || 'No response generated';
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
  
  async processOnboarding(messages: any[]): Promise<string> {
    try {
      // If in WebContainer, provide a mock response
      if (isWebContainerEnvironment()) {
        return "What is your name?";
      }
      
      // Add system message for onboarding
      const systemMessage = { 
        role: 'system', 
        content: 'You are a friendly onboarding assistant for Biowell. Ask questions one at a time to help the user complete their profile. Be conversational and engaging.' 
      };
      
      const formattedMessages = [systemMessage, ...messages];
      
      // Call the API
      const data = await this.createChatCompletion(formattedMessages, { temperature: 0.7 });
      
      // Return the response
      return data.choices?.[0]?.message?.content || 'What is your name?';
    } catch (err) {
      logError('Error processing onboarding', err);
      throw err;
    }
  },
  
  async extractOnboardingData(messages: any[]): Promise<any> {
    try {
      // If in WebContainer, provide mock data
      if (isWebContainerEnvironment()) {
        return {
          firstName: "Demo",
          lastName: "User",
          gender: "not_specified",
          mainGoal: "Improve sleep quality",
          healthGoals: ["Better sleep", "Reduce stress", "Increase energy"],
          supplementHabits: ["Vitamin D", "Magnesium"]
        };
      }
      
      // Create a system prompt for data extraction
      const systemPrompt = {
        role: 'system',
        content: `Extract structured data from the conversation. Return a JSON object with the following fields:
          - firstName: User's first name
          - lastName: User's last name
          - gender: User's gender (if mentioned)
          - mainGoal: User's main health goal (if mentioned)
          - healthGoals: Array of health goals (if mentioned)
          - supplementHabits: Array of supplements they currently take (if mentioned)
          
          Only include fields that you have information for. If a field is not mentioned in the conversation, don't include it.`
      };
      
      // Call the API with the system prompt and conversation history
      const data = await this.createChatCompletion(
        [systemPrompt, ...messages],
        { 
          temperature: 0,
          response_format: { type: 'json_object' }
        }
      );
      
      // Parse the JSON response
      const content = data.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (err) {
      logError('Error extracting onboarding data', err);
      throw err;
    }
  }
};