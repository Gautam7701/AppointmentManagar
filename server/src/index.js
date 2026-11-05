import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const port = process.env.PORT || 5000;
try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/appointment_manager');
  app.listen(port, () => console.log(`Appointment Manager API listening on http://localhost:${port}`));
} catch (error) {
  console.error('Could not connect to MongoDB:', error.message);
  process.exit(1);
}
