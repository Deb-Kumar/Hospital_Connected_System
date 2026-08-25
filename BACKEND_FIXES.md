# Backend Fixes — Phase 1

Changes made to `backend/` before starting the Android app. All are backward
compatible with the existing React web app unless noted.

## 1. Fixed a live bug: `GET /api/departments` was broken
`adminController.js` had **two** `exports.getPublicDepartments` definitions.
In JavaScript, the second silently overwrites the first, so the route was
actually returning `{ success: true, departments: [...] }` instead of a plain
array — and React's `Departments.jsx`, `GuestBooking.jsx`, and
`BookAppointment.jsx` all call `.map()` / check `.length` directly on the
response body. In practice this meant:
- `GuestBooking.jsx` and `BookAppointment.jsx`'s department `<select>` would
  throw at render (`.map is not a function`) or silently render empty.
- `Departments.jsx` always fell back to its hardcoded `DEFAULT_CATALOGUE`
  instead of showing real DB departments, because `dbDepartments.length` was
  `undefined` on an object.

**Fix:** removed the duplicate, kept the array-returning version, restored the
`active: true` filter, and added a `doctorCount` field per department (based
on approved, non-leave doctors) — additive, doesn't break existing consumers.

## 2. Closed an unauthenticated password-reset endpoint
`POST /api/auth/dev-reset` let anyone reset any patient's password using only
their phone number — no auth, no rate limiting. Now:
- Registered only when `NODE_ENV !== 'production'`.
- Even then, requires a `DEV_RESET_KEY` shared secret via the
  `x-dev-reset-key` header.

## 3. Medical records: real file upload instead of a trusted URL string
Previously `POST /api/patient/:id/records` just stored whatever `fileUrl`
string the client sent — no actual file handling. Added:
- `utils/fileStorage.js` — uploads to Cloudinary if `CLOUDINARY_*` env vars
  are set (durable, works on Render); falls back to local disk under
  `backend/uploads/` if not (dev only — Render's disk is ephemeral).
- `POST /api/patient/:id/records/upload` (multipart/form-data, field `file`)
  — new endpoint, uses this storage layer. The Android app should use this
  one. The original JSON-body endpoint is untouched for the web app.
- `express.static('/uploads')` added to serve local-fallback files.

## 4. Production start script
`npm start` ran `nodemon` (a dev file-watcher) in production. Changed to
`node server.js`. `npm run dev` still uses nodemon for local development.

## 5. Root-level health check
Added `GET /health` (in addition to the existing `GET /api/health`) returning
`{ status, service, environment }`, matching what Render/uptime checks and the
Android app will look for.

## 6. `.env.example` added
Documents every variable the backend reads, including the new
`CLOUDINARY_*` and `DEV_RESET_KEY` vars, with no real values.

## 7. Public settings endpoint (added in a later session, for the Android app)
Added `GET /api/settings/public` — returns only the non-sensitive subset of
`SystemSetting` (hospital name, emergency hotline, support email, OPD hours)
without requiring auth. This exists because `SystemSetting` was previously
only reachable through the admin-only settings endpoint, but the Android
app's Emergency screen needs the real hotline number without hard-coding it
or requiring the patient to be logged in. Registered in `server.js` as
`app.use('/api/settings', require('./routes/settingsRoutes'))`.

## ⚠️ Action required from you
Your uploaded zip's `backend/.env` contained **live credentials**: MongoDB
Atlas password, JWT secret, Gmail SMTP app password, and a Fast2SMS API key.
I did not include this file in the returned zip. If it has ever been pushed
to GitHub or shared, **rotate all of these now** before deploying anywhere:
- Change the MongoDB Atlas database user's password.
- Revoke and regenerate the Gmail SMTP app password.
- Regenerate the Fast2SMS API key.
- Generate a new random `JWT_SECRET`.

## New dependencies
`multer` (file uploads) and `cloudinary` (durable storage) added to
`package.json`. Run `npm install` in `backend/` to pick them up.

## Not yet done (flagged in the original assessment, still pending)
- Response-shape standardization across the rest of the API (deferred —
  touching this now risks breaking the web app; better done endpoint-by-
  endpoint as Android consumes each one).
- WebSocket/live queue updates (still polling-based).
- FCM push notification wiring (dependency present, not yet integrated).
