import { AgeGroup, ChildInput, GuardianInfo, RegistrationData, RegistrationResult, FlatRegistration } from '../types';


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

export const getSpotsLeft = async (): Promise<Record<AgeGroup, number>> => {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/obtenerinscripciones`);
    const result = await response.json();

    if (!result.success || !result.data) return { 'Bichitos': 15, 'Escarabajos': 15, 'Escorpiones': 15 };

    const takenSpots: Record<AgeGroup, number> = {
      'Bichitos': 0,
      'Escarabajos': 0,
      'Escorpiones': 0
    };

    result.data.forEach((reg: RegistrationData) => {
      reg.children.forEach((child: ChildInput) => {
        const age = calculateAge(child.birthDate);
        const group = determineGroup(age);
        if (group) {
          takenSpots[group]++;
        }
      });
    });

    return {
      'Bichitos': Math.max(0, CAPACITY_PER_GROUP - takenSpots['Bichitos']),
      'Escarabajos': Math.max(0, CAPACITY_PER_GROUP - takenSpots['Escarabajos']),
      'Escorpiones': Math.max(0, CAPACITY_PER_GROUP - takenSpots['Escorpiones'])
    };
  } catch {
    return { 'Bichitos': 15, 'Escarabajos': 15, 'Escorpiones': 15 };
  }
};

export const registerFamily = async (guardian: GuardianInfo, children: ChildInput[]): Promise<RegistrationResult> => {
  try {
    // Normalizamos antes de enviar
    const normalizedChildren = children.map(child => ({
      ...child,
      childName: normalizeIdentity(child.childName)
    }));

    const normalizedGuardian = {
      ...guardian,
      guardianName: normalizeIdentity(guardian.guardianName)
    };

    const response = await fetch(`${FUNCTIONS_BASE_URL}/guardarinscripcion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guardian: normalizedGuardian,
        children: normalizedChildren
      }),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, message: result.message || 'Registro exitoso en Firestore' };
    } else {
      return { success: false, message: result.error || 'Error en el servidor' };
    }
  } catch (error) {
    console.error("Error calling Firebase Function:", error);
    return { success: false, message: 'Error de conexión al servidor' };
  }
};

export const isDuplicate = async (name: string, dob: string, guardianName: string): Promise<boolean> => {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/obtenerinscripciones`);
    const result = await response.json();

    if (!result.success || !result.data) return false;

    const inputIdentity = normalizeIdentity(name);

    return result.data.some((reg: RegistrationData) => 
      reg.children.some((child: ChildInput) => 
        normalizeIdentity(child.childName) === inputIdentity && child.birthDate === dob
      )
    );
  } catch {
    return false;
  }
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

// Firebase Functions URL (ajusta región/project si necesario)
const FUNCTIONS_BASE_URL = 'https://us-central1-ebvmasvida2026.cloudfunctions.net';