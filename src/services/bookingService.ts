/**
 * Booking Service
 *
 * This file contains all booking-related functions that interact
 * with the Supabase database. It provides a clean API for:
 * - Creating new bookings
 * - Reading bookings (all, by user, by date, by status)
 * - Updating booking details
 * - Updating booking status (approve/reject)
 * - Deleting bookings
 * - Real-time subscription to booking changes
 *
 * All functions include error handling and return consistent response formats.
 */

import { supabase } from "@/lib/supabase";

/**
 * Booking status enum matching database constraint
 * - pending: New booking awaiting admin approval
 * - approved: Booking confirmed by admin
 * - rejected: Booking denied by admin
 */
export type BookingStatus = "pending" | "approved" | "rejected" | "today";
export type BookingRemarks = "";

/**
 * Booking record from the database
 */
export interface Booking {
  id: string;
  user_id: string;
  user_name: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  reason: string;
  created_at: string;
}

/**
 * Data required to create a new booking
 */
export interface NewBooking {
  user_id: string;
  user_name: string;
  start_time: string;
  end_time: string;
  reason: string;
}

/**
 * Data for updating an existing booking
 */
export interface BookingUpdate {
  start_time?: string;
  end_time?: string;
  reason?: string;
  status?: BookingStatus;
  admin_notes?: string;
}

/**
 * Response type for booking operations
 * Provides consistent error handling across all functions
 */
export interface BookingResponse<T = void> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all bookings from the database
 *
 * This function retrieves all booking records, ordered by creation date.
 * Used by admins to see all bookings in the system.
 *
 * @returns BookingResponse with array of bookings
 */
