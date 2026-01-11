import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useBookings } from '@/context/BookingContext';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export function BookingCalendar({ onDateSelect, selectedDate }: BookingCalendarProps) {
  const { bookings } = useBookings();
  const [month, setMonth] = useState<Date>(new Date());

  const datesWithBookings = bookings.reduce((acc, booking) => {
    const dateStr = booking.start_time.split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = { approved: 0, pending: 0 };
    }
    if (booking.status === 'approved') acc[dateStr].approved++;
    if (booking.status === 'pending') acc[dateStr].pending++;
    return acc;
  }, {} as Record<string, { approved: number; pending: number }>);

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-card">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateSelect(date)}
        month={month}
        onMonthChange={setMonth}
        className="pointer-events-auto"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium text-foreground",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-7 w-7 bg-transparent p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: cn(
            "h-9 w-9 p-0 font-normal rounded-md transition-all",
            "hover:bg-primary/20 hover:text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          ),
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-glow",
          day_today: "bg-muted text-foreground font-semibold",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
        }}
        components={{
          DayContent: ({ date }) => {
            const dateStr = date.toISOString().split('T')[0];
            const counts = datesWithBookings[dateStr];
            return (
              <div className="relative w-full h-full flex items-center justify-center">
                <span>{date.getDate()}</span>
                {counts && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {counts.approved > 0 && (
                      <span className="w-1 h-1 rounded-full bg-success" />
                    )}
                    {counts.pending > 0 && (
                      <span className="w-1 h-1 rounded-full bg-warning" />
                    )}
                  </div>
                )}
              </div>
            );
          },
        }}
      />
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span>Approved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}
