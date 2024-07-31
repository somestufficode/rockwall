import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema({
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
  workerName: { type: String, required: true },
});

export const AvailabilityModel = mongoose.models.Availability || mongoose.model('Availability', AvailabilitySchema);