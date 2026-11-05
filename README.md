# Daybook — Appointment Manager

A responsive appointment dashboard built for the freelancer practical assessment. The React client talks to an Express REST API; MongoDB is the source of truth for records and status changes.

## Features

- Appointment listing, live totals by status, customer name search, and combined status filtering.
- Validated appointment creation with predefined services and custom service names.
- Persisted status changes, loading/error/empty states, and success/error notifications.
- Responsive sidebar and appointment table for mobile and desktop.
- Repeatable MongoDB seed for the three assessment appointments.

## Stack and structure

- Client: React, Vite, React Router, Axios, Lucide, React Hot Toast, Tailwind CSS (with a small custom design system).
- Server: Node.js, Express, Mongoose, express-validator.

```text
client/src/App.jsx                 Dashboard, form, filters and status actions
client/src/services/appointments.js API service layer
client/src/styles.css              Responsive design system
server/src/models/Appointment.js   Mongoose schema
server/src/routes/appointments.js  REST routes and request validation
server/src/seed.js                 Idempotent assessment data seed
```

## Prerequisites and setup

Use Node.js 20 or later and a running local MongoDB instance, or provide a MongoDB Atlas connection string.

```bash
npm run install:all
```

Copy `server/.env.example` to `server/.env`; set `MONGODB_URI`, `PORT`, and `CLIENT_URL` if needed. Copy `client/.env.example` to `client/.env` and set `VITE_API_BASE_URL` if the API does not use its default URL. The sample values contain no credentials.

Seed and start the application in the project root:

```bash
npm run seed
npm run dev
```

The API runs at `http://localhost:5000` and Vite serves the app at `http://localhost:5173`. To run them separately use `npm run dev:server` and `npm run dev:client`. A production client bundle is created by `npm run build`.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| GET | `/api/appointments` | Return sorted appointments and dynamically calculated status totals in `{ success, data }` |
| GET | `/api/appointments?status=Pending` | Optionally filter the list by a supported status; totals remain for all records |
| GET | `/api/appointments/:id` | Return one appointment or a 404 |
| POST | `/api/appointments` | Create an appointment; validates name, service, date, time and status |
| PATCH | `/api/appointments/:id/status` | Validate and persist a new status |

Successful responses use `{ success: true, data: ... }`; errors use `{ success: false, message: ... }` and include field errors when validation fails.

Dates are stored as `YYYY-MM-DD` and times as 24-hour `HH:MM` strings. This preserves the user's chosen local appointment values without UTC date shifting.

## Assessment handover

**Completed:** listing, creation, backend/frontend validation, MongoDB persistence, status management, status filters, customer search, responsive layout, loading/error/empty states, and repeatable seed data.

**Search change request assumption:** the added customer search matches a case-insensitive substring of the customer name and can be combined with the selected status filter. This fits the existing UI and does not change the API or persistence model.

**Tests performed:** `npm test` passed 12 automated checks (6 API health/validation checks and 6 React dashboard checks). `npm run build` completed successfully, and `npm audit` reports zero client dependency vulnerabilities. On the configured Atlas database, the seed ran, and a temporary appointment was created, changed from Pending to Confirmed, read back through the API, and removed after verification. The database returned to the three assessment records. Client workflow tests mock the API.

**Still to verify manually:** inspect the rendered browser at 360px and desktop widths, and refresh the browser after a real appointment change to demonstrate end-to-end persistence in the UI. The API persistence path itself was verified against Atlas.

**Technical decisions:** a small Axios service layer keeps HTTP details out of UI components. The Mongoose model centralizes persistence constraints. Reusable stat cards, status badges, and appointment rows keep the dashboard consistent. No authentication or payment features were added because they are outside the assessment scope.

**Known limitation:** visual browser QA at mobile and desktop sizes has not been completed. The frontend automated tests mock the API; live database create/status/readback was checked separately.

**AI and starting-code disclosure:** the workspace was empty before implementation. AI assistance was used to create the project source, tests, and documentation from the candidate brief and the supplied development prompt.
