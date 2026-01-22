import { ACCESS_TOKEN_KEY, clearTokens, REFRESH_TOKEN_KEY, setTokens } from '@/services/api';
import { authService, userService } from '@/services/user';
import { AuthTokens, User, UserRole } from '@/types';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}

interface AuthContextType extends AuthState {
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    role: null,
  });

  // Check for existing tokens on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (accessToken) {
          // Fetch user profile
          const response = await userService.getProfile();
          setState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            role: response.data.role,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            role: null,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await clearTokens();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          role: null,
        });
      }
    };

    checkAuth();
  }, []);

  // Login with tokens
  const login = useCallback(async (tokens: AuthTokens) => {
    try {
      await setTokens(tokens.accessToken, tokens.refreshToken);
      
      // Fetch user profile
      const response = await userService.getProfile();
      setState({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
        role: response.data.role,
      });
    } catch (error) {
      console.error('Login failed:', error);
      await clearTokens();
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await clearTokens();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        role: null,
      });
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await userService.getProfile();
      setState(prev => ({
        ...prev,
        user: response.data,
        role: response.data.role,
      }));
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
