// packages/frontend/src/services/api/csrf.service.ts
import axios from 'axios';

/**
 * CSRF Token Service
 * Handles retrieving and storing CSRF tokens for secure API requests
 */
export class CsrfService {
  private static token: string | null = null;
  private static tokenPromise: Promise<string> | null = null;

  /**
   * Get the current CSRF token, fetching a new one if needed
   */
  public static async getToken(): Promise<string> {
    // If we already have a token, return it
    if (this.token) {
      return this.token;
    }

    // If we're already fetching a token, return that promise
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // Try to get token from cookie first
    const cookieToken = this.getTokenFromCookie();
    if (cookieToken) {
      this.token = cookieToken;
      return cookieToken;
    }

    // Otherwise, fetch a new token
    this.tokenPromise = this.fetchNewToken();
    
    try {
      this.token = await this.tokenPromise;
      return this.token;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      throw error;
    } finally {
      this.tokenPromise = null;
    }
  }

  /**
   * Fetch a new CSRF token from the server
   */
  private static async fetchNewToken(): Promise<string> {
    try {
      const response = await axios.get('/api/auth/csrf-token');
      
      if (response.data && response.data.csrfToken) {
        return response.data.csrfToken;
      }
      
      throw new Error('Invalid response from CSRF token endpoint');
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }

  /**
   * Get CSRF token from cookie if available
   */
  private static getTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Apply CSRF token to API request config
   */
  public static applyToRequest(config: any): any {
    if (this.token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['X-CSRF-Token'] = this.token;
    }
    return config;
  }

  /**
   * Reset the token (useful after logout)
   */
  public static resetToken(): void {
    this.token = null;
  }
}

// Configure axios to automatically include CSRF token in all requests
axios.interceptors.request.use(async (config) => {
  try {
    const token = await CsrfService.getToken();
    return CsrfService.applyToRequest(config);
  } catch (error) {
    // If we can't get a token, continue without it - the server will handle the error
    console.warn('Failed to apply CSRF token to request:', error);
    return config;
  }
});

export default CsrfService;