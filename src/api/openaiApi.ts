import { ApiError, ErrorType } from './apiClient';
import { logError } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';
import { openaiRateLimiter, createUserRateLimiter } from '../utils/rateLimiter'; 

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

    // Prepare messages with system prompt
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    // For demo purposes, generate a mock response based on the last message
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    let mockResponse = "I'm your Biowell health coach. How can I help you today?";
    
    if (lastMessage.includes('sleep')) {
      mockResponse = "Based on your interest in sleep improvement, I recommend Magnesium Glycinate (green-tier) at 300-400mg before bed to support deeper sleep and muscle relaxation. L-Theanine (green-tier) at 200mg can also help with sleep onset without causing grogginess. For best results, maintain a consistent sleep schedule and avoid screens 1 hour before bedtime.";
    } else if (lastMessage.includes('energy')) {
      mockResponse = "To boost your energy levels naturally, I recommend B-Complex vitamins (green-tier) in the morning to support cellular energy production. Rhodiola Rosea (yellow-tier) at 200-400mg daily can help combat fatigue and improve mental performance under stress. Also consider optimizing your sleep quality and staying properly hydrated throughout the day.";
    } else if (lastMessage.includes('stress') || lastMessage.includes('anxiety')) {
      mockResponse = "For stress management, Ashwagandha (green-tier) at 300-600mg daily has strong evidence for reducing cortisol levels. L-Theanine (green-tier) at 200mg can promote relaxation without sedation. Combining these supplements with regular meditation, deep breathing exercises, and adequate sleep will provide the best results for stress reduction.";
    } else if (lastMessage.includes('muscle') || lastMessage.includes('workout')) {
      mockResponse = "For muscle building and recovery, Creatine Monohydrate (green-tier) at 5g daily is one of the most well-researched supplements. Whey Protein Isolate (green-tier) at 20-30g post-workout provides essential amino acids for muscle repair. For optimal results, ensure you're in a slight caloric surplus and following a progressive resistance training program.";
    } else if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
      mockResponse = "Hello! I'm your Biowell health coach. I can help you with personalized supplement recommendations, sleep optimization, stress management, and more. What health goal would you like to focus on today?";
    }
    
    // Create a mock response object that matches the OpenAI API response format
    const mockData = {
      choices: [
        {
          message: {
            content: mockResponse
          }
        }
      ]
    };
    
    return mockData;
  },

  async generateResponse(prompt: string, context?: Record<string, any>): Promise<string> {
    try {
      // Format messages for the API
      const messages: ChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      try {
        // Call the createChatCompletion method with context in options
        const data = await this.createChatCompletion(messages, { 
          context: context ? JSON.stringify(context) : undefined 
        });
        
        // Extract and return the response
        if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from AI service');
        }
        
        return data.choices[0].message.content || 'No response generated';
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
      }
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
      // Generate a mock response for onboarding
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      
      if (lastMessage.includes('name')) {
        return "Nice to meet you! Could you tell me your gender?";
      } else if (lastMessage.includes('gender') || lastMessage.includes('male') || lastMessage.includes('female')) {
        return "Thanks! What's your primary health goal right now?";
      } else if (lastMessage.includes('goal') || lastMessage.includes('improve') || lastMessage.includes('better')) {
        return "Great goal! What specific health areas would you like to focus on? You can list multiple areas like sleep, energy, stress, fitness, etc.";
      } else if (lastMessage.includes('sleep') || lastMessage.includes('energy') || lastMessage.includes('stress')) {
        return "Got it. Are you currently taking any supplements? If yes, please list them.";
      } else {
        return "Thank you for sharing that information! Based on your responses, I've created a personalized health plan for you. Let's get started on your journey to better health!";
      }
    } catch (err) {
      logError('Error processing onboarding', err);
      return "What is your name?";
    }
  },
  
  async extractOnboardingData(messages: any[]): Promise<any> {
    try {
      // Extract basic information from the conversation
      const userData: any = {
        firstName: "Demo",
        lastName: "User"
      };
      
      // Look for gender information
      for (const message of messages) {
        const content = message.content.toLowerCase();
        if (content.includes('male')) {
          userData.gender = 'male';
        } else if (content.includes('female')) {
          userData.gender = 'female';
        }
        
        // Look for health goals
        if (content.includes('sleep')) {
          userData.mainGoal = 'Improve sleep';
          userData.healthGoals = ['Improve sleep quality'];
        } else if (content.includes('energy')) {
          userData.mainGoal = 'Increase energy';
          userData.healthGoals = ['Increase energy levels'];
        } else if (content.includes('stress')) {
          userData.mainGoal = 'Reduce stress';
          userData.healthGoals = ['Stress reduction'];
        }
        
        // Look for supplements
        if (content.includes('vitamin') || content.includes('supplement')) {
          userData.supplementHabits = ['Multivitamin'];
        }
      }
      
      return userData;
    } catch (err) {
      logError('Error extracting onboarding data', err);
      return {
        firstName: "Demo",
        lastName: "User"
      };
    }
  }
};