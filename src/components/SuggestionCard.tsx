import React from 'react';
import { ScoredSlot } from '../types';
import { format } from 'date-fns';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

interface SuggestionCardProps {
  slot: ScoredSlot;
  onSelect: (slot: ScoredSlot) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ slot, onSelect }) => {
  const scoreColor = slot.score < 15 ? 'text-green-600 bg-green-50' : slot.score < 45 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:border-blue-400 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-slate-800">
            {format(slot.start, 'EEEE, d MMM')}
          </h4>
          <div className="flex items-center text-slate-600 mt-1">
            <Clock className="w-4 h-4 mr-1" />
            <span>{format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-bold ${scoreColor}`}>
          +{slot.score} min travel
        </div>
      </div>

      <div className="text-xs text-slate-500 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        <span>Base/Prev</span>
        <ArrowRight className="w-3 h-3" />
        <span>{slot.travelToClient}m</span>
        <ArrowRight className="w-3 h-3" />
        <span>Client</span>
        <ArrowRight className="w-3 h-3" />
        <span>{slot.travelFromClient}m</span>
        <ArrowRight className="w-3 h-3" />
        <span>Next/Base</span>
      </div>

      <button 
        onClick={() => onSelect(slot)}
        className="w-full mt-2 bg-primary text-white py-3 rounded-lg font-semibold active:bg-blue-700 transition-colors"
      >
        Confirm Appointment
      </button>
    </div>
  );
};