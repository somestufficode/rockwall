import React from 'react'
import Link from 'next/link';

const ReturnHomeButton = () => {
  return (
        <Link href="/">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
        Return to Home
        </button>
        </Link>
  )
}

export default ReturnHomeButton