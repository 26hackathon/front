import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getPostLogs, getInProgressPosts, ProgressLog, PostResponse } from '@/lib/api';
import { useAuth } from './auth-context';

type ProgressContextType = {
  inProgressPosts: PostResponse[];
  activityLogs: ProgressLog[];
  refreshProgress: () => Promise<void>;
  isInProgress: (postId: number) => boolean;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [inProgressPosts, setInProgressPosts] = useState<PostResponse[]>([]);
  const [activityLogs, setActivityLogs] = useState<ProgressLog[]>([]);

  const refreshProgress = useCallback(async () => {
    if (!user) {
      setInProgressPosts([]);
      setActivityLogs([]);
      return;
    }
    
    try {
      const [logs, posts] = await Promise.all([
        getPostLogs(4), // get top 4 logs
        getInProgressPosts(20), // max 20 in progress
      ]);
      
      setActivityLogs(logs);
      setInProgressPosts(posts);
    } catch (error) {
      console.error('Failed to fetch progress state:', error);
    }
  }, [user]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const isInProgress = useCallback((postId: number) => {
    return inProgressPosts.some(post => post.id === postId);
  }, [inProgressPosts]);

  return (
    <ProgressContext.Provider value={{ inProgressPosts, activityLogs, refreshProgress, isInProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextType {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
