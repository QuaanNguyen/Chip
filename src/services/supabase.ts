import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Initialize Supabase client with anonymous key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or anonymous key");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
