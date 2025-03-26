'use client';

import { useState } from 'react';
import AdminCalendar from '@/components/AdminCalendar';
// import FinalizedCalendar from '@/components/FinalizedCalendar';
import ReturnHomeButton from '@/components/ReturnHomeButton';
import { Button } from '@mui/material';

// interface AdminCalendarProps {
//   name: string;
// }

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [showFinalizedCalendar, setShowFinalizedCalendar] = useState(false);
  const [workerViewMode, setWorkerViewMode] = useState<'accepted' | 'potential'>('accepted');


  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    if (password === "1909") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  // const toggleCalendarView = () => {
  //   setShowFinalizedCalendar((prev) => !prev);
  // };

  const toggleWorkerView = () => {
    setWorkerViewMode(prev => prev === 'accepted' ? 'potential' : 'accepted');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Enter password"
          className="border p-2 mb-4"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className=" min-h-screen p-5">
      <div className='mb-3'>
      <ReturnHomeButton />

      </div>
      {/* <button
          onClick={toggleCalendarView}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showFinalizedCalendar ? 'View Admin Calendar' : 'View Finalized Calendar'}
        </button> */}
{/*       
      {showFinalizedCalendar ? (
        <FinalizedCalendar name="Admin" />
      ) : ( */}
      <button
          onClick={toggleWorkerView}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded flex mb-3 items-center"
        >
          {workerViewMode === 'accepted' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Potential Workers
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              View Accepted Workers
            </>
          )}
        </button>
        <AdminCalendar workerViewMode={workerViewMode} />
        </div>
  );
}