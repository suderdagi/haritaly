import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '@/src/types';

interface AuthContextType {
  user: User | null;
  userToken: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  register: (token: string, user: User) => Promise<void>;
  restoreToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore token on app launch
  const restoreToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        setUserToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error('Failed to restore token', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Login action
  const login = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUserToken(token);
      setUser(userData);
    } catch (e) {
      console.error('Failed to save auth data', e);
      throw e;
    }
  };

  // Register action
  const register = async (token: string, userData: User) => {
    await login(token, userData);
  };

  // Logout action
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUserToken(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to logout', e);
      throw e;
    }
  };

  useEffect(() => {
    restoreToken();
  }, []);

  const value: AuthContextType = {
    user,
    userToken,
    isLoading,
    login,
    logout,
    register,
    restoreToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
