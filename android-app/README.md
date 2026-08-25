# Brainware Hospital — Android App

Native Android (Java + XML, MVVM) patient app for the Hospital Connected
System, sharing the same Node.js/Express/MongoDB backend as the React web
app. No separate backend, no direct database access — every screen talks to
the backend over HTTPS REST, exactly like the web app does.

## Requirements
- Android Studio (Koala or newer)
- JDK 17
- Android SDK 34
- An emulator or physical device (minSdk 24 / Android 7.0+)

## Running locally

1. Start the backend (`backend/`) and make sure it's reachable at
   `http://localhost:5000` — see `BACKEND_FIXES.md` and the backend's own
   README for setup.
2. Open `android-app/` in Android Studio as its own project (File → Open).
3. Run on an **emulator** — debug builds are already pointed at
   `http://10.0.2.2:5000/api/`, which is how the emulator reaches your
   machine's `localhost`. No config needed.
4. Running on a **physical device** instead: it can't resolve `10.0.2.2`.
   You need to update **two files together** — missing one makes requests
   fail silently:
   - `app/build.gradle` (`buildTypes.debug.buildConfigField "BASE_URL"`) →
     your machine's LAN IP, e.g. `http://192.168.1.42:5000/api/`
   - `app/src/main/res/xml/network_security_config.xml` → add that same IP
     as a `<domain>` entry (see the comment already in that file). Android
     blocks cleartext HTTP to any host not explicitly whitelisted there, so
     updating `BASE_URL` alone will fail with no obvious error.
   - Make sure the device is on the same Wi-Fi network as your machine.

## Production build

Before building a release APK/AAB:

1. Deploy the backend to Render (see the backend's own deployment docs).
2. In `app/build.gradle`, under `buildTypes.release`, replace
   `https://YOUR-RENDER-SERVICE.onrender.com/api/` with your real Render URL.
3. Build → Generate Signed Bundle/APK in Android Studio.

## Architecture

```
UI (Activities/Fragments)
   ↓
ViewModel (LiveData<Resource<T>>)
   ↓
Repository (maps API responses → Resource states)
   ↓
ApiService (Retrofit interface, exact backend contract)
   ↓
Node.js Backend (shared with React web app)
   ↓
MongoDB Atlas
```

- **Auth**: JWT stored in `EncryptedSharedPreferences` (Android Keystore
  backed) via `TokenManager`. Never stores the password. `AuthInterceptor`
  attaches the token to every request; `SessionExpiredInterceptor` detects a
  401 and broadcasts a sign-out event that `MainActivity` listens for.
- **Every API-driven screen** has Loading / Success / Error / Empty states —
  see `Resource<T>` and how each Fragment/Activity observes it.
- **Booking flow never trusts the client**: `BookAppointmentActivity` checks
  availability before enabling the booking button, but still handles a 409
  from the actual booking call (someone else took the slot in between) by
  invalidating the check and asking the user to re-check.
- **Digital Patient ID QR code** is generated locally (ZXing) from an opaque
  identifier only — never the JWT, password, or medical history.
- **Known backend response-shape quirks** (e.g. `doctor` sometimes being a
  bare ObjectId string and sometimes a populated object) are handled
  defensively in `Appointment.java` / `Doctor.java` via `JsonElement`, with
  comments pointing at the backend code that causes it.

## What's implemented
Register, OTP verification, login (including 2FA/OTP challenge), forgot/reset
password, guest booking (book without an account, matching the backend's
`book-guest` endpoint), home dashboard, browse departments → doctors →
doctor profile, book appointment with availability check, appointment
history with Upcoming/Completed/Cancelled tabs, cancellation, reschedule,
medical records list + upload (multipart, matches the backend endpoint),
profile view/edit, digital patient ID, family member management, change
password, 2FA toggle, delete account, and a real backend-fetched emergency
contact number (never hard-coded — see `GET /api/settings/public`).

## Not yet implemented (flagged, not silently skipped)
- Push notifications (Firebase Cloud Messaging) — dependency not yet added,
  no in-app notifications feed either.
- Live queue via WebSocket — the app shows queue position from the
  appointment detail response but doesn't poll or subscribe for live updates.
- The 2FA switch doesn't show your *current* 2FA status on load (the profile
  endpoint doesn't expose it) — it reflects the state after you toggle it,
  via the server's response message.
