export type PatientRecurrenceType = 'WEEKLY' | 'BIWEEKLY' | 'ONE_OFF';
export type PatientStatus = 'ACTIVE' | 'IN_EVALUATION' | 'INACTIVE';

export interface Patient {
  id: string;
  fullName: string;
  age: number | null;
  phone: string;
  recurrenceType: PatientRecurrenceType;
  pricePerSession: string;
  status: PatientStatus;
  createdAt: string;
}

export type AppointmentModality = 'IN_PERSON' | 'ONLINE';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELED';

export interface Appointment {
  id: string;
  patientId: string;
  dateTime: string;
  modality: AppointmentModality;
  status: AppointmentStatus;
  price: string;
  patient?: { id: string; fullName: string };
}

export type FinancialTransactionType = 'INCOME' | 'EXPENSE';
export type FinancialScope = 'OFFICE' | 'PERSONAL';
export type FinancialTransactionStatus = 'PENDING' | 'PAID' | 'CANCELED';

export interface FinancialTransaction {
  id: string;
  type: FinancialTransactionType;
  scope: FinancialScope;
  category: string;
  amount: string;
  dueDate: string;
  status: FinancialTransactionStatus;
  recurring: boolean;
}

export interface Tag {
  id: string;
  name: string;
  category: string | null;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  sessionNumber: number;
  evolutionText: string;
  observations: string | null;
  stepsText: string | null;
  version: number;
  createdAt: string;
  tags: Tag[];
}
