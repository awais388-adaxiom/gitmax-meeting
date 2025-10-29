"use client"

import { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { format, isSameDay, parseISO, isWithinInterval } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import 'react-day-picker/dist/style.css';

const meetings = ["Meeting1", "Meeting2", "Meeting3"]
const companies = ["Company1", "Company2", "Company3"]

const timeSlots = Array.from({ length: 19 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9
  const minute = i % 2 === 0 ? "00" : "30"
  return `${hour.toString().padStart(2, "0")}:${minute}:00`
})

interface UnavailableSlot {
  meetingID: number
  companyID: number
  time: string
  date: string
}
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}
export default function Component() {
  const [meeting, setMeeting] = useState("")
  const [company, setCompany] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState("")
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    // const data = fetch('https://haidristaging.planoai.com/data').then((res) => console.log("data : ",res.json()))
    fetchUnavailableSlots()
  }, [])
  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }

  const fetchUnavailableSlots = async () => {
    try {
      const response = await fetch('http://localhost:3333/meeting/view-meeting')
      const data = await response.json()
      console.log("data : ",data?.data)
      setUnavailableSlots(data?.data)
    } catch (error) {
      console.error('Error fetching unavailable slots:', error)
      toast({
        title: "Error",
        description: "Failed to fetch unavailable slots. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meeting || !company || !date || !timeSlot) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:3333/meeting/create-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // companyID: company.replace('Company', ''),
          // meetingID: meeting.replace('Meeting', ''),
          companyID: '1',
          meetingID: '1',
          time: timeSlot,
          date: format(date, 'yyyy-MM-dd'),
        }),
      })

      const data = await response.json()

      if (data.error == false) {
        showToast("Your slot has been scheduled successfully!", 'success')
        toast({
          title: "Success",
          description: "Your slot has been scheduled successfully!",
        })
        // Reset form
        setMeeting("")
        setCompany("")
        setDate(undefined)
        setTimeSlot("")
        fetchUnavailableSlots() // Refresh unavailable slots
      } else {
        showToast("Something Went Wrong, Please try Again!", 'error')

        throw new Error(data.message || 'Failed to schedule meeting')
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      showToast("Something Went Wrong, Please try Again!", 'error')

      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isDateAvailable = (date: Date) => {
    const startDate = new Date("2024-10-12")
    const endDate = new Date("2024-10-18")
    return isWithinInterval(date, { start: startDate, end: endDate })
  }

  const isTimeSlotUnavailable = (slot: string) => {
    // console.log("slot.slice(0,6): ",slot.slice(0,5))
    if (!date) return false
    const formattedDate = format(date, 'yyyy-MM-dd')
    return unavailableSlots.some((unavailableSlot) => 
      unavailableSlot.date == formattedDate && 
    unavailableSlot.time.slice(0,5) == slot.slice(0,5)
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" >
      <div className="max-w-md w-full mx-auto p-6 bg-white bg-opacity-90 rounded-lg shadow-lg backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Schedule a Meeting</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="meeting" className="block text-sm font-medium text-gray-700">
              Meeting
            </label>
            <Select onValueChange={setMeeting} value={meeting} required>
              <SelectTrigger id="meeting">
                <SelectValue placeholder="Select a meeting" />
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

          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <Select onValueChange={setCompany} value={company} required>
              <SelectTrigger id="company">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
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
                  onSelect={setDate}
                  disabled={(date) => !isDateAvailable(date)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Time Slot</label>
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
                  onClick={() => !isTimeSlotUnavailable(slot) && setTimeSlot(slot)}
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
      {/* Custom Toast Notifications */}
      <div className="fixed top-4 center flex flex-col space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "p-4 rounded-md shadow-md flex items-center justify-between",
              toast.type === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white"
            )}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-4 text-white hover:text-gray-200"
            >
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}