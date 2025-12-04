import { GeoLocation } from "../types";

// Radius of the Earth in km
const R = 6371;

/**
 * Calculates distance between two points in kilometers using Haversine formula
 */
export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Estimates travel time in minutes based on distance and average city speed.
 * Uses a conservative 30km/h average speed for city driving + 5 min parking buffer.
 */
export function estimateTravelTimeMinutes(start: GeoLocation, end: GeoLocation): number {
  const distKm = getDistanceFromLatLonInKm(start.lat, start.lng, end.lat, end.lng);
  const avgSpeedKmh = 30; 
  const travelTime = (distKm / avgSpeedKmh) * 60;
  return Math.ceil(travelTime + 5); // Add 5 minutes buffer for parking/traffic
}