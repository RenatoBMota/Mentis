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
  anamnesis?: string | null;
  treatmentPlan?: string | null;
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

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type PaymentMethod = 'PIX' | 'BANK_TRANSFER' | 'CARD';

export interface SessionRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  date: string;
  chargeSentAt: string | null;
  paidAt: string | null;
}

export interface SessionRow extends Appointment {
  patient: { id: string; fullName: string };
  sessionRecord: SessionRecord | null;
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

export interface Referral {
  id: string;
  patientId: string;
  type: string;
  recipient: string | null;
  content: string;
  createdAt: string;
}

export interface Assessment {
  id: string;
  patientId: string;
  type: 'PHQ9' | 'GAD7';
  answers: number[];
  totalScore: number;
  severity: string;
  clinicalAlert: boolean;
  createdAt: string;
}

export type DocumentCategory = 'LAUDO' | 'TAREFA_CASA' | 'EXERCICIO' | 'OUTRO';

export interface PatientDocument {
  id: string;
  patientId: string;
  category: DocumentCategory;
  title: string;
  description: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  crp: string | null;
  phone: string | null;
  pixKey: string | null;
  role: 'PROFESSIONAL' | 'RECEPTIONIST' | 'SUPERVISOR';
  planType: 'STARTER' | 'PRO' | 'CLINIC';
}

export interface AppNotification {
  id: string;
  type: 'CHARGE' | 'PAYMENT_REMINDER' | 'APPOINTMENT_REMINDER' | 'SYSTEM';
  payload: { summary?: string; [key: string]: unknown };
  createdAt: string;
  readAt: string | null;
}
