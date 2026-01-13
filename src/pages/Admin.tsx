import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingContext";
import { Navbar } from "@/components/Navbar";
import { BookingCalendar } from "@/components/BookingCalendar";
import { AdminBookingTable } from "@/components/AdminBookingTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle,
  XCircle,
  LayoutList,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Admin() {
  const { isAuthenticated, user } = useAuth();
  const { bookings } = useBookings();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const rejectedCount = bookings.filter((b) => b.status === "rejected").length;

  const stats = [
    {
      label: "Pending",
      count: pendingCount,
      icon: Clock,
      color: "text-warning",
    },
    {
      label: "Approved",
      count: approvedCount,
      icon: CheckCircle,
      color: "text-success",
    },
    {
      label: "Rejected",
      count: rejectedCount,
      icon: XCircle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold mb-2">
            Admin <span className="text-gradient">Panel</span>
          </h1>
          <p className="text-muted-foreground">
            Manage booking requests and monitor studio availability
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map(({ label, count, icon: Icon, color }, index) => (
            <div
              key={label}
              className="bg-card rounded-xl border border-border p-4 shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn("w-5 h-5", color)} />
                <span className={cn("font-display text-2xl font-bold", color)}>
                  {count}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{label} Bookings</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Management */}
          <div
            className="lg:col-span-2 space-y-4 animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <LayoutList className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">
                Booking Requests
              </h2>
            </div>

            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="bg-secondary border border-border mb-4">
                <TabsTrigger
                  value="today"
                  className="data-[state=active]:bg-card"
                >
                  Today
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-card"
                >
                  <Clock className="w-4 h-4 mr-1.5 text-warning" />
                  Pending
                  {pendingCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="data-[state=active]:bg-card"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5 text-success" />
                  Approved
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="data-[state=active]:bg-card"
                >
                  <XCircle className="w-4 h-4 mr-1.5 text-destructive" />
                  Rejected
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today">
                <AdminBookingTable filter="today" />
              </TabsContent>
              <TabsContent value="pending">
                <AdminBookingTable filter="pending" />
              </TabsContent>
              <TabsContent value="approved">
                <AdminBookingTable filter="approved" />
              </TabsContent>
              <TabsContent value="rejected">
                <AdminBookingTable filter="rejected" />
              </TabsContent>
            </Tabs>
          </div>

          {/* Calendar Overview */}
          <div
            className="space-y-4 animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">
                Calendar Overview
              </h2>
            </div>
            <BookingCalendar
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
