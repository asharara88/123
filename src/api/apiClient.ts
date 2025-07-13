// API client utilities and types
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  CLIENT = 'client',
  AUTHENTICATION = 'authentication',
  TIMEOUT = 'timeout'
}

export interface ApiError {
  type: ErrorType;
  message: string;
  originalError?: any;
  status?: number;
  setupRequired?: boolean;
}

export const apiClient = {
  /**
   * Generic request wrapper with error handling
   */
  async request<T>(
    requestFn: () => Promise<{ data: T; error: any }>,
    errorMessage: string = 'Request failed'
  ): Promise<T> {
    try {
      const result = await requestFn();
      
      if (result.error) {
        throw new Error(result.error.message || errorMessage);
      }
      
      return result.data;
    } catch (error) {
      const apiError: ApiError = {
        type: ErrorType.SERVER,
        message: error instanceof Error ? error.message : errorMessage,
        originalError: error
      };
      throw apiError;
    }
  },

  /**
   * Create a standardized API error
   */
  createError(type: ErrorType, message: string, originalError?: any, status?: number): ApiError {
    return {
      type,
      message,
      originalError,
      status
    };
  }
};
