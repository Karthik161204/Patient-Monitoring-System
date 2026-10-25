# Patient Appointment Monitoring System


A full-stack hospital appointment management application built with MongoDB,
Express, React, and Node.js. It provides separate portals for patients, doctors,
and administrators, with role-based access to appointment and prescription
workflows.

## Contents

- [Project overview](#project-overview)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Installation and setup](#installation-and-setup)
- [Mobile and installable app](#mobile-and-installable-app)
- [Demo accounts](#demo-accounts)
- [Using the application](#using-the-application)
- [Appointment and prescription rules](#appointment-and-prescription-rules)
- [API overview](#api-overview)
- [Data models](#data-models)
- [Available scripts](#available-scripts)
- [Configuration](#configuration)
- [Security and production notes](#security-and-production-notes)

## Project overview

The application supports the complete appointment journey:

1. Patients register or sign in.
2. Patients find doctors by name, specialty, or a supported medical-issue keyword.
3. Patients review a doctor's profile and book an available appointment.
4. Doctors view their appointment queue, start consultations, and record
   prescriptions.
5. Patients can review their appointments and prescription history.
6. Administrators manage doctors, patients, appointments, and prescriptions,
   and can view a patient's combined history.

## Features

- Responsive patient, doctor, and admin portals with installable PWA support.

### Patient portal

- Patient registration and sign-in.
- Doctor search by name, specialty, or supported medical-issue keywords.
- Doctor profile and availability viewing.
- Appointment booking and appointment history.
- Personal prescription history.

### Doctor portal

- Today's appointments and upcoming appointments.
- Patient details and appointment history.
- Appointment queue ordered by token.
- Set appointment availability from the doctor dashboard; the saved status is
  shown to patients and administrators and prevents new bookings while off.
- Consultation workflow and prescription entry.
- Prescription history.

### Admin portal

- Dashboard totals for patients, doctors, today's appointments, and completed
  appointments.
- Create and manage doctor profiles, including specialty, experience, phone,
  and availability.
- View patient and appointment lists.
- View an individual patient's grouped appointment and prescription history.
- Review prescriptions and add clarifying notes.

### Shared workflows

- JWT-based authentication and role-protected application routes.
- Password hashing with bcrypt.
- Server-side appointment validation and slot reservation.
- Prescription history preservation: each consultation creates a separate
  record; administrators can update clarifying notes without replacing the
  diagnosis or prescription text.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, React Router 6, Axios, Vite, CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcrypt |

## Project structure

```text
hospital-appointment-system/
├── client/                 # React single-page application
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # Shared UI and protected-route components
│   │   ├── context/        # Authentication state
│   │   ├── pages/
│   │   │   ├── admin/      # Admin dashboard and management pages
│   │   │   ├── auth/       # Patient, doctor, and admin login/register
│   │   │   ├── doctor/     # Doctor appointments and consultation pages
│   │   │   └── patient/    # Patient search, booking, and history pages
│   │   └── styles/         # Application styles
│   └── vite.config.js      # Dev server and API proxy configuration
├── server/                 # Express API
│   ├── config/             # MongoDB connection
│   ├── middleware/         # Authentication and role authorization
│   ├── models/             # Mongoose data models
│   ├── routes/             # API route handlers
│   ├── seed.js             # Demo data seeder
│   └── server.js           # API entry point
├── package.json            # Root convenience scripts
└── run-app.bat             # Windows launcher for client and server
```

## Requirements

- Node.js 18 or later and npm.
- MongoDB running locally or a MongoDB connection string, such as MongoDB Atlas.

## Installation and setup

### 1. Configure the backend

From the project root, copy the example environment file and install the server
dependencies.

**Windows PowerShell:**

```powershell
Copy-Item server\.env.example server\.env
cd server
npm install
```

**macOS/Linux:**

```bash
cp server/.env.example server/.env
cd server
npm install
```

Edit `server/.env` as necessary. At minimum, make sure `MONGO_URI` points to a
running MongoDB instance and set a private `JWT_SECRET`.

Seed the demo data and start the API:

```bash
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`. Its health endpoint is
`http://localhost:5000/api/health`.

## Mobile and installable app

The client is responsive across phone, tablet, and desktop sizes and can be
installed from a supported mobile or desktop browser as a Progressive Web App.
Serve the production client over HTTPS, open it in the browser, then choose
**Install app** or **Add to Home Screen**. On iOS, use Safari's Share menu and
choose **Add to Home Screen**. The install prompt is browser-dependent.

The service worker caches only the app shell and static frontend assets; API
requests and patient, doctor, and appointment data are not cached. Offline
installation opens the app shell, but sign-in, booking, and other server-backed
features require a network connection. Hosting must serve the SPA fallback for
app routes and serve the manifest and service worker from the site root.

This produces an installable web app, not native iOS/Android store packages.
Publishing to the Apple App Store or Google Play requires a native wrapper and
the corresponding developer accounts and review process.

### 2. Configure the frontend

Open a second terminal at the project root.

**Windows PowerShell:**

```powershell
Copy-Item client\.env.example client\.env
cd client
npm install
npm run dev
```

**macOS/Linux:**

```bash
cp client/.env.example client/.env
cd client
npm install
npm run dev
```

Open `http://localhost:3000`. The Vite development server forwards `/api`
requests to the backend at `http://127.0.0.1:5000`.

### Windows quick start

After configuring the environment files, run `run-app.bat` from the project
folder. It opens separate command windows for the backend and frontend. The
backend dependencies and frontend dependencies must each be installed first.

## Demo accounts

The server seed script creates the following accounts using the password
`password123`:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@hospital.com` | `password123` |
| Doctor | `kumar@hospital.com` | `password123` |
| Patient | `patient@hospital.com` | `password123` |

The seed script also creates sample doctors in multiple specialties and sample
patient appointment/prescription data. Additional doctor emails and specialties
are listed in `server/seed.js`. Patients can also create accounts from the
registration page.

The seed operation is safe to rerun for the accounts it manages: existing demo
users are skipped rather than recreated.

## Using the application

| User | Entry point | Main actions |
| --- | --- | --- |
| Patient | `/patient/login` or `/patient/register` | Search doctors, view profiles, book appointments, review appointments and prescriptions |
| Doctor | `/doctor/login` | View queues, attend scheduled appointments, review patients, write prescriptions |
| Admin | `/admin/login` | Review dashboard, manage doctors and patients, inspect appointments and prescriptions |

The application root (`/`) redirects to the patient login page. Authenticated
pages require the matching user role.

## Appointment and prescription rules

1. **Booking window:** appointments can be booked only for today or a future
   date in the current calendar month.
2. **Appointment times:** the system offers 30-minute slots from 9:00 AM
   through 4:30 PM. On the current day, past slots are not available.
3. **Slot exclusivity:** a doctor cannot have two active appointments for the
   same date and time. Cancelled appointments release their slot.
4. **Token queues:** token numbers are assigned per doctor and appointment
   date. Different doctors have independent queues.
5. **Consultation start:** doctors can start an appointment only on its
   scheduled date and once its appointment time has arrived.
6. **Prescription creation:** saving a prescription completes the appointment
   and creates a new prescription record. Admins may update a record's notes,
   but its diagnosis and prescription text are not overwritten.
7. **Patient history:** the admin patient-history page groups a patient's
   appointments and prescriptions under one patient record.

Appointment statuses are `Booked`, `Waiting`, `In Consultation`, `Completed`,
and `Cancelled`.

## API overview

All API endpoints are prefixed with `/api`.

| Route group | Purpose |
| --- | --- |
| `/api/health` | API and database connection status |
| `/api/auth` | Patient registration and role-specific login |
| `/api/doctors` | Doctor search/details, doctor appointments, and patient history for authorized roles |
| `/api/patients` | Current patient profile, appointments, and prescriptions |
| `/api/appointments` | Availability, appointment creation, details, and status changes |
| `/api/prescriptions` | Doctor prescription creation |
| `/api/admin` | Admin dashboard summary and administrative management endpoints |

Protected endpoints use the bearer token returned by login or registration.
Role checks are applied to protected operations on the server as well as in the
frontend.

## Data models

- **User:** identity, email, hashed password, and role (`patient`, `doctor`, or
  `admin`).
- **Patient:** patient profile linked to a user, including phone, age, and
  gender.
- **Doctor:** doctor profile linked to a user, including specialty, experience,
  phone, and availability.
- **Appointment:** patient, doctor, date, time, token number, status, and active
  slot reservation.
- **Prescription:** patient, doctor, appointment, diagnosis, prescription text,
  and notes.

## Available scripts

Run scripts from the directory indicated:

| Directory | Command | Description |
| --- | --- | --- |
| `server/` | `npm run dev` | Start the API with nodemon |
| `server/` | `npm start` | Start the API with Node.js |
| `server/` | `npm run seed` | Create demo accounts and sample records |
| `client/` | `npm run dev` | Start the Vite development server |
| `client/` | `npm run build` | Create a production frontend build in `client/dist` |
| `client/` | `npm run preview` | Preview the production frontend build |
| Project root | `npm run server` | Convenience command to start the backend |
| Project root | `npm run client` | Convenience command to start the frontend |
| Project root | `npm run seed` | Convenience command to seed the database |

## Configuration

### Backend: `server/.env`

| Variable | Purpose | Default |
| --- | --- | --- |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/hospital_appointment_system` |
| `JWT_SECRET` | Secret used to sign authentication tokens | Set this to a private value |
| `PORT` | API listening port | `5000` |

### Frontend: `client/.env`

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_URL` | API base path used by the frontend | `/api` |

## Security and production notes

- Demo credentials and the example JWT secret are for local development only.
  Change the secret and all demo passwords before any deployment.
- Keep `.env` files private and do not commit real credentials.
- This project is an application starter/demo, not a substitute for a
  production clinical system. Before deployment, review security, privacy,
  auditing, backups, access policies, operational monitoring, and applicable
  healthcare regulations.
- The repository does not currently define automated test scripts.
