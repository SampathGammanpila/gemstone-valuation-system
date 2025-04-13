import React, { createContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/api/auth.service';
import userService from '../services/api/user.service';
import { User, LoginInput, RegisterInput } from '../types/user.types';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginInput) => Promise<void>;
  register: (userData: RegisterInput) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  clearError: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => ({ success: false, message: '' }),
  logout: () => {},
  clearError: () => {}
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initial authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isLoggedIn()) {
          const userProfile = await userService.getUserProfile();
          setUser(userProfile.user);
          setProfile(userProfile.profile);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginInput) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      setUser(response.user);
      setProfile(response.profile);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterInput) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      return response;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};