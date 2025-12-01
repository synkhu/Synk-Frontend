// services/auth.service.ts
import axios from 'axios';

export interface UserSession {
  token: string;
  expiresAt: string; // ISO date string
  user?: any; // You can type this properly based on your API response
}

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private readonly SESSION_KEY = 'user_session';
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  // Login and store session
  async login(credentials: LoginCredentials): Promise<UserSession> {
    try {
      const options = {
        method: 'POST',
        url: 'https://api.synk.hu/auth/login',
        headers: { 'Content-Type': 'application/json' },
        data: credentials
      };

      const { data } = await axios.request(options);
      
      // Store the session
      this.setSession(data);
      
      // Start session monitoring
      this.startSessionMonitoring();
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Store session in localStorage
  setSession(sessionData: UserSession): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    
    // Also set axios default headers for future requests
    if (sessionData.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${sessionData.token}`;
    }
  }

  // Get current session
  getSession(): UserSession | null {
    const sessionStr = localStorage.getItem(this.SESSION_KEY);
    if (!sessionStr) return null;
    
    try {
      return JSON.parse(sessionStr);
    } catch (error) {
      this.clearSession();
      return null;
    }
  }

  // Check if session is valid
  isSessionValid(): boolean {
    const session = this.getSession();
    if (!session || !session.token || !session.expiresAt) {
      return false;
    }

    const expiresAt = new Date(session.expiresAt);
    const now = new Date();
    
    return expiresAt > now;
  }

  // Check if session needs refresh
  needsRefresh(): boolean {
    const session = this.getSession();
    if (!session || !session.expiresAt) return true;

    const expiresAt = new Date(session.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    return timeUntilExpiry < this.TOKEN_REFRESH_THRESHOLD;
  }

  // Refresh token (if your API supports it)
  async refreshToken(): Promise<UserSession | null> {
    try {
      const session = this.getSession();
      if (!session) return null;

      // Example refresh endpoint - adjust based on your API
      const response = await axios.post('https://api.synk.hu/auth/refresh', {
        token: session.token
      });

      if (response.data) {
        this.setSession(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearSession();
    }
    
    return null;
  }

  // Logout and clear session
  logout(): void {
    this.clearSession();
    this.stopSessionMonitoring();
    
    // Remove axios auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Optional: Notify API about logout
    // axios.post('https://api.synk.hu/auth/logout').catch(console.error);
  }

  // Clear session from storage
  private clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Get auth token
  getToken(): string | null {
    const session = this.getSession();
    return session?.token || null;
  }

  // Session monitoring for auto-refresh or logout
  private sessionMonitorInterval: NodeJS.Timeout | null = null;

  private startSessionMonitoring(): void {
    this.stopSessionMonitoring(); // Clear any existing interval
    
    this.sessionMonitorInterval = setInterval(() => {
      if (!this.isSessionValid()) {
        console.log('Session expired, logging out...');
        this.logout();
        // Optional: Dispatch event or redirect
        this.dispatchSessionExpired();
      } else if (this.needsRefresh()) {
        console.log('Session needs refresh, attempting refresh...');
        this.refreshToken().catch(() => {
          // If refresh fails, logout
          this.logout();
          this.dispatchSessionExpired();
        });
      }
    }, 60000); // Check every minute
  }

  private stopSessionMonitoring(): void {
    if (this.sessionMonitorInterval) {
      clearInterval(this.sessionMonitorInterval);
      this.sessionMonitorInterval = null;
    }
  }

  private dispatchSessionExpired(): void {
    // Dispatch custom event that other components can listen to
    const event = new CustomEvent('session-expired');
    window.dispatchEvent(event);
  }

  // Check session on app start
  initialize(): void {
    const session = this.getSession();
    
    if (session && this.isSessionValid()) {
      // Set axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
      
      // Start monitoring
      this.startSessionMonitoring();
      
      // Refresh if needed
      if (this.needsRefresh()) {
        this.refreshToken().catch(() => {
          this.logout();
        });
      }
    } else {
      this.clearSession();
    }
  }
}

export const authService = new AuthService();