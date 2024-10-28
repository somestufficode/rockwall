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

interface EmployeeCalendarProps {
  name: string;
}

export default function EmployeeCalendar({ name }: EmployeeCalendarProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchShifts();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
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

  const filteredShifts = shifts.filter(shift => 
    shift.acceptedWorkers.includes(name)
  );

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

  const determineEventColor = (title: string) => {
    if (title.includes("Open Wall")) {
      return "bg-red-100 border-red-400 text-red-800";
    } else if (title.includes("Holiday Class")) {
      return "bg-blue-100 border-blue-400 text-blue-800";
    } else if (title.includes("Adventure Class")) {
      return "bg-purple-100 border-purple-400 text-purple-800";
    } else if (title.includes("Class")) {
      return "bg-green-100 border-green-400 text-green-800";
    } else if (title.includes("Camp")) {
      return "bg-blue-100 border-blue-400 text-blue-800";
    } else {
      return "bg-gray-100 border-gray-400 text-gray-800";
    }
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
        titleFormat={isMobile ? { month: 'short', day: 'numeric' } : { month: 'long', day: 'numeric' }}
        events={isLoading ? generatePlaceholderEvents(31) : filteredShifts.map((shift) => ({
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
                  <div className="p-1 bg-white rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                );
              }
              
          const eventColorClasses = determineEventColor(event.title);
        
          return (
            <div className={`m-1 p-1 rounded-lg shadow-md ${eventColorClasses}`}>
              <p className="font-bold text-sm whitespace-normal break-words">{event.title}</p>
              <p className="text-gray-600 text-md mt-0.5 whitespace-normal break-words">
                {event.extendedProps.acceptedWorkers?.join(", ") || "No workers"}
              </p>
            </div>
          );
        }}
      />

{selectedShift && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-0"
            onClick={() => setSelectedShift(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{selectedShift.title}</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">Date:</span>{" "}
                    {format(parseISO(selectedShift.start), "MMMM d, yyyy")}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Time:</span>{" "}
                    {format(parseISO(selectedShift.start), "p")}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Accepted Workers</h3>
                  {selectedShift.acceptedWorkers.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedShift.acceptedWorkers.map((worker, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {worker}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No accepted workers yet.</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Potential Workers</h3>
                  {selectedShift.potentialWorkers.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedShift.potentialWorkers.map((worker, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <svg className="h-4 w-4 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {worker}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No potential workers at the moment.</p>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setSelectedShift(null)}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
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