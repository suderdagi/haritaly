import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUnauthorizedHandler, TOKEN_KEY } from '@/src/api/client';
import { User } from '@/src/types';

const USER_KEY = 'userData';

interface AuthContextType {
  user: User | null;
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = useCallback(async (token: string, userData: User) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(userData)],
    ]);
    setUserToken(token);
    setUser(userData);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setUserToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (userData: User) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Restore the session on app launch
  useEffect(() => {
    (async () => {
      try {
        const [[, token], [, userData]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
        if (token && userData) {
          setUserToken(token);
          setUser(JSON.parse(userData));
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // An expired token anywhere in the app sends the user back to login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  return (
    <AuthContext.Provider value={{ user, userToken, isLoading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
