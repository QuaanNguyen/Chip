import { supabase } from "@/src/services/supabase";
import { TablesInsert } from "@/src/types/database";

export type LocationUpdate = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  batteryLevel?: number;
  isCharging?: boolean;
  isLive?: boolean;
  liveExpiresAt?: string;
};

/**
 * Update user's location
 */
export async function updateLocation(location: LocationUpdate): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("partnership_id")
    .eq("user_id", user.user.id)
    .single();

  if (!profile?.partnership_id) {
    throw new Error("No active partnership");
  }

  // Get user's privacy settings
  const { data: privacy } = await supabase
    .from("privacy_settings")
    .select("*")
    .eq("user_id", user.user.id)
    .single();

  if (!privacy?.location_sharing_enabled || privacy.privacy_paused) {
    return; // Don't update if sharing is disabled
  }

  // Apply approximate mode if enabled
  let lat = location.latitude;
  let lng = location.longitude;
  if (privacy.location_mode === "approximate") {
    // Round to ~1km precision
    lat = Math.round(lat * 100) / 100;
    lng = Math.round(lng * 100) / 100;
  }

  const locationData: TablesInsert<"user_locations"> = {
    user_id: user.user.id,
    partnership_id: profile.partnership_id,
    latitude: lat,
    longitude: lng,
    accuracy: location.accuracy,
    battery_level: privacy.share_battery ? location.batteryLevel : null,
    is_charging: privacy.share_battery ? location.isCharging : null,
    is_live: location.isLive ?? false,
    live_expires_at: location.liveExpiresAt,
    location_mode: privacy.location_mode,
  };

  await supabase.from("user_locations").insert(locationData);
}

/**
 * Start Go Live mode (auto-expires after timeout)
 */
export async function startGoLive(durationMinutes: number = 60): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

  // Update the latest location to be live
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  // Get the latest location and update it
  const { data: latestLocation } = await supabase
    .from("user_locations")
    .select("id")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (latestLocation) {
    await supabase
      .from("user_locations")
      .update({
        is_live: true,
        live_expires_at: expiresAt.toISOString(),
      })
      .eq("id", latestLocation.id);
  }
}

/**
 * Stop Go Live mode
 */
export async function stopGoLive(): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  await supabase
    .from("user_locations")
    .update({
      is_live: false,
      live_expires_at: null,
    })
    .eq("user_id", user.user.id)
    .eq("is_live", true);
}

/**
 * Subscribe to partner's location updates
 */
export function subscribeToPartnerLocation(
  partnershipId: string,
  partnerId: string,
  callback: (location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    batteryLevel?: number;
    isCharging?: boolean;
    isLive?: boolean;
    updatedAt: string;
  }) => void
) {
  const channel = supabase
    .channel(`location:${partnershipId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "user_locations",
        filter: `user_id=eq.${partnerId}`,
      },
      (payload) => {
        const loc = payload.new as {
          latitude: number;
          longitude: number;
          accuracy: number | null;
          battery_level: number | null;
          is_charging: boolean | null;
          is_live: boolean | null;
          created_at: string;
        };
        callback({
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy ?? undefined,
          batteryLevel: loc.battery_level ?? undefined,
          isCharging: loc.is_charging ?? undefined,
          isLive: loc.is_live ?? undefined,
          updatedAt: loc.created_at,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Delete all location history for current user
 */
export async function deleteLocationHistory(): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  await supabase.from("user_locations").delete().eq("user_id", user.user.id);
}

