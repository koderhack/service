import { GeoLocation } from "../types";

// Mock database for offline/demo usage (Kraków districts)
const MOCK_LOCATIONS: Record<string, { lat: number, lng: number }> = {
  "krakow": { lat: 50.0647, lng: 19.9450 },
  "olsza": { lat: 50.0811, lng: 19.9606 },
  "kazimierz": { lat: 50.0526, lng: 19.9442 },
  "nowa huta": { lat: 50.0722, lng: 20.0382 },
  "podgorze": { lat: 50.0413, lng: 19.9501 },
  "bronowice": { lat: 50.0863, lng: 19.8974 },
  "ruczaj": { lat: 50.0125, lng: 19.9142 },
  "pradnik": { lat: 50.0934, lng: 19.9324 },
};

/**
 * Geocodes a text string to a location.
 * Priority:
 * 1. API (Mapbox/Google) - skipped if no key provided.
 * 2. Mock Data (dictionary match).
 * 3. Random fallback around center (for pure demo purposes if text unknown).
 */
export async function geocodeLocation(text: string): Promise<GeoLocation> {
  const query = text.toLowerCase().trim();
  
  // Simulation delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // 1. Try to match mock data keys
  for (const [key, coords] of Object.entries(MOCK_LOCATIONS)) {
    if (query.includes(key)) {
      return {
        address: text, // Keep original text
        lat: coords.lat,
        lng: coords.lng
      };
    }
  }

  // 2. Fallback: Return a coordinate slightly offset from center (Demo only!)
  // In a real app, this would throw an error or ask for refinement
  console.warn("Geocode fallback used for:", text);
  return {
    address: text,
    lat: 50.0647 + (Math.random() * 0.05 - 0.025),
    lng: 19.9450 + (Math.random() * 0.05 - 0.025)
  };
}