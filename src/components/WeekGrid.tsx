import React, { useMemo } from 'react';
import { Appointment } from '../types';
import { format, startOfWeek, addDays, getHours, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface WeekGridProps {
  appointments: Appointment[];
  selectedDate?: Date;
}

export const WeekGrid: React.FC<WeekGridProps> = ({ appointments, selectedDate }) => {
  const startDate = useMemo(() => startOfWeek(selectedDate || new Date(), { weekStartsOn: 1 }), [selectedDate]);
  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8:00 to 17:00

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  }, [startDate]);

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-700 mb-4">Weekly Schedule</h3>
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="text-xs text-slate-400 font-medium">Time</div>
          {days.map((day) => (
            <div key={day.toString()} className={`text-center text-xs font-semibold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-600'}`}>
              {format(day, 'EEE dd')}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-8 gap-1">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time Label */}
              <div className="h-12 text-xs text-slate-400 flex items-start justify-center pt-1 border-t border-slate-100">
                {hour}:00
              </div>
              
              {/* Days Columns */}
              {days.map((day) => {
                // Find appointments in this cell
                const cellAppts = appointments.filter(apt => {
                  const d = new Date(apt.start);
                  return isSameDay(d, day) && getHours(d) === hour;
                });

                return (
                  <div key={`${day}-${hour}`} className="h-12 border-t border-slate-100 relative group">
                    {cellAppts.map(apt => (
                      <div 
                        key={apt.id} 
                        className="absolute inset-0.5 bg-blue-100 border-l-4 border-blue-500 rounded-sm p-1 text-[10px] leading-tight overflow-hidden cursor-pointer hover:bg-blue-200 transition-colors"
                        title={apt.location.address}
                      >
                        <span className="font-bold block truncate">{apt.clientName}</span>
                        <span className="truncate text-slate-500">{apt.location.address}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};