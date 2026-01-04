import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>

        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          Your account has been created successfully.
        </Text>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Ionicons name="people-outline" size={24} color="#5D4E37" />
            <Text style={styles.featureText}>
              Pair with your partner using an invite code
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="location-outline" size={24} color="#5D4E37" />
            <Text style={styles.featureText}>
              Share your location when you want
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="heart-outline" size={24} color="#5D4E37" />
            <Text style={styles.featureText}>
              Save your favorite places together
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="calendar-outline" size={24} color="#5D4E37" />
            <Text style={styles.featureText}>
              Never miss important dates
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.continueButton}
        onPress={() => router.replace("/pairing")}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6E3",
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
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
    textAlign: "center",
    marginBottom: 40,
  },
  features: {
    width: "100%",
    gap: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#5D4E37",
    lineHeight: 22,
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

