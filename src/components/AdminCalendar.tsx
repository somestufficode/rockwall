"use client";
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { EventSourceInput, EventChangeArg } from "@fullcalendar/core";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import ReturnHomeButton from "./ReturnHomeButton";

interface Shift {
  _id: string;
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
  const [modalContent, setModalContent] = useState<"options" | "add" | "shifts">("options");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [newShift, setNewShift] = useState<NewShift>({
    title: "",
    startTime: "",
    endTime: "",
    acceptedWorkers: [],
    potentialWorkers: [],
  });
  const [workersSelection, setWorkersSelection] = useState<string[]>([]);

  useEffect(() => {
    fetchShifts();
    fetchAvailabilities();
  }, []);

  const fetchShifts = async () => {
    const response = await fetch("/api/shifts");
    const data = await response.json();
    setShifts(data.shifts);
  };

  const fetchAvailabilities = async () => {
    const response = await fetch("/api/availabilities");
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
    setModalContent("options");
    setShowModal(true);
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setWorkersSelection(shift.acceptedWorkers || []);
    setModalContent("shifts");
    setShowModal(true);
  };

  const handleAcceptWorkers = async () => {
    if (!selectedShift) return;

    try {
      const response = await fetch(`/api/shifts/${selectedShift._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptedWorkers: workersSelection,
        }),
      });

      if (response.ok) {
        setShifts((prevShifts) =>
          prevShifts.map((shift) =>
            shift._id === selectedShift._id
              ? { ...shift, acceptedWorkers: workersSelection }
              : shift
          )
        );
      }
    } catch (error) {
      console.error("Error finalizing workers:", error);
    }
  };

  const handleWorkerToggle = (workerName: string) => {
    setWorkersSelection((prev) =>
      prev.includes(workerName)
        ? prev.filter((name) => name !== workerName)
        : [...prev, workerName]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewShift({
      ...newShift,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newShifts = selectedDates.map((date) => {
      const start = new Date(date);
      start.setHours(
        parseInt(newShift.startTime.split(":")[0]),
        parseInt(newShift.startTime.split(":")[1])
      );
      const end = new Date(date);
      end.setHours(
        parseInt(newShift.endTime.split(":")[0]),
        parseInt(newShift.endTime.split(":")[1])
      );
      return {
        title: newShift.title,
        start: start.toISOString(),
        end: end.toISOString(),
        acceptedWorkers: [],
        potentialWorkers: [],
      };
    });

    const response = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newShifts),
    });

    if (response.ok) {
      fetchShifts();
      setShowModal(false);
      setNewShift({
        title: "",
        startTime: "",
        endTime: "",
        acceptedWorkers: [],
        potentialWorkers: [],
      });
      setSelectedDates([]);
    }
  };

  const handleAcceptWorker = async (shiftId: string, workerName: string) => {
    const response = await fetch(`/api/shifts/${shiftId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerName }),
    });
    if (response.ok) {
      fetchShifts();
      fetchAvailabilities();
    }
  };

  const handleEventChange = async (changeInfo: EventChangeArg) => {
    const updatedShift = {
      id: changeInfo.event._def.extendedProps._id,
      title: changeInfo.event.title,
      start: changeInfo.event.start?.toISOString(),
      end: changeInfo.event.end?.toISOString(),
    };

    try {
      const response = await fetch(`/api/shifts/${updatedShift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedShift),
      });

      if (response.ok) {
        fetchShifts();
      } else {
        changeInfo.revert();
      }
    } catch (error) {
      console.error("Error updating shift:", error);
      changeInfo.revert();
    }
  };

  return (
    <div>
{/*       
      <div className="flex justify-between items-center mb-4">
        <ReturnHomeButton />
      </div> */}

      <FullCalendar
        plugins={[
          dayGridPlugin,
          interactionPlugin,
          timeGridPlugin,
          listPlugin,
          bootstrap5Plugin,
        ]}
        themeSystem="bootstrap5"
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          right: "title",
        }}
        events={shifts.map((shift) => ({
          ...shift,
          title: shift.title,
        })) as EventSourceInput}
        editable={true}
        selectable={true}
        select={handleDateSelect}
        eventClick={(info) => {
          const shift = shifts.find((s) => s._id === info.event.id);
          if (shift) {
            handleShiftClick(shift);
          }
        }}
        eventChange={handleEventChange}
      />

      {showModal && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {modalContent === "options" && (
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Selected Dates: {selectedDates.map(date => date.toDateString()).join(', ')}
                </h3>
                <div className="flex justify-between">
                  <button
                    onClick={() => setModalContent("add")}
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Add Shift
                  </button>
                  <button
                    onClick={() => {
                      setSelectedShift(null);
                      setModalContent("shifts");
                    }}
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    View Shifts
                  </button>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {modalContent === "add" && (
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Add Shifts for: {selectedDates.map(date => date.toDateString()).join(', ')}
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
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      Add Shifts
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalContent("options")}
                      className="ml-2 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Back
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modalContent === "shifts" && (
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Shifts on: {selectedDates.length > 0 ? selectedDates[0].toDateString() : ""}
                </h3>
                <ul className="mb-4">
                  {shifts
                    .filter(
                      (shift) =>
                        selectedDates.some(date => 
                          new Date(shift.start).toDateString() === date.toDateString()
                        )
                    )
                    .map((shift) => (
                      <li
                        key={shift._id}
                        className={`p-2 rounded mb-2 cursor-pointer ${
                          selectedShift?._id === shift._id
                            ? "bg-blue-200"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        onClick={() => handleShiftClick(shift)}
                      >
                        <strong>{shift.title}</strong> (
                        {new Date(shift.start).toLocaleTimeString()} -{" "}
                        {new Date(shift.end).toLocaleTimeString()})
                      </li>
                    ))}
                </ul>
                {selectedShift && (
                  <div>
                    <h4 className="font-medium mb-2">Potential Workers:</h4>
                    <div className="flex flex-wrap mb-2">
                      {selectedShift.potentialWorkers.map((worker) => (
                        <button
                          key={worker}
                          onClick={() => handleWorkerToggle(worker)}
                          className={`m-1 px-3 py-1 rounded ${
                            workersSelection.includes(worker)
                              ? "bg-blue-500 text-white"
                              : "bg-gray-300 text-gray-800"
                          }`}
                        >
                          {worker}
                        </button>
                      ))}
                    </div>
                    <h4 className="font-medium mb-2">Accepted Workers:</h4>
                    <div className="flex flex-wrap mb-4">
                      {selectedShift.acceptedWorkers?.map((worker) => (
                        <span
                          key={worker}
                          className="m-1 px-3 py-1 rounded bg-green-500 text-white"
                        >
                          {worker}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleAcceptWorkers}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition duration-200"
                      >
                        Accept Workers
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setModalContent("options")}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-200"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Worker Availabilities</h2>
        {availabilities.map((availability, index) => (
          <div key={index} className="mb-2">
            <span>
              {availability.workerName} is available for shift{" "}
              {availability.shiftId}
            </span>
            <button
              onClick={() =>
                handleAcceptWorker(availability.shiftId, availability.workerName)
              }
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