import { supabase } from "@/src/services/supabase";
import { AuthError } from "./types";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-linking";

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with Google OAuth
 * Opens a browser for Google sign-in and handles the callback
 */
export async function signInWithGoogle() {
  try {
    const redirectTo = makeRedirectUri({
      scheme: "chip",
      path: "google-auth",
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "consent" },
        skipBrowserRedirect: true,
      },
    });

    if (error) throw new AuthError("unknown");

    const googleOAuthUrl = data.url;
    if (!googleOAuthUrl) {
      throw new AuthError("unknown");
    }

    const result = await WebBrowser.openAuthSessionAsync(
      googleOAuthUrl,
      redirectTo,
      { showInRecents: true }
    );

    if (result.type === "success") {
      const url = new URL(result.url);
      const params = new URLSearchParams(url.hash.substring(1));

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

        if (sessionError) throw new AuthError("unknown");
        return sessionData;
      }
    }

    throw new AuthError("unknown");
  } catch (error) {
    if (error instanceof AuthError) throw error;
    if (error instanceof Error && error.message.includes("network"))
      throw new AuthError("network");
    throw new AuthError("unknown");
  }
}

/**
 * Check if an email address is already registered
 * @param email The email address to check
 * @returns Promise that resolves to true if email exists, false otherwise
 * @throws {AuthError} with code 'network' or 'unknown'
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("email_exists", {
      p_email: email,
    });

    if (error) throw new AuthError("unknown");
    return data as boolean;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    if (error instanceof Error && error.message.includes("network"))
      throw new AuthError("network");
    throw new AuthError("unknown");
  }
}

/**
 * Sign in a user with email and password
 * @param email User's email address
 * @param password User's password
 * @throws {AuthError} with appropriate error code
 */
export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials"))
        throw new AuthError("invalid-credentials");
      if (error.message.includes("network")) throw new AuthError("network");
      throw new AuthError("unknown");
    }

    return data;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    if (error instanceof Error && error.message.includes("network"))
      throw new AuthError("network");
    throw new AuthError("unknown");
  }
}

/**
 * Create a new user account
 * @param email User's email address
 * @param password User's password
 * @throws {AuthError} with appropriate error code
 */
export async function signup(email: string, password: string) {
  try {
    console.log("🔄 Starting signup process for:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "chip://auth/callback",
      },
    });

    if (error) {
      console.error("Supabase signup error:", error);
      if (error.message.includes("already registered")) {
        throw new AuthError("email-already-in-use");
      }
      if (error.message.includes("network")) {
        throw new AuthError("network");
      }
      if (error.message) {
        console.error("Detailed error:", error.message);
      }
      throw new AuthError("unknown");
    }

    console.log("Signup successful:", data);
    return data;
  } catch (error) {
    console.error("Signup catch block error:", error);
    if (error instanceof AuthError) throw error;
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      if (error.message.includes("network")) {
        throw new AuthError("network");
      }
    }
    throw new AuthError("unknown");
  }
}
