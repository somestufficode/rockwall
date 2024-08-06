'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useRouter } from 'next/navigation';

export default function EmployeeDropdown() {
  const [selectedEmployee, setSelectedEmployee] = React.useState('');
  const router = useRouter();

  const employees = ['Vincent', 'Derek', 'Don', 'Joe', 'Matt', 'Brendan', 'Andrianna', 'Eleni', 'Randy'];

  const handleChange = (event: SelectChangeEvent) => {
    const employeeName = event.target.value;
    setSelectedEmployee(employeeName);

    // Navigate to the employee's page
    if (employeeName) {
      router.push(`/employees/${employeeName}`);
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
        >
          {employees.map((employee) => (
            <MenuItem key={employee} value={employee}>
              {employee}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
