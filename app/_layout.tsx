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
      const { data: profile } = await supabase
        .from("profiles")
        .select("partnership_id")
        .eq("user_id", userId)
        .single();

      if (profile?.partnership_id) {
        const { data: partnership } = await supabase
          .from("partnerships")
          .select("status")
          .eq("id", profile.partnership_id)
          .single();

        setHasPartnership(partnership?.status === "active");
      } else {
        setHasPartnership(false);
      }
    } catch {
      setHasPartnership(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const inMainGroup = segments[0] === "(main)";
    const inPairingGroup = segments[0] === "pairing";

    if (!isAuthenticated && !inAuthGroup && segments[0] !== undefined) {
      // Not authenticated, redirect to landing
      router.replace("/");
    } else if (isAuthenticated && !hasPartnership && (inMainGroup || inAuthGroup)) {
      // Authenticated but no partnership, go to pairing
      router.replace("/pairing");
    } else if (isAuthenticated && hasPartnership && (inPairingGroup || inAuthGroup)) {
      // Authenticated with partnership, go to main
      router.replace("/(main)/map");
    }
  }, [isLoading, isAuthenticated, hasPartnership, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D4E37" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="pairing" />
      <Stack.Screen name="(main)" />
    </Stack>
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
