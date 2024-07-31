// src/components/ShiftCard.tsx
import React from 'react';

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
      <p className="text-sm text-gray-600">Start: {shift.start}</p>
      <p className="text-sm text-gray-600">End: {shift.end}</p>
      <p className="text-sm text-gray-600">Potential Workers: {shift.potentialWorkers.join(', ')}</p>
    </div>
  );
};

export default ShiftCard;
