import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { config } from '../config';

interface User {
  id: string;
  email: string;
  phone: string;
  role: 'admin' | 'premium' | 'free';
  status: 'active' | 'pending' | 'expired';
  createdAt: string;
  premiumUntil?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean | 'unauthorized'>;
  signup: (email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isPremium: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Admin credentials
  const ADMIN_EMAIL = 'seanmacalintal0409@gmail.com';
  const ADMIN_PHONE = '09291860540';

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await apiClient.verifyToken();
        if (response.data) {
          setUser(response.data.user);
          localStorage.setItem('kairos_user', JSON.stringify(response.data.user));
        } else {
          // Token invalid, clear localStorage
          setUser(null);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('kairos_user');
        }
      } else {
        setUser(null);
        localStorage.removeItem('kairos_user');
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean | 'unauthorized'> => {
    try {
      const response = await apiClient.login(email, password);
      if (response.error) {
        console.error('Login error:', response.error);
        if (response.status === 401) {
          return 'unauthorized';
        }
        return false;
      }
      if (response.data) {
        const { user, token } = response.data;
        // Store token
        localStorage.setItem('auth_token', token);
        // Immediately verify token with backend to get fresh user info
        const verifyResponse = await apiClient.verifyToken();
        if (verifyResponse.data) {
          setUser(verifyResponse.data.user);
          localStorage.setItem('kairos_user', JSON.stringify(verifyResponse.data.user));
        } else {
          setUser(user);
          localStorage.setItem('kairos_user', JSON.stringify(user));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, phone: string): Promise<boolean> => {
    try {
      const response = await apiClient.register(email, password, phone);
      if (response.error) {
        console.error('Signup error:', response.error);
        return false;
      }
      if (response.data) {
        const { user, token } = response.data;
        // Store token
        localStorage.setItem('auth_token', token);
        // Store user
        setUser(user);
        localStorage.setItem('kairos_user', JSON.stringify(user));
      return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kairos_user');
    localStorage.removeItem('auth_token');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isPremium = () => {
    // If premium requirements are disabled, treat all authenticated users as premium
    if (config.DISABLE_PREMIUM_REQUIREMENTS && user) {
      return true;
    }
    return user?.role === 'premium' || user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAdmin,
      isPremium
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 