/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for the application.
 * The client is used for all interactions with the Supabase backend including:
 * - Authentication (login, register, logout, session management)
 * - Database operations (CRUD on bookings, profiles, etc.)
 * - Real-time subscriptions
 * 
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
// These are set in the project secrets and exposed via Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
// This helps catch configuration errors early in development
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

/**
 * The main Supabase client instance
 * 
 * This client is configured with:
 * - Auto-refresh of auth tokens
 * - Persistent sessions using localStorage
 * 
 * Usage:
 * - Import this client wherever you need to interact with Supabase
 * - Example: import { supabase } from '@/lib/supabase'
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh the session when it expires
    autoRefreshToken: true,
    // Persist the session in localStorage for page reloads
    persistSession: true,
    // Detect session from URL (useful for OAuth callbacks)
    detectSessionInUrl: true,
  },
});
