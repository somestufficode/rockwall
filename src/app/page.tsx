import Link from 'next/link'
import Image from 'next/image'
import EmployeeDropdown from '@/components/EmployeeDropdown'
import admin from '../../public/admin.png'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className='mb-8' >
        <Link 
          href="/admin" 
          aria-label="Access admin page"
        >
          <Image 
            src={admin}
            width={70}
            height={50}
            alt="Admin access illustration"
            className="cursor-pointer transition-opacity hover:opacity-80"
          />
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-10">Rockwall Scheduler</h1>
      <EmployeeDropdown />
    </main>
  )
}