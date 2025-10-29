"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarIcon } from "lucide-react";
import { format, isSameDay, parseISO, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "react-day-picker/dist/style.css";
import icon from "../../icon.png";
import Image from "next/image";
import { useAuth } from '../auth/useAuth'
import { useRouter } from "next/navigation";

const meetings = ["Meeting1", "Meeting2", "Meeting3"];
const companies = ["Company1", "Company2", "Company3"];

interface Meeting {
  meetingID: number;
  companyID: number;
  time: string;
  date: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function Component() {
  const [meeting, setMeeting] = useState("");
  const [company, setCompany] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [scheduledMeetings, setScheduledMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const fetchMeetings = useCallback(async (selectedDate: Date) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3333/meeting/view-meeting");
      const data = await response.json();

      if (data) {
        const filteredMeetings = data.filter((meeting: Meeting) =>
          isSameDay(parseISO(meeting.date), selectedDate)
        );
        setScheduledMeetings(filteredMeetings);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      showToast("Failed to fetch meetings. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMeetings(date)
    }
  }, [date, fetchMeetings,isAuthenticated]);

 
  const isDateAvailable = (date: Date) => {
    const startDate = new Date("2024-10-1");
    const endDate = new Date("2024-12-30");
    return isWithinInterval(date, { start: startDate, end: endDate });
  };

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isAuthenticated) {
    return null
  }
  return (
    <div>
      <div className="min-w-[500px] w-full mx-auto bg-white rounded-lg shadow-lg p-6 opacity-90">
        <div className="flex justify-center">
          <Image src={icon} alt="Logo" width={200} height={200} />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Scheduled Meetings
        </h2>
        <div className="mb-6">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
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
                onSelect={(newDate) => newDate && setDate(newDate)}
                disabled={(date) => !isDateAvailable(date)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {isLoading ? (
          <div className="text-center">Loading meetings...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meeting Name</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledMeetings.length > 0 ? (
                scheduledMeetings.map((meeting, index) => (
                  <TableRow key={index}>
                    <TableCell>{meeting.meetingID}</TableCell>
                    <TableCell>{meeting.companyID}</TableCell>
                    <TableCell>{meeting.time}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No meetings scheduled for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Custom Toast Notifications */}
      <div className="fixed top-4 right-4 flex flex-col space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "p-4 rounded-md shadow-md flex items-center justify-between",
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            )}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
