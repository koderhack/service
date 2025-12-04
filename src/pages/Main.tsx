import React, { useState, useEffect } from 'react';
import { Mic, Search, Calendar, RefreshCw } from 'lucide-react';
import { geocodeLocation } from '../services/geocode';
import { findBestSlots } from '../services/scheduler';
import { useAppointments } from '../hooks/useAppointments';
import { DEFAULT_PREFERENCES } from '../constants';
import { WeekGrid } from '../components/WeekGrid';
import { SuggestionCard } from '../components/SuggestionCard';
import { ScoredSlot, Appointment, GeoLocation } from '../types';
import { API_CONFIG } from '../constants';

export const Main: React.FC = () => {
  const { appointments, addAppointment, refresh } = useAppointments();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<ScoredSlot[]>([]);
  const [targetLocation, setTargetLocation] = useState<GeoLocation | null>(null);
  const [tasksCount, setTasksCount] = useState(0);

  // Poll for external tasks (Shortcuts/Webhook) - Simple polling mechanism
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_CONFIG.BACKEND_URL}/tasks/user1`);
        if (res.ok) {
          const tasks = await res.json();
          if (tasks.length > 0 && tasks.length !== tasksCount) {
            setTasksCount(tasks.length);
            // Auto-populate input with last task
            setInputText(tasks[tasks.length - 1].rawText);
          }
        }
      } catch (e) {
        // Silently fail on connection error (expected if server not running)
      }
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [tasksCount]);

  const handleSearch = async () => {
    if (!inputText) return;
    setIsProcessing(true);
    setSuggestions([]);
    
    try {
      // 1. Geocode
      const loc = await geocodeLocation(inputText);
      setTargetLocation(loc);

      // 2. Run Algorithm
      const slots = findBestSlots(loc, appointments, DEFAULT_PREFERENCES);
      setSuggestions(slots);
    } catch (error) {
      console.error(error);
      alert("Could not find location or slots.");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmSlot = async (slot: ScoredSlot) => {
    if (!targetLocation) return;
    
    const newAppt: Appointment = {
      id: Date.now().toString(),
      clientName: inputText.split(' ')[0] || "Client", // Naive name extraction
      location: targetLocation,
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      notes: "Scheduled via AI"
    };

    await addAppointment(newAppt);
    setSuggestions([]);
    setInputText("");
    setTargetLocation(null);
    alert("Appointment Confirmed!");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar / Top Area: Input */}
      <div className="w-full md:w-96 bg-white shadow-md z-10 flex flex-col border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="text-primary" /> ServiceRoute
          </h1>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Where is the job?</label>
            <div className="relative">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. Kraków Olsza, Awaria pralki"
                className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="absolute right-3 top-3 text-slate-400 hover:text-primary">
                <Mic className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={handleSearch}
              disabled={isProcessing}
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? <RefreshCw className="animate-spin w-5 h-5"/> : <Search className="w-5 h-5" />}
              Find Best Slots
            </button>
          </div>

          {targetLocation && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-md">
              <span className="font-semibold">Location found:</span> {targetLocation.address}
            </div>
          )}
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {suggestions.length > 0 && <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recommended Slots</h3>}
          {suggestions.map((slot, idx) => (
            <SuggestionCard key={idx} slot={slot} onSelect={confirmSlot} />
          ))}
          {suggestions.length === 0 && !isProcessing && inputText && targetLocation && (
             <div className="text-center text-slate-400 mt-10">
               No slots found or processed yet.
             </div>
          )}
        </div>
      </div>

      {/* Main Content: Calendar */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <WeekGrid appointments={appointments} />
          
          <div className="mt-8 text-slate-500 text-sm">
            <h4 className="font-bold mb-2">Debug / Info</h4>
            <p>Appointments stored locally on device.</p>
            <p>External Task Queue: {tasksCount} items waiting.</p>
          </div>
        </div>
      </div>

    </div>
  );
};