export async function fetchAllBookings(): Promise<BookingResponse<Booking[]>> {
  try {
    // Query the bookings table, ordered by newest first
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    // Handle query errors
    if (error) {
      console.error("Fetch bookings error:", error);
      return { data: null, error: "Failed to fetch bookings" };
    }

    return { data: (data as Booking[]) || [], error: null };
  } catch (error) {
    console.error("Unexpected fetch error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch bookings for a specific user
 *
 * This function retrieves all bookings created by a specific user.
 * Used on the user dashboard to show their booking history.
 *
 * @param userId - The user's UUID
 * @returns BookingResponse with array of user's bookings
 */
export async function fetchUserBookings(
  userId: string
): Promise<BookingResponse<Booking[]>> {
  try {
    // Query bookings filtered by user_id
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Handle query errors
    if (error) {
      console.error("Fetch user bookings error:", error);
      return { data: null, error: "Failed to fetch your bookings" };
    }

    return { data: (data as Booking[]) || [], error: null };
  } catch (error) {
    console.error("Unexpected fetch error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch bookings for a specific date
 *
 * This function retrieves all bookings that start on a given date.
 * Used for the calendar view to show daily bookings.
 *
 * @param date - The date to query (YYYY-MM-DD format)
 * @returns BookingResponse with array of bookings for that date
 */
export async function fetchBookingsForDate(
  date: string
): Promise<BookingResponse<Booking[]>> {
  try {
    // Create the date range for the query
    // We need to find bookings that start on this date
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    // Query bookings within the date range
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay)
      .order("start_time", { ascending: true });

    // Handle query errors
    if (error) {
      console.error("Fetch date bookings error:", error);
      return { data: null, error: "Failed to fetch bookings for date" };
    }

    return { data: (data as Booking[]) || [], error: null };
  } catch (error) {
    console.error("Unexpected fetch error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch bookings by status
 *
 * This function retrieves all bookings with a specific status.
 * Used by admins to filter pending, approved, or rejected bookings.
 *
 * @param status - The booking status to filter by
 * @returns BookingResponse with array of filtered bookings
 */
export async function fetchBookingsByStatus(
  status: BookingStatus
): Promise<BookingResponse<Booking[]>> {
  try {
    // Query bookings filtered by status
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    // Handle query errors
    if (error) {
      console.error("Fetch bookings by status error:", error);
      return { data: null, error: "Failed to fetch bookings" };
    }

    return { data: (data as Booking[]) || [], error: null };
  } catch (error) {
    console.error("Unexpected fetch error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new booking
 *
 * This function inserts a new booking record into the database.
 * The booking starts with 'pending' status awaiting admin approval.
 *
 * @param booking - The booking data to insert
 * @returns BookingResponse with the created booking
 */
export async function createBooking(
  booking: NewBooking
): Promise<BookingResponse<Booking>> {
  try {
    // Insert the new booking with 'pending' status
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        ...booking,
        status: "pending", // Always start as pending
      })
      .select()
      .single();

    // Handle insert errors
    if (error) {
      console.error("Create booking error:", error);
      return { data: null, error: "Failed to create booking" };
    }

    return { data: data as Booking, error: null };
  } catch (error) {
    console.error("Unexpected create error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing booking
 *
 * This function updates a booking record with new data.
 * Used when users edit their pending bookings.
 *
 * @param id - The booking's UUID
 * @param updates - The fields to update
 * @returns BookingResponse with the updated booking
 */
export async function updateBooking(
  id: string,
  updates: BookingUpdate
): Promise<BookingResponse<Booking>> {
  try {
    // Update the booking record
    const { data, error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    // Handle update errors
    if (error) {
      console.error("Update booking error:", error);
      return { data: null, error: "Failed to update booking" };
    }

    return { data: data as Booking, error: null };
  } catch (error) {
    console.error("Unexpected update error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Update a booking's status
 *
 * This function specifically updates the status of a booking.
 * Used by admins to approve or reject bookings.
 *
 * @param id - The booking's UUID
 * @param status - The new status ('approved' | 'rejected')
 * @returns BookingResponse with the updated booking
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<BookingResponse<Booking>> {
  try {
    // Update only the status field
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    // Handle update errors
    if (error) {
      console.error("Update status error:", error);
      return { data: null, error: "Failed to update booking status" };
    }

    return { data: data as Booking, error: null };
  } catch (error) {
    console.error("Unexpected update error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a booking
 *
 * This function removes a booking record from the database.
 * Used when users cancel their pending bookings.
 *
 * @param id - The booking's UUID
 * @returns BookingResponse indicating success or failure
 */
export async function deleteBooking(id: string): Promise<BookingResponse> {
  try {
    // Delete the booking record
    const { error } = await supabase.from("bookings").delete().eq("id", id);

    // Handle delete errors
    if (error) {
      console.error("Delete booking error:", error);
      return { data: null, error: "Failed to delete booking" };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error("Unexpected delete error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Get taken time slots for a specific date
 *
 * This function calculates which time slots are already booked
 * for a given date. It considers both pending and approved bookings.
 *
 * @param date - The date to check (YYYY-MM-DD format)
 * @returns BookingResponse with array of taken time slots (HH:MM format)
 */
export async function getTakenSlots(
  date: string
): Promise<BookingResponse<string[]>> {
  try {
    // Fetch all non-rejected bookings for the date
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("start_time, end_time, status")
      .gte("start_time", `${date}T00:00:00`)
      .lte("start_time", `${date}T23:59:59`)
      .in("status", ["pending", "approved"]);

    // Handle query errors
    if (error) {
      console.error("Fetch taken slots error:", error);
      return { data: null, error: "Failed to fetch taken slots" };
    }

    // Calculate the taken time slots
    const takenSlots: string[] = [];

    // For each booking, generate the hourly slots it occupies
    (
      bookings as Array<{ start_time: string; end_time: string }> | null
    )?.forEach((booking) => {
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
      let current = new Date(start);

      // Loop through each hour of the booking
      while (current < end) {
        // Format as HH:MM (24-hour format)
        const timeSlot = current.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        takenSlots.push(timeSlot);

        // Move to the next hour
        current.setHours(current.getHours() + 1);
      }
    });

    return { data: takenSlots, error: null };
  } catch (error) {
    console.error("Unexpected slots error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

/**
 * Subscribe to real-time booking changes
 *
 * This function sets up a real-time subscription to the bookings table.
 * It notifies the callback whenever bookings are created, updated, or deleted.
 *
 * @param callback - Function called when booking data changes
 * @returns Unsubscribe function to clean up the subscription
 */
export function subscribeToBookings(
  callback: (bookings: Booking[]) => void
): () => void {
  // Create a channel for real-time updates
  const channel = supabase
    .channel("bookings-changes")
    .on(
      "postgres_changes",
      {
        event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "bookings",
      },
      async () => {
        // When any change occurs, refetch all bookings
        // This ensures consistency across all clients
        console.log("Booking change detected, refetching...");
        const { data } = await fetchAllBookings();
        if (data) {
          callback(data);
        }
      }
    )
    .subscribe();

  // Return the unsubscribe function
  return () => {
    console.log("Unsubscribing from booking changes");
    supabase.removeChannel(channel);
  };
}
