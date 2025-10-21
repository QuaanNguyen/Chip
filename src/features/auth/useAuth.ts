import { useState } from "react";
import { checkEmailExists, login, signup } from "./api";

/**
 * Hook providing authentication actions and state management
 * @returns Object containing auth actions and loading state
 */
export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Check if an email is registered and handle loading state
   */
  const probeEmail = async (email: string) => {
    setIsLoading(true);
    try {
      return await checkEmailExists(email);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      return await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create new account with email and password
   */
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      return await signup(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    probeEmail,
    signIn,
    signUp,
  };
}
