import { RegistrationData, AgeGroup } from '../types';

const STORAGE_KEY_REGISTRATIONS = 'ebv_registrations_2026';
const MAX_SPOTS_PER_GROUP = 15;
// The event starts on July 13, 2026. Ages are calculated based on this date.
const EVENT_START_DATE = '2026-07-13';

// Updated colors:
// Bichitos (Sky) -> text-sky-600 (Was Emerald)
// Escarabajos (Purple) -> text-violet-600
// Escorpiones (Orange/Amber) -> text-amber-600
export const GROUP_CONFIG: Record<AgeGroup, { min: number; max: number; color: string; icon: string }> = {
  'Bichitos': { min: 4, max: 6, color: 'text-sky-600', icon: '🐞' },
  'Escarabajos': { min: 7, max: 9, color: 'text-violet-600', icon: '🪲' },
  'Escorpiones': { min: 10, max: 12, color: 'text-amber-600', icon: '🦂' }
};

export const getRegisteredChildren = (): RegistrationData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading registrations", e);
    return [];
  }
};

export const getSpotsLeft = (): Record<AgeGroup, number> => {
  const registered = getRegisteredChildren();
  const counts: Record<AgeGroup, number> = {
    'Bichitos': 0,
    'Escarabajos': 0,
    'Escorpiones': 0
  };
  
  registered.forEach(child => {
    if (child.group && counts[child.group] !== undefined) {
      counts[child.group]++;
    }
  });

  return {
    'Bichitos': Math.max(0, MAX_SPOTS_PER_GROUP - counts['Bichitos']),
    'Escarabajos': Math.max(0, MAX_SPOTS_PER_GROUP - counts['Escarabajos']),
    'Escorpiones': Math.max(0, MAX_SPOTS_PER_GROUP - counts['Escorpiones'])
  };
};

// Calculates age based on the Event Start Date, not today's date.
export const calculateAge = (birthDate: string): number => {
  const targetDate = new Date(EVENT_START_DATE);
  const birth = new Date(birthDate);
  
  let age = targetDate.getFullYear() - birth.getFullYear();
  const m = targetDate.getMonth() - birth.getMonth();
  
  if (m < 0 || (m === 0 && targetDate.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const determineGroup = (age: number): AgeGroup | null => {
  if (age >= 4 && age <= 6) return 'Bichitos';
  if (age >= 7 && age <= 9) return 'Escarabajos';
  if (age >= 10 && age <= 12) return 'Escorpiones';
  return null;
};

export const registerChild = (data: RegistrationData): { success: boolean; message: string } => {
  const age = calculateAge(data.birthDate);
  const group = determineGroup(age);

  if (!group) {
    return { success: false, message: 'La edad del niño (al 13 de Julio de 2026) no corresponde a ninguno de nuestros grupos (4-12 años).' };
  }

  const spots = getSpotsLeft();
  if (spots[group] <= 0) {
    return { success: false, message: `Lo sentimos, el grupo ${group} ya está lleno.` };
  }

  const finalData = { ...data, age, group };
  const current = getRegisteredChildren();
  current.push(finalData);
  localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(current));
  
  return { success: true, message: 'Registro exitoso' };
};

export const deleteChild = (index: number): void => {
  const current = getRegisteredChildren();
  if (index >= 0 && index < current.length) {
    current.splice(index, 1);
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(current));
  }
};