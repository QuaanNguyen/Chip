import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/src/services/supabase";
import { usePartnership } from "@/src/features/partnership/usePartnership";
import { Tables } from "@/src/types/database";

type PrivacySettings = Tables<"privacy_settings">;

export default function SettingsScreen() {
  const router = useRouter();
  const { dissolve, hasPartnership, status, inviteCode } = usePartnership();
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; email: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("user_id", user.user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch privacy settings
      const { data: privacyData } = await supabase
        .from("privacy_settings")
        .select("*")
        .eq("user_id", user.user.id)
        .single();

      if (privacyData) {
        setPrivacy(privacyData);
      }
    } catch {
      // Handle error
    }
    setIsLoading(false);
  };

  const updatePrivacy = async (updates: Partial<PrivacySettings>) => {
    if (!privacy) return;

    const newPrivacy = { ...privacy, ...updates };
    setPrivacy(newPrivacy);

    await supabase
      .from("privacy_settings")
      .update(updates)
      .eq("id", privacy.id);
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/");
        },
      },
    ]);
  };

  const handleDissolvePartnership = () => {
    Alert.alert(
      "End Partnership",
      "This will permanently end your partnership. All shared data will be deleted. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Partnership",
          style: "destructive",
          onPress: async () => {
            await dissolve();
            router.replace("/pairing");
          },
        },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all your location history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { data: user } = await supabase.auth.getUser();
            if (user.user) {
              await supabase
                .from("user_locations")
                .delete()
                .eq("user_id", user.user.id);
            }
            Alert.alert("Done", "Your location history has been deleted.");
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#5D4E37" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color="#8B7355" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.display_name || "Set your name"}
              </Text>
              <Text style={styles.profileEmail}>{profile?.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B8A88A" />
          </View>
        </View>
      </View>

      {/* Partnership Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Partnership</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Status</Text>
              <Text style={styles.settingValue}>
                {hasPartnership
                  ? status === "active"
                    ? "Paired"
                    : "Waiting for partner"
                  : "Not paired"}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                status === "active" && styles.statusBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  status === "active" && styles.statusBadgeTextActive,
                ]}
              >
                {status === "active" ? "Active" : status === "pending" ? "Pending" : "None"}
              </Text>
            </View>
          </View>

          {status === "pending" && inviteCode && (
            <View style={styles.inviteCodeRow}>
              <Text style={styles.inviteCodeLabel}>Your invite code:</Text>
              <Text style={styles.inviteCode}>{inviteCode}</Text>
            </View>
          )}

          {hasPartnership && (
            <Pressable style={styles.dangerButton} onPress={handleDissolvePartnership}>
              <Ionicons name="heart-dislike-outline" size={20} color="#E57373" />
              <Text style={styles.dangerButtonText}>End Partnership</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="location-outline" size={22} color="#5D4E37" />
              <Text style={styles.settingLabel}>Share Location</Text>
            </View>
            <Switch
              value={privacy?.location_sharing_enabled ?? false}
              onValueChange={(value) =>
                updatePrivacy({ location_sharing_enabled: value })
              }
              trackColor={{ false: "#E8DCC4", true: "#A5D6A7" }}
              thumbColor={privacy?.location_sharing_enabled ? "#4CAF50" : "#fff"}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="battery-half-outline" size={22} color="#5D4E37" />
              <Text style={styles.settingLabel}>Share Battery</Text>
            </View>
            <Switch
              value={privacy?.share_battery ?? false}
              onValueChange={(value) => updatePrivacy({ share_battery: value })}
              trackColor={{ false: "#E8DCC4", true: "#A5D6A7" }}
              thumbColor={privacy?.share_battery ? "#4CAF50" : "#fff"}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="pause-circle-outline" size={22} color="#5D4E37" />
              <Text style={styles.settingLabel}>Privacy Pause</Text>
            </View>
            <Switch
              value={privacy?.privacy_paused ?? false}
              onValueChange={(value) => updatePrivacy({ privacy_paused: value })}
              trackColor={{ false: "#E8DCC4", true: "#FFCC80" }}
              thumbColor={privacy?.privacy_paused ? "#FF9800" : "#fff"}
            />
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.settingButton}>
            <Ionicons name="navigate-outline" size={22} color="#5D4E37" />
            <View style={styles.settingButtonContent}>
              <Text style={styles.settingLabel}>Location Mode</Text>
              <Text style={styles.settingValue}>
                {privacy?.location_mode === "approximate" ? "Approximate" : "Precise"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B8A88A" />
          </Pressable>

          <Pressable style={styles.settingButton}>
            <Ionicons name="moon-outline" size={22} color="#5D4E37" />
            <View style={styles.settingButtonContent}>
              <Text style={styles.settingLabel}>Quiet Hours</Text>
              <Text style={styles.settingValue}>
                {privacy?.quiet_hours_start && privacy?.quiet_hours_end
                  ? `${privacy.quiet_hours_start} - ${privacy.quiet_hours_end}`
                  : "Not set"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B8A88A" />
          </Pressable>
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <Pressable style={styles.dangerButton} onPress={handleDeleteData}>
            <Ionicons name="trash-outline" size={20} color="#E57373" />
            <Text style={styles.dangerButtonText}>Delete Location History</Text>
          </Pressable>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <View style={styles.card}>
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color="#5D4E37" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6E3",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3D3225",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B7355",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5EFE0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#3D3225",
  },
  profileEmail: {
    fontSize: 14,
    color: "#8B7355",
    marginTop: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#3D3225",
  },
  settingValue: {
    fontSize: 14,
    color: "#8B7355",
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  settingButtonContent: {
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#F5EFE0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: "#E8F5E9",
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8B7355",
  },
  statusBadgeTextActive: {
    color: "#4CAF50",
  },
  inviteCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  inviteCodeLabel: {
    fontSize: 14,
    color: "#8B7355",
  },
  inviteCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5D4E37",
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F5EFE0",
    marginHorizontal: 16,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: "#FFF5F5",
    borderRadius: 14,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#E57373",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#5D4E37",
  },
});

