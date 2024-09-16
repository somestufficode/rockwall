import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { EventSourceInput, EventChangeArg, EventContentArg } from "@fullcalendar/core";
import { parseISO, format } from "date-fns";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
// import ReturnHomeButton from "./ReturnHomeButton";

interface Shift {
  _id: string;
  title: string;
  start: string;
  end: string;
  acceptedWorkers?: string[];
  potentialWorkers: string[];
}

// interface Availability {
//   shiftId: string;
//   workerName: string;
// }

interface NewShift {
  title: string;
  startTime: string;
  endTime: string;
}

export default function AdminCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  // const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [newShift, setNewShift] = useState<NewShift>({
    title: "",
    startTime: "",
    endTime: "",
  });
  const [workersSelection, setWorkersSelection] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchShifts();
    // fetchAvailabilities();
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const fetchShifts = async () => {
    const response = await fetch("/api/shifts");
    const data = await response.json();
    setShifts(
      data.shifts.map((shift: any) => ({
        ...shift,
        id: shift._id,
      }))
    );
  };

  // const fetchAvailabilities = async () => {
  //   const response = await fetch("/api/availabilities");
  //   const data = await response.json();
  //   setAvailabilities(data.availabilities);
  // };

  const handleDateSelect = (arg: { start: Date; end: Date }) => {
    const dates = [];
    let currentDate = new Date(arg.start);
    while (currentDate < arg.end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDates(dates);
    setShowAddShiftModal(true);
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setWorkersSelection(shift.acceptedWorkers || []);
  };

  const handleWorkerToggle = (workerName: string) => {
    setWorkersSelection((prev) =>
      prev.includes(workerName)
        ? prev.filter((name) => name !== workerName)
        : [...prev, workerName]
    );
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
        setSelectedShift(null);
      }
    } catch (error) {
      console.error("Error finalizing workers:", error);
    }
  };

  const handleShiftInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewShift({ ...newShift, [e.target.name]: e.target.value });
  };

  const handleAddShifts = async () => {
    if (selectedDates.length === 0) return;

    const shiftsToAdd = selectedDates.map((date) => {
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

    try {
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shifts: shiftsToAdd }),
      });

      if (response.ok) {
        fetchShifts();
        setShowAddShiftModal(false);
        setNewShift({ title: "", startTime: "", endTime: "" });
        setSelectedDates([]);
      } else {
        const errorData = await response.json();
        console.error("Error adding shifts:", errorData.message);
      }
    } catch (error) {
      console.error("Error adding shifts:", error);
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

  // const handleAcceptWorker = async (shiftId: string, workerName: string) => {
  //   try {
  //     const response = await fetch(`/api/shifts/${shiftId}/accept`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ workerName }),
  //     });

  //     if (response.ok) {
  //       fetchShifts();
  //       // fetchAvailabilities();
  //     } else {
  //       console.error("Error accepting worker:", response.statusText);
  //     }
  //   } catch (error) {
  //     console.error("Error accepting worker:", error);
  //   }
  // };

  const handleDeleteShift = async () => {
    if (!selectedShift) return;

    try {
      const response = await fetch(`/api/shifts/${selectedShift._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShifts((prevShifts) =>
          prevShifts.filter((shift) => shift._id !== selectedShift._id)
        );
        setSelectedShift(null);
      } else {
        console.error("Error deleting shift:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  const determineEventColor = (title: string) => {
    if (title.includes("Open Wall")) {
      return "bg-red-100 border-red-400 text-red-800";
    } else if (title.includes("Holiday Class")) {
      return "bg-blue-100 border-blue-400 text-blue-800";
    } else if (title.includes("Class")) {
      return "bg-green-100 border-green-400 text-green-800";
    } else if (title.includes("Camp")) {
      return "bg-blue-100 border-blue-400 text-blue-800";
    } else {
      return "bg-gray-100 border-gray-400 text-gray-800";
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[
          dayGridPlugin,
          interactionPlugin,
          timeGridPlugin,
          listPlugin,
          bootstrap5Plugin,
        ]}
        themeSystem="bootstrap5"
        initialView="listWeek"
        headerToolbar={{
          left: isMobile ? "prev,next" : "prev,next today",
          center: "title",
          right: isMobile ? "" : "listWeek,dayGridMonth",
        }}
        events={shifts.map((shift) => ({
          ...shift,
          id: shift._id,
          title: shift.title,
        })) as EventSourceInput}
        editable={true}
        selectable={true}
        select={handleDateSelect}
        eventClick={(info) => {
          const shiftId = info.event.id;
          const shift = shifts.find((s) => s._id === shiftId);
          if (shift) {
            handleShiftClick(shift);
          }
        }}
        eventChange={handleEventChange}
        height="auto"
        contentHeight="auto"
        eventContent={({ event }: EventContentArg) => {
          if (event.extendedProps.isPlaceholder) {
            return (
              <div className="p-1 bg-white rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            );
          }

          const eventColorClasses = determineEventColor(event.title);
          const startTime = event.start ? format(event.start, "p") : "N/A";
          const endTime = event.end ? format(event.end, "p") : "N/A";

          return (
            <div className={`p-1 rounded-lg shadow-md ${eventColorClasses} m-1`}>
              <p className="font-bold text-md whitespace-normal break-words">{event.title}</p>
              <p className="text-gray-600 text-sm mt-0.5 whitespace-normal break-words">
                {startTime} - {endTime}
              </p>
              <p className="text-gray-600 text-sm mt-1 font-bold whitespace-normal break-words">
                {event.extendedProps.acceptedWorkers?.join(", ") || "No workers"}
              </p>
            </div>
          );
        }}
      />

      {showAddShiftModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-0"
          onClick={() => setShowAddShiftModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Add New Shifts</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-semibold">Selected Dates:</span>{" "}
                  {selectedDates.map((date) => format(date, "MMMM d, yyyy")).join(", ")}
                </p>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="title"
                  value={newShift.title}
                  onChange={handleShiftInputChange}
                  placeholder="Shift Title"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <input
                  type="time"
                  name="startTime"
                  value={newShift.startTime}
                  onChange={handleShiftInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <input
                  type="time"
                  name="endTime"
                  value={newShift.endTime}
                  onChange={handleShiftInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-between">
              <button
                onClick={handleAddShifts}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
              >
                <i className="bi bi-plus-circle mr-2"></i>
                Add Shifts
              </button>
              <button
                onClick={() => setShowAddShiftModal(false)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Accepted Workers</h3>
                {selectedShift.acceptedWorkers && selectedShift.acceptedWorkers.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedShift.acceptedWorkers.map((worker, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <input
                          type="checkbox"
                          checked={workersSelection.includes(worker)}
                          onChange={() => handleWorkerToggle(worker)}
                          className="mr-2"
                        />
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
                        <input
                          type="checkbox"
                          checked={workersSelection.includes(worker)}
                          onChange={() => handleWorkerToggle(worker)}
                          className="mr-2"
                        />
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
              <div className="bg-gray-50 px-6 py-4 flex justify-between space-x-4">
            <button
              onClick={handleAcceptWorkers}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              <i className="bi bi-check-circle mr-2"></i>
              Confirm Workers
            </button>
            <button
              onClick={handleDeleteShift}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              <i className="bi bi-trash mr-2"></i>
              Delete Shift
            </button>
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
