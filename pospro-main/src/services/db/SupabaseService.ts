/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ✅ SUPABASE SERVICE - Koneksi Client ke PostgreSQL via Supabase
 * ✅ Real-time sync support
 * ✅ Authentication & Row Level Security
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Inisialisasi koneksi Supabase
 * Harus dipanggil saat aplikasi startup sebelum mengakses database
 */
export const initSupabase = (): SupabaseClient => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '❌ Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  console.log('✅ Supabase client initialized successfully');
  return supabaseClient;
};

/**
 * Dapatkan instance Supabase client
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
};

/**
 * Helper untuk sign up
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('❌ Sign up error:', error);
    throw error;
  }

  return data;
};

/**
 * Helper untuk sign in
 */
export const signInWithEmail = async (email: string, password: string) => {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Sign in error:', error);
    throw error;
  }

  return data;
};

/**
 * Helper untuk sign out
 */
export const signOut = async () => {
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();

  if (error) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
};

/**
 * Dapatkan current user session
 */
export const getCurrentUser = async () => {
  const client = getSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  return user;
};

/**
 * Subscribe ke auth state changes
 */
export const onAuthStateChange = (callback: (user: any) => void) => {
  const client = getSupabaseClient();
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange(async (_event, session) => {
    callback(session?.user || null);
  });

  return subscription;
};
