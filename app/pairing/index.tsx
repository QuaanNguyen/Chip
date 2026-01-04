import { usePartnership } from "@/src/features/partnership/usePartnership";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function PairingScreen() {
  const router = useRouter();
  const { inviteCode: paramInviteCode } = useLocalSearchParams<{ inviteCode?: string }>();
  const { isLoading, status, inviteCode, create, join, refreshStatus } = usePartnership();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [inputCode, setInputCode] = useState("");
  const [isAutoJoining, setIsAutoJoining] = useState(false);
  const hasAttemptedAutoJoin = useRef(false);

  // Handle incoming invite code from params - auto-join if valid
  useEffect(() => {
    if (paramInviteCode && paramInviteCode.length === 6 && !hasAttemptedAutoJoin.current) {
      hasAttemptedAutoJoin.current = true;
      setInputCode(paramInviteCode);
      setMode("join");
      setIsAutoJoining(true);
      
      // Auto-join after a brief delay to show the UI
      const autoJoin = async () => {
        try {
          await join(paramInviteCode);
          router.replace("/(main)/map");
        } catch (error) {
          setIsAutoJoining(false);
          Alert.alert("Error", error instanceof Error ? error.message : "Failed to join partnership");
        }
      };
      // Small delay so user sees what's happening
      setTimeout(autoJoin, 500);
    }
  }, [paramInviteCode, join, router]);

  // Refresh partnership status on mount
  useEffect(() => {
    refreshStatus();
  }, []);

  const handleCreatePartnership = async () => {
    try {
      await create();
      setMode("create");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create partnership");
    }
  };

  const handleJoinPartnership = async () => {
    if (inputCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a 6-character invite code");
      return;
    }
    try {
      await join(inputCode);
      router.replace("/(main)/map");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to join partnership");
    }
  };

  const handleShareCode = async () => {
    if (!inviteCode) return;
    try {
      await Share.share({
        message: `Join me on Chip! Use my invite code: ${inviteCode}`,
      });
    } catch {
      // User cancelled
    }
  };

  // Already has a pending partnership with invite code
  if (status === "pending" && inviteCode) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Waiting for Partner</Text>
          <Text style={styles.subtitle}>Share this code with your partner</Text>

          <View style={styles.codeContainer}>
            <Text style={styles.inviteCode}>{inviteCode}</Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={handleShareCode}>
            <Text style={styles.buttonText}>Share Invite Code</Text>
          </Pressable>

          <Text style={styles.hint}>
            Once they enter this code, you'll be paired automatically.
          </Text>
        </View>
      </View>
    );
  }

  // Join mode
  if (mode === "join") {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isAutoJoining ? "Joining Partnership..." : "Enter Invite Code"}
          </Text>
          <Text style={styles.subtitle}>
            {isAutoJoining 
              ? "Please wait while we connect you with your partner"
              : "Ask your partner for their 6-character code"
            }
          </Text>

          <TextInput
            style={styles.codeInput}
            value={inputCode}
            onChangeText={(text) => setInputCode(text.toUpperCase())}
            placeholder="XXXXXX"
            placeholderTextColor="#999"
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isAutoJoining}
          />

          <Pressable
            style={[styles.primaryButton, (inputCode.length !== 6 || isAutoJoining) && styles.buttonDisabled]}
            onPress={handleJoinPartnership}
            disabled={isLoading || isAutoJoining || inputCode.length !== 6}
          >
            {isLoading || isAutoJoining ? (
              <ActivityIndicator color="#333" />
            ) : (
              <Text style={styles.buttonText}>Join Partnership</Text>
            )}
          </Pressable>

          {!isAutoJoining && (
            <Pressable style={styles.textButton} onPress={() => setMode("choose")}>
              <Text style={styles.textButtonLabel}>Go Back</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // Choose mode (default)
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Chip</Text>
        <Text style={styles.tagline}>The app for two</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Connect with Your Partner</Text>
        <Text style={styles.subtitle}>
          Create or join a private space for just the two of you
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={handleCreatePartnership}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#333" />
          ) : (
            <Text style={styles.buttonText}>Create Partnership</Text>
          )}
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => setMode("join")}
        >
          <Text style={styles.secondaryButtonText}>I Have an Invite Code</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6E3",
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: "700",
    color: "#5D4E37",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: "#8B7355",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#5D4E37",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  title: {
    fontSize: 22,
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
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#E8DCC4",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D3225",
  },
  secondaryButton: {
    backgroundColor: "#F5EFE0",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#5D4E37",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8DCC4",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#8B7355",
    fontSize: 14,
  },
  codeContainer: {
    backgroundColor: "#FDF6E3",
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  inviteCode: {
    fontSize: 36,
    fontWeight: "700",
    color: "#5D4E37",
    letterSpacing: 8,
  },
  codeInput: {
    backgroundColor: "#FDF6E3",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
    fontSize: 28,
    fontWeight: "600",
    color: "#3D3225",
    textAlign: "center",
    letterSpacing: 6,
  },
  hint: {
    fontSize: 13,
    color: "#8B7355",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },
  textButton: {
    marginTop: 16,
    alignItems: "center",
  },
  textButtonLabel: {
    fontSize: 15,
    color: "#8B7355",
    fontWeight: "500",
  },
});

