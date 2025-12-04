# ServiceRoute AI

Hybrid React+Capacitor application for technicians to schedule appointments efficiently based on location.

## Quick Start (Developer)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Web Frontend:**
   ```bash
   npm run dev
   ```

3. **Run Backend (Optional for Shortcuts):**
   ```bash
   npm run server
   ```

## Building for iOS (iPad/iPhone)

1. **Build the React App:**
   ```bash
   npm run build
   ```

2. **Initialize Capacitor:**
   ```bash
   npx cap add ios
   ```

3. **Sync to Native:**
   ```bash
   npx cap sync
   ```

4. **Open Xcode:**
   ```bash
   npx cap open ios
   ```
   Select your connected device or simulator and hit Play.

## iOS Shortcuts Integration

To allow Siri/Shortcuts to send addresses to the app:

1. Start the server (`npm run server`) and expose it via ngrok (`ngrok http 3001`).
2. Create a new Shortcut on iOS:
   - **Ask for Input**: Text (Prompt: "Where is the service?")
   - **Get Contents of URL**:
     - URL: `https://<your-ngrok-id>.ngrok.io/receive-shortcut`
     - Method: POST
     - Request Body: JSON
     - Fields: Key `text` -> value `Provided Input`
3. Run the shortcut. The text will appear in the app (polled every 5s).

## Logic Overview

- **Geocoding:** Currently uses a Mock dictionary (Kraków districts) + Random fallback. Edit `src/services/geocode.ts` to add API keys.
- **Scoring:** The algorithm (`src/services/scheduler.ts`) finds gaps in the schedule and calculates the *delta* travel time added by inserting a new stop.
- **Storage:** Uses `Capacitor Preferences` (LocalStorage equivalent) for persistence.

## Checklist for first 2 Hours

1. `npm install` & `npm run dev`.
2. Type "Kraków Olsza" in the input.
3. Click "Find Best Slots".
4. Confirm an appointment and see it on the grid.
5. (Optional) Setup Node server and test `curl -X POST -H "Content-Type: application/json" -d '{"text":"Test Location"}' http://localhost:3001/receive-shortcut`.
