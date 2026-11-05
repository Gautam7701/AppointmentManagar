import express from 'express';
import cors from 'cors';
import appointments from './routes/appointments.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/appointments', appointments);
app.use(notFound);
app.use(errorHandler);
export default app;
