import { format } from "date-fns";
import { useBookings } from "@/context/BookingContext";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Clock, Calendar, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BookingStatus } from "@/services/bookingService";
import { useEffect, useState } from "react";

interface AdminBookingTableProps {
  filter?: BookingStatus;
}

export function AdminBookingTable({ filter }: AdminBookingTableProps) {
  const { bookings, updateBookingStatus } = useBookings();
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);

  useEffect(() => {
    setFilteredBookings(
      filter ? bookings.filter((b) => b.status === filter) : bookings
    );
  }, []);

  const sortedBookings = [...filteredBookings].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleApprove = (id: string) => {
    updateBookingStatus(id, "approved");
    toast({
      title: "Booking Approved",
      description: "The booking has been approved successfully",
    });
  };

  const handleReject = (id: string) => {
    updateBookingStatus(id, "rejected");
    toast({
      title: "Booking Rejected",
      description: "The booking has been rejected",
      variant: "destructive",
    });
  };

  if (sortedBookings.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center shadow-card">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-display text-lg text-foreground mb-1">
          {filter === "pending" ? "No Pending Requests" : "No Bookings Found"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {filter === "pending"
            ? "All booking requests have been processed"
            : "Bookings will appear here when users make requests"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">User</TableHead>
            <TableHead className="text-muted-foreground">Date & Time</TableHead>
            <TableHead className="text-muted-foreground">Reason</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBookings.map((booking, index) => (
            <TableRow
              key={booking.id}
              className="border-border animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{booking.user_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {format(new Date(booking.start_time), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(booking.start_time), "HH:mm")} -{" "}
                    {format(new Date(booking.end_time), "HH:mm")}
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {booking.reason}
              </TableCell>
              <TableCell>
                <StatusBadge status={booking.status} />
              </TableCell>
              <TableCell className="text-right">
                {booking.status === "pending" ? (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 border-success text-success hover:bg-success hover:text-success-foreground"
                      onClick={() => handleApprove(booking.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleReject(booking.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Processed
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
