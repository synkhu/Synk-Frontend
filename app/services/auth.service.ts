"use client";
import axios from "axios";

export interface UserSession {
  token: string;
  expiresAt: string;
  user?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private readonly SESSION_KEY = "user_session";
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;

  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  async login(credentials: LoginCredentials): Promise<UserSession> {
    try {
      const options = {
        method: "POST",
        url: "https://api.synk.hu/auth/login",
        headers: { "Content-Type": "application/json" },
        data: credentials,
      };

      const { data } = await axios.request(options);

      this.setSession(data);

      this.startSessionMonitoring();

      return data;
    } catch (error) {
      throw error;
    }
  }

  setSession(sessionData: UserSession): void {
    if (!this.isBrowser()) return;

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));

    if (sessionData.token) {
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${sessionData.token}`;
    }
  }

  private setupAxiosInterceptors(): void {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          this.dispatchSessionExpired();
        }
        return Promise.reject(error);
      },
    );
  }

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

  needsRefresh(): boolean {
    if (!this.isBrowser()) return false;

    const session = this.getSession();
    if (!session || !session.expiresAt) return true;

    const expiresAt = new Date(session.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    return timeUntilExpiry < this.TOKEN_REFRESH_THRESHOLD;
  }

  async refreshToken(): Promise<UserSession | null> {
    if (!this.isBrowser()) return null;

    try {
      const session = this.getSession();
      if (!session) return null;

      const response = await axios.post("https://api.synk.hu/auth/refresh", {
        token: session.token,
      });

      if (response.data) {
        this.setSession(response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearSession();
    }

    return null;
  }

  logout(): void {
    if (!this.isBrowser()) return;

    this.clearSession();
    this.stopSessionMonitoring();

    delete axios.defaults.headers.common["Authorization"];
  }

  private clearSession(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.SESSION_KEY);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    const session = this.getSession();
    return session?.token || null;
  }

  async sendVerificationEmail(): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error("No authentication token found.");

    try {
      await axios.post(
        "https://api.synk.hu/auth/send-verification-email",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw error;
    }
  }

  async getUserInfo(): Promise<any> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const options = {
        method: "GET",
        url: "https://api.synk.hu/users/me",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.request(options);
      return data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  }

  async isAdmin(): Promise<boolean> {
    const userInfo = await this.getUserInfo();
    return userInfo?.role === "Administrator" || userInfo?.role === "Organizer";
  }

  async canAccessAdminPages(): Promise<boolean> {
    return await this.isAdmin();
  }

  private sessionMonitorInterval: NodeJS.Timeout | null = null;

  private startSessionMonitoring(): void {
    if (!this.isBrowser()) return;

    this.stopSessionMonitoring();

    this.sessionMonitorInterval = setInterval(() => {
      if (!this.isSessionValid()) {
        this.logout();
        this.dispatchSessionExpired();
      } else if (this.needsRefresh()) {
        this.refreshToken().catch(() => {
          this.logout();
          this.dispatchSessionExpired();
        });
      }
    }, 60000);
  }

  private stopSessionMonitoring(): void {
    if (this.sessionMonitorInterval) {
      clearInterval(this.sessionMonitorInterval);
      this.sessionMonitorInterval = null;
    }
  }

  private dispatchSessionExpired(): void {
    if (!this.isBrowser()) return;
    const event = new CustomEvent("session-expired");
    window.dispatchEvent(event);
  }

  initialize(): void {
    if (!this.isBrowser()) return;

    this.setupAxiosInterceptors();

    const session = this.getSession();

    if (session && this.isSessionValid()) {
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${session.token}`;

      this.startSessionMonitoring();

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
