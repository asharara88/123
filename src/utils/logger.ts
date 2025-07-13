// Simple logger utility for the application
export const logError = (message: string, error?: any) => {
  console.error(`${new Date().toISOString()} ERROR: ${message}`, error);
};

export const logWarning = (message: string, data?: any) => {
  console.warn(`${new Date().toISOString()} WARNING: ${message}`, data);
};

export const logInfo = (message: string, data?: any) => {
  console.info(`${new Date().toISOString()} INFO: ${message}`, data);
};

export const logDebug = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.debug(`${new Date().toISOString()} DEBUG: ${message}`, data);
  }
};
