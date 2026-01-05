import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/src/services/supabase";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPartnership, setHasPartnership] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        await checkPartnership(session.user.id);
      } else {
        setHasPartnership(false);
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        await checkPartnership(session.user.id);
      }
    } catch {
      // Handle error
    }
    setIsLoading(false);
  };

  const checkPartnership = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("partnership_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError || !profile?.partnership_id) {
        setHasPartnership(false);
        return;
      }

      const { data: partnership, error: partnershipError } = await supabase
        .from("partnerships")
        .select("status")
        .eq("id", profile.partnership_id)
        .maybeSingle();

      if (partnershipError || !partnership) {
        setHasPartnership(false);
        return;
      }

      setHasPartnership(partnership.status === "active");
    } catch (error) {
      console.error("Error checking partnership:", error);
      setHasPartnership(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const inMainGroup = segments[0] === "(main)";
    const inPairingGroup = segments[0] === "pairing";
    const inOnboardingGroup = segments[0] === "onboarding";

    // Don't redirect if we're on onboarding pages
    if (inOnboardingGroup) return;

    if (!isAuthenticated && !inAuthGroup && segments[0] !== undefined) {
      // Not authenticated, redirect to landing
      try {
        router.replace("/");
      } catch (error) {
        console.error("Navigation error:", error);
      }
    } else if (isAuthenticated && !hasPartnership && (inMainGroup || inAuthGroup)) {
      // Authenticated but no partnership, go to pairing
      // Add small delay to prevent navigation conflicts
      const timer = setTimeout(() => {
        try {
          router.replace("/pairing");
        } catch (error) {
          console.error("Navigation error:", error);
        }
      }, 100);
      return () => clearTimeout(timer);
    } else if (isAuthenticated && hasPartnership && (inPairingGroup || inAuthGroup)) {
      // Authenticated with partnership, go to main
      // Add small delay to prevent navigation conflicts
      const timer = setTimeout(() => {
        try {
          router.replace("/(main)/map");
        } catch (error) {
          console.error("Navigation error:", error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, hasPartnership, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D4E37" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDF6E3",
  },
});
