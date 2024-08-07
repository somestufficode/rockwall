'use client';

import { useState } from 'react';
import UserAvailability from '@/components/UserAvailability';
import FinalizedCalendar from '@/components/FinalizedCalendar';
import ViewSwitcher from '@/components/ViewSwitcher';
import ReturnHomeButton from '@/components/ReturnHomeButton';

export default function Page({ params }: { params: { slug: string } }) {
  const [selectedView, setSelectedView] = useState<'availability' | 'calendar'>('calendar');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 md:p-8 lg:p-10">
        <div className="pl-10 flex justify-center">
          <ViewSwitcher selectedView={selectedView} setSelectedView={setSelectedView} />
        </div>
        {selectedView === 'availability' && <UserAvailability name={params.slug} />}
        {selectedView === 'calendar' && <FinalizedCalendar name={params.slug} />}
      </div>
    </div>
  );
}