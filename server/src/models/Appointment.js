import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
  service: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending', required: true }
}, { timestamps: true, versionKey: false });

export default mongoose.model('Appointment', appointmentSchema);
