"use client";
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { parseISO, format } from 'date-fns';

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

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    const response = await fetch('/api/shifts');
    const data = await response.json();
    setShifts(data.shifts);
  };

  const renderEventContent = (eventInfo: any) => {
    const { acceptedWorkers } = eventInfo.event.extendedProps;
    return (
      <div className="text-sm">
        <b>{eventInfo.event.title}</b>
        <div className="mt-1">
          <strong>Accepted Workers:</strong> {acceptedWorkers.join(', ') || 'None'}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">Finalized Monthly Calendar</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listMonth',
        }}
        events={shifts.map((shift) => ({
          ...shift,
          id: shift._id,
          title: `${shift.title} (${format(parseISO(shift.start), 'p')} - ${format(
            parseISO(shift.end),
            'p'
          )})`,
          acceptedWorkers: shift.acceptedWorkers || [],
        }))}
        eventContent={renderEventContent}
      />
    </div>
  );
}
