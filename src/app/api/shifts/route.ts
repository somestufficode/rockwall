import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb/database'
import { ShiftModel } from '@/lib/mongodb/database/models/Shift'

interface ShiftData {
    title: string;
    start: string;
    end: string;
    acceptedWorkers?: string[];
    potentialWorkers?: string[];
  }


export async function GET() {
  await connectToDatabase()
  const shifts = await ShiftModel.find({})
  return NextResponse.json({ shifts })
}
  
export async function POST(req: NextRequest) {
    await connectToDatabase();
    
    const shiftDataArray: ShiftData[] = await req.json();
  
    if (!Array.isArray(shiftDataArray)) {
      return NextResponse.json({ message: 'Invalid data format, expected an array' }, { status: 400 });
    }
  
    try {
      // Additional validation
      for (const shift of shiftDataArray) {
        if (!shift.title || !shift.start || !shift.end) {
          return NextResponse.json({ message: 'Each shift must have a title, start, and end time' }, { status: 400 });
        }
        if (new Date(shift.start) >= new Date(shift.end)) {
          return NextResponse.json({ message: 'Shift end time must be after start time' }, { status: 400 });
        }
      }

      const newShifts = await ShiftModel.insertMany(
        shiftDataArray.map((shift) => ({
          title: shift.title,
          start: shift.start,
          end: shift.end,
          acceptedWorkers: shift.acceptedWorkers || [],
          potentialWorkers: shift.potentialWorkers || [],
        }))
      );
  
      return NextResponse.json({ message: 'Shifts created', shifts: newShifts }, { status: 201 });
    } catch (error) {
      console.error('Error creating shifts:', error);
      return NextResponse.json({ message: 'Failed to create shifts', error }, { status: 500 });
    }
}
// New route for handling availability submissions
export async function PUT(req: NextRequest) {
    await connectToDatabase();
    const { shiftId, workerName } = await req.json();
  
    try {
      const shift = await ShiftModel.findById(shiftId);
      if (!shift) {
        return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
      }
  
      if (!shift.potentialWorkers) {
        shift.potentialWorkers = [];
      }
  
      if (!shift.potentialWorkers.includes(workerName)) {
        shift.potentialWorkers.push(workerName);
        await shift.save();
      }
  
      return NextResponse.json({ message: 'Availability submitted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error submitting availability:', error);
      return NextResponse.json({ message: 'Error submitting availability', error }, { status: 500 });
    }
  }