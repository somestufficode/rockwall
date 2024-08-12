'use client';
import { useState } from 'react';
import AdminCalendar from '@/components/AdminCalendar';
import FinalizedCalendar from '@/components/FinalizedCalendar';
import ReturnHomeButton from '@/components/ReturnHomeButton';

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFinalizedCalendar, setShowFinalizedCalendar] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    // Replace 'your_secure_password' with your actual password
    if (password === "1909") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const toggleCalendarView = () => {
    setShowFinalizedCalendar((prev) => !prev);
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
    <div className="p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <ReturnHomeButton />
        <button
          onClick={toggleCalendarView}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showFinalizedCalendar ? 'View Admin Calendar' : 'View Finalized Calendar'}
        </button>
      </div>

      {showFinalizedCalendar ? <FinalizedCalendar name="Admin" /> : <AdminCalendar />}
    </div>
  );
}
