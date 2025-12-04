import { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'appointments_data';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      if (value) {
        setAppointments(JSON.parse(value));
      } else {
        // Load initial dummy data if empty
        const dummy: Appointment[] = [
          {
            id: '1',
            clientName: 'Jan Kowalski',
            location: { lat: 50.0647, lng: 19.9450, address: 'Kraków Rynek' },
            start: new Date().toISOString(), // Today
            end: new Date(new Date().getTime() + 60*60000).toISOString(),
            notes: 'Demo'
          }
        ];
        setAppointments(dummy);
      }
    } catch (e) {
      console.error('Failed to load appointments', e);
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async (apt: Appointment) => {
    const updated = [...appointments, apt];
    setAppointments(updated);
    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(updated),
    });
  };

  return { appointments, addAppointment, loading, refresh: loadAppointments };
}