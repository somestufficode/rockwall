"use client";
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { parseISO, format } from "date-fns";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';


interface Shift {
  _id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  acceptedWorkers: string[];
  potentialWorkers: string[];
}

export default function FinalizedCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await fetch("/api/shifts");
      const data = await response.json();
      setShifts(data.shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  const handleEventClick = ({ event }: any) => {
    const shift = shifts.find((s) => s._id === event.id);
    if (shift) {
      setSelectedShift(shift);
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, listPlugin, bootstrap5Plugin]}
        themeSystem='bootstrap5'        
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,listMonth",
        }}
        events={shifts.map((shift) => ({
          id: shift._id,
          title: `${shift.title} ${format(parseISO(shift.start), "p")}`,
          start: shift.start,
          end: shift.end,
          allDay: shift.allDay,
          extendedProps: {
            acceptedWorkers: shift.acceptedWorkers || [],
            potentialWorkers: shift.potentialWorkers || [],
          },
        }))}
        eventClick={handleEventClick}
        height="auto"
        contentHeight="auto"
        aspectRatio={1.35}
        eventContent={({ event }) => (
          <div className="p-2 bg-white rounded-lg shadow-md">
            <p className="font-bold text-sm">{event.title}</p>
            <p className="text-gray-600 text-sm mt-1">
              {event.extendedProps.acceptedWorkers.join(", ") || "No workers"}
            </p>
          </div>
        )}
      />

      {selectedShift && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedShift(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-4">{selectedShift.title}</h2>
            <p className="text-gray-700">
              <strong>Date:</strong>{" "}
              {format(parseISO(selectedShift.start), "MMMM d, yyyy")}
            </p>
            <p className="text-gray-700">
              <strong>Time:</strong>{" "}
              {format(parseISO(selectedShift.start), "p")}
            </p>
            <div className="mt-4">
              <h3 className="font-medium text-lg">Accepted Workers:</h3>
              {selectedShift.acceptedWorkers.length > 0 ? (
                <ul className="list-disc list-inside mt-2">
                  {selectedShift.acceptedWorkers.map((worker, index) => (
                    <li key={index} className="text-gray-700 text-lg font-semibold">
                      {worker}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">No accepted workers.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedShift(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
