import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb/database'
import { ShiftModel } from '@/lib/mongodb/database/models/Shift'
import { AvailabilityModel } from '@/lib/mongodb/database/models/Availability'

export async function POST() {
  await connectToDatabase()
  await ShiftModel.updateMany({ acceptedWorker: { $exists: false } }, { $set: { acceptedWorker: null } })
  await AvailabilityModel.deleteMany({})
  return NextResponse.json({ message: "Calendar finalized" })
}