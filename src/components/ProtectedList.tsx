import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { getSupabase } from "../lib/supabase";

type Item = { id: number; title: string; body: string | null };

export default function ProtectedList() {
  const { session } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [request, setRequest] = useState(0);
  const userId = session?.user.id;

  function reload() {
    setLoading(true);
    setError(null);
    setRequest((previous) => previous + 1);
  }

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();

    async function load() {
      try {
        const { data, error } = await getSupabase()
          .from("member_resources")
          .select("id, title, body")
          .order("id")
          .abortSignal(controller.signal);
        if (controller.signal.aborted) return;
        if (error) setError(error.message);
        else setItems(data ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setError("Could not load data. Check your connection.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [userId, request]);

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
        <Text style={styles.retry} onPress={reload}>Tap to retry</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={styles.heading}>Members-only data</Text>}
      ListEmptyComponent={<Text style={styles.empty}>No items found.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          {item.body ? <Text style={styles.desc}>{item.body}</Text> : null}
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
