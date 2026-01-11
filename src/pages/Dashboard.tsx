import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingModal } from '@/components/BookingModal';
import { BookingHistory } from '@/components/BookingHistory';
import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user?.name}</span>
          </h1>
          <p className="text-muted-foreground">
            Select a date to book your next studio session
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar Section */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Studio Calendar</h2>
              </div>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Booking
              </Button>
            </div>
            <BookingCalendar
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>

          {/* Booking History */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <BookingHistory />
          </div>
        </div>
      </main>

      <BookingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedDate={selectedDate}
      />
    </div>
  );
}
