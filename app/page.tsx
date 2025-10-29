"use client";

import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { BASE_URL  } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import "react-day-picker/dist/style.css";
import Image from "next/image";
import icon from "../icon.png";

// ✅ Static meeting rooms
const meetings = ["Meeting room 1", "Meeting room 2"];

// ✅ Time slots from 9:00 to 18:30
const timeSlots = Array.from({ length: 19 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}:00`;
});

interface UnavailableSlot {
  meetingID: string | number;
  companyID: string | number;
  time: string;
  date: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

interface Company {
  id: number;
  name: string;
}

export default function Component() {
  const [meeting, setMeeting] = useState("Meeting room 1");
  const [company, setCompany] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState("");
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ✅ Initial load: get unavailable slots + companies
  useEffect(() => {
    fetchUnavailableSlots();
    fetchCompanies();
  }, []);

  // ✅ Toast function
  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      if (type === "success") {
        window.location.reload();
      }
    }, 3000);
  };

  // ✅ Fetch unavailable slots
  const fetchUnavailableSlots = async () => {
    try {
      const res = await fetch(`${BASE_URL}/meeting/view-meeting`);
      const data = await res.json();
      setUnavailableSlots(Array.isArray(data) ? data : data.data || []);  
    } catch (err) {
      console.error("Error fetching unavailable slots:", err);
      showToast("Failed to fetch unavailable slots.", "error");
    }
  };

  // ✅ Fetch companies from DB
  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${BASE_URL}/company/view-company`);
      const data = await res.json();
      // expecting [{id: 1, name: "ABC"}, {id: 2, name: "XYZ"}]
      setCompanies(data || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      showToast("Failed to fetch companies.", "error");
    }
  };

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meeting || !company || !date || !timeSlot) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/meeting/create-meeting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyID: company, // sending ID
          meetingID: meeting,
          time: timeSlot,
          date: format(date, "yyyy-MM-dd"),
        }),
      });

      const data = await res.json();

      if (!data.error) {
        showToast("Your slot has been scheduled successfully!", "success");
      } else {
        showToast("Something went wrong, please try again!", "error");
      }
    } catch (err) {
      console.error("Error scheduling meeting:", err);
      showToast("Failed to schedule meeting. Try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Date availability logic
  const isDateAvailable = (d: Date) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    return isWithinInterval(d, { start: yesterday, end: today });
  };

  // ✅ Time slot availability check
  const isTimeSlotUnavailable = (slot: string) => {
    if (!date) return false;
    const formatted = format(date, "yyyy-MM-dd");
    return unavailableSlots.some(
      (u) =>
        u.date === formatted &&
        u.time.slice(0, 5) === slot.slice(0, 5) &&
        u.meetingID.toString() === meeting
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center">
      <div className="max-w-md w-full mx-auto p-6 bg-white bg-opacity-90 rounded-lg shadow-lg backdrop-blur-sm">
        <div className="flex justify-center mb-4">
          <Image src={icon} alt="Logo" width={120} height={120} />
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Schedule a Meeting
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Meeting selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Room
            </label>
            <Select onValueChange={setMeeting} value={meeting}>
              <SelectTrigger>
                <SelectValue placeholder="Select meeting room" />
              </SelectTrigger>
              <SelectContent>
                {meetings.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

{/* ✅ Company selection (fully fixed version) */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Company
  </label>

  <Select onValueChange={setCompany} value={company}>
    {/* 🔹 Select box (trigger) */}
    <SelectTrigger className="w-full max-w-full">
      <SelectValue placeholder="Select a company" className="truncate" />
    </SelectTrigger>

    {/* 🔹 Dropdown list (same width + truncate fix) */}
    <SelectContent
      position="popper"
      className="max-h-60 w-[var(--radix-select-trigger-width)]"
    >
      {companies.length > 0 ? (
        companies.map((c) => (
          <SelectItem
            key={c.id}
            value={c.name}
            title={c.name} // hover pe full name dikhata hai
            className="flex items-center gap-2 overflow-hidden"
          >
            {/* ✅ Tick icon Radix khud handle karta hai, yahan bas text truncate */}
            <span className="flex-1 truncate block whitespace-nowrap overflow-hidden text-ellipsis">
              {c.name}
            </span>
          </SelectItem>
        ))
      ) : (
        <SelectItem value="none" disabled>
          Loading...
        </SelectItem>
      )}
    </SelectContent>
  </Select>
</div>





          {/* ✅ Date picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => !isDateAvailable(d)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* ✅ Time slot buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slot
            </label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={timeSlot === slot ? "default" : "outline"}
                  className={cn(
                    "text-xs px-2 py-1",
                    isTimeSlotUnavailable(slot) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() =>
                    !isTimeSlotUnavailable(slot) && setTimeSlot(slot)
                  }
                  disabled={isTimeSlotUnavailable(slot)}
                >
                  {slot.slice(0, -3)}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Scheduling..." : "Schedule Meeting"}
          </Button>
        </form>
      </div>

      {/* ✅ Toast notifications */}
      <div className="fixed top-4 right-4 flex flex-col space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "p-4 rounded-md shadow-md transition-transform animate-slide-in",
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <style jsx>{`
        .animate-slide-in {
          transform: translateX(100%);
          animation: slide-in 0.3s forwards;
        }
        @keyframes slide-in {
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
