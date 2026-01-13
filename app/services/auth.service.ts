"use client";
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

  // Check if we're in browser environment
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

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
    if (!this.isBrowser()) return;
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    
    // Also set axios default headers for future requests
    if (sessionData.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${sessionData.token}`;
    }
  }

  // Get current session
  getSession(): UserSession | null {
    if (!this.isBrowser()) return null;
    
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
    if (!this.isBrowser()) return false;
    
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
    if (!this.isBrowser()) return false;
    
    const session = this.getSession();
    if (!session || !session.expiresAt) return true;

    const expiresAt = new Date(session.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    return timeUntilExpiry < this.TOKEN_REFRESH_THRESHOLD;
  }

  // Refresh token (if your API supports it)
  async refreshToken(): Promise<UserSession | null> {
    if (!this.isBrowser()) return null;
    
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
    if (!this.isBrowser()) return;
    
    this.clearSession();
    this.stopSessionMonitoring();
    
    // Remove axios auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Optional: Notify API about logout
    // axios.post('https://api.synk.hu/auth/logout').catch(console.error);
  }

  // Clear session from storage
  private clearSession(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Get auth token
  getToken(): string | null {
    if (!this.isBrowser()) return null;
    const session = this.getSession();
    return session?.token || null;
  }

  // Get user info from identify endpoint
  async getUserInfo(): Promise<any> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const options = {
        method: 'GET',
        url: 'https://api.synk.hu/auth/identify',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const { data } = await axios.request(options);
      return data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  // Check if user is admin or organizer
  async isAdmin(): Promise<boolean> {
    const userInfo = await this.getUserInfo();
    return userInfo?.role === 'Administrator' || userInfo?.role === 'Organizer';
  }

  // Check if user can access admin pages (Administrator or Organizer)
  async canAccessAdminPages(): Promise<boolean> {
    return await this.isAdmin();
  }

  // Session monitoring for auto-refresh or logout
  private sessionMonitorInterval: NodeJS.Timeout | null = null;

  private startSessionMonitoring(): void {
    if (!this.isBrowser()) return;
    
    this.stopSessionMonitoring(); // Clear any existing interval
    
    this.sessionMonitorInterval = setInterval(() => {
      if (!this.isSessionValid()) {
        this.logout();
        // Optional: Dispatch event or redirect
        this.dispatchSessionExpired();
      } else if (this.needsRefresh()) {
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
    if (!this.isBrowser()) return;
    // Dispatch custom event that other components can listen to
    const event = new CustomEvent('session-expired');
    window.dispatchEvent(event);
  }

  // Check session on app start
  initialize(): void {
    if (!this.isBrowser()) return;
    
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