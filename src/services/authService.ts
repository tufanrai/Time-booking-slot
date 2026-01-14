/**
 * Authentication Service
 *
 * This file contains all authentication-related functions that interact
 * with Supabase Auth. It provides a clean API for:
 * - User registration with profile creation
 * - User login with email/password
 * - Session management
 * - User role retrieval
 * - Logout functionality
 *
 * All functions include error handling and return consistent response formats.
 */

import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import Cookie from "js-cookie";

/**
 * User role enum for access control
 * - admin: Can manage all bookings and approve/reject requests
 * - user: Can create and manage their own bookings
 */
export type UserRole = "admin" | "user";

/**
 * Response type for auth operations
 * Provides consistent error handling across all auth functions
 */
export interface AuthResponse<T = void> {
  data: T | null;
  error: string | null;
}

/**
 * User profile with role information
 * This is the combined user data returned after authentication
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Register a new user
 *
 * This function:
 * 1. Creates a new auth user in Supabase Auth
 * 2. Creates a profile record in the profiles table
 * 3. Assigns a role in the user_roles table
 *
 * @param email - User's email address
 * @param password - User's password (min 6 characters)
 * @param name - User's display name
 * @param role - User's role (defaults to 'user')
 * @returns AuthResponse with UserProfile on success
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = "user"
): Promise<AuthResponse<UserProfile>> {
  try {
    // Step 1: Create the auth user
    // This adds the user to Supabase's auth.users table
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Include metadata that can be used in database triggers
        data: {
          name,
          role,
        },
        // Redirect URL after email confirmation (if enabled)
        emailRedirectTo: window.location.origin,
      },
    });

    // Handle auth signup errors
    if (authError) {
      console.error("Auth signup error:", authError);
      return { data: null, error: authError.message };
    }

    // Check if user was created
    if (!authData.user) {
      toast({
        title: "Login failed",
        description: "Invalid credentials.",
        variant: "destructive",
      });
      return { data: null, error: "Failed to create user account" };
    }

    toast({
      title: "Welcome back!",
      description: "You've been logged in successfully",
    });

    console.log(authData.user);
    // Step 2: Create the user profile
    // This stores additional user information in our profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      name,
      role,
    });

    // Handle profile creation errors
    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Note: The auth user was created, but profile failed
      // In production, you might want to clean up the auth user
      return { data: null, error: "Failed to create user profile" };
    }

    // // Step 3: Assign the user role
    // // This is stored in a separate table for security
    // const { error: roleError } = await supabase.from("profiles").insert({
    //   user_id: authData.user.id,
    //   role,
    // });

    // // Handle role assignment errors
    // if (roleError) {
    //   console.error("Role assignment error:", roleError);
    //   return { data: null, error: "Failed to assign user role" };
    // }

    // Return the complete user profile
    return {
      data: {
        id: authData.user.id,
        email,
        name,
        role,
      },
      error: null,
    };
  } catch (error) {
    // Catch any unexpected errors
    console.error("Unexpected registration error:", error);
    return {
      data: null,
      error: "An unexpected error occurred during registration",
    };
  }
}

/**
 * Login an existing user
 *
 * This function:
 * 1. Authenticates the user with Supabase Auth
 * 2. Fetches their profile and role information
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns AuthResponse with UserProfile on success
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse<UserProfile>> {
  try {
    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // Handle authentication errors
    if (authError) {
      console.error("Login error:", authError);
      return { data: null, error: authError.message };
    }

    // Check if session was created
    if (!authData.user) {
      return { data: null, error: "Login failed - no user returned" };
    }

    Cookie.set("secret", authData.session.access_token);
    // Step 2: Fetch the user's complete profile with role
    const userProfile = await getUserProfile(authData.user.id);

    if (!userProfile.data) {
      return {
        data: null,
        error: userProfile.error || "Failed to fetch profile",
      };
    }

    return { data: userProfile.data, error: null };
  } catch (error) {
    console.error("Unexpected login error:", error);
    return {
      data: null,
      error: "An unexpected error occurred during login",
    };
  }
}

/**
 * Get the current authenticated user's profile
 *
 * This function fetches the profile and role for a given user ID.
 * It's used after login and for session restoration.
 *
 * @param userId - The user's UUID from auth.users
 * @returns AuthResponse with UserProfile on success
 */
export async function getUserProfile(
  userId: string
): Promise<AuthResponse<UserProfile>> {
  try {
    // Fetch the user's profile from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // Handle profile fetch errors
    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return { data: null, error: "Failed to fetch user profile" };
    }

    // Handle case where profile doesn't exist
    if (!profile) {
      return { data: null, error: "User profile not found" };
    }

    // // Fetch the user's role from the user_roles table
    // const { data: roleData, error: roleError } = await supabase
    //   .from("profiles")
    //   .select("role")
    //   .maybeSingle();

    // // Handle role fetch errors
    // if (roleError) {
    //   console.error("Role fetch error:", roleError);
    //   return { data: null, error: "Failed to fetch user role" };
    // }

    // Default to 'user' role if no role is assigned
    const role: UserRole = (profile?.role as UserRole) || "user";

    // Return the complete user profile
    return {
      data: {
        id: profile.id as string,
        email: profile.email as string,
        name: profile.name as string,
        role,
      },
      error: null,
    };
  } catch (error) {
    console.error("Unexpected profile fetch error:", error);
    return {
      data: null,
      error: "An unexpected error occurred while fetching profile",
    };
  }
}

/**
 * Get the current session
 *
 * This function retrieves the current auth session from Supabase.
 * Used to restore user state on page load.
 *
 * @returns The current session user or null
 */
export async function getCurrentSession(): Promise<User | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Session fetch error:", error);
      return null;
    }

    return session?.user || null;
  } catch (error) {
    console.error("Unexpected session error:", error);
    return null;
  }
}

/**
 * Logout the current user
 *
 * This function signs out the user from Supabase Auth,
 * clearing their session and tokens.
 *
 * @returns AuthResponse indicating success or failure
 */
export async function logoutUser(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return { data: null, error: error.message };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error("Unexpected logout error:", error);
    return {
      data: null,
      error: "An unexpected error occurred during logout",
    };
  }
}

/**
 * Subscribe to auth state changes
 *
 * This function sets up a listener for authentication state changes.
 * It's used to keep the app in sync with the auth state.
 *
 * @param callback - Function called when auth state changes
 * @returns Unsubscribe function to clean up the listener
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    // Log the auth event for debugging
    console.log("Auth state changed:", event);

    // Call the callback with the user (or null if signed out)
    callback(session?.user || null);
  });

  // Return the unsubscribe function for cleanup
  return () => subscription.unsubscribe();
}
