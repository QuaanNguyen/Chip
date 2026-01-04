import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/src/services/supabase";

export default function ConsentScreen() {
  const router = useRouter();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [batteryEnabled, setBatteryEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleContinue = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    // Create privacy settings with user's choices
    await supabase.from("privacy_settings").upsert({
      user_id: user.user.id,
      location_sharing_enabled: locationEnabled,
      share_battery: batteryEnabled,
      location_mode: "precise",
    });

    router.replace("/(main)/map");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy Settings</Text>
        <Text style={styles.subtitle}>
          Choose what you want to share with your partner. You can change these anytime.
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={styles.optionIcon}>
              <Ionicons name="location" size={24} color="#5D4E37" />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Location Sharing</Text>
              <Text style={styles.optionDescription}>
                Let your partner see where you are in real-time
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: "#E8DCC4", true: "#A5D6A7" }}
              thumbColor={locationEnabled ? "#4CAF50" : "#fff"}
            />
          </View>
          {locationEnabled && (
            <View style={styles.optionNote}>
              <Ionicons name="information-circle" size={16} color="#8B7355" />
              <Text style={styles.optionNoteText}>
                Both of you must enable this to see each other
              </Text>
            </View>
          )}
        </View>

        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={styles.optionIcon}>
              <Ionicons name="battery-half" size={24} color="#5D4E37" />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Battery Status</Text>
              <Text style={styles.optionDescription}>
                Share your phone's battery level
              </Text>
            </View>
            <Switch
              value={batteryEnabled}
              onValueChange={setBatteryEnabled}
              trackColor={{ false: "#E8DCC4", true: "#A5D6A7" }}
              thumbColor={batteryEnabled ? "#4CAF50" : "#fff"}
            />
          </View>
        </View>

        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={styles.optionIcon}>
              <Ionicons name="notifications" size={24} color="#5D4E37" />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Smart Nudges</Text>
              <Text style={styles.optionDescription}>
                Get gentle reminders to check in
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#E8DCC4", true: "#A5D6A7" }}
              thumbColor={notificationsEnabled ? "#4CAF50" : "#fff"}
            />
          </View>
        </View>
      </View>

      <View style={styles.privacyInfo}>
        <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
        <Text style={styles.privacyText}>
          Your data is encrypted and never shared outside your partnership. You can delete all data anytime.
        </Text>
      </View>

      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6E3",
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3D3225",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8B7355",
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5EFE0",
    justifyContent: "center",
    alignItems: "center",
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#3D3225",
  },
  optionDescription: {
    fontSize: 14,
    color: "#8B7355",
    marginTop: 2,
  },
  optionNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5EFE0",
  },
  optionNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#8B7355",
  },
  privacyInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: "#2E7D32",
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: "#F0D071",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#3D3225",
  },
});

