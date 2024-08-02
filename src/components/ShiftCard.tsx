import React from 'react';
import { format, parseISO } from 'date-fns';

// Helper function to format the date and time
const formatDate = (date: string) => {
  return format(parseISO(date), 'M/d EEEE h:mm a');
};

interface ShiftCardProps {
  shift: {
    id: string;
    title: string;
    start: string;
    end: string;
    acceptedWorkers?: string[];
    potentialWorkers: string[];
  };
  onClick: (id: string) => void;
}

const ShiftCard = ({ shift, onClick }: ShiftCardProps) => {
  return (
    <div
      className="border border-gray-300 rounded-md p-4 mb-4 cursor-pointer hover:bg-gray-100"
      onClick={() => onClick(shift.id)}
    >
      <h2 className="text-lg font-bold">{shift.title}</h2>
      <p className="text-sm text-gray-600">Start: {formatDate(shift.start)}</p>
      <p className="text-sm text-gray-600">End: {formatDate(shift.end)}</p>
      <p className="text-sm text-gray-600">Potential Workers: {shift.potentialWorkers.join(', ')}</p>
    </div>
  );
};

export default ShiftCard;
