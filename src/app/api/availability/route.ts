import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb/database'
import { AvailabilityModel } from '@/lib/mongodb/database/models/Availability'
import { ShiftModel } from '@/lib/mongodb/database/models/Shift'

export async function GET() {
  await connectToDatabase()
  const availabilities = await AvailabilityModel.find({})
  return NextResponse.json({ availabilities })
}

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const { name, availableShifts } = await req.json()
  
  // Insert new availabilities
  const newAvailabilities = availableShifts.map((shiftId: string) => ({ shiftId, workerName: name }))
  await AvailabilityModel.insertMany(newAvailabilities)
  
  // Update Shift documents with the new potential worker
  await Promise.all(availableShifts.map((shiftId: string) => 
    ShiftModel.findByIdAndUpdate(
      shiftId,
      { $addToSet: { potentialWorkers: name } },
      { new: true }
    )
  ))

  return NextResponse.json({ message: "Availability submitted" }, { status: 201 })
}