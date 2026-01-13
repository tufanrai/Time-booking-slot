/**
 * Booking Context
 *
 * This context provides booking state and methods throughout the app.
 * It connects to Supabase for real-time data with automatic updates.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  fetchAllBookings,
  createBooking as createBookingService,
  updateBooking as updateBookingService,
  updateBookingStatus as updateBookingStatusService,
  deleteBooking as deleteBookingService,
  getTakenSlots as getTakenSlotsService,
  subscribeToBookings,
  Booking,
  BookingStatus,
  NewBooking,
  BookingUpdate,
  BookingRemarks,
} from "@/services/bookingService";

// Re-export types
export type { Booking, BookingStatus, NewBooking, BookingUpdate };

interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;
  addBooking: (booking: NewBooking) => Promise<boolean>;
  updateBooking: (id: string, updates: BookingUpdate) => Promise<boolean>;
  deleteBooking: (id: string) => Promise<boolean>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<boolean>;
  getBookingsForDate: (date: Date) => Booking[];
  getUserBookings: (userId: string) => Booking[];
  getApprovedBookings: () => Booking[];
  getTakenSlots: (date: Date) => Promise<string[]>;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load bookings on mount
  const refreshBookings = useCallback(async () => {
    const { data } = await fetchAllBookings();
    if (data) setBookings(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshBookings();
    // Subscribe to real-time updates
    const unsubscribe = subscribeToBookings(setBookings);
    return unsubscribe;
  }, [refreshBookings]);

  const addBooking = async (booking: NewBooking): Promise<boolean> => {
    const { error } = await createBookingService(booking);
    if (!error) {
      await refreshBookings();
      return true;
    }
    return false;
  };

  const updateBooking = async (
    id: string,
    updates: BookingUpdate
  ): Promise<boolean> => {
    const { error } = await updateBookingService(id, updates);
    if (!error) {
      await refreshBookings();
      return true;
    }
    return false;
  };

  const deleteBooking = async (id: string): Promise<boolean> => {
    const { error } = await deleteBookingService(id);
    if (!error) {
      await refreshBookings();
      return true;
    }
    return false;
  };

  const updateBookingStatus = async (
    id: string,
    status: BookingStatus
  ): Promise<boolean> => {
    const { error } = await updateBookingStatusService(id, status);
    if (!error) {
      await refreshBookings();
      return true;
    }
    return false;
  };

  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split("T")[0];
    return bookings.filter((b) => b.start_time.startsWith(dateStr));
  };

  const getUserBookings = (userId: string): Booking[] => {
    return bookings.filter((b) => b.user_id === userId);
  };

  const getApprovedBookings = (): Booking[] => {
    return bookings.filter((b) => b.status === "approved");
  };

  const getTakenSlots = async (date: Date): Promise<string[]> => {
    const dateStr = date.toISOString().split("T")[0];
    const { data } = await getTakenSlotsService(dateStr);
    return data || [];
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        isLoading,
        addBooking,
        updateBooking,
        deleteBooking,
        updateBookingStatus,
        getBookingsForDate,
        getUserBookings,
        getApprovedBookings,
        getTakenSlots,
        refreshBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
}
