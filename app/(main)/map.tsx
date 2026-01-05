import { usePartnership } from "@/src/features/partnership/usePartnership";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const isValidLocation = (loc: { latitude: number; longitude: number } | null | undefined) => {
  return loc && (loc.latitude !== 0 || loc.longitude !== 0);
};

const MINIMAL_MAP_STYLE = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f0f0f0" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { partnerInfo, fetchPartnerInfo, isLoading } = usePartnership();
  const [isLive, setIsLive] = useState(false);
  const prevCoordinatesRef = useRef<{ latitude: number; longitude: number } | null>(null);

  // Poll for partner info
  useEffect(() => {
    fetchPartnerInfo();
    const interval = setInterval(() => fetchPartnerInfo(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // Follow partner location when live mode is active
  useEffect(() => {
    if (!isLive || !isValidLocation(partnerInfo?.location) || !mapRef.current) return;

    const { latitude, longitude } = partnerInfo!.location!;
    const prev = prevCoordinatesRef.current;

    // Only animate if coordinates have actually changed
    if (!prev || prev.latitude !== latitude || prev.longitude !== longitude) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
      prevCoordinatesRef.current = { latitude, longitude };
    }
  }, [isLive, partnerInfo?.location?.latitude, partnerInfo?.location?.longitude]);

  const toggleLiveMode = () => {
    const newLiveState = !isLive;
    setIsLive(newLiveState);

    // When enabling live mode, immediately animate to partner's location
    if (newLiveState && isValidLocation(partnerInfo?.location) && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: partnerInfo!.location!.latitude,
        longitude: partnerInfo!.location!.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
      prevCoordinatesRef.current = {
        latitude: partnerInfo!.location!.latitude,
        longitude: partnerInfo!.location!.longitude,
      };
    }
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
        <Text style={styles.headerTitle}>Locate</Text>
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
          ref={mapRef}
          style={styles.map}
          provider="google"
          customMapStyle={MINIMAL_MAP_STYLE}
          initialRegion={{
            latitude: isValidLocation(partnerInfo?.location) ? partnerInfo!.location!.latitude : 37.78825,
            longitude: isValidLocation(partnerInfo?.location) ? partnerInfo!.location!.longitude : -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          // @ts-expect-error - googleMapsApiKey is needed for web maps
          googleMapsApiKey={GOOGLE_MAPS_API_KEY}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsTraffic={false}
          showsIndoors={false}
          showsBuildings={false}
          zoomControlEnabled={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          options={{
            disableDefaultUI: true,
            clickableIcons: false,
          }}
        >
          {isValidLocation(partnerInfo?.location) && (
            <Marker
              coordinate={{
                latitude: partnerInfo!.location!.latitude,
                longitude: partnerInfo!.location!.longitude,
              }}
            >
              <View style={styles.customMarker}>
                <View style={styles.markerDot} />
                <View style={styles.markerRing} />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      {/* Partner info card */}
      <View style={styles.partnerCard}>
        {isLoading && !partnerInfo ? (
          <ActivityIndicator color="#5D4E37" />
        ) : partnerInfo?.error ? (
          <Text style={styles.errorText}>{partnerInfo.error}</Text>
        ) : (
          <>
            <View style={styles.partnerHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {partnerInfo?.display_name?.[0]?.toUpperCase() || "P"}
                </Text>
              </View>
              <View style={styles.partnerDetails}>
                <Text style={styles.partnerName}>
                  {partnerInfo?.display_name || "Partner"}
                </Text>
                {isValidLocation(partnerInfo?.location) ? (
                  <Text style={styles.locationStatus}>
                    {formatLastUpdate(partnerInfo!.location!.updated_at)}
                    {partnerInfo!.location!.is_live && " • Live"}
                  </Text>
                ) : (
                  <Text style={styles.locationStatus}>No location yet</Text>
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
                    size={16}
                    color={partnerInfo.battery.level > 20 ? "#5D4E37" : "#E57373"}
                  />
                  <Text style={styles.batteryText}>
                    {partnerInfo.battery.level}%
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3D3225",
    letterSpacing: -0.5,
  },
  liveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(93, 78, 55, 0.1)",
  },
  liveButtonActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#B8A88A",
  },
  liveDotActive: {
    backgroundColor: "#4CAF50",
  },
  liveText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5D4E37",
  },
  liveTextActive: {
    color: "#4CAF50",
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    ...Platform.select({
      web: {
        boxShadow: "0 8px 24px rgba(61, 50, 37, 0.1)",
      },
      ios: {
        shadowColor: "#3D3225",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  customMarker: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
    zIndex: 2,
  },
  markerRing: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    zIndex: 1,
  },
  partnerCard: {
    position: "absolute",
    bottom: 32,
    left: 32,
    right: 32,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,1)",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0EAE0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5D4E37",
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3D3225",
    marginBottom: 2,
  },
  locationStatus: {
    fontSize: 12,
    color: "#8B7355",
    fontWeight: "500",
  },
  batteryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FAF8F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5D4E37",
  },
  errorText: {
    fontSize: 13,
    color: "#E57373",
    textAlign: "center",
  },
});

