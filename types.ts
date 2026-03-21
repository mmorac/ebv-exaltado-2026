export type Language = 'es' | 'en' | 'pt';

export type AgeGroup = 'Bichitos' | 'Escarabajos' | 'Escorpiones';

export interface GuardianInfo {
  guardianName: string;
  // Address fields
  postalCode: string;
  city: string;
  province: string;
  addressType: string;
  address: string;
  // Contact
  workPhone: string;
  cellPhone: string;
  email: string;
  // Emergency
  emergencyContactName: string;
  emergencyContactPhone: string;
  pickupPersonName: string;
  pickupPersonPhone: string;
  // Permissions
  invitedBy: string;
  photoPermission: string;
  promoPermission: string;
  lopdConsent: boolean;
}

export interface ChildInput {
  childName: string;
  birthDate: string;
  bloodGroup: string;
  lastGradeCompleted: string;
  medicalInfo: string;
  foodAllergies: string; // Added field for dietary restrictions
  attendsSundaySchool: string;
  sundaySchoolLocation: string;
}

export interface RegistrationResult {
  success: boolean;
  message: string;
}

// Flat structure for the Data Table
export interface FlatRegistration extends ChildInput, GuardianInfo {
  id: string;
  registrationDate: string;
  age: number;
  group: AgeGroup | 'Sin Grupo';
}

export interface RegistrationData {
  guardian: GuardianInfo;
  children: ChildInput[];
}