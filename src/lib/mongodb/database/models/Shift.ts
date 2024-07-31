import mongoose from 'mongoose';

const ShiftSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  acceptedWorkers: [String],
  potentialWorkers: [String]
});

export const ShiftModel = mongoose.models.Shift || mongoose.model('Shift', ShiftSchema);