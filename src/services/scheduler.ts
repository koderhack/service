import { Appointment, GeoLocation, ScoredSlot, UserPreferences } from "../types";
import { estimateTravelTimeMinutes } from "../utils/geo";
import { addDays, setHours, setMinutes, startOfDay, addMinutes, isBefore, isAfter, areIntervalsOverlapping, format } from "date-fns";

/**
 * CORE ALGORITHM
 * 
 * 1. Generate all possible 1-hour slots for the next N days.
 * 2. Filter out slots that overlap with existing appointments.
 * 3. Calculate "Added Travel Cost" for each slot.
 *    Cost = (Travel(Prev -> New) + Travel(New -> Next)) - Travel(Prev -> Next)
 * 4. Sort by lowest cost.
 */

export function findBestSlots(
  targetLocation: GeoLocation,
  existingAppointments: Appointment[],
  preferences: UserPreferences,
  daysToCheck: number = 7
): ScoredSlot[] {
  const scoredSlots: ScoredSlot[] = [];
  const now = new Date();
  
  // 1. Iterate over next N days
  for (let i = 0; i < daysToCheck; i++) {
    const currentDay = addDays(now, i);
    const dayStart = setMinutes(setHours(currentDay, preferences.workStartHour), 0);
    const dayEnd = setMinutes(setHours(currentDay, preferences.workEndHour), 0);

    // Filter appointments for this specific day and sort by time
    const dayAppointments = existingAppointments
      .filter(apt => {
        const aptDate = new Date(apt.start);
        return aptDate.getDate() === currentDay.getDate() && 
               aptDate.getMonth() === currentDay.getMonth();
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Generate candidate slots (every 30 mins to give flexibility)
    let candidateStart = dayStart;
    
    while (addMinutes(candidateStart, preferences.appointmentDurationMinutes) <= dayEnd) {
      const candidateEnd = addMinutes(candidateStart, preferences.appointmentDurationMinutes);
      
      // Check collision
      const hasCollision = dayAppointments.some(apt => 
        areIntervalsOverlapping(
          { start: candidateStart, end: candidateEnd },
          { start: new Date(apt.start), end: new Date(apt.end) }
        )
      );

      if (!hasCollision) {
        // SCORING LOGIC
        const score = calculateScore(candidateStart, candidateEnd, targetLocation, dayAppointments, preferences);
        if (score !== null) {
          scoredSlots.push(score);
        }
      }

      candidateStart = addMinutes(candidateStart, 30);
    }
  }

  // Sort: Lowest score (min added minutes) first
  return scoredSlots.sort((a, b) => a.score - b.score).slice(0, 5); // Return top 5
}

function calculateScore(
  start: Date,
  end: Date,
  targetLoc: GeoLocation,
  dayAppointments: Appointment[],
  prefs: UserPreferences
): ScoredSlot | null {
  // Find Previous and Next appointment relative to this slot
  // Note: dayAppointments is already sorted
  let prevAppt: Appointment | null = null;
  let nextAppt: Appointment | null = null;

  for (const apt of dayAppointments) {
    if (isBefore(new Date(apt.end), start) || new Date(apt.end).getTime() === start.getTime()) {
      prevAppt = apt;
    }
    if ((isAfter(new Date(apt.start), end) || new Date(apt.start).getTime() === end.getTime()) && !nextAppt) {
      nextAppt = apt;
    }
  }

  // Define Locations
  const prevLoc = prevAppt ? prevAppt.location : prefs.homeBase;
  const nextLoc = nextAppt ? nextAppt.location : prefs.homeBase;

  // Calculate Travel Times (Using fallback estimator)
  const travelPrevToNew = estimateTravelTimeMinutes(prevLoc, targetLoc);
  const travelNewToNext = estimateTravelTimeMinutes(targetLoc, nextLoc);
  
  // Baseline: How much travel was there originally?
  // If we insert between A and B, original was A->B.
  // If A or B didn't exist, original was 0 (or Home->Home logic, but strictly we look at delta).
  const travelPrevToNext = estimateTravelTimeMinutes(prevLoc, nextLoc);

  // Buffer Check: Do we actually have time to travel?
  if (prevAppt) {
    const timeAvailable = (start.getTime() - new Date(prevAppt.end).getTime()) / 60000;
    if (timeAvailable < travelPrevToNew) return null; // Impossible slot
  }
  if (nextAppt) {
    const timeAvailable = (new Date(nextAppt.start).getTime() - end.getTime()) / 60000;
    if (timeAvailable < travelNewToNext) return null; // Impossible slot
  }

  // Score Calculation: Added Minutes
  // Cost = (A->C + C->B) - (A->B)
  const cost = (travelPrevToNew + travelNewToNext) - travelPrevToNext;

  return {
    start,
    end,
    score: Math.round(cost),
    travelToClient: travelPrevToNew,
    travelFromClient: travelNewToNext,
    reason: `Fits between ${prevAppt ? 'appointment' : 'start'} and ${nextAppt ? 'appointment' : 'end'}`
  };
}