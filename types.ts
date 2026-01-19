export type AgeGroup = 'Bichitos' | 'Escarabajos' | 'Escorpiones';

export type Language = 'es' | 'en' | 'pt';

export interface RegistrationData {
  childName: string;
  guardianName: string;
  address: string;
  workPhone: string;
  cellPhone: string; // Label will be "Móvil"
  email: string;
  birthDate: string;
  age?: number; // Calculated based on event date
  group?: AgeGroup; // Assigned based on age
  bloodGroup: string; // New field
  lastGradeCompleted: string;
  medicalInfo: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  pickupPersonName: string;
  pickupPersonPhone: string;
  attendsSundaySchool: 'Si' | 'No' | '';
  sundaySchoolLocation: string;
  invitedBy: string;
  photoPermission: 'Si' | 'No' | '';
  promoPermission: 'Si' | 'No' | '';
  lopdConsent: boolean; // New field for LOPD
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export enum AppView {
  HOME = 'HOME',
  REGISTER = 'REGISTER',
  SUCCESS = 'SUCCESS',
  ADMIN = 'ADMIN'
}