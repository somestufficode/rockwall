// components/ViewSwitcher.tsx

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface ViewSwitcherProps {
  selectedView: 'availability' | 'calendar';
  setSelectedView: (view: 'availability' | 'calendar') => void;
}

export default function ViewSwitcher({ selectedView, setSelectedView }: ViewSwitcherProps) {
  return (
    <Stack direction="row" spacing={2} className="mb-4">
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
    </Stack>
  );
}