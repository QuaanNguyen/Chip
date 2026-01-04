import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/src/services/supabase";
import { Tables } from "@/src/types/database";

type SharedPlace = Tables<"shared_places">;

const CATEGORIES = [
  { key: "restaurant", label: "Restaurant", icon: "restaurant" },
  { key: "cafe", label: "Café", icon: "cafe" },
  { key: "bar", label: "Bar", icon: "wine" },
  { key: "park", label: "Park", icon: "leaf" },
  { key: "activity", label: "Activity", icon: "bicycle" },
  { key: "shopping", label: "Shopping", icon: "bag" },
  { key: "date_spot", label: "Date Spot", icon: "heart" },
  { key: "general", label: "Other", icon: "location" },
] as const;

export default function PlacesScreen() {
  const [places, setPlaces] = useState<SharedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [newPlace, setNewPlace] = useState({
    name: "",
    category: "restaurant",
    address: "",
    notes: "",
  });

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("partnership_id")
        .single();

      if (!profile?.partnership_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("shared_places")
        .select("*")
        .eq("partnership_id", profile.partnership_id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPlaces(data);
      }
    } catch {
      // Handle error
    }
    setIsLoading(false);
  };

  const handleAddPlace = async () => {
    if (!newPlace.name) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("partnership_id")
        .single();

      if (!user.user || !profile?.partnership_id) return;

      // For demo, using dummy coordinates. In production, use geocoding API
      await supabase.from("shared_places").insert({
        partnership_id: profile.partnership_id,
        created_by: user.user.id,
        name: newPlace.name,
        category: newPlace.category,
        address: newPlace.address || null,
        notes: newPlace.notes || null,
        latitude: 0, // Would be geocoded in production
        longitude: 0,
      });

      setShowAddModal(false);
      setNewPlace({
        name: "",
        category: "restaurant",
        address: "",
        notes: "",
      });
      fetchPlaces();
    } catch {
      // Handle error
    }
  };

  const toggleVisited = async (place: SharedPlace) => {
    await supabase
      .from("shared_places")
      .update({
        visited: !place.visited,
        visited_at: !place.visited ? new Date().toISOString() : null,
      })
      .eq("id", place.id);
    fetchPlaces();
  };

  const getCategoryIcon = (category: string | null) => {
    return CATEGORIES.find((c) => c.key === category)?.icon || "location";
  };

  const filteredPlaces = filterCategory
    ? places.filter((p) => p.category === filterCategory)
    : places;

  const visitedCount = places.filter((p) => p.visited).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Places</Text>
        <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#3D3225" />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{places.length}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{visitedCount}</Text>
          <Text style={styles.statLabel}>Visited</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{places.length - visitedCount}</Text>
          <Text style={styles.statLabel}>To Try</Text>
        </View>
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
          onPress={() => setFilterCategory(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              !filterCategory && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            style={[
              styles.filterChip,
              filterCategory === cat.key && styles.filterChipActive,
            ]}
            onPress={() =>
              setFilterCategory(filterCategory === cat.key ? null : cat.key)
            }
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={filterCategory === cat.key ? "#3D3225" : "#8B7355"}
            />
            <Text
              style={[
                styles.filterChipText,
                filterCategory === cat.key && styles.filterChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D4E37" />
        </View>
      ) : filteredPlaces.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#D4C4A8" />
          <Text style={styles.emptyTitle}>No Places Yet</Text>
          <Text style={styles.emptyText}>
            Save your favorite spots to visit together
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredPlaces.map((place) => (
            <View key={place.id} style={styles.placeCard}>
              <Pressable
                style={[
                  styles.placeIcon,
                  place.visited && styles.placeIconVisited,
                ]}
                onPress={() => toggleVisited(place)}
              >
                <Ionicons
                  name={getCategoryIcon(place.category) as any}
                  size={22}
                  color={place.visited ? "#fff" : "#5D4E37"}
                />
              </Pressable>
              <View style={styles.placeContent}>
                <Text
                  style={[styles.placeName, place.visited && styles.placeNameVisited]}
                >
                  {place.name}
                </Text>
                {place.address && (
                  <Text style={styles.placeAddress}>{place.address}</Text>
                )}
                {place.notes && (
                  <Text style={styles.placeNotes}>{place.notes}</Text>
                )}
              </View>
              {place.rating && (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F0D071" />
                  <Text style={styles.ratingText}>{place.rating}</Text>
                </View>
              )}
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Add Place Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Place</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#5D4E37" />
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Place name"
              placeholderTextColor="#B8A88A"
              value={newPlace.name}
              onChangeText={(text) =>
                setNewPlace((prev) => ({ ...prev, name: text }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Address (optional)"
              placeholderTextColor="#B8A88A"
              value={newPlace.address}
              onChangeText={(text) =>
                setNewPlace((prev) => ({ ...prev, address: text }))
              }
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  style={[
                    styles.categoryButton,
                    newPlace.category === cat.key && styles.categoryButtonActive,
                  ]}
                  onPress={() =>
                    setNewPlace((prev) => ({ ...prev, category: cat.key }))
                  }
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={newPlace.category === cat.key ? "#3D3225" : "#8B7355"}
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes (optional)"
              placeholderTextColor="#B8A88A"
              value={newPlace.notes}
              onChangeText={(text) =>
                setNewPlace((prev) => ({ ...prev, notes: text }))
              }
              multiline
            />

            <Pressable style={styles.saveButton} onPress={handleAddPlace}>
              <Text style={styles.saveButtonText}>Save Place</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6E3",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3D3225",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0D071",
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3D3225",
  },
  statLabel: {
    fontSize: 13,
    color: "#8B7355",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E8DCC4",
  },
  filterScroll: {
    maxHeight: 48,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: "#F0D071",
  },
  filterChipText: {
    fontSize: 14,
    color: "#8B7355",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#3D3225",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3D3225",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 15,
    color: "#8B7355",
    textAlign: "center",
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  placeCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5EFE0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeIconVisited: {
    backgroundColor: "#4CAF50",
  },
  placeContent: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D3225",
  },
  placeNameVisited: {
    textDecorationLine: "line-through",
    color: "#8B7355",
  },
  placeAddress: {
    fontSize: 13,
    color: "#8B7355",
    marginTop: 2,
  },
  placeNotes: {
    fontSize: 13,
    color: "#B8A88A",
    marginTop: 4,
    fontStyle: "italic",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FDF6E3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5D4E37",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(61, 50, 37, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FDF6E3",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#3D3225",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: "#3D3225",
    marginBottom: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5D4E37",
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  categoryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryButtonActive: {
    backgroundColor: "#F0D071",
  },
  saveButton: {
    backgroundColor: "#F0D071",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D3225",
  },
});

