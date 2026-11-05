import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';

const router = Router();
const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const validate = (req, res, next) => { const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() }); next(); };
const appointmentFields = [
  body('customerName').isString().withMessage('Customer name is required').bail().trim().notEmpty().withMessage('Customer name is required').isLength({ max: 100 }).withMessage('Customer name must be 100 characters or fewer'),
  body('service').isString().withMessage('Service is required').bail().trim().notEmpty().withMessage('Service is required').isLength({ max: 100 }).withMessage('Service must be 100 characters or fewer'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must use YYYY-MM-DD format').custom(value => { const d = new Date(`${value}T00:00:00Z`); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value; }).withMessage('Enter a valid date'),
  body('time').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Time must use 24-hour HH:MM format'),
  body('status').optional().isIn(['Pending', 'Confirmed', 'Cancelled']).withMessage('Status must be Pending, Confirmed or Cancelled')
];

router.get('/', query('status').optional().isIn(['Pending', 'Confirmed', 'Cancelled']).withMessage('Status must be Pending, Confirmed or Cancelled'), validate, asyncRoute(async (req, res) => {
  const appointments = await Appointment.find().sort({ date: 1, time: 1, createdAt: -1 }).lean();
  const filtered = req.query.status ? appointments.filter(a => a.status === req.query.status) : appointments;
  res.json({ success: true, data: { appointments: filtered, stats: { total: appointments.length, pending: appointments.filter(a => a.status === 'Pending').length, confirmed: appointments.filter(a => a.status === 'Confirmed').length, cancelled: appointments.filter(a => a.status === 'Cancelled').length } } });
}));
router.get('/:id', param('id').custom(value => mongoose.isValidObjectId(value)).withMessage('Invalid appointment ID'), validate, asyncRoute(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).lean();
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.json({ success: true, data: { appointment } });
}));
router.post('/', appointmentFields, validate, asyncRoute(async (req, res) => { const appointment = await Appointment.create(req.body); res.status(201).json({ success: true, message: 'Appointment created successfully', data: { appointment } }); }));
router.patch('/:id/status', param('id').custom(value => mongoose.isValidObjectId(value)).withMessage('Invalid appointment ID'), body('status').isIn(['Pending', 'Confirmed', 'Cancelled']).withMessage('Status must be Pending, Confirmed or Cancelled'), validate, asyncRoute(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.json({ success: true, message: 'Appointment status updated successfully', data: { appointment } });
}));
export default router;
