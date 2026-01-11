// Re-export types from bookingService for backward compatibility
// The canonical types are now defined in bookingService.ts with snake_case
export type { 
  BookingStatus, 
  Booking, 
  NewBooking, 
  BookingUpdate 
} from '@/services/bookingService';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
