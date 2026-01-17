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
import { useBookings } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { timeSlots } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Clock, Calendar, Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

export function BookingModal({
  open,
  onOpenChange,
  selectedDate,
}: BookingModalProps) {
  const { user } = useAuth();
  const { addBooking, getTakenSlots } = useBookings();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [timeSlot, setTimeSlots] = useState<string[]>(timeSlots);

  // Fetch taken slots when date changes or modal opens
  useEffect(() => {
    if (open && selectedDate) {
      getTakenSlots(selectedDate).then(setTakenSlots);
    }
  }, [open, selectedDate, getTakenSlots]);

  // display time on 12hrs format
  useEffect(() => {
    const smallerTimes = timeSlots.filter((time) => time <= "12:30");
    const greaterTimes = timeSlots.filter((time) => time > "12:30");
    const atomRefinedTIme = greaterTimes
      .map((time) => {
        return time.split(":");
      })
      .map((timeArr) => {
        const hrs = (Number(timeArr[0]) - 12).toString();
        const min = timeArr[1];
        return `${hrs}:${min}`;
      });
    setTimeSlots([...smallerTimes, ...atomRefinedTIme]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !startTime || !endTime || !reason.trim()) {
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

    const success = await addBooking({
      user_id: user.id,
      user_name: user.name,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      reason: reason.trim(),
    });

    if (success) {
      toast({
        title: "Booking Submitted!",
        description: "Your booking request is pending approval",
      });

      setStartTime("");
      setEndTime("");
      setReason("");
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
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
            <Mic className="w-5 h-5 text-primary" />
            Book Studio Session
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Time slot */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Time Slot</Label>
            <div className="grid grid-cols-5 gap-2">
              {timeSlot &&
                timeSlots.map((slot, key) => {
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
                      {timeSlot[key]}
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

          {/* Reason textarea */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Booking</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Band practice, Recording session, Podcast..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-secondary border-border resize-none h-20"
            />
          </div>

          {/* Submition button */}
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
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
