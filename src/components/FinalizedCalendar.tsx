'use client';

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { parseISO, format, addDays, startOfMonth } from "date-fns";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import ReturnHomeButton from "./ReturnHomeButton";

interface Shift {
  _id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  acceptedWorkers: string[];
  potentialWorkers: string[];
}

interface FinalizedCalendarProps {
  name: string;
}

export default function FinalizedCalendar({ name }: FinalizedCalendarProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchShifts();
    handleResize();
    // Add event listener to update isMobile on window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as needed
  };


  const fetchShifts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/shifts");
      const data = await response.json();
      setShifts(data.shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = ({ event }: any) => {
    const shift = shifts.find((s) => s._id === event.id);
    if (shift) {
      setSelectedShift(shift);
    }
  };

  const generatePlaceholderEvents = (daysInMonth: number) => {
    const start = startOfMonth(new Date());
    return Array.from({ length: daysInMonth }, (_, index) => ({
      id: `placeholder-${index}`,
      title: 'Loading...',
      start: addDays(start, index),
      end: addDays(start, index),
      allDay: true,
      extendedProps: { isPlaceholder: true },
    }));
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Welcome, {name}</h1>
        <ReturnHomeButton />
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, listPlugin, bootstrap5Plugin]}
        themeSystem="bootstrap5"
        initialView="listWeek"
        headerToolbar={{
          left: isMobile ? "prev,next" : "prev,next today",
          center: "title",
          right: isMobile ? "" : "dayGridMonth,listWeek",
        }}
        events={isLoading ? generatePlaceholderEvents(31) : shifts.map((shift) => ({
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
        eventContent={({ event }) => {
          if (event.extendedProps.isPlaceholder) {
            return (
              <div className="p-2 bg-white rounded-lg ">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            );
          }
          return (
            <div className="p-2 bg-white rounded-lg shadow-md">
              <p className="font-bold text-sm">{event.title}</p>
              <p className="text-gray-600 text-sm mt-1">
                {event.extendedProps.acceptedWorkers?.join(", ") || "No workers"}
              </p>
            </div>
          );
        }}
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
            <div className="mt-4">
              <h3 className="font-medium text-lg">Potential Workers:</h3>
              {selectedShift.potentialWorkers.length > 0 ? (
                <ul className="list-disc list-inside mt-2">
                  {selectedShift.potentialWorkers.map((worker, index) => (
                    <li key={index} className="text-gray-700 text-lg font-semibold">
                      {worker}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">No potential workers.</p>
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
