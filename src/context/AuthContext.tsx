/**
 * Authentication Context
 * 
 * This context provides authentication state and methods throughout the app.
 * It connects to Supabase Auth for real authentication.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile, 
  onAuthStateChange,
  getCurrentSession,
  UserProfile,
  UserRole
} from '@/services/authService';

// Re-export types for convenience
export type { UserRole, UserProfile };

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (authUser) {
        const { data } = await getUserProfile(authUser.id);
        setUser(data);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Check for existing session
    getCurrentSession().then(async (authUser) => {
      if (authUser) {
        const { data } = await getUserProfile(authUser.id);
        setUser(data);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await loginUser(email, password);
    if (data && !error) {
      setUser(data);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    const { data, error } = await registerUser(email, password, name, role);
    if (data && !error) {
      setUser(data);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
