import { usePartnership } from "@/src/features/partnership/usePartnership";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function MapScreen() {
  const { partnerInfo, fetchPartnerInfo, isLoading } = usePartnership();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetchPartnerInfo();
  }, []);

  const toggleLiveMode = () => {
    setIsLive(!isLive);
    // TODO: Implement actual Go Live functionality
  };

  const formatLastUpdate = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Map</Text>
        <Pressable
          style={[styles.liveButton, isLive && styles.liveButtonActive]}
          onPress={toggleLiveMode}
        >
          <View style={[styles.liveDot, isLive && styles.liveDotActive]} />
          <Text style={[styles.liveText, isLive && styles.liveTextActive]}>
            {isLive ? "Live" : "Go Live"}
          </Text>
        </Pressable>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider="google"
          initialRegion={{
            latitude: partnerInfo?.location?.latitude ?? 37.78825,
            longitude: partnerInfo?.location?.longitude ?? -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          // @ts-expect-error - googleMapsApiKey is needed for web maps
          googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        >
          {partnerInfo?.location && (
            <Marker
              coordinate={{
                latitude: partnerInfo.location.latitude,
                longitude: partnerInfo.location.longitude,
              }}
              title={partnerInfo.display_name || "Partner"}
            />
          )}
        </MapView>
      </View>

      {/* Partner info card */}
      <View style={styles.partnerCard}>
        {isLoading ? (
          <ActivityIndicator color="#5D4E37" />
        ) : partnerInfo?.error ? (
          <Text style={styles.errorText}>{partnerInfo.error}</Text>
        ) : (
          <>
            <View style={styles.partnerHeader}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#8B7355" />
              </View>
              <View style={styles.partnerDetails}>
                <Text style={styles.partnerName}>
                  {partnerInfo?.display_name || "Your Partner"}
                </Text>
                {partnerInfo?.location ? (
                  <Text style={styles.locationStatus}>
                    Updated {formatLastUpdate(partnerInfo.location.updated_at)}
                    {partnerInfo.location.is_live && " • Live"}
                  </Text>
                ) : (
                  <Text style={styles.locationStatus}>Location not shared</Text>
                )}
              </View>
              {partnerInfo?.battery && (
                <View style={styles.batteryInfo}>
                  <Ionicons
                    name={
                      partnerInfo.battery.is_charging
                        ? "battery-charging"
                        : partnerInfo.battery.level > 20
                        ? "battery-half"
                        : "battery-dead"
                    }
                    size={20}
                    color={partnerInfo.battery.level > 20 ? "#5D4E37" : "#E57373"}
                  />
                  <Text style={styles.batteryText}>
                    {partnerInfo.battery.level}%
                  </Text>
                </View>
              )}
            </View>

            {partnerInfo?.location && (
              <View style={styles.coordsRow}>
                <Text style={styles.coordsLabel}>
                  {partnerInfo.location.mode === "approximate"
                    ? "Approximate location"
                    : "Precise location"}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Nudge preview */}
      <View style={styles.nudgeCard}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#F0D071" />
        <Text style={styles.nudgeText}>
          No nudges right now. Check in when you want!
        </Text>
      </View>
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
  liveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  liveButtonActive: {
    backgroundColor: "#E8F5E9",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B8A88A",
  },
  liveDotActive: {
    backgroundColor: "#4CAF50",
  },
  liveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5D4E37",
  },
  liveTextActive: {
    color: "#4CAF50",
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 20,
    overflow: "hidden",
    minHeight: 300,
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  partnerCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#5D4E37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5EFE0",
    justifyContent: "center",
    alignItems: "center",
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#3D3225",
  },
  locationStatus: {
    fontSize: 13,
    color: "#8B7355",
    marginTop: 2,
  },
  batteryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5EFE0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  batteryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#5D4E37",
  },
  coordsRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5EFE0",
  },
  coordsLabel: {
    fontSize: 13,
    color: "#8B7355",
  },
  errorText: {
    fontSize: 14,
    color: "#E57373",
    textAlign: "center",
  },
  nudgeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3D3225",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  nudgeText: {
    flex: 1,
    fontSize: 14,
    color: "#F5EFE0",
    lineHeight: 20,
  },
});

