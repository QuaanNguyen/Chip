import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/src/services/supabase";
import { Tables } from "@/src/types/database";

type CalendarEvent = Tables<"calendar_events">;

const EVENT_TYPES = [
  { key: "anniversary", label: "Anniversary", icon: "heart" },
  { key: "birthday", label: "Birthday", icon: "gift" },
  { key: "milestone", label: "Milestone", icon: "trophy" },
  { key: "date", label: "Date Night", icon: "restaurant" },
  { key: "reminder", label: "Reminder", icon: "notifications" },
  { key: "other", label: "Other", icon: "calendar" },
] as const;

export default function CalendarScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    event_type: "anniversary" as string,
    event_date: "",
    description: "",
    is_recurring: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
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
        .from("calendar_events")
        .select("*")
        .eq("partnership_id", profile.partnership_id)
        .order("event_date", { ascending: true });

      if (!error && data) {
        setEvents(data);
      }
    } catch {
      // Handle error
    }
    setIsLoading(false);
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.event_date) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("partnership_id")
        .single();

      if (!user.user || !profile?.partnership_id) return;

      await supabase.from("calendar_events").insert({
        partnership_id: profile.partnership_id,
        created_by: user.user.id,
        title: newEvent.title,
        event_type: newEvent.event_type,
        event_date: newEvent.event_date,
        description: newEvent.description || null,
        is_recurring: newEvent.is_recurring,
        recurrence_type: newEvent.is_recurring ? "yearly" : null,
      });

      setShowAddModal(false);
      setNewEvent({
        title: "",
        event_type: "anniversary",
        event_date: "",
        description: "",
        is_recurring: true,
      });
      fetchEvents();
    } catch {
      // Handle error
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set event to this year
    const thisYear = new Date(
      today.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );
    
    // If already passed this year, use next year
    if (thisYear < today) {
      thisYear.setFullYear(thisYear.getFullYear() + 1);
    }
    
    const diffTime = thisYear.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEventIcon = (type: string) => {
    return EVENT_TYPES.find((t) => t.key === type)?.icon || "calendar";
  };

  const upcomingEvents = events
    .map((e) => ({ ...e, daysUntil: getDaysUntil(e.event_date) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#3D3225" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D4E37" />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#D4C4A8" />
          <Text style={styles.emptyTitle}>No Events Yet</Text>
          <Text style={styles.emptyText}>
            Add your first special date to start tracking
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.emptyButtonText}>Add First Event</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Next upcoming highlight */}
          {upcomingEvents[0] && (
            <View style={styles.highlightCard}>
              <View style={styles.highlightIcon}>
                <Ionicons
                  name={getEventIcon(upcomingEvents[0].event_type) as any}
                  size={28}
                  color="#F0D071"
                />
              </View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightLabel}>Coming Up</Text>
                <Text style={styles.highlightTitle}>
                  {upcomingEvents[0].title}
                </Text>
                <Text style={styles.highlightDays}>
                  {upcomingEvents[0].daysUntil === 0
                    ? "Today!"
                    : upcomingEvents[0].daysUntil === 1
                    ? "Tomorrow"
                    : `${upcomingEvents[0].daysUntil} days`}
                </Text>
              </View>
            </View>
          )}

          {/* Events list */}
          <Text style={styles.sectionTitle}>All Events</Text>
          {upcomingEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View
                style={[
                  styles.eventIcon,
                  event.daysUntil <= 7 && styles.eventIconSoon,
                ]}
              >
                <Ionicons
                  name={getEventIcon(event.event_type) as any}
                  size={20}
                  color={event.daysUntil <= 7 ? "#F0D071" : "#8B7355"}
                />
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>
                  {new Date(event.event_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                  {event.is_recurring && " • Yearly"}
                </Text>
              </View>
              <View style={styles.eventDays}>
                <Text
                  style={[
                    styles.eventDaysNumber,
                    event.daysUntil <= 7 && styles.eventDaysSoon,
                  ]}
                >
                  {event.daysUntil}
                </Text>
                <Text style={styles.eventDaysLabel}>days</Text>
              </View>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Add Event Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Event</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#5D4E37" />
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Event name"
              placeholderTextColor="#B8A88A"
              value={newEvent.title}
              onChangeText={(text) =>
                setNewEvent((prev) => ({ ...prev, title: text }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#B8A88A"
              value={newEvent.event_date}
              onChangeText={(text) =>
                setNewEvent((prev) => ({ ...prev, event_date: text }))
              }
            />

            <Text style={styles.inputLabel}>Event Type</Text>
            <View style={styles.typeGrid}>
              {EVENT_TYPES.map((type) => (
                <Pressable
                  key={type.key}
                  style={[
                    styles.typeButton,
                    newEvent.event_type === type.key && styles.typeButtonActive,
                  ]}
                  onPress={() =>
                    setNewEvent((prev) => ({ ...prev, event_type: type.key }))
                  }
                >
                  <Ionicons
                    name={type.icon as any}
                    size={18}
                    color={
                      newEvent.event_type === type.key ? "#3D3225" : "#8B7355"
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      newEvent.event_type === type.key &&
                        styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.recurringToggle}
              onPress={() =>
                setNewEvent((prev) => ({
                  ...prev,
                  is_recurring: !prev.is_recurring,
                }))
              }
            >
              <Ionicons
                name={
                  newEvent.is_recurring
                    ? "checkbox"
                    : "square-outline"
                }
                size={22}
                color="#5D4E37"
              />
              <Text style={styles.recurringText}>Repeat yearly</Text>
            </Pressable>

            <Pressable style={styles.saveButton} onPress={handleAddEvent}>
              <Text style={styles.saveButtonText}>Save Event</Text>
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
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: "#F0D071",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D3225",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  highlightCard: {
    backgroundColor: "#3D3225",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 28,
  },
  highlightIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(240, 208, 113, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  highlightContent: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: 12,
    color: "#B8A88A",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  highlightTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F5EFE0",
    marginTop: 4,
  },
  highlightDays: {
    fontSize: 15,
    color: "#F0D071",
    fontWeight: "500",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B7355",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5EFE0",
    justifyContent: "center",
    alignItems: "center",
  },
  eventIconSoon: {
    backgroundColor: "#FDF6E3",
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D3225",
  },
  eventDate: {
    fontSize: 13,
    color: "#8B7355",
    marginTop: 2,
  },
  eventDays: {
    alignItems: "center",
  },
  eventDaysNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5D4E37",
  },
  eventDaysSoon: {
    color: "#F0D071",
  },
  eventDaysLabel: {
    fontSize: 11,
    color: "#8B7355",
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
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5D4E37",
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  typeButtonActive: {
    backgroundColor: "#F0D071",
  },
  typeButtonText: {
    fontSize: 14,
    color: "#8B7355",
  },
  typeButtonTextActive: {
    color: "#3D3225",
    fontWeight: "500",
  },
  recurringToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  recurringText: {
    fontSize: 15,
    color: "#5D4E37",
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

