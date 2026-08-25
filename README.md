# Hospital Appointment System — Connected Architecture

**One backend. One database. Two clients.** The Android app and the React
web app both talk to the same Node/Express + MongoDB API, so a patient who
books an appointment on the phone app shows up instantly in the doctor's
queue on the web app, and vice versa — because they're reading and writing
the exact same data.

```
                     ┌─────────────────────┐
                     │   MongoDB database    │
                     │  (hospital_db)         │
                     └──────────▲────────────┘
                                │
                     ┌──────────┴────────────┐
                     │   backend/             │
                     │   Node + Express API   │
                     │   http://<host>:5000    │
                     └────▲──────────────▲────┘
                          │              │
              REST/JSON   │              │   REST/JSON
                          │              │
              ┌───────────┴───┐   ┌──────┴──────────┐
              │  android-app/  │   │   web-app/       │
              │  Native app    │   │   React website  │
              │  (Patient/     │   │   (Patient/       │
              │   Doctor/      │   │    Doctor/        │
              │   Receptionist/│   │    Admin)         │
              │   Admin)       │   │                  │
              └────────────────┘   └──────────────────┘
```

## Why this works

Both clients were built against the identical REST contract:
- Same JWT auth (`Authorization: Bearer <token>`)
- Same role model (`PATIENT`, `DOCTOR`, `RECEPTIONIST`, `ADMIN`)
- Same MongoDB ObjectId-based IDs (strings) everywhere
- Same endpoints, same JSON shapes, same field names

The Android app previously pointed at a separate Java/Spring Boot + MySQL
backend from an earlier version of this project. That backend has been
**retired** for this connected setup — it still exists as a standalone
artifact if you ever want it back, but it is not part of this system and
the Android app no longer talks to it. `android-app/` now points at the
same Node backend as `web-app/`.

## Folder structure

```
hospital-connected/
├── backend/         Node + Express + MongoDB — the ONE shared API
├── android-app/     Native Android client (XML layouts), hits backend/
└── web-app/         React client, hits backend/
```

## Running the connected system

### 1. Start the shared backend (do this first — both clients need it running)
```
cd backend
cp .env.example .env      # set MONGO_URI, JWT_SECRET, SMTP_*
npm install
npm run dev
```
Runs at `http://localhost:5000/api`.

### 2. Start the web app
```
cd web-app
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```
Opens at `http://localhost:5173`.

### 3. Run the Android app
Open `android-app/` in Android Studio (see the Gradle/emulator setup notes
from earlier in this conversation if running from the terminal). It's
pre-configured to call `http://10.0.2.2:5000/api/` — the emulator's alias
for your host machine's `localhost:5000`, i.e. the same backend the web
app is using.

**On a real phone** instead of an emulator, change the base URL in
`android-app/app/src/main/java/com/hospital/app/api/ApiClient.java`:
```java
private static final String BASE_URL = "http://<your-machine-LAN-IP>:5000/api/";
```
and make sure the phone and your backend machine are on the same network.

## How to prove they're actually connected

1. Register an Admin account (web or Android — same result either way).
2. Have the Admin create a Department (`POST /api/admin/departments`, e.g.
   via Postman, since there's no department UI screen yet).
3. Register a Doctor in that department **on the web app**.
4. Register a Patient **on the Android app**, then book an appointment
   with that doctor.
5. Log in as the Doctor **on the web app** — the booking from the Android
   app appears in their queue immediately. Same database, same data,
   regardless of which client wrote it.

## What changed to make this possible

- **Android app IDs**: converted from `Long` (Spring Boot + MySQL) to
  `String` (MongoDB ObjectId) across every model, DTO, and API call.
- **Android base URL**: repointed from port 8080 (Spring Boot) to port
  5000 (Node).
- **Android request bodies**: a couple of endpoints (`walk-in`, `records`
  upload) switched from form-encoded fields to JSON bodies, since Express
  parses JSON, not form-urlencoded, by default in this project.
- **Backend**: added a `Receptionist` role, model, controller, and routes
  to the Node backend — it only had Patient/Doctor/Admin before, since the
  web app never needed Receptionist. Android did, so the shared backend
  now supports all four roles.

## Guest booking (no login required)

The web app's home page (`/`) leads straight to a public booking form at
`/book` — no account needed. Here's how it works end to end:

1. **Visitor books** with just their name, phone, department, doctor, date,
   and time — `POST /api/appointments/book-guest` (genuinely public, no
   JWT). The backend finds or creates a lightweight `Patient` account
   behind the scenes (same pattern as receptionist walk-in registration).
2. **Success popup** shows the token number, patient name, doctor name,
   department, and appointment time — then nudges them to log in or sign
   up (with the *same phone number*) if they want to see their history.
3. **Claiming the account**: if they later register with that same phone
   number, `authController.register` detects the existing guest account
   and *upgrades* it in place (sets a real password, sends OTP) instead
   of rejecting the signup as a duplicate. Their booking history —
   already linked to that account — is there the moment they log in.
4. **History, profile, records** all stay behind `ProtectedRoute` /
   `protect` middleware as before — only booking itself is public.

### A real bug this fix also closed

While wiring this up, a real issue surfaced: `patient`/`doctor`-scoped
endpoints (profile, history, "my queue", "my revenue") expected the
*Patient* or *Doctor* document's own database id, but both the web app and
Android app only ever had the logged-in person's *User* id. Against a live
MongoDB, "view my history" would have silently 404'd. Fixed by adding
`utils/resolvers.js`, which resolves the right Patient/Doctor document from
the User id server-side — no frontend changes needed, since both clients
already sent the User id. This fix applies to **both** the web app and the
Android app automatically, since it lives in the shared backend.

## Doctor approval workflow (identical on Web and Android)

Every doctor sign-up — whether from the website or the phone app — goes
through the exact same pipeline, because both clients call the exact same
backend endpoints with the exact same field names:

1. **Sign-up form** collects: name, email, phone, password, specialization
   (dropdown: Cardiology, Dentist, Orthopedics, etc.), qualification
   (dropdown: MBBS, MD, MS, BDS, etc.), years of experience, available
   days (Mon–Sun), and available time range. The dropdown option lists are
   kept in sync between `web-app/src/pages/Register.jsx` and
   `android-app/.../res/values/arrays.xml` — same choices, either platform.
2. **Every new doctor starts `PENDING`** — `Doctor.approvalStatus` defaults
   to `PENDING` in the shared database; this can't be bypassed from either
   client because it's enforced in `authController.js`, not the UI.
3. **Admin reviews** — both the web Admin Dashboard and the Android Admin
   Dashboard have a "Pending Doctor Approvals" section showing the same
   details (specialization, qualification, experience, availability) with
   Approve / Reject buttons, calling the same
   `PUT /admin/doctors/:id/approve` and `PUT /admin/doctors/:id/reject`
   endpoints.
4. **Login gate** — a `PENDING` or `REJECTED` doctor is blocked at login on
   both platforms with a clear message (web: colored banner; Android:
   dialog), using the same `approvalStatus` field the backend returns.
   Only `APPROVED` doctors reach their dashboard.
5. **Booking safety** — patients and guests can only ever see and book
   `APPROVED` doctors in the department/doctor lists, on either client.

## Known gaps (same as before, now shared across both clients)

- Department-creation and family-member-add screens don't exist in either
  UI yet — the backend endpoints are there, waiting for a form.
- File upload for medical records saves a placeholder URL rather than a
  real file — wire up S3/Cloudinary before using this for real documents.
- SMS/WhatsApp/Push notifications log to the console — add real provider
  credentials in `backend/utils/notification.js` to go live.
