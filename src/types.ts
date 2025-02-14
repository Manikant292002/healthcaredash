export interface Disease {
  name: string;
  confidence: number;
  severity: number;
  affectedAreas: AffectedArea[];
}

export interface AffectedArea {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface DiseaseDetectionResult {
  disease: string;
  confidence: number;
  status: 'Healthy' | 'At Risk' | 'Critical';
  details: {
    severity: number;
    affectedArea: number;
    recommendations: string[];
    explanation: {
      features: string[];
      importance: number[];
    };
  };
  timestamp: string;
  color: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface PrescriptionTemplate {
  id: string;
  condition: string;
  medications: Medication[];
  advice: string[];
  followUpDays: number;
  createdBy: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: Disease[];
  medications: Medication[];
  advice: string[];
  followUpDate: string;
  digitalSignature?: string;
  status: 'draft' | 'signed' | 'sent';
  additionalNotes?: string;
}