import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import ProtectedList from "../components/ProtectedList";
import SignOutButton from "../components/SignOutButton";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.name ?? user?.email ?? "Signed in";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: displayName, headerRight: () => <SignOutButton /> }} />
      <ProtectedList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6" },
});