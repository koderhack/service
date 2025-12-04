import { UserPreferences } from "./types";

export const DEFAULT_PREFERENCES: UserPreferences = {
  workStartHour: 8,
  workEndHour: 17,
  appointmentDurationMinutes: 60,
  // Defaulting to a central point in Kraków for demo purposes
  homeBase: {
    lat: 50.0647,
    lng: 19.9450,
    address: "Base (Kraków Main Square)"
  }
};

export const API_CONFIG = {
  // Replace these with process.env.VITE_... in production
  MAPBOX_TOKEN: "", // Optional: if empty, app uses Haversine fallback
  BACKEND_URL: "http://localhost:3001" // For local dev
};