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
    const { title, start, end, acceptedWorkers, potentialWorkers } = shiftData;
  
    // Create a new shift with the provided data
    const newShift = await ShiftModel.create({
      title,
      start,
      end,
      acceptedWorkers: acceptedWorkers || [], // Default to empty string if not provided
      potentialWorkers: potentialWorkers || [] // Default to empty array if not provided
    });
  
    return NextResponse.json({ message: 'Shift created', shift: newShift }, { status: 201 });
  }

// New route for handling availability submissions
export async function PUT(req: NextRequest) {
  await connectToDatabase()
  const { name, shiftIds } = await req.json()

  console.log('Received request:', { name, shiftIds });

  try {
    const updateResults = await Promise.all(shiftIds.map(async (shiftId: string) => {
      const result = await ShiftModel.findByIdAndUpdate(
        shiftId,
        { $addToSet: { potentialWorkers: name } },
        { new: true }
      );
      if (!result) {
        console.log(`Shift not found for ID: ${shiftId}`);
      }
      return result;
    }));

    console.log('Update results:', updateResults);

    const successfulUpdates = updateResults.filter(Boolean);
    if (successfulUpdates.length === 0) {
      return NextResponse.json({ message: "No shifts were updated" }, { status: 404 });
    }

    return NextResponse.json({ message: "Availability submitted successfully", updatedShifts: successfulUpdates }, { status: 200 });
  } catch (error) {
    console.error('Error submitting availability:', error);
    return NextResponse.json({ message: "Error submitting availability"}, { status: 500 });
  }
}