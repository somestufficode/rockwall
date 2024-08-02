// /pages/api/shifts/[id].ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/database';
import { ShiftModel } from '@/lib/mongodb/database/models/Shift';

// GET method to fetch a specific shift by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase(); // Ensure database connection

  const { id } = params; // Extract the 'id' from the request params

  try {
    // Find the shift by ID in the database
    const shift = await ShiftModel.findById(id);

    if (!shift) {
      // If the shift is not found, return a 404 error response
      return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
    }

    // Return the found shift as a JSON response
    return NextResponse.json(shift, { status: 200 });
  } catch (error) {
    console.error('Error fetching shift:', error);
    // Return a 500 error response if there's a server error
    return NextResponse.json({ message: 'Error fetching shift', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    await connectToDatabase(); // Ensure database connection
  
    const { id } = params; // Extract the 'id' from the request params
    const { title, start, end, acceptedWorkers, potentialWorkers } = await req.json(); // Extract shift details from request body
  
    console.log('Request Params ID:', id);
    console.log('Updated Shift Data:', { title, start, end, acceptedWorkers, potentialWorkers });
  
    try {
      // Find the shift by ID in the database
      const shift = await ShiftModel.findById(id);
      console.log("Shift found:", shift);
  
      if (!shift) {
        // If the shift is not found, return a 404 error response
        return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
      }
  
      // Update shift details if provided
      if (title !== undefined) shift.title = title;
      if (start !== undefined) shift.start = start;
      if (end !== undefined) shift.end = end;
      if (acceptedWorkers !== undefined) shift.acceptedWorkers = acceptedWorkers;
      if (potentialWorkers !== undefined) shift.potentialWorkers = potentialWorkers;
  
      await shift.save(); // Save the updated shift document
  
      return NextResponse.json({ message: 'Shift updated successfully', shift }, { status: 200 });
    } catch (error) {
      console.error('Error updating shift:', error);
      // Return a 500 error response if there's a server error
      return NextResponse.json({ message: 'Error updating shift', error }, { status: 500 });
    }
  }