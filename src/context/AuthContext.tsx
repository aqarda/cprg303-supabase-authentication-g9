import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { getAuthErrorMessage } from '@/lib/authErrors';
import { supabase } from '@/lib/supabase';

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
    const { data, error } = await supabase.auth.signUp({
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
    const { error } = await supabase.auth.signInWithPassword({
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
    const { error } = await supabase.auth.signOut();
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
    let isMounted = true;

    // Load the saved session when the app starts
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setSession(data.session);
        }
      })
      .catch(() => {
        // If loading fails, continue as signed out
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // Update the session whenever the user signs in, signs out, or the token refreshes
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
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
