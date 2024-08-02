"use client";
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { format, isSameDay, parseISO } from 'date-fns';

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
  const [name, setName] = useState('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<Shift[]>([]);
  const [availableShifts, setAvailableShifts] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    const response = await fetch('/api/shifts');
    const data = await response.json();
    setShifts(data.shifts);
  };

  const handleDateClick = (date: Date) => {
    const shiftsForDate = shifts.filter((shift) =>
      isSameDay(parseISO(shift.start), date)
    );
    setSelectedShifts(shiftsForDate);
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleShiftClick = (shiftId: string) => {
    if (!name) {
      alert('Please enter your name before selecting shifts.');
      return;
    }
    setAvailableShifts((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId]
    );
  };

  const submitAvailability = async () => {
    if (!name) {
      alert("Please enter your name before submitting availability.");
      return;
    }
    console.log(name)
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
      console.log(response)

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
    <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="mb-4 p-2 border rounded text-black"
      />

      <div className="overflow-x-auto">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={shifts.map((shift) => ({
            ...shift,
            id: shift._id,
            color: availableShifts.includes(shift._id) ? 'green' : 'blue',
          }))}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth',
          }}
          dateClick={(info) => {
            handleDateClick(info.date);
          }}
          eventClick={(info) => {
            const shiftId = info.event.id;
            handleShiftClick(shiftId);
          }}
        />
      </div>

      {showModal && selectedDate && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-11/12 md:w-1/2 lg:w-1/3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Shifts for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            {selectedShifts.length > 0 ? (
              selectedShifts.map((shift) => (
                <div key={shift._id} className="mb-4 p-4 border rounded-lg shadow-md">
                  <h3 className="font-bold text-lg">{shift.title}</h3>
                  <p>
                    <strong>Time:</strong> {format(parseISO(shift.start), 'p')} -{' '}
                    {format(parseISO(shift.end), 'p')}
                  </p>
                  <p>
                    <strong>Accepted Workers:</strong>{' '}
                    {shift.acceptedWorkers?.join(', ') || 'None'}
                  </p>
                  <p>
                    <strong>Potential Workers:</strong>{' '}
                    {shift.potentialWorkers.join(', ') || 'None'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No shifts for this day.</p>
            )}
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button
        onClick={submitAvailability}
        className="mt-4 px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        Submit Availability
      </button>
    </div>
  );
}
