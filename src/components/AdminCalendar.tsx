"use client"
import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { EventSourceInput } from '@fullcalendar/core/index.js'

interface Shift {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  role?: string;
  acceptedWorkers?: string[];
  potentialWorkers: string[];
}

interface Availability {
  shiftId: string;
  workerName: string;
}

export default function AdminCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newShift, setNewShift] = useState<Omit<Shift, 'id'>>({
    title: '',
    start: '',
    end: '',
    allDay: false,
    role: '',
    acceptedWorkers: [],
    potentialWorkers: [],
  })

  useEffect(() => {
    fetchShifts()
    fetchAvailabilities()
  }, [])

  const fetchShifts = async () => {
    const response = await fetch('/api/shifts')
    const data = await response.json()
    setShifts(data.shifts)
  }

  const fetchAvailabilities = async () => {
    const response = await fetch('/api/availabilities')
    const data = await response.json()
    setAvailabilities(data.availabilities)
  }

  const handleDateClick = (arg: { date: Date, allDay: boolean }) => {
    setNewShift({
      title: '',
      start: arg.date.toISOString().slice(0, 16),
      end: new Date(arg.date.getTime() + 3600000).toISOString().slice(0, 16),
      allDay: arg.allDay,
      role: '',
      acceptedWorkers: [],
      potentialWorkers: [],
    })
    setShowModal(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewShift({
      ...newShift,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const response = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShift),
    })
    if (response.ok) {
      fetchShifts()
      setShowModal(false)
      setNewShift({
        title: '',
        start: '',
        end: '',
        allDay: false,
        role: '',
        acceptedWorkers: [],
        potentialWorkers: [],
      })
    }
  }

  const handleAcceptWorker = async (shiftId: string, workerName: string) => {
    const response = await fetch(`/api/shifts/${shiftId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerName }),
    })
    if (response.ok) {
      fetchShifts()
      fetchAvailabilities()
    }
  }

  const handleFinalizeCalendar = async () => {
    const response = await fetch('/api/calendar/finalize', { method: 'POST' })
    if (response.ok) {
      fetchShifts()
    }
  }

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={shifts.map(shift => ({
          ...shift,
          title: `${shift.title} ${shift.acceptedWorkers ? `(${shift.acceptedWorkers})` : ''}`,
        })) as EventSourceInput}
        editable={true}
        selectable={true}
        dateClick={handleDateClick}
      />

      <button onClick={handleFinalizeCalendar} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
        Finalize Calendar
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" 
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Add New Shift</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                value={newShift.title}
                onChange={handleChange}
                placeholder="Shift Title"
                className="mt-2 p-2 w-full border rounded"
              />
              <input
                type="datetime-local"
                name="start"
                value={newShift.start}
                onChange={handleChange}
                className="mt-2 p-2 w-full border rounded"
              />
              <input
                type="datetime-local"
                name="end"
                value={newShift.end}
                onChange={handleChange}
                className="mt-2 p-2 w-full border rounded"
              />
              <input
                type="text"
                name="role"
                value={newShift.role}
                onChange={handleChange}
                placeholder="Role"
                className="mt-2 p-2 w-full border rounded"
              />
              <div className="mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Add Shift
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="ml-2 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Worker Availabilities</h2>
        {availabilities.map((availability, index) => (
          <div key={index} className="mb-2">
            <span>{availability.workerName} is available for shift {availability.shiftId}</span>
            <button
              onClick={() => handleAcceptWorker(availability.shiftId, availability.workerName)}
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
            >
              Accept
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}