'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useRouter } from 'next/navigation';
import { Circles, Bars } from 'react-loading-icons'; // Importing a specific icon

export default function EmployeeDropdown() {
  const [selectedEmployee, setSelectedEmployee] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const employees = ['Vincent', 'Derek', 'Don', 'Joseph Valentino', 'Greg Levet', 'Matt', 'Brendan', 'Andrianna Selearis', 'Eleni', 'Randy Leidl'];

  const handleChange = (event: SelectChangeEvent) => {
    const employeeName = event.target.value;
    setSelectedEmployee(employeeName);

    if (employeeName) {
      setLoading(true); // Show loading icon
      setTimeout(() => {
        router.push(`/employees/${employeeName}`);
      }, 1500);
    }
  };

  return (
    <Box sx={{ minWidth: 300, marginBottom: 4 }}>
      <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
        <InputLabel id="employee-select-label">Select Employee</InputLabel>
        <Select
          labelId="employee-select-label"
          id="employee-select"
          value={selectedEmployee}
          label="Select Employee"
          onChange={handleChange}
          disabled={loading} // Disable selection while loading
        >
          {employees.map((employee) => (
            <MenuItem key={employee} value={employee}>
              {employee}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {loading && (
        <Box mt={2} display="flex" justifyContent="center" alignItems="center">
          <Bars stroke="currentColor" strokeWidth={2} width={50} height={50} />
        </Box>
      )}
    </Box>
  );
}
