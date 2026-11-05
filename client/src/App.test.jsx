import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import * as service from './services/appointments.js';

vi.mock('./services/appointments.js');
const seed = [
  { _id: 'a1', customerName: 'Alex Morgan', service: 'Consultation', date: '2026-11-02', time: '10:00', status: 'Pending' },
  { _id: 'a2', customerName: 'Jamie Lee', service: 'Follow-up', date: '2026-11-02', time: '11:30', status: 'Confirmed' },
  { _id: 'a3', customerName: 'Taylor Smith', service: 'Review', date: '2026-11-03', time: '14:00', status: 'Cancelled' }
];
let records;
const snapshot = () => ({ appointments: records.map(record => ({ ...record })), stats: { total: records.length, pending: records.filter(a => a.status === 'Pending').length, confirmed: records.filter(a => a.status === 'Confirmed').length, cancelled: records.filter(a => a.status === 'Cancelled').length } });
function mount() { return render(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></BrowserRouter>); }

beforeEach(() => {
  records = seed.map(record => ({ ...record }));
  service.getAppointments.mockImplementation(async () => snapshot());
  service.createAppointment.mockImplementation(async data => { const appointment = { ...data, _id: `a${records.length + 1}` }; records.push(appointment); return appointment; });
  service.updateAppointmentStatus.mockImplementation(async (id, status) => { const appointment = records.find(item => item._id === id); const updated = { ...appointment, status }; records = records.map(item => item._id === id ? updated : item); return updated; });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('Appointment dashboard', () => {
  it('renders the assessment records and dynamic statistics', async () => {
    mount();
    expect(await screen.findByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText('Jamie Lee')).toBeInTheDocument();
    expect(screen.getByText('Taylor Smith')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Appointment statistics' })).toHaveTextContent('3');
  });

  it('filters the list to each status and restores all appointments', async () => {
    const user = userEvent.setup(); mount();
    const table = await screen.findByRole('table');
    for (const [status, visible, hidden] of [
      ['Pending', 'Alex Morgan', 'Jamie Lee'],
      ['Confirmed', 'Jamie Lee', 'Taylor Smith'],
      ['Cancelled', 'Taylor Smith', 'Alex Morgan']
    ]) {
      await user.click(screen.getByRole('tab', { name: new RegExp(status, 'i') }));
      expect(await within(table).findByText(visible)).toBeInTheDocument();
      expect(within(table).queryByText(hidden)).not.toBeInTheDocument();
    }
    await user.click(screen.getByRole('tab', { name: /all/i }));
    expect(within(table).getByText('Alex Morgan')).toBeInTheDocument();
    expect(within(table).getByText('Jamie Lee')).toBeInTheDocument();
    expect(within(table).getByText('Taylor Smith')).toBeInTheDocument();
  });

  it('searches customer names without regard to letter case', async () => {
    const user = userEvent.setup(); mount();
    const table = await screen.findByRole('table');
    await user.type(screen.getByRole('textbox', { name: 'Search customers' }), 'jAmIe');
    expect(await within(table).findByText('Jamie Lee')).toBeInTheDocument();
    expect(within(table).queryByText('Taylor Smith')).not.toBeInTheDocument();
  });

  it('opens the form and shows field level errors for an empty submission', async () => {
    const user = userEvent.setup(); mount();
    await user.click(await screen.findByRole('button', { name: /add appointment/i }));
    await user.click(screen.getByRole('button', { name: /create appointment/i }));
    expect(await screen.findByText('Add the customer’s name to continue.')).toBeInTheDocument();
    expect(screen.getByText('Choose an appointment date.')).toBeInTheDocument();
    expect(service.createAppointment).not.toHaveBeenCalled();
  });

  it('creates and displays an appointment', async () => {
    const user = userEvent.setup(); mount();
    await user.click(await screen.findByRole('button', { name: /add appointment/i }));
    await user.type(screen.getByLabelText(/customer name/i), 'Robin Chen');
    await user.selectOptions(screen.getByLabelText('Service'), 'Review');
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-10' } });
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '09:15' } });
    await user.click(screen.getByRole('button', { name: /create appointment/i }));
    await waitFor(() => expect(service.createAppointment).toHaveBeenCalledWith(expect.objectContaining({ customerName: 'Robin Chen', service: 'Review', date: '2026-11-10', time: '09:15', status: 'Pending' })));
    await waitFor(() => expect(service.getAppointments).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Robin Chen', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(service.createAppointment).toHaveBeenCalledWith(expect.objectContaining({ customerName: 'Robin Chen', date: '2026-11-10', status: 'Pending' }));
  });

  it('combines customer search with status filtering and persists a changed status', async () => {
    const user = userEvent.setup(); mount();
    const rows = within(await screen.findByRole('table')).getAllByRole('row');
    const alexRow = rows.find(row => within(row).queryByText('Alex Morgan'));
    await user.selectOptions(within(alexRow).getByLabelText('Status for Alex Morgan'), 'Confirmed');
    await waitFor(() => expect(service.updateAppointmentStatus).toHaveBeenCalledWith('a1', 'Confirmed'));
    await waitFor(() => expect(within(alexRow).getByLabelText('Status for Alex Morgan')).toHaveValue('Confirmed'));
    expect(records.find(item => item._id === 'a1').status).toBe('Confirmed');
    await user.click(screen.getByRole('tab', { name: /confirmed/i }));
    await user.type(screen.getByRole('textbox', { name: 'Search customers' }), 'alex');
    const filteredTable = screen.getByRole('table');
    expect(await within(filteredTable).findByText('Alex Morgan', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(within(filteredTable).queryByText('Jamie Lee')).not.toBeInTheDocument();
    expect(records.find(item => item._id === 'a1').status).toBe('Confirmed');
  });
});
