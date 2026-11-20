import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { supabaseSetupError } from "../lib/supabase";

function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" />
        <Text style={styles.splashText}>Restoring session...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="explore" options={{ title: "Explore" }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" options={{ title: "Sign In" }} />
        <Stack.Screen name="sign-up" options={{ title: "Sign Up" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  if (supabaseSetupError) {
    return (
      <View style={styles.splash}>
        <Text accessibilityRole="header" style={styles.heading}>Supabase setup</Text>
        <Text style={styles.splashText}>{supabaseSetupError}</Text>
        <Text style={styles.splashText}>After saving .env, restart Expo with npx expo start --clear.</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "700", color: "#171717" },
  splashText: { fontSize: 16, color: "#555", textAlign: "center" },
});
