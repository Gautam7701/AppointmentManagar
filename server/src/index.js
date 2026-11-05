import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './db.js';

const port = process.env.PORT || 5000;
try {
  await connectDatabase();
  app.listen(port, () => console.log(`Appointment Manager API listening on http://localhost:${port}`));
} catch (error) {
  console.error('Could not connect to MongoDB:', error.message);
  process.exit(1);
}
