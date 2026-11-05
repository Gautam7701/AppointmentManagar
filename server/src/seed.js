import 'dotenv/config';
import mongoose from 'mongoose';
import Appointment from './models/Appointment.js';

const records = [
  { customerName: 'Alex Morgan', service: 'Consultation', date: '2026-11-02', time: '10:00', status: 'Pending' },
  { customerName: 'Jamie Lee', service: 'Follow-up', date: '2026-11-02', time: '11:30', status: 'Confirmed' },
  { customerName: 'Taylor Smith', service: 'Review', date: '2026-11-03', time: '14:00', status: 'Cancelled' }
];
try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/appointment_manager');
  for (const record of records) await Appointment.updateOne({ customerName: record.customerName, service: record.service, date: record.date, time: record.time }, { $setOnInsert: record }, { upsert: true });
  console.log('Seed complete. Existing matching assessment records were preserved.');
} catch (error) { console.error('Seed failed:', error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
