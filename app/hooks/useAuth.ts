// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return authService.isSessionValid();
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    checkAuth();
    
    // Listen for session changes
    const handleStorageChange = () => {
      checkAuth();
    };
    
    // Listen for session expired event
    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    const isValid = authService.isSessionValid();
    setIsAuthenticated(isValid);
    
    if (isValid) {
      const session = authService.getSession();
      setUser(session?.user || null);
    } else {
      setUser(null);
    }
    
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const session = await authService.login({ email, password });
      setIsAuthenticated(true);
      setUser(session.user || null);
      return session;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const getToken = () => {
    return authService.getToken();
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    getToken,
    checkAuth
  };
}