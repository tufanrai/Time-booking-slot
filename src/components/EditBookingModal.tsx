import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBookings, Booking } from "@/context/BookingContext";
import { timeSlots } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Clock, Calendar, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EditBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export function EditBookingModal({
  open,
  onOpenChange,
  booking,
}: EditBookingModalProps) {
  const { updateBooking, getTakenSlots } = useBookings();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [takenSlots, setTakenSlots] = useState<string[]>([]);

  useEffect(() => {
    if (booking) {
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
      setStartTime(format(start, "HH:mm"));
      setEndTime(format(end, "HH:mm"));
      setReason(booking.reason);
    }
  }, [booking]);

  // Fetch taken slots when booking changes
  useEffect(() => {
    if (open && booking) {
      const selectedDate = new Date(booking.start_time);
      getTakenSlots(selectedDate).then((slots) => {
        // Exclude current booking's slots from taken list
        const bookingStart = format(new Date(booking.start_time), "HH:mm");
        const bookingEnd = format(new Date(booking.end_time), "HH:mm");
        const filteredSlots = slots.filter(
          (slot) => slot < bookingStart || slot >= bookingEnd,
        );
        setTakenSlots(filteredSlots);
      });
    }
  }, [open, booking, getTakenSlots]);

  if (!booking) return null;

  const selectedDate = new Date(booking.start_time);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startTime || !endTime || !reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(selectedDate);
    const [startHour, startMin] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(selectedDate);
    const [endHour, endMin] = endTime.split(":").map(Number);
    endDateTime.setHours(endHour, endMin, 0, 0);

    if (endDateTime <= startDateTime) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    const success = await updateBooking(booking.id, {
      start_time: startDateTime.toString(),
      end_time: endDateTime.toString(),
      reason: reason,
    });

    if (success) {
      toast({
        title: "Booking Updated!",
        description: "Your booking has been updated successfully",
      });
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isSlotTaken = (slot: string) => takenSlots.includes(slot);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Edit className="w-5 h-5 text-primary" />
            Edit Booking
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Time Slot</Label>
            <div className="grid grid-cols-5 gap-2">
              {timeSlots.map((slot) => {
                const taken = isSlotTaken(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={taken}
                    onClick={() => {
                      if (!startTime || (startTime && endTime)) {
                        setStartTime(slot);
                        setEndTime("");
                      } else if (slot > startTime) {
                        setEndTime(slot);
                      } else {
                        setStartTime(slot);
                        setEndTime("");
                      }
                    }}
                    className={cn(
                      "py-2 px-1 text-xs rounded-md border transition-all font-medium",
                      taken &&
                        "bg-muted/50 text-muted-foreground border-border cursor-not-allowed opacity-50",
                      !taken &&
                        slot === startTime &&
                        "bg-primary text-primary-foreground border-primary shadow-glow",
                      !taken &&
                        slot === endTime &&
                        "bg-success/20 text-success border-success",
                      !taken &&
                        slot !== startTime &&
                        slot !== endTime &&
                        "bg-secondary border-border hover:border-primary hover:bg-primary/10",
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            {startTime && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {startTime} {endTime && `→ ${endTime}`}
                {!endTime && " (select end time)"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Booking</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Band practice, Recording session, Podcast..."
              defaultValue={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-secondary border-border resize-none h-20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={!startTime || !endTime || !reason.trim()}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
