import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb/database'
import { ShiftModel } from '@/lib/mongodb/database/models/Shift'

export async function GET() {
  await connectToDatabase()
  const shifts = await ShiftModel.find({})
  return NextResponse.json({ shifts })
}

export async function POST(req: NextRequest) {
    await connectToDatabase();
    
    const shiftData = await req.json();
    
    // Ensure `acceptedWorker` and `potentialWorkers` are included in the shift data
    const { title, start, end, allDay, role, acceptedWorkers, potentialWorkers } = shiftData;
  
    // Create a new shift with the provided data
    const newShift = await ShiftModel.create({
      title,
      start,
      end,
      allDay,
      role,
      acceptedWorkers: acceptedWorkers || [], // Default to empty string if not provided
      potentialWorkers: potentialWorkers || [] // Default to empty array if not provided
    });
  
    return NextResponse.json({ message: 'Shift created', shift: newShift }, { status: 201 });
  }

// New route for handling availability submissions
export async function PUT(req: NextRequest) {
  await connectToDatabase()
  const { name, shiftIds } = await req.json()

  try {
    // Update Shift documents with the new potential worker
    await Promise.all(shiftIds.map((shiftId: string) => 
      ShiftModel.findByIdAndUpdate(
        shiftId,
        { $addToSet: { potentialWorkers: name } },
        { new: true }
      )
    ))

    return NextResponse.json({ message: "Availability submitted successfully" }, { status: 200 })
  } catch (error) {
    console.error('Error submitting availability:', error)
    return NextResponse.json({ message: "Error submitting availability" }, { status: 500 })
  }
}