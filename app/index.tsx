import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function LandingPage() {
  return (
    <View
      style={{
        backgroundColor: "#F0D071",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 30, fontWeight: "600" }}>
        Welcome to Chip
      </Text>

      <View
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 15,
          width: "100%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Link href="/auth/auth" asChild>
          <Pressable
            style={{
              backgroundColor: "#F0D071",
              padding: 15,
              borderRadius: 10,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "500" }}>
              Login / Sign Up
            </Text>
          </Pressable>
        </Link>

        <Pressable
          style={{
            backgroundColor: "#F0D071",
            padding: 15,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
            Enter Invite Code
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
