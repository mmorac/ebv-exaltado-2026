import { AgeGroup, ChildInput, GuardianInfo, RegistrationResult, FlatRegistration } from '../types';
import React from 'react';

// Fecha de inicio de la EBV: 13 de Julio de 2026
const EVENT_DATE = new Date('2026-07-13');
const CAPACITY_PER_GROUP = 15;

// Helper para normalización estricta (SGIC Rule #2)
export const normalizeIdentity = (text: string): string => {
  if (!text) return '';
  return text
    .toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
    .replace(/[^A-Z0-9\s]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, ' ') // Eliminar espacios dobles
    .trim();
};

export const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  // Calculamos la edad que tendrá el niño el día del evento
  let age = EVENT_DATE.getFullYear() - birth.getFullYear();
  const m = EVENT_DATE.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && EVENT_DATE.getDate() < birth.getDate())) {
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

export const getSpotsLeft = (): Record<AgeGroup, number> => {
  // 1. Obtener registros existentes del almacenamiento
  const storedData = localStorage.getItem('registrations');
  const registrations = storedData ? JSON.parse(storedData) : [];

  // 2. Inicializar contadores
  const takenSpots: Record<AgeGroup, number> = {
    'Bichitos': 0,
    'Escarabajos': 0,
    'Escorpiones': 0
  };

  // 3. Iterar sobre cada registro y sus niños para contar
  registrations.forEach((reg: any) => {
    if (reg.children && Array.isArray(reg.children)) {
      reg.children.forEach((child: ChildInput) => {
        const age = calculateAge(child.birthDate);
        const group = determineGroup(age);
        if (group) {
          takenSpots[group]++;
        }
      });
    }
  });

  // 4. Calcular restantes (Máximo 15 - Ocupados)
  return {
    'Bichitos': Math.max(0, CAPACITY_PER_GROUP - takenSpots['Bichitos']),
    'Escarabajos': Math.max(0, CAPACITY_PER_GROUP - takenSpots['Escarabajos']),
    'Escorpiones': Math.max(0, CAPACITY_PER_GROUP - takenSpots['Escorpiones'])
  };
};

export const registerFamily = (guardian: GuardianInfo, children: ChildInput[]): RegistrationResult => {
  try {
    const existing = JSON.parse(localStorage.getItem('registrations') || '[]');
    
    // Normalizamos los datos al guardar para mantener integridad
    const normalizedChildren = children.map(child => ({
      ...child,
      childName: normalizeIdentity(child.childName) // Guardar nombre normalizado
    }));

    const normalizedGuardian = {
      ...guardian,
      guardianName: normalizeIdentity(guardian.guardianName)
    };

    const newReg = { guardian: normalizedGuardian, children: normalizedChildren, date: new Date().toISOString() };
    localStorage.setItem('registrations', JSON.stringify([...existing, newReg]));
    return { success: true, message: 'Registro exitoso' };
  } catch (error) {
    console.error("Error saving registration", error);
    return { success: false, message: 'Error al guardar el registro.' };
  }
};

export const isDuplicate = (name: string, dob: string, guardianName: string): boolean => {
  const existing = JSON.parse(localStorage.getItem('registrations') || '[]');
  
  // SGIC Rule: Normalización antes de comparar
  const inputIdentity = normalizeIdentity(name);

  return existing.some((reg: any) => 
    reg.children.some((child: any) => 
      // Comparamos el nombre normalizado almacenado (o lo normalizamos al vuelo si es viejo) con el input
      normalizeIdentity(child.childName) === inputIdentity && child.birthDate === dob
    )
  );
};

export const GROUP_CONFIG: Record<AgeGroup, { color: string; icon: string }> = {
  'Bichitos': { color: 'text-green-600 bg-green-50 border-green-200', icon: '🐞' },
  'Escarabajos': { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '🪲' },
  'Escorpiones': { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '🦂' }
};

// --- DASHBOARD SERVICES ---

export const getDashboardData = (): FlatRegistration[] => {
  const storedData = localStorage.getItem('registrations');
  if (!storedData) return [];
  
  const rawData = JSON.parse(storedData);
  const flatList: FlatRegistration[] = [];

  rawData.forEach((reg: any, regIndex: number) => {
    reg.children.forEach((child: ChildInput, childIndex: number) => {
      const age = calculateAge(child.birthDate);
      const group = determineGroup(age);
      
      flatList.push({
        ...child,
        ...reg.guardian,
        id: `${regIndex}-${childIndex}`,
        registrationDate: reg.date,
        age: age,
        group: group || 'Sin Grupo' as any
      });
    });
  });

  return flatList;
};

export const exportToCSV = (data: FlatRegistration[], filename: string) => {
  if (!data.length) return;

  // Define headers map (Key in Object -> CSV Header Name)
  const headers = {
    childName: 'Nombre Niño',
    age: 'Edad',
    group: 'Grupo',
    guardianName: 'Tutor',
    cellPhone: 'Teléfono',
    photoPermission: 'Fotos (Interno)',
    promoPermission: 'Fotos (Público)',
    address: 'Dirección',
    city: 'Ciudad',
    medicalInfo: 'Médico',
    foodAllergies: 'Alergias'
  };

  const csvRows = [];
  
  // Create Header Row
  csvRows.push(Object.values(headers).join(','));

  // Create Data Rows
  data.forEach(row => {
    const values = Object.keys(headers).map(key => {
      const val = (row as any)[key] || '';
      // Escape quotes and wrap in quotes to handle commas within data
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};