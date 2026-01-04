import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/src/services/supabase";

export default function LandingPage() {
  const router = useRouter();
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Check partnership status
      const { data: profile } = await supabase
        .from("profiles")
        .select("partnership_id")
        .eq("user_id", session.user.id)
        .single();

      if (profile?.partnership_id) {
        const { data: partnership } = await supabase
          .from("partnerships")
          .select("status")
          .eq("id", profile.partnership_id)
          .single();

        if (partnership?.status === "active") {
          router.replace("/(main)/map");
        } else {
          router.replace("/pairing");
        }
      } else {
        router.replace("/pairing");
      }
    }
  };

  const handleJoinWithCode = async () => {
    if (inviteCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a 6-character invite code");
      return;
    }
    // Store the code and redirect to auth
    // After auth, they'll be directed to pairing with this code
    router.push({
      pathname: "/auth",
      params: { inviteCode: inviteCode.toUpperCase() },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Chip</Text>
        <Text style={styles.tagline}>The app for two</Text>
      </View>

      <View style={styles.illustration}>
        <View style={styles.illustrationCircle}>
          <Text style={styles.illustrationEmoji}>💑</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Stay Connected</Text>
        <Text style={styles.subtitle}>
          Share your day, plan dates, and get gentle reminders to check in with your partner.
        </Text>

        <Link href="/auth" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>
        </Link>

        {!showInviteInput ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => setShowInviteInput(true)}
          >
            <Text style={styles.secondaryButtonText}>I Have an Invite Code</Text>
          </Pressable>
        ) : (
          <View style={styles.inviteSection}>
            <TextInput
              style={styles.inviteInput}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#B8A88A"
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Pressable
              style={[
                styles.joinButton,
                inviteCode.length !== 6 && styles.joinButtonDisabled,
              ]}
              onPress={handleJoinWithCode}
              disabled={isLoading || inviteCode.length !== 6}
            >
              {isLoading ? (
                <ActivityIndicator color="#3D3225" />
              ) : (
                <Text style={styles.joinButtonText}>Join</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>

      <Text style={styles.footer}>
        Privacy first. Your data stays between you two.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6E3",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    fontSize: 42,
    fontWeight: "700",
    color: "#5D4E37",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: "#8B7355",
    marginTop: 4,
  },
  illustration: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#F0D071",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5D4E37",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  illustrationEmoji: {
    fontSize: 72,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 28,
    shadowColor: "#5D4E37",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3D3225",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#8B7355",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#F0D071",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#3D3225",
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8B7355",
  },
  inviteSection: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  inviteInput: {
    flex: 1,
    backgroundColor: "#F5EFE0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 18,
    fontWeight: "600",
    color: "#3D3225",
    textAlign: "center",
    letterSpacing: 4,
  },
  joinButton: {
    backgroundColor: "#F0D071",
    paddingHorizontal: 24,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  joinButtonDisabled: {
    backgroundColor: "#E8DCC4",
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D3225",
  },
  footer: {
    fontSize: 13,
    color: "#B8A88A",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 20,
  },
});
