import { apiClient } from './apiClient';
import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';
import { openaiApi } from './openaiApi'; 
import { isWebContainerEnvironment } from '../utils/supabaseConnection';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

interface ChatHistoryEntry {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
}

export const chatApi = {
  /**
   * Send a message to the AI assistant
   */
  async sendMessage(messages: ChatMessage[], userId?: string): Promise<string> {
    try {
      // Check if we're in a WebContainer environment
      if (isWebContainerEnvironment()) {
        console.log('WebContainer environment detected - using mock chat response');
        
        // Get the last message content
        const lastMessage = messages[messages.length - 1].content;
        
        // Generate a contextual mock response
        let response = "I'm your Biowell health coach. How can I help you today?";
        
        if (lastMessage.toLowerCase().includes('sleep')) {
          response = "Based on your interest in sleep improvement, I recommend Magnesium Glycinate (green-tier) at 300-400mg before bed to support deeper sleep and muscle relaxation. L-Theanine (green-tier) at 200mg can also help with sleep onset without causing grogginess. For best results, maintain a consistent sleep schedule and avoid screens 1 hour before bedtime.";
        } else if (lastMessage.toLowerCase().includes('energy')) {
          response = "To boost your energy levels naturally, I recommend B-Complex vitamins (green-tier) in the morning to support cellular energy production. Rhodiola Rosea (yellow-tier) at 200-400mg daily can help combat fatigue and improve mental performance under stress. Also consider optimizing your sleep quality and staying properly hydrated throughout the day.";
        } else if (lastMessage.toLowerCase().includes('stress') || lastMessage.toLowerCase().includes('anxiety')) {
          response = "For stress management, Ashwagandha (green-tier) at 300-600mg daily has strong evidence for reducing cortisol levels. L-Theanine (green-tier) at 200mg can promote relaxation without sedation. Combining these supplements with regular meditation, deep breathing exercises, and adequate sleep will provide the best results for stress reduction.";
        } else if (lastMessage.toLowerCase().includes('muscle') || lastMessage.toLowerCase().includes('workout')) {
          response = "For muscle building and recovery, Creatine Monohydrate (green-tier) at 5g daily is one of the most well-researched supplements. Whey Protein Isolate (green-tier) at 20-30g post-workout provides essential amino acids for muscle repair. For optimal results, ensure you're in a slight caloric surplus and following a progressive resistance training program.";
        } else if (lastMessage.toLowerCase().includes('hello') || lastMessage.toLowerCase().includes('hi')) {
          response = "Hello! I'm your Biowell health coach. I can help you with personalized supplement recommendations, sleep optimization, stress management, and more. What health goal would you like to focus on today?";
        }
        
        // Save to chat history if userId is provided
        if (userId) {
          try {
            await this.saveChatMessage(userId, lastMessage, response);
          } catch (error) {
            logError('Failed to save chat message', error);
            // Continue even if saving fails
          }
        }
        
        return response;
      }
      
      // Check if we're in a WebContainer environment
      if (isWebContainerEnvironment()) {
        console.log('WebContainer environment detected - using mock chat response');
        
        // Get the last message content
        const lastMessage = messages[messages.length - 1].content;
        
        // Generate a contextual mock response
        let response = "I'm your Biowell health coach. How can I help you today?";
        
        if (lastMessage.toLowerCase().includes('sleep')) {
          response = "Based on your interest in sleep improvement, I recommend Magnesium Glycinate (green-tier) at 300-400mg before bed to support deeper sleep and muscle relaxation. L-Theanine (green-tier) at 200mg can also help with sleep onset without causing grogginess. For best results, maintain a consistent sleep schedule and avoid screens 1 hour before bedtime.";
        } else if (lastMessage.toLowerCase().includes('energy')) {
          response = "To boost your energy levels naturally, I recommend B-Complex vitamins (green-tier) in the morning to support cellular energy production. Rhodiola Rosea (yellow-tier) at 200-400mg daily can help combat fatigue and improve mental performance under stress. Also consider optimizing your sleep quality and staying properly hydrated throughout the day.";
        } else if (lastMessage.toLowerCase().includes('stress') || lastMessage.toLowerCase().includes('anxiety')) {
          response = "For stress management, Ashwagandha (green-tier) at 300-600mg daily has strong evidence for reducing cortisol levels. L-Theanine (green-tier) at 200mg can promote relaxation without sedation. Combining these supplements with regular meditation, deep breathing exercises, and adequate sleep will provide the best results for stress reduction.";
        } else if (lastMessage.toLowerCase().includes('muscle') || lastMessage.toLowerCase().includes('workout')) {
          response = "For muscle building and recovery, Creatine Monohydrate (green-tier) at 5g daily is one of the most well-researched supplements. Whey Protein Isolate (green-tier) at 20-30g post-workout provides essential amino acids for muscle repair. For optimal results, ensure you're in a slight caloric surplus and following a progressive resistance training program.";
        } else if (lastMessage.toLowerCase().includes('hello') || lastMessage.toLowerCase().includes('hi')) {
          response = "Hello! I'm your Biowell health coach. I can help you with personalized supplement recommendations, sleep optimization, stress management, and more. What health goal would you like to focus on today?";
        }
        
        // Save to chat history if userId is provided
        if (userId) {
          try {
            await this.saveChatMessage(userId, lastMessage, response);
          } catch (error) {
            logError('Failed to save chat message', error);
            // Continue even if saving fails
          }
        }
        
        return response;
      }
      
      // Format messages for the API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add context data
      const context = {
        steps: 8432,
        sleep_score: 82,
        goal: "improve deep sleep",
        device: "Apple Watch"
      };
      
      // Use OpenAI API directly instead of Supabase Edge Function
      const lastMessage = formattedMessages[formattedMessages.length - 1].content;
      const response = await openaiApi.generateResponse(lastMessage, context);
      
      // Save to chat history if userId is provided
      if (userId) {
        try {
          await this.saveChatMessage(userId, lastMessage, response);
        } catch (error) {
          logError('Failed to save chat message', error);
          // Continue even if saving fails
        }
      }
      
      return response;
    } catch (error) {
      logError('Error in chat message', error);
      throw error;
    }
  },

  /**
   * Fetch chat history for a user
   */
  async getChatHistory(userId: string, limit: number = 10): Promise<ChatHistoryEntry[]> {
    // Return empty array in WebContainer environment
    if (isWebContainerEnvironment()) {
      console.log('WebContainer environment detected - returning mock chat history');
      return [];
    }
    
    return apiClient.request(
      async () => {
        const result = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
        return result;
      },
      'Failed to fetch chat history'
    );
  },

  /**
   * Save a chat message and response
   */
  async saveChatMessage(userId: string, message: string, response: string): Promise<void> {
    // Skip saving in WebContainer environment
    if (isWebContainerEnvironment()) {
      console.log('WebContainer environment detected - skipping chat history save');
      return;
    }
    
    await apiClient.request(
      async () => {
        const result = await supabase
          .from('chat_history')
          .insert({
            user_id: userId,
            message,
            response
          })
          .select();
        return result;
      },
      'Failed to save chat message'
    );
  }
};