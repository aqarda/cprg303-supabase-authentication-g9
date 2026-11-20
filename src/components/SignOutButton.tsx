import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function SignOutButton() {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePress() {
    setBusy(true);
    setError(null);
    const result = await signOut();
    setError(result.error);
    setBusy(false);
  }

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityLabel="Sign out"
        disabled={busy} accessibilityState={{ busy, disabled: busy }} onPress={handlePress}>
        {busy ? <ActivityIndicator /> : <Text style={styles.label}>Sign out</Text>}
      </Pressable>
      {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "flex-end", maxWidth: 190 },
  label: { color: "#234d88", fontWeight: "600", padding: 8 },
  error: { color: "#a5272b", fontSize: 12 },
});
