import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

type Item = { id: number; title: string; description: string | null };

export default function ProtectedList() {
  const { session } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("protected_items")
        .select("id, title, description")
        .order("id");
      if (error) throw error;
      setItems(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.retry} onPress={load}>Tap to retry</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={styles.heading}>Members-only data</Text>}
      ListEmptyComponent={<Text style={styles.empty}>No items found.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  list: { padding: 16, gap: 12 },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#e5e5e5" },
  title: { fontSize: 16, fontWeight: "600" },
  desc: { fontSize: 14, color: "#555", marginTop: 4 },
  error: { color: "#d9534f", fontSize: 15, textAlign: "center" },
  retry: { color: "#0a7ea4", fontWeight: "600" },
  empty: { textAlign: "center", color: "#777", marginTop: 24 },
});