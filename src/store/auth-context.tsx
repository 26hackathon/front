import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { decodeJwt } from '@/lib/api';

export type User = {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN' | 'SUSPENDED' | 'DELETED';
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  login: (
    accessToken: string,
    refreshToken: string,
    nickname?: string,
    userId?: number,
    profileImageUrl?: string | null
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tokens and user on mount
    const loadTokensAndUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          setAccessToken(token);
          
          // Load stored user profile
          const storedUser = await SecureStore.getItemAsync('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // Decode ID from JWT as fallback
            const decoded = decodeJwt(token);
            if (decoded && decoded.sub) {
              const userId = parseInt(decoded.sub, 10) || 0;
              const fallbackUser: User = {
                id: userId,
                nickname: `User_${userId}`,
                profileImageUrl: null,
                status: 'ACTIVE',
              };
              setUser(fallbackUser);
              await SecureStore.setItemAsync('user', JSON.stringify(fallbackUser));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load token or user:', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTokensAndUser();
  }, []);

  const login = async (
    newAccessToken: string,
    newRefreshToken: string,
    nickname?: string,
    userId?: number,
    profileImageUrl?: string | null
  ) => {
    try {
      await SecureStore.setItemAsync('accessToken', newAccessToken);
      await SecureStore.setItemAsync('refreshToken', newRefreshToken);
      setAccessToken(newAccessToken);

      // Extract user ID from accessToken or parameter
      const decoded = decodeJwt(newAccessToken);
      const resolvedUserId = userId ?? (decoded?.sub ? (parseInt(decoded.sub, 10) || 0) : 0);

      const loadedUser: User = {
        id: resolvedUserId,
        nickname: nickname ?? `User_${resolvedUserId}`,
        profileImageUrl: profileImageUrl ?? null,
        status: 'ACTIVE',
      };

      setUser(loadedUser);
      await SecureStore.setItemAsync('user', JSON.stringify(loadedUser));
    } catch (e) {
      console.error('Failed to save tokens:', e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      setAccessToken(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to clear tokens:', e);
      throw e;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return;
      const updated = { ...user, ...userData };
      setUser(updated);
      await SecureStore.setItemAsync('user', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update user in SecureStore:', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        accessToken,
        user,
        login,
        logout,
        updateUser,
        isLoading,
      }}
    >
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
