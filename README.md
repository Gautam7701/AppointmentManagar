# Appointment Manager

A small appointment dashboard for creating appointments and keeping their status up to date. The interface is built with React, and the Express API stores appointment records in MongoDB.

**Source:** [Gautam7701/AppointmentManagar on GitHub](https://github.com/Gautam7701/AppointmentManagar)

## What you can do

- View appointments and counts for pending, confirmed, and cancelled bookings.
- Search by customer name and filter by status.
- Add an appointment with a service, date, time, and status.
- Change an appointment's status and keep that change in MongoDB.
- See validation messages, loading and empty states, and save/error notifications.

The form offers common services and also accepts a custom service name.

## Run it locally

You will need Node.js 20 or newer and MongoDB running locally, or a MongoDB Atlas database with a connection string.

From the project folder, install the dependencies:

```bash
npm run install:all
```

In PowerShell, make a private server environment file from the example:

```powershell
Copy-Item server/.env.example server/.env
```

Open `server/.env`. The example is set up for local MongoDB. If you are using Atlas, replace `MONGODB_URI` with your Atlas connection string. Keep the real `.env` file private; it is excluded from Git. The example file contains no credentials.

Add the sample appointments, then start the API and web app:

```bash
npm run seed
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:5000](http://localhost:5000), and its health check is `/api/health`. The seed can be run again safely; it leaves matching sample appointments in place instead of inserting duplicates.

### Quick demo

After the app opens, the three seeded appointments should appear on the dashboard. Try searching for a customer, filtering by status, and adding an appointment with a future date. Change its status, refresh the page, and check that the updated status is still there. This gives a reviewer a short way to see the UI and database-backed flow working.

To start one side at a time, use `npm run dev:server` or `npm run dev:client`. To create the production client bundle, run `npm run build`.

### Environment examples

- `server/.env.example` lists the API and MongoDB settings. Copy it to `server/.env` for local use.
- `client/.env.example` shows the optional `VITE_API_BASE_URL` setting. The local default is `http://localhost:5000/api`; production builds use `/api` on the same domain.

For Vercel, add `MONGODB_URI` in the project's Environment Variables. Do not commit the value to GitHub. The repo includes `vercel.json` to route the frontend and API as Vercel services; the hosted deployment still needs to be completed and checked.

## API notes

All routes use the `/api` prefix. Dates use `YYYY-MM-DD`; times use 24-hour `HH:MM` format.

| Method | Route | What it does |
| --- | --- | --- |
| `GET` | `/api/health` | Confirms the API is responding. |
| `GET` | `/api/appointments` | Lists appointments and returns status totals. |
| `GET` | `/api/appointments?status=Pending` | Filters the list by `Pending`, `Confirmed`, or `Cancelled`. Totals still cover all appointments. |
| `GET` | `/api/appointments/:id` | Returns one appointment, or a not-found response. |
| `POST` | `/api/appointments` | Creates an appointment after validating its fields. |
| `PATCH` | `/api/appointments/:id/status` | Changes the status of an existing appointment. |

Successful responses have a `success: true` field and a `data` object. Errors return `success: false` with a readable message; validation errors also include field details.

Example request body for `POST /api/appointments`:

```json
{
  "customerName": "Alex Morgan",
  "service": "Consultation",
  "date": "2026-11-12",
  "time": "10:30",
  "status": "Pending"
}
```

## Verification

The checks run for this submission:

- `npm test` - all 12 automated checks passed: 6 API health/validation checks and 6 dashboard interaction checks.
- `npm run build` - the Vite production build completed.
- The API was also checked against the configured Atlas database: sample data was seeded, a temporary appointment was created, its status changed and read back, then the temporary record was removed. The three sample records remained. The client tests use a mocked API, so those tests do not exercise MongoDB.

## Status and limitations

The appointment list, search, status filter, create form, status updates, validation, MongoDB persistence, seed data, and basic loading/error/empty states are implemented.

The remaining handoff checks are a visual pass at mobile and desktop widths and a live Vercel check after adding the Atlas `MONGODB_URI`. The app has no sign-in or per-user access control, so it is intended as a small assessment demo rather than a multi-user production system.

## One implementation decision

Appointment dates and times are stored as strings in the formats entered in the form. They represent a local booking time, so converting them to UTC timestamps could shift the displayed date for someone in another timezone. Keeping the date and time separate avoids that shift for this dashboard.
