'use client';

import { useState, useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { format, isSameDay, parseISO, startOfMonth, addDays } from "date-fns";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import ReturnHomeButton from "./ReturnHomeButton";
import { Box, Button, Skeleton } from "@mui/material";

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

interface UserAvailabilityProps {
  name: string;
}

export default function UserAvailability({ name }: UserAvailabilityProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<Shift[]>([]);
  const [availableShifts, setAvailableShifts] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [currentShiftIndex, setCurrentShiftIndex] = useState(0);


  useEffect(() => {
    fetchShifts();
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

      const initialAvailableShifts = data.shifts
        .filter((shift: Shift) => shift.potentialWorkers.includes(name))
        .map((shift: Shift) => shift._id);
      setAvailableShifts(initialAvailableShifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateClick = (date: Date) => {
    const shiftsForDate = shifts.filter((shift) =>
      isSameDay(parseISO(shift.start), date)
    );
    setSelectedShifts(shiftsForDate);
    setSelectedDate(date);
    setCurrentShiftIndex(0);
    setShowModal(true);
  };

  const handleShiftClick = (shiftId: string) => {
    const shift = shifts.find((s) => s._id === shiftId);
    if (shift) {
      setSelectedShift(shift);
      setShowModal(true);
    }
  };

  const handleCheckboxChange = (shiftId: string, isChecked: boolean) => {
    setAvailableShifts((prev) =>
      isChecked ? [...prev, shiftId] : prev.filter((id) => id !== shiftId)
    );
  };

  const submitAvailability = async () => {
    if (!name) {
      alert("Name is missing.");
      return;
    }
    try {
      const response = await fetch("/api/shifts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          shiftIds: availableShifts,
        }),
      });

      if (!response.ok) throw new Error("Failed to save availability");
      alert("Availability submitted successfully!");

      setShifts((prevShifts) =>
        prevShifts.map((shift) => {
          if (availableShifts.includes(shift._id)) {
            return {
              ...shift,
              potentialWorkers: [...shift.potentialWorkers, name].filter(
                (value, index, self) => self.indexOf(value) === index
              ),
            };
          } else {
            return {
              ...shift,
              potentialWorkers: shift.potentialWorkers.filter(
                (worker) => worker !== name
              ),
            };
          }
        })
      );
    } catch (error) {
      console.error("Error saving availability:", error);
      alert("Failed to submit availability. Please try again.");
    }
  };

  const generatePlaceholderEvents = (daysInMonth: number) => {
    const start = startOfMonth(new Date());
    return Array.from({ length: daysInMonth }, (_, index) => ({
      id: `placeholder-${index}`,
      title: "Loading...",
      start: addDays(start, index),
      end: addDays(start, index),
      allDay: true,
      extendedProps: { isPlaceholder: true },
    }));
  };

  const renderEventContent = (eventInfo: any) => {
    const isChecked = availableShifts.includes(eventInfo.event.id);

    if (eventInfo.event.extendedProps.isPlaceholder) {
      return (
        <div className="p-2 bg-white rounded-lg shadow-md">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <Checkbox
          checked={isChecked}
          onChange={(e) =>
            handleCheckboxChange(eventInfo.event.id, e.target.checked)
          }
          onClick={(e) => e.stopPropagation()}
          inputProps={{ "aria-label": "Checkbox for availability" }}
          color="primary"
        />
        <span
          onClick={() => handleShiftClick(eventInfo.event.id)}
          className="cursor-pointer"
        >
          {eventInfo.event.title}
        </span>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Welcome, {name}</h1>
        <ReturnHomeButton />
      </div>
      <div className="mb-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin, bootstrap5Plugin]}
          themeSystem="bootstrap5"
          initialView="listMonth"
          headerToolbar={{
            left: isMobile ? "prev,next" : "prev,next today",
            center: "title",
            right: isMobile ? "" : "dayGridMonth,listMonth",
          }}
          events={
            isLoading
              ? generatePlaceholderEvents(31)
              : shifts.map((shift) => ({
                  ...shift,
                  id: shift._id,
                }))
          }
          dateClick={(info) => {
            handleDateClick(info.date);
          }}
          eventClick={(info) => {
            handleShiftClick(info.event.id);
          }}
          eventContent={renderEventContent}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.5}
        />
      </div>

      {showModal && (selectedDate || selectedShift) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-0"
          onClick={() => {
            setShowModal(false);
            setSelectedShift(null);
            setSelectedDate(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {selectedDate
                  ? `Shifts for ${format(selectedDate, "MMMM d, yyyy")}`
                  : selectedShift?.title}
              </h2>
              {selectedDate && (
                <div className="text-white">
                  {currentShiftIndex + 1} / {selectedShifts.length}
                </div>
              )}
            </div>
            <div className="p-6">
              {selectedDate && selectedShifts.length > 0 && (
                <div>
                  <ShiftDetails shift={selectedShifts[currentShiftIndex]} />
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => setCurrentShiftIndex((prev) => (prev > 0 ? prev - 1 : selectedShifts.length - 1))}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setCurrentShiftIndex((prev) => (prev < selectedShifts.length - 1 ? prev + 1 : 0))}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
              {selectedDate && selectedShifts.length === 0 && (
                <p className="text-gray-500 italic">No shifts scheduled for this day.</p>
              )}
              {selectedShift && <ShiftDetails shift={selectedShift} />}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedShift(null);
                  setSelectedDate(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={submitAvailability}
          className="mt-4 px-4 py-2 items-center bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          disabled={isLoading}
        >
          {isLoading ? <Skeleton width={100} /> : "Submit Availability"}
        </Button>
      </div>
    </div>
  );
}

function ShiftDetails({ shift }: { shift: Shift }) {
  return (
    <div>
      <h3 className="font-semibold text-lg text-gray-800 mb-2">{shift.title}</h3>
      <p className="text-gray-700">
        <span className="font-semibold">Date:</span>{" "}
        {format(parseISO(shift.start), "MMMM d, yyyy")}
      </p>
      <p className="text-gray-700 mb-4">
        <span className="font-semibold">Time:</span>{" "}
        {format(parseISO(shift.start), "p")} - {format(parseISO(shift.end), "p")}
      </p>
      <div className="mb-4">
        <h4 className="font-semibold text-md text-gray-800 mb-2">Accepted Workers</h4>
        {shift.acceptedWorkers && shift.acceptedWorkers.length > 0 ? (
          <ul className="space-y-1">
            {shift.acceptedWorkers.map((worker, index) => (
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
        <h4 className="font-semibold text-md text-gray-800 mb-2">Potential Workers</h4>
        {shift.potentialWorkers.length > 0 ? (
          <ul className="space-y-1">
            {shift.potentialWorkers.map((worker, index) => (
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
  );
}