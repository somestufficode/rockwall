import React from 'react'
import Link from 'next/link';

const ReturnHomeButton = () => {
  return (
        <Link href="/">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
        Home
        </button>
        </Link>
  )
}

export default ReturnHomeButton