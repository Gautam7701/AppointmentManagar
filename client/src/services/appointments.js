import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'), timeout: 10000 });
export const getAppointments = async () => (await api.get('/appointments')).data.data;
export const createAppointment = async (data) => (await api.post('/appointments', data)).data.data.appointment;
export const updateAppointmentStatus = async (id, status) => (await api.patch(`/appointments/${id}/status`, { status })).data.data.appointment;
