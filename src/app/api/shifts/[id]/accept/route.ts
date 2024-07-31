import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb/database'
import { ShiftModel } from '@/lib/mongodb/database/models/Shift'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase()
  const { workerName } = await req.json()
  const updatedShift = await ShiftModel.findByIdAndUpdate(
    params.id,
    { acceptedWorker: workerName },
    { new: true }
  )
  return NextResponse.json({ message: "Worker accepted", shift: updatedShift })
}