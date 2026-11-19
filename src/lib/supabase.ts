import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// Values come from the .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase values. Copy .env.example to .env, add the URL and key, then restart with: npx expo start -c',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage, // saves the session on the phone so the user stays signed in
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // only needed for web apps
  },
});

// Refresh the session only while the app is open
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
