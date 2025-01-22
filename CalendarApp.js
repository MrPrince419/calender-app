import { useState } from 'react'
import { Button } from "/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "/components/ui/dialog"
import { Input } from "/components/ui/input"
import { Label } from "/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import './styles.css'

export default function CalendarApp() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<{ date: Date, title: string, description: string }[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const handleAddEvent = () => {
    if (eventTitle.trim() === '') return
    setEvents([...events, { date: selectedDate!, title: eventTitle, description: eventDescription }])
    setModalOpen(false)
    setSelectedDate(null)
    setEventTitle('')
    setEventDescription('')
  }

  const handleDeleteEvent = (eventDate: Date, eventTitle: string) => {
    setEvents(events.filter(event => !isSameDay(event.date, eventDate) || event.title !== eventTitle))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={handlePrevMonth}>
          <CalendarIcon className="mr-2" />
          Prev
        </Button>
        <h1 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h1>
        <Button variant="outline" onClick={handleNextMonth}>
          Next
          <CalendarIcon className="ml-2" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold">
            {day}
          </div>
        ))}
        {daysInMonth.map(day => (
          <div key={day.toString()} className={`p-2 ${isSameDay(day, new Date()) ? 'bg-blue-100' : ''}`}>
            <div className="text-center mb-2">{format(day, 'd')}</div>
            <Button variant="outline" size="sm" className="w-full mb-2" onClick={() => { setSelectedDate(day); setModalOpen(true) }}>
              Add Event
            </Button>
            {events.filter(event => isSameDay(event.date, day)).map(event => (
              <div key={event.title} className="flex justify-between items-center bg-gray-100 p-2 rounded mb-1">
                <div>{event.title}</div>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteEvent(day, event.title)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden">Open</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              Add a new event for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={eventTitle.trim() === ''}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"