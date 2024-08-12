import Link from 'next/link'
import EmployeeDropdown from '@/components/EmployeeDropdown';
import { Button } from '@mui/material';
import LoadingIcons from 'react-loading-icons';

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-10">Rockwall Scheduler</h1>
      <EmployeeDropdown />
      <Button>
          <Link href="/admin" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded no-underline">
              Admin
          </Link>
      </Button>
      {/* <div className="flex space-x-4">
        <Link href="/admin" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Admin
        </Link>
        <Link href="/availability" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          User Availability
        </Link>
        <Link href='/calendar' className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Calendar
        </Link>
      </div>  */}
    </main>
  )
}