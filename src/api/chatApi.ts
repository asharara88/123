import { apiClient } from './apiClient';
import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';
import { openaiApi } from './openaiApi'; 

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
      // Format messages for the API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Use OpenAI API directly instead of Supabase Edge Function
      const lastMessage = formattedMessages[formattedMessages.length - 1].content;
      const response = await openaiApi.generateResponse(lastMessage, { userId });
      
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
    return apiClient.request(
      async () => {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
        return { data: data || [], error };
      },
      'Failed to fetch chat history'
    );
  },

  /**
   * Save a chat message and response
   */
  async saveChatMessage(userId: string, message: string, response: string): Promise<void> {
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