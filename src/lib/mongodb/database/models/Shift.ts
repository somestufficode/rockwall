import mongoose, { Schema, Document } from 'mongoose';

export interface IShift extends Document {
  title: string;
  start: string;
  end: string;
  acceptedWorkers: string[];
  potentialWorkers: string[];
}

const ShiftSchema: Schema = new Schema({
  title: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  acceptedWorkers: { type: [String], default: [] },
  potentialWorkers: { type: [String], default: [] },
});

export const ShiftModel = mongoose.models.Shift || mongoose.model<IShift>('Shift', ShiftSchema);
