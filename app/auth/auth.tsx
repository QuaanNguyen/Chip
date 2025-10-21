import { checkEmailExists, login, signup } from "@/src/features/auth/api";
import { AuthError } from "@/src/features/auth/types";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function AuthEntry() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [emailExists, setEmailExists] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const router = useRouter();

  const onContinue = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }
    try {
      setStatus("Checking email...");
      const exists = await checkEmailExists(email);
      console.log("Email check result:", exists);
      setEmailExists(exists);
      setStatus(
        exists
          ? "Email exists! Enter password to login"
          : "Email available for signup!"
      );
      setShowPassword(true);
      // Reset password fields when email changes
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Email check error:", error);
      if (error instanceof AuthError) {
        Alert.alert("Error", error.code);
      } else {
        Alert.alert("Error", "An unknown error occurred");
      }
      setStatus("");
    }
  };

  const handleLogin = async () => {
    try {
      setStatus("Logging in...");
      const result = await login(email, password);
      setStatus("Login successful!");
      console.log("Login result:", result);
      // Navigate to main app
    } catch (error) {
      if (error instanceof AuthError) {
        Alert.alert("Login Error", error.code);
      } else {
        Alert.alert("Error", "An unknown error occurred");
      }
      setStatus("");
    }
  };

  const handleSignup = async () => {
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setStatus("Creating your account...");
      console.log("Starting signup for email:", email);

      const result = await signup(email, password);
      console.log("Signup API response:", result);

      if (result?.user) {
        setStatus("Account created successfully! Redirecting...");
        console.log("User created:", result.user);

        // Brief delay before navigation to show success message
        setTimeout(() => {
          router.push("/onboarding/onboard");
        }, 1000);
      } else {
        console.error("No user in signup response");
        throw new Error("Signup failed - no user returned");
      }
    } catch (error) {
      console.error("Signup error:", error);

      if (error instanceof AuthError) {
        Alert.alert("Signup Error", `Error: ${error.code}`);
      } else if (error instanceof Error) {
        console.error("Detailed error:", error.message);
        Alert.alert("Signup Error", `Something went wrong: ${error.message}`);
      } else {
        Alert.alert("Error", "An unexpected error occurred during signup");
      }

      setStatus("");
    }
  };
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
        {/* OAuth buttons */}
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 10,
            alignItems: "center",
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#eee",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
            Continue With Google
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => ({
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 10,
            alignItems: "center",
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#eee",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
            Continue With Apple
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => ({
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 10,
            alignItems: "center",
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#eee",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
            Continue With Facebook
          </Text>
        </Pressable>

        <Text
          style={{ textAlign: "center", marginVertical: 12, color: "#666" }}
        >
          OR
        </Text>

        <TextInput
          onChangeText={setEmail}
          value={email}
          placeholder="abc@gmail.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderColor: "#eee",
            borderRadius: 8,
            padding: 12,
            marginVertical: 12,
            backgroundColor: "#fff",
          }}
        />

        {showPassword && (
          <>
            <TextInput
              onChangeText={setPassword}
              value={password}
              placeholder="Enter password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: "#eee",
                borderRadius: 8,
                padding: 12,
                marginVertical: 12,
                backgroundColor: "#fff",
              }}
            />
            {!emailExists && (
              <TextInput
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                placeholder="Confirm password"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
                style={{
                  borderWidth: 1,
                  borderColor: "#eee",
                  borderRadius: 8,
                  padding: 12,
                  marginVertical: 12,
                  backgroundColor: "#fff",
                }}
              />
            )}
          </>
        )}

        {status ? (
          <Text
            style={{ textAlign: "center", marginVertical: 8, color: "#666" }}
          >
            {status}
          </Text>
        ) : null}

        {!showPassword ? (
          <Pressable
            onPress={onContinue}
            disabled={!email}
            style={({ pressed }) => ({
              backgroundColor: email ? "#F0D071" : "#f1dca0",
              padding: 15,
              borderRadius: 10,
              alignItems: "center",
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: "500" }}>Continue</Text>
          </Pressable>
        ) : (
          <View>
            <Pressable
              onPress={handleLogin}
              disabled={!email || !password}
              style={({ pressed }) => ({
                backgroundColor: email && password ? "#F0D071" : "#f1dca0",
                padding: 15,
                borderRadius: 10,
                alignItems: "center",
                opacity: pressed ? 0.9 : 1,
                marginBottom: 8,
              })}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>Login</Text>
            </Pressable>

            <Pressable
              onPress={handleSignup}
              disabled={!email || !password}
              style={({ pressed }) => ({
                backgroundColor: email && password ? "#F0D071" : "#f1dca0",
                padding: 15,
                borderRadius: 10,
                alignItems: "center",
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>Sign Up</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
