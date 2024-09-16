// components/ViewSwitcher.tsx

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface ViewSwitcherProps {
  selectedView: 'availability' | 'calendar' | 'employee';
  setSelectedView: (view: 'availability' | 'calendar' | 'employee') => void;
}

export default function ViewSwitcher({ selectedView, setSelectedView }: ViewSwitcherProps) {
  return (
    <Stack direction="row" spacing={1} className="mb-4">
      <Button
        variant="text"
        onClick={() => setSelectedView('availability')}
        style={{
          color: selectedView === 'availability' ? '#fff' : '#000',
          backgroundColor: selectedView === 'availability' ? '#4a5568' : 'transparent',
        }}
      >
        Availability
      </Button>
      <Button
        variant="text"
        onClick={() => setSelectedView('calendar')}
        style={{
          color: selectedView === 'calendar' ? '#fff' : '#000',
          backgroundColor: selectedView === 'calendar' ? '#4a5568' : 'transparent',
        }}
      >
        Calendar
      </Button>
      <Button
        variant="text"
        onClick={() => setSelectedView('employee')}
        style={{
          color: selectedView === 'employee' ? '#fff' : '#000',
          backgroundColor: selectedView === 'employee' ? '#4a5568' : 'transparent',
        }}
      >
        Employee
      </Button>
    </Stack>
  );
}
