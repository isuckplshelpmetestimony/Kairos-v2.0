import React, { createContext, useContext, useState, useEffect } from 'react';

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
  login: (email: string, password: string) => Promise<boolean>;
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
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('kairos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('kairos_users') || '[]');
      const foundUser = users.find((u: User) => u.email === email);

      if (!foundUser) {
        throw new Error('User not found');
      }

      // Simple password check (in real app, use proper hashing)
      const passwords = JSON.parse(localStorage.getItem('kairos_passwords') || '{}');
      if (passwords[email] !== password) {
        throw new Error('Invalid password');
      }

      // Check if admin
      if (email === ADMIN_EMAIL) {
        foundUser.role = 'admin';
      }

      setUser(foundUser);
      localStorage.setItem('kairos_user', JSON.stringify(foundUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, phone: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('kairos_users') || '[]');
      const passwords = JSON.parse(localStorage.getItem('kairos_passwords') || '{}');

      // Check if user exists
      if (users.some((u: User) => u.email === email)) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        phone,
        role: email === ADMIN_EMAIL ? 'admin' : 'free',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      passwords[email] = password;

      localStorage.setItem('kairos_users', JSON.stringify(users));
      localStorage.setItem('kairos_passwords', JSON.stringify(passwords));

      setUser(newUser);
      localStorage.setItem('kairos_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kairos_user');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isPremium = () => {
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