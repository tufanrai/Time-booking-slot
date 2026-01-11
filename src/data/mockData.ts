import { Booking, User } from '@/types/booking';

export const mockUsers: User[] = [
  { id: '1', email: 'admin@studio.com', name: 'Studio Admin', role: 'admin' },
  { id: '2', email: 'john@email.com', name: 'John Doe', role: 'user' },
  { id: '3', email: 'jane@email.com', name: 'Jane Smith', role: 'user' },
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    user_id: '2',
    user_name: 'John Doe',
    start_time: '2026-01-08T10:00:00Z',
    end_time: '2026-01-08T12:00:00Z',
    status: 'approved',
    reason: 'Band Practice',
    created_at: '2026-01-05T08:00:00Z',
  },
  {
    id: '2',
    user_id: '3',
    user_name: 'Jane Smith',
    start_time: '2026-01-08T14:00:00Z',
    end_time: '2026-01-08T16:00:00Z',
    status: 'pending',
    reason: 'Vocal Recording Session',
    created_at: '2026-01-06T10:00:00Z',
  },
  {
    id: '3',
    user_id: '2',
    user_name: 'John Doe',
    start_time: '2026-01-09T09:00:00Z',
    end_time: '2026-01-09T11:00:00Z',
    status: 'pending',
    reason: 'Podcast Recording',
    created_at: '2026-01-07T14:00:00Z',
  },
  {
    id: '4',
    user_id: '3',
    user_name: 'Jane Smith',
    start_time: '2026-01-10T13:00:00Z',
    end_time: '2026-01-10T15:00:00Z',
    status: 'rejected',
    reason: 'DJ Set Practice',
    created_at: '2026-01-04T09:00:00Z',
  },
  {
    id: '5',
    user_id: '2',
    user_name: 'John Doe',
    start_time: '2026-01-12T16:00:00Z',
    end_time: '2026-01-12T18:00:00Z',
    status: 'approved',
    reason: 'Music Video Shoot',
    created_at: '2026-01-03T11:00:00Z',
  },
];

export const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];
