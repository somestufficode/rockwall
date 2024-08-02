"use client";
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { EventSourceInput, EventChangeArg } from '@fullcalendar/core';

interface Shift {
  id: string;
  title: string;
  start: string;
  end: string;
  acceptedWorkers?: string[];
  potentialWorkers: string[];
}

interface Availability {
  shiftId: string;
  workerName: string;
}

interface NewShift {
  title: string;
  startTime: string;
  endTime: string;
  acceptedWorkers: string[];
  potentialWorkers: string[];
}

export default function AdminCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newShift, setNewShift] = useState<NewShift>({
    title: '',
    startTime: '',
    endTime: '',
    acceptedWorkers: [],
    potentialWorkers: [],
  });
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    fetchShifts();
    fetchAvailabilities();
  }, []);

  const fetchShifts = async () => {
    const response = await fetch('/api/shifts');
    const data = await response.json();
    setShifts(data.shifts);
  };

  const fetchAvailabilities = async () => {
    const response = await fetch('/api/availabilities');
    const data = await response.json();
    setAvailabilities(data.availabilities);
  };

  const handleDateSelect = (arg: { start: Date; end: Date }) => {
    const dates = [];
    let currentDate = new Date(arg.start);
    while (currentDate < arg.end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDates(dates);
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewShift({
      ...newShift,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const shifts = selectedDates.map(date => {
      const start = new Date(date);
      start.setHours(parseInt(newShift.startTime.split(':')[0]), parseInt(newShift.startTime.split(':')[1]));
      const end = new Date(date);
      end.setHours(parseInt(newShift.endTime.split(':')[0]), parseInt(newShift.endTime.split(':')[1]));
      return {
        title: newShift.title,
        start: start.toISOString(),
        end: end.toISOString(),
        acceptedWorkers: [],
        potentialWorkers: [],
      };
    });

    const response = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shifts),
    });

    if (response.ok) {
      fetchShifts();
      setShowModal(false);
      setNewShift({
        title: '',
        startTime: '',
        endTime: '',
        acceptedWorkers: [],
        potentialWorkers: [],
      });
      setSelectedDates([]);
    }
  };

  const handleAcceptWorker = async (shiftId: string, workerName: string) => {
    const response = await fetch(`/api/shifts/${shiftId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerName }),
    });
    if (response.ok) {
      fetchShifts();
      fetchAvailabilities();
    }
  };

  const handleFinalizeCalendar = async () => {
    const response = await fetch('/api/calendar/finalize', { method: 'POST' });
    if (response.ok) {
      fetchShifts();
    }
  };

  const handleEventChange = async (changeInfo: EventChangeArg) => {
    console.log('c',changeInfo)
    const updatedShift = {
      id: changeInfo.event._def.extendedProps._id,
      title: changeInfo.event.title,
      start: changeInfo.event.start?.toISOString(),
      end: changeInfo.event.end?.toISOString(),
    };

    try {
      const response = await fetch(`/api/shifts/${updatedShift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedShift),
      });

      console.log('u',updatedShift)
      console.log('r',response)

      if (response.ok) {
        fetchShifts(); // Refresh shifts after successful update
      } else {
        // If update fails, revert the change
        changeInfo.revert();
      }
    } catch (error) {
      console.error('Error updating shift:', error);
      changeInfo.revert();
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
        initialView='dayGridMonth'
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listMonth'
        }}
        events={shifts.map(shift => ({
          ...shift,
          title: shift.title
        })) as EventSourceInput}
        editable={true}
        selectable={true}
        select={handleDateSelect}
        eventChange={handleEventChange}
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
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
              Add Shifts for Selected Dates
            </h3>
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
                type="time"
                name="startTime"
                value={newShift.startTime}
                onChange={handleChange}
                className="mt-2 p-2 w-full border rounded"
              />
              <input
                type="time"
                name="endTime"
                value={newShift.endTime}
                onChange={handleChange}
                className="mt-2 p-2 w-full border rounded"
              />
              <div className="mt-4 mb-4">
                <h4 className="font-medium">Selected Dates:</h4>
                <ul>
                  {selectedDates.map((date, index) => (
                    <li key={index}>{date.toDateString()}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Add Shifts
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDates([]);
                  }}
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
  );
}