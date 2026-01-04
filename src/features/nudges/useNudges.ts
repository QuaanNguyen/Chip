import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/src/services/supabase";
import { NudgeEngine, Nudge } from "./engine";

export function useNudges() {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkNudges = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("partnership_id")
        .eq("user_id", user.user.id)
        .single();

      if (!profile?.partnership_id) return;

      // Get partnership to find partner
      const { data: partnership } = await supabase
        .from("partnerships")
        .select("*")
        .eq("id", profile.partnership_id)
        .single();

      if (!partnership || partnership.status !== "active") return;

      const partnerId =
        partnership.user1_id === user.user.id
          ? partnership.user2_id
          : partnership.user1_id;

      if (!partnerId) return;

      // Get partner's recent locations
      const { data: partnerLocations } = await supabase
        .from("user_locations")
        .select("latitude, longitude, created_at, battery_level")
        .eq("user_id", partnerId)
        .gte("created_at", new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()) // Last 4 hours
        .order("created_at", { ascending: false });

      // Initialize nudge engine
      const engine = new NudgeEngine(user.user.id, profile.partnership_id);
      await engine.initialize();

      // Evaluate rules
      const triggeredNudges = await engine.evaluate({
        partnerLocations: partnerLocations ?? undefined,
        partnerBatteryLevel: partnerLocations?.[0]?.battery_level ?? undefined,
      });

      setNudges(triggeredNudges);
    } catch (error) {
      console.error("Error checking nudges:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismissNudge = useCallback(async (nudge: Nudge, wasActedOn: boolean) => {
    if (nudge.id) {
      await supabase
        .from("nudges_log")
        .update({ was_acted_on: wasActedOn })
        .eq("id", nudge.id);
    }
    setNudges((prev) => prev.filter((n) => n !== nudge));
  }, []);

  useEffect(() => {
    checkNudges();

    // Check every 15 minutes
    const interval = setInterval(checkNudges, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkNudges]);

  return {
    nudges,
    isLoading,
    checkNudges,
    dismissNudge,
  };
}

