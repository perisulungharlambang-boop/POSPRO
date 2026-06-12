/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ✅ HOOK: useSupabase - Simple wrapper untuk Supabase operations
 * Mempermudah penggunaan database di dalam components
 */

import { useEffect, useState } from 'react';
import { SupabaseAdapter } from '@/services/db/SupabaseAdapter';
import { getSupabaseClient } from '@/services/db/SupabaseService';

export const useSupabase = () => {
  const [db] = useState(() => new SupabaseAdapter());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async <T,>(
    query: () => Promise<T>,
    errorMessage = 'Operation failed'
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await query();
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : errorMessage;
      setError(msg);
      console.error('❌ Query error:', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    db,
    isLoading,
    error,
    executeQuery,
    client: getSupabaseClient(),
  };
};

/**
 * Hook untuk subscribe ke real-time updates
 * @example
 * const { data } = useRealtimeSubscription('products');
 */
export const useRealtimeSubscription = (tableName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const db = new SupabaseAdapter();

  useEffect(() => {
    const subscription = db.subscribeToTable(tableName, (payload) => {
      // Update state based on payload.eventType
      if (payload.eventType === 'INSERT') {
        setData((prev) => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setData((prev) =>
          prev.map((item) =>
            item.id === payload.new.id ? payload.new : item
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setData((prev) => prev.filter((item) => item.id !== payload.old.id));
      }
    });

    setIsLoading(false);

    return () => {
      db.unsubscribeFromTable(subscription);
    };
  }, [tableName]);

  return { data, isLoading };
};

/**
 * Hook untuk Authentication
 */
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const client = getSupabaseClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, [client]);

  return { user, isLoading };
};
