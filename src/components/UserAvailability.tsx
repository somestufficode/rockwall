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
    setShowModal(true);
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
              ), // Ensure uniqueness with array
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
      <div>
        <Checkbox
          checked={isChecked}
          onChange={(e) =>
            handleCheckboxChange(eventInfo.event.id, e.target.checked)
          }
          inputProps={{ "aria-label": "Checkbox for availability" }}
          color="primary"
        />
        <span>{eventInfo.event.title}</span>
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
          eventContent={renderEventContent}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.5}
        />
      </div>

      {showModal && selectedDate && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 w-full max-w-md md:max-w-lg lg:max-w-xl h-auto max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">
              Shifts for {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            {selectedShifts.length > 0 ? (
              selectedShifts.map((shift) => (
                <div
                  key={shift._id}
                  className="mb-3 p-3 border rounded-lg shadow-sm"
                >
                  <h3 className="font-semibold text-md">{shift.title}</h3>
                  <p className="text-sm">
                    <strong>Time:</strong>{" "}
                    {format(parseISO(shift.start), "p")} -{" "}
                    {format(parseISO(shift.end), "p")}
                  </p>
                  <p className="text-sm">
                    <strong>Accepted Workers:</strong>{" "}
                    {shift.acceptedWorkers?.join(", ") || "None"}
                  </p>
                  <p className="text-sm">
                    <strong>Potential Workers:</strong>{" "}
                    {shift.potentialWorkers.join(", ") || "None"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No shifts for this day.</p>
            )}
            <button
              className="mt-3 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
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
