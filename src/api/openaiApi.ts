// src/api/openaiApi.ts
import { ApiError, ErrorType } from './apiClient';
import { logError } from '../utils/logger';
import OpenAI from 'openai';

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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development
});

// System prompt to enforce evidence-based recommendations
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

export const openaiApi = {
  async createChatCompletion(messages: ChatMessage[], options: ChatCompletionOptions = {}) {
    try {
      // Check if OpenAI API key is configured
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
      }

      try {
        // Prepare messages with system prompt
        const formattedMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          // Add context if provided
          ...(options.context ? [{ role: 'system', content: `Context: ${options.context}` }] : []),
          ...messages
        ];

        // Call OpenAI API directly
        const completion = await openai.chat.completions.create({
          model: options.model || 'gpt-4',
          messages: formattedMessages,
          temperature: options.temperature !== undefined ? options.temperature : 0.7,
          max_tokens: options.max_tokens || 1000,
          response_format: options.response_format,
        });

        return completion;
      } catch (networkError) {
        console.error('OpenAI API request failed:', networkError);
        logError('OpenAI API request failed', networkError);
        let errorMessage = 'Failed to connect to OpenAI API. Please check your API key and internet connection.';

        throw {
          type: ErrorType.NETWORK,
          message: errorMessage,
          originalError: networkError
        } as ApiError;
      }
    } catch (err) {
      if (err instanceof Error || (err && typeof err === 'object' && 'type' in err)) {
        throw err; // Re-throw if already a proper Error object or ApiError
      }
      throw new Error('Unexpected error communicating with AI service');
    }
  },
  
  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      // Format messages
      const messages: ChatMessage[] = [
        { role: 'user', content: prompt }
      ];
      
      // Call OpenAI API
      const data = await this.createChatCompletion(messages, { 
        context: context ? JSON.stringify(context) : undefined 
      });
      
      // Extract response
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
      // System message for onboarding
      const systemMessage = { 
        role: 'system', 
        content: 'You are a friendly onboarding assistant for Biowell. Ask questions one at a time to help the user complete their profile. Be conversational and engaging.' 
      };
      
      const formattedMessages = [systemMessage, ...messages];
      
      // Call OpenAI
      const data = await this.createChatCompletion(formattedMessages, { temperature: 0.7 });
      
      return data.choices?.[0]?.message?.content || 'What is your name?';
    } catch (err) {
      logError('Error processing onboarding', err);
      throw err;
    }
  },
  
  async extractOnboardingData(messages: any[]): Promise<any> {
    try {
      // System prompt for data extraction
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
      
      // Call OpenAI API
      const data = await this.createChatCompletion(
        [systemPrompt, ...messages],
        { 
          temperature: 0,
          response_format: { type: 'json_object' }
        }
      );
      
      // Parse JSON response
      const content = data.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (err) {
      logError('Error extracting onboarding data', err);
      throw err;
    }
  }
};