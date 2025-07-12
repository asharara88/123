// src/api/openaiApi.ts
import { ApiError, ErrorType } from './apiClient';
import { logError } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';
import { openaiRateLimiter, createUserRateLimiter } from '../utils/rateLimiter';

// Import OpenAI conditionally to avoid initialization errors
let OpenAI: any;
let openai: any;

// Only initialize if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (apiKey) {
  try {
    // Dynamic import to avoid initialization errors
    import('openai').then((module) => {
      OpenAI = module.default;
      openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Only for development
      });
    });
  } catch (err) {
    console.error('Failed to initialize OpenAI client:', err);
  }
}

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
      
      // Try Edge Function first, then fallback to direct API call
      try {
        return await this.callEdgeFunction(messages, options, session);
      } catch (edgeFunctionError) {
        console.log('Edge Function failed, trying direct OpenAI API call...');
        return await this.callDirectOpenAI(messages, options);
      }
    } catch (err) {
      if (err instanceof Error || (err && typeof err === 'object' && 'type' in err)) {
        throw err; // Re-throw if already a proper Error object or ApiError
      }
      throw new Error('Unexpected error communicating with AI service');
    }
  },

  async callEdgeFunction(messages: ChatMessage[], options: ChatCompletionOptions, session: any) {
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
        throw new Error('Missing Supabase URL configuration. Please check your .env file and restart the development server.');
      }

      if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase anon key configuration. Please check your .env file and restart the development server.');
      }
      
      // Log the request in development mode only
      if (import.meta.env.DEV) {
        console.log('Making request to Edge Function:', `${supabaseUrl}/functions/v1/openai-proxy`);
        console.log('Request body:', { messages, context: options.context, options });
      }
      
      const response = await fetch(
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

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: { message: `HTTP error! status: ${response.status}` } };
        }
        
        let errorMessage = 'AI service request failed';
        let setupRequired = false;
        
        if (errorData.error && errorData.error.message) {
          if (errorData.error.message.includes('API key')) {
            errorMessage = 'AI service is not properly configured. Please ensure the OpenAI API key is set correctly.';
            setupRequired = true;
          } else if (errorData.error.message.includes('rate limit')) {
            errorMessage = 'Too many requests. Please try again in a moment.';
          } else if (errorData.error.message.includes('quota')) {
            errorMessage = 'Service temporarily unavailable. Please try again later.';
          } else if (errorData.error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
          } else if (errorData.error.message.includes('not configured')) {
            errorMessage = errorData.error.message;
            setupRequired = true;
          } else {
            errorMessage = errorData.error.message;
          }
        } else if (response.status === 404) {
          errorMessage = 'The OpenAI Edge Function is not deployed. Please deploy the openai-proxy function to your Supabase project.';
          setupRequired = true;
        } else if (response.status === 500) {
          errorMessage = 'Internal server error. Please check your OpenAI API key configuration and Edge Function deployment.';
          setupRequired = true;
        }
        
        console.error('Edge Function error:', { 
          status: response.status,
          statusText: response.statusText,
          errorData,
          setupInstructions: errorData.error?.setupInstructions
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
          setupRequired
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
  },

  async callDirectOpenAI(messages: ChatMessage[], options: ChatCompletionOptions) {
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      throw {
        type: ErrorType.AUTHENTICATION,
        message: 'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your environment variables.',
        setupRequired: true
      } as ApiError;
    }

    if (!openaiApiKey.startsWith('sk-')) {
      throw {
        type: ErrorType.AUTHENTICATION,
        message: 'Invalid OpenAI API key format. Key should start with "sk-"',
        setupRequired: true
      } as ApiError;
    }

    // Prepare messages with system prompt
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    console.log('Making direct request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4',
        messages: formattedMessages,
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
        max_tokens: options.max_tokens || 1000,
        response_format: options.response_format,
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: { message: `HTTP error! status: ${response.status}` } };
      }
      
      let errorMessage = 'AI service request failed';
      
      if (response.status === 401) {
        errorMessage = 'Invalid OpenAI API key. Please check your API key configuration.';
      } else if (response.status === 429) {
        errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
      } else if (response.status === 402) {
        errorMessage = 'OpenAI API quota exceeded. Please check your billing and usage limits.';
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      throw {
        type: ErrorType.SERVER,
        message: errorMessage,
        status: response.status,
        originalError: errorData
      } as ApiError;
    }

    const data = await response.json();
    console.log('Direct OpenAI API request successful');
    return data;
  },
  
  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
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
        message: err && typeof err === 'object' && 'message' in err ? err.message : 'Failed to generate response',
        originalError: err,
      };
      throw apiError;
    }
  },
  
  async processOnboarding(messages: any[]): Promise<string> {
    try {
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