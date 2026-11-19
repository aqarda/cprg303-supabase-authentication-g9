import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

function connect() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, '');
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) {
    return { client: null, error: 'Add the project URL and publishable key to .env beside package.json.' };
  }

  try {
    const client = createClient(url, key, {
      auth: {
        // Expo SQLite supplies storage on the phone. Supabase detects browser storage on web.
        storage: Platform.OS === 'web' ? undefined : globalThis.localStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
    return { client, error: null };
  } catch (error) {
    return { client: null, error: error instanceof Error ? error.message : 'Check the Supabase project URL in .env.' };
  }
}

export const { client: supabase, error: supabaseSetupError } = connect();

export function getSupabase() {
  if (!supabase) throw new Error(supabaseSetupError ?? 'Supabase is unavailable.');
  return supabase;
}
