// utils/error-handler.ts
export class ErrorHandler {
  static getReadableError(error: any): string {
    if (!error) {
      return 'An unknown error occurred';
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    if (error.error && error.error.message) {
      return error.error.message;
    }
    
    return 'An unexpected error occurred';
  }
  
  static isNetworkError(error: any): boolean {
    if (!error) {
      return false;
    }
    
    const errorString = JSON.stringify(error).toLowerCase();
    return errorString.includes('network') || 
           errorString.includes('connection') || 
           errorString.includes('offline') ||
           errorString.includes('internet');
  }
}