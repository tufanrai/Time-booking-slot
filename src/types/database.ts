/**
 * Database Types for Supabase
 * 
 * This file defines TypeScript types that match your Supabase database schema.
 * These types provide type safety when performing database operations.
 * 
 * Tables included:
 * - profiles: User profile information linked to auth.users
 * - bookings: Studio booking records with status workflow
 * - user_roles: Role assignments for access control (admin/user)
 */

/**
 * Booking status enum matching database constraint
 * - pending: New booking awaiting admin approval
 * - approved: Booking confirmed by admin
 * - rejected: Booking denied by admin
 */
export type BookingStatus = 'pending' | 'approved' | 'rejected';

/**
 * User role enum for access control
 * - admin: Can manage all bookings and approve/reject requests
 * - user: Can create and manage their own bookings
 */
export type UserRole = 'admin' | 'user';

/**
 * Database schema type definition
 * This mirrors your Supabase database structure
 */
export interface Database {
  public: {
    Tables: {
      /**
       * Profiles Table
       * Stores user profile information
       * Linked to auth.users via id (foreign key)
       */
      profiles: {
        Row: {
          id: string;           // UUID, references auth.users(id)
          email: string;        // User's email address
          name: string;         // Display name
          created_at: string;   // Timestamp when profile was created
          updated_at: string;   // Timestamp of last update
        };
        Insert: {
          id: string;           // Required: must match auth.users(id)
          email: string;        // Required
          name: string;         // Required
          created_at?: string;  // Optional: defaults to now()
          updated_at?: string;  // Optional: defaults to now()
        };
        Update: {
          id?: string;          // Cannot update id
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;  // Will be set to now() on update
        };
      };

      /**
       * Bookings Table
       * Stores all studio booking requests
       */
      bookings: {
        Row: {
          id: string;           // UUID, primary key
          user_id: string;      // References profiles(id)
          user_name: string;    // Denormalized for display efficiency
          start_time: string;   // ISO timestamp for booking start
          end_time: string;     // ISO timestamp for booking end
          status: BookingStatus; // Current booking status
          reason: string;       // Purpose of the booking
          created_at: string;   // When booking was created
        };
        Insert: {
          id?: string;          // Optional: auto-generated UUID
          user_id: string;      // Required: must be authenticated user
          user_name: string;    // Required
          start_time: string;   // Required
          end_time: string;     // Required
          status?: BookingStatus; // Optional: defaults to 'pending'
          reason: string;       // Required
          created_at?: string;  // Optional: defaults to now()
        };
        Update: {
          id?: string;
          user_id?: string;
          user_name?: string;
          start_time?: string;
          end_time?: string;
          status?: BookingStatus;
          reason?: string;
          created_at?: string;
        };
      };

      /**
       * User Roles Table
       * Stores role assignments for access control
       * Separated from profiles for security (prevents privilege escalation)
       */
      user_roles: {
        Row: {
          id: string;           // UUID, primary key
          user_id: string;      // References auth.users(id)
          role: UserRole;       // The assigned role
        };
        Insert: {
          id?: string;          // Optional: auto-generated
          user_id: string;      // Required
          role: UserRole;       // Required
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRole;
        };
      };
    };
  };
}

/**
 * Helper type to extract table row types
 * Usage: type Profile = Tables<'profiles'>
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/**
 * Helper type to extract insert types
 * Usage: type NewBooking = TablesInsert<'bookings'>
 */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/**
 * Helper type to extract update types
 * Usage: type BookingUpdate = TablesUpdate<'bookings'>
 */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
