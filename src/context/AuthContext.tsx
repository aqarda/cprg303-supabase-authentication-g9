import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { AppState, Platform } from 'react-native';

import { getAuthErrorMessage } from '@/lib/authErrors';
import { getSupabase } from '@/lib/supabase';

// error is null when the request works, otherwise it is a message to show the user
export type AuthResult = { error: string | null };

// needsConfirmation is true when Supabase asks the user to confirm their email first
export type SignUpResult = AuthResult & { needsConfirmation: boolean };

export type SignUpInput = { fullName: string; email: string; password: string };
export type SignInInput = { email: string; password: string };

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  displayName: string | null; // full name, or email if there is no name
  isLoading: boolean; // true while the saved session loads when the app starts
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  signIn: (input: SignInInput) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// These functions never throw. Errors are returned as a message for the screen to show.
// The session itself is updated by onAuthStateChange inside AuthProvider.

async function signUp({ fullName, email, password }: SignUpInput): Promise<SignUpResult> {
  try {
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (error) {
      return { error: getAuthErrorMessage(error), needsConfirmation: false };
    }

    // No session means the user has to confirm their email before signing in
    return { error: null, needsConfirmation: data.session === null };
  } catch (error) {
    return { error: getAuthErrorMessage(error), needsConfirmation: false };
  }
}

async function signIn({ email, password }: SignInInput): Promise<AuthResult> {
  try {
    const { error } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error ? getAuthErrorMessage(error) : null };
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }
}

async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await getSupabase().auth.signOut();
    return { error: error ? getAuthErrorMessage(error) : null };
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }
}

function getDisplayName(user: User | null): string | null {
  if (!user) {
    return null;
  }

  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim() !== '') {
    return fullName.trim();
  }

  return user.email ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { auth } = getSupabase();
    // INITIAL_SESSION restores the saved user. Later events reflect sign-in and sign-out.
    const { data } = auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    function updateRefresh(state: string) {
      if (state === 'active') {
        void auth.startAutoRefresh();
      } else {
        void auth.stopAutoRefresh();
      }
    }

    const appState = Platform.OS === 'web'
      ? undefined
      : AppState.addEventListener('change', updateRefresh);
    if (appState && AppState.currentState) updateRefresh(AppState.currentState);

    return () => {
      data.subscription.unsubscribe();
      appState?.remove();
      if (appState) void auth.stopAutoRefresh();
    };
  }, []);

  const user = session?.user ?? null;

  const value: AuthContextValue = {
    session,
    user,
    displayName: getDisplayName(user),
    isLoading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
