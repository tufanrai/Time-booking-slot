import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useBookings, Booking } from "@/context/BookingContext";
import { StatusBadge } from "./StatusBadge";
import { EditBookingModal } from "./EditBookingModal";
import {
  Clock,
  Calendar,
  Music,
  Pencil,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { updateBooking, updateBookingStatus } from "@/services/bookingService";

export function BookingHistory() {
  const { user } = useAuth();
  const { getUserBookings, getApprovedBookings, deleteBooking } = useBookings();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [approvedBookings, setApprovedBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);

  if (!user) return null;

  // Fetch booking data
  useEffect(() => {
    // display users bookings
    setUserBookings(
      getUserBookings(user.id).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    );

    // displayes all approved bookings
    setApprovedBookings(
      getApprovedBookings().sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
      ),
    );

    // pendingBookings
    if (typeof pendingBookings === null) {
      toast({
        title: "Not found",
        description: "You do not have any pending lists to be displayed",
      });
    }
    setPendingBookings(
      getUserBookings(user.id).filter((b) => b.status === "pending"),
    );
  }, [updateBookingStatus, updateBooking, deleteBooking, getUserBookings]);

  // Fetch data at real time
  useEffect(() => {
    // Realtime data fetching.
    const channel = supabase
      .channel("bookings")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // We only care about new ones
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          // Add the new booking to the top of your state list
          const newArr = payload.new;
          const oldArr = userBookings;
          const filteredArr = newArr.filter((val) => !oldArr.includes(val));
          setUserBookings((prev) => [filteredArr, ...prev]);
        },
      )
      .subscribe();

    // Cleanup: Close the connection when the admin leaves the page
    return () => {
      supabase.removeChannel(channel);
    };
  }, [updateBookingStatus, updateBooking, deleteBooking, getUserBookings]);

  // Handles delet functions
  const handleDelete = () => {
    if (deletingBooking) {
      deleteBooking(deletingBooking.id);
      toast({
        title: "Booking Deleted",
        description: "Your booking request has been cancelled",
      });
      setDeletingBooking(null);
    }
  };

  // const

  const BookingCard = ({
    booking,
    showActions = false,
  }: {
    booking: Booking;
    showActions?: boolean;
  }) => (
    <div className="p-4 hover:bg-secondary/50 transition-colors animate-fade-in">
      {/* Booking slot request details */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-foreground overflow-y-auto overflow-x-hidden">
            {booking.reason}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 overflow-x-auto overflow-y-hidden">
            by {booking.user_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} />
          {showActions && booking.status === "pending" && (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={() => setEditingBooking(booking)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => setDeletingBooking(booking)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Booking slot request start and end times */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(booking.start_time), "MMM d, yyyy")}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {format(new Date(booking.start_time), "HH:mm")} -{" "}
          {format(new Date(booking.end_time), "HH:mm")}
        </span>
      </div>
    </div>
  );

  const EmptyState = ({
    message,
    icon: Icon,
  }: {
    message: string;
    icon: typeof Music;
  }) => (
    <div className="p-8 text-center">
      <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <Tabs defaultValue="my-bookings" className="w-full">
          <div className="p-4 border-b border-border">
            <TabsList className="grid w-full grid-cols-3 bg-secondary">
              <TabsTrigger value="my-bookings" className="text-xs">
                My Bookings
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                Pending ({pendingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs">
                All Approved
              </TabsTrigger>
            </TabsList>
          </div>

          {/* My booking list */}
          <TabsContent value="my-bookings" className="m-0">
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {userBookings.length === 0 ? (
                <EmptyState
                  message="No bookings yet. Select a date to book!"
                  icon={Music}
                />
              ) : (
                userBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} showActions />
                ))
              )}
            </div>
          </TabsContent>

          {/* My pending list */}
          <TabsContent value="pending" className="m-0">
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {pendingBookings.length === 0 ? (
                <EmptyState message="No pending requests" icon={Clock} />
              ) : (
                pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} showActions />
                ))
              )}
            </div>
          </TabsContent>

          {/* All approved list */}
          <TabsContent value="approved" className="m-0">
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {approvedBookings.length === 0 ? (
                <EmptyState
                  message="No approved bookings yet"
                  icon={CheckCircle}
                />
              ) : (
                approvedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <EditBookingModal
        open={!!editingBooking}
        onOpenChange={(open) => !open && setEditingBooking(null)}
        booking={editingBooking}
      />

      <AlertDialog
        open={!!deletingBooking}
        onOpenChange={(open) => !open && setDeletingBooking(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your booking request for "
              {deletingBooking?.reason}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
