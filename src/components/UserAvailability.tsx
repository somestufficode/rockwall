"use client"
import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

interface Shift {
  _id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  role?: string;
  acceptedWorkers?: string[];
  potentialWorkers: string[];
}

export default function UserAvailability() {
  const [name, setName] = useState('')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [availableShifts, setAvailableShifts] = useState<string[]>([])

  useEffect(() => {
    fetchShifts()
  }, [])

  const fetchShifts = async () => {
    const response = await fetch('/api/shifts')
    const data = await response.json()
    setShifts(data.shifts)
  }

  const handleShiftClick = (shiftId: string) => {
    if (!name) {
      alert("Please enter your name before selecting shifts.");
      return;
    }
    setAvailableShifts(prev =>
      prev.includes(shiftId)
        ? prev.filter(id => id !== shiftId)
        : [...prev, shiftId]
    );
  };

    const submitAvailability = async () => {
        if (!name) {
          alert("Please enter your name before submitting availability.");
          return;
        }
        try {
          const response = await fetch('/api/shifts', {  // Note the change in URL
            method: 'PUT',  // Changed from POST to PUT
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              name, 
              shiftIds: availableShifts
            }),
          })
          if (!response.ok) throw new Error('Failed to save availability')
          alert('Availability submitted successfully!')
          
          // Update local shifts state with the new potential worker
          setShifts(prevShifts => prevShifts.map(shift => {
            if (availableShifts.includes(shift._id)) {
              return {
                ...shift,
                potentialWorkers: [...(shift.potentialWorkers || []), name]
              };
            }
            return shift;
          }));
      
          setAvailableShifts([])
        } catch (error) {
          console.error('Error saving availability:', error)
          alert('Failed to submit availability. Please try again.')
        }
      }

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="mb-4 p-2 border rounded"
      />

    <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={shifts.map(shift => ({
          ...shift,
          id: shift._id,
          color: availableShifts.includes(shift._id) ? 'green' : 'blue',
          title: shift.acceptedWorkers
            ? `${shift.title} (Taken by ${shift.acceptedWorkers.join(', ')})`
            : shift.title,
        }))}
        eventClick={(info) => {
          const shiftId = info.event.id;
          if (info.event.extendedProps.acceptedWorkers && info.event.extendedProps.acceptedWorkers.length > 0) {
            alert(`This shift is already taken by ${info.event.extendedProps.acceptedWorkers.join(', ')}`);
          } else {
            handleShiftClick(shiftId);
          }
        }}
      />
      <button
        onClick={submitAvailability}
        className="mt-4 px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        Submit Availability
      </button>
    </div>
  )
}