import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";

type Item = { id: number; title: string; description: string | null };

export default function PublicResourceList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("public_items")
          .select("id, title, description")
          .order("id");
        if (error) throw error;
        setItems(data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load data. Check your connection.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Public data</Text>
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !error && items.length === 0 ? <Text style={styles.empty}>No items yet.</Text> : null}
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, gap: 10 },
  heading: { fontSize: 18, fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: "#e5e5e5" },
  title: { fontSize: 16, fontWeight: "600" },
  desc: { fontSize: 14, color: "#555", marginTop: 4 },
  error: { color: "#d9534f" },
  empty: { color: "#777" },
});