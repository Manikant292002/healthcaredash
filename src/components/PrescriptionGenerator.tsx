import * as React from 'react';
import { useState, useEffect } from 'react';
import { FileText, Send, Download, Edit3, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { Disease, Patient, Prescription, PrescriptionTemplate, Medication } from '../types';

const MEDICATION_DATABASE: Record<string, Medication[]> = {
  'Pneumonia': [
    {
      name: 'Azithromycin',
      dosage: '500mg',
      frequency: 'Once daily',
      duration: '3 days'
    },
    {
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Three times daily',
      duration: '7 days'
    }
  ],
  'Pleural Effusion': [
    {
      name: 'Furosemide',
      dosage: '40mg',
      frequency: 'Once daily',
      duration: '5 days'
    },
    {
      name: 'Spironolactone',
      dosage: '25mg',
      frequency: 'Once daily',
      duration: '7 days'
    }
  ],
  'Lung Cancer': [
    {
      name: 'Cisplatin',
      dosage: '75mg/m²',
      frequency: 'Once every 3 weeks',
      duration: '4-6 cycles'
    },
    {
      name: 'Pemetrexed',
      dosage: '500mg/m²',
      frequency: 'Once every 3 weeks',
      duration: '4-6 cycles'
    }
  ],
  'Brain Tumor': [
    {
      name: 'Dexamethasone',
      dosage: '4mg',
      frequency: 'Four times daily',
      duration: 'As directed'
    },
    {
      name: 'Levetiracetam',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: 'As directed'
    }
  ]
};

const ADVICE_TEMPLATES: PrescriptionTemplate[] = [
  {
    id: '1',
    condition: 'Pneumonia',
    medications: MEDICATION_DATABASE['Pneumonia'],
    advice: [
      'Complete rest for 5-7 days',
      'Stay hydrated',
      'Monitor temperature',
      'Deep breathing exercises'
    ],
    followUpDays: 14,
    createdBy: 'Dr. Smith'
  },
  {
    id: '2',
    condition: 'Pleural Effusion',
    medications: MEDICATION_DATABASE['Pleural Effusion'],
    advice: [
      'Limited physical activity',
      'Monitor breathing difficulty',
      'Regular vital checks',
      'Report increased shortness of breath'
    ],
    followUpDays: 7,
    createdBy: 'Dr. Smith'
  },
  {
    id: '3',
    condition: 'Lung Cancer',
    medications: MEDICATION_DATABASE['Lung Cancer'],
    advice: [
      'Regular oncology follow-up',
      'Monitor side effects',
      'Maintain nutrition',
      'Report any new symptoms',
      'Join support group'
    ],
    followUpDays: 21,
    createdBy: 'Dr. Smith'
  },
  {
    id: '4',
    condition: 'Brain Tumor',
    medications: MEDICATION_DATABASE['Brain Tumor'],
    advice: [
      'Regular neurological checks',
      'Avoid strenuous activity',
      'Monitor headaches and vision',
      'Keep seizure diary if applicable',
      'Emergency contact if symptoms worsen'
    ],
    followUpDays: 7,
    createdBy: 'Dr. Smith'
  }
];

interface PrescriptionGeneratorProps {
  patient: Patient;
  detectedDisease: string;
  onSavePrescription: (prescription: Prescription) => void;
}

export function PrescriptionGenerator({ patient, detectedDisease, onSavePrescription }: PrescriptionGeneratorProps) {
  const [prescription, setPrescription] = useState<Partial<Prescription>>({
    id: crypto.randomUUID(),
    patientId: patient.id,
    doctorId: 'DR001',
    date: new Date().toISOString(),
    medications: [],
    advice: [],
    status: 'draft'
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  // Auto-select template based on detected disease
  React.useEffect(() => {
    const template = ADVICE_TEMPLATES.find(t => t.condition === detectedDisease);
    if (template) {
      handleTemplateSelect(template.id);
    }
  }, [detectedDisease]);

  const handleTemplateSelect = (templateId: string) => {
    const template = ADVICE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setPrescription(prev => ({
        ...prev,
        medications: template.medications,
        advice: template.advice,
        followUpDate: new Date(Date.now() + template.followUpDays * 24 * 60 * 60 * 1000).toISOString()
      }));
    }
    setSelectedTemplate(templateId);
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications?.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleAdviceChange = (index: number, value: string) => {
    setPrescription(prev => ({
      ...prev,
      advice: prev.advice?.map((adv, i) => i === index ? value : adv)
    }));
  };

  const handleSignPrescription = () => {
    const signedPrescription: Prescription = {
      ...prescription as Prescription,
      status: 'signed',
      digitalSignature: 'Dr. Smith',
    };
    onSavePrescription(signedPrescription);
    setIsSigned(true);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const lineHeight = 10;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Medical Prescription', 105, yPos, { align: 'center' });
    yPos += lineHeight * 2;

    // Doctor Info
    doc.setFontSize(12);
    doc.text('Dr. Smith', 20, yPos);
    doc.text('Medical License: ML12345', 20, yPos + lineHeight);
    yPos += lineHeight * 3;

    // Patient Info
    doc.setFontSize(14);
    doc.text('Patient Information', 20, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    doc.text(`Name: ${patient.name}`, 20, yPos);
    doc.text(`Age/Gender: ${patient.age} / ${patient.gender}`, 120, yPos);
    yPos += lineHeight;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += lineHeight * 2;

    // Diagnosis
    doc.setFontSize(14);
    doc.text('Diagnosis:', 20, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    doc.text(`- ${detectedDisease}`, 25, yPos);
    yPos += lineHeight * 2;

    // Medications
    doc.setFontSize(14);
    doc.text('Medications:', 20, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    prescription.medications?.forEach(med => {
      doc.text(`• ${med.name}`, 25, yPos);
      yPos += lineHeight;
      doc.text(`  ${med.dosage} - ${med.frequency} for ${med.duration}`, 30, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Advice
    doc.setFontSize(14);
    doc.text('Doctor\'s Advice:', 20, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    prescription.advice?.forEach(advice => {
      doc.text(`• ${advice}`, 25, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Follow-up
    if (prescription.followUpDate) {
      doc.text(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString()}`, 20, yPos);
      yPos += lineHeight * 2;
    }

    // Signature
    doc.setFontSize(12);
    doc.text('Digital Signature:', 20, yPos);
    doc.text('Dr. Smith', 50, yPos);

    // Save the PDF
    doc.save(`prescription_${patient.name.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          Generate Prescription
        </h3>
        <div className="flex gap-2">
          {!isSigned && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-600 hover:text-blue-500"
            >
              <Edit3 className="h-5 w-5" />
            </button>
          )}
          {!isSigned ? (
            <button
              onClick={handleSignPrescription}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              <Check className="h-5 w-5" />
              Sign & Save
            </button>
          ) : (
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              <Download className="h-5 w-5" />
              Download PDF
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Patient Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Patient Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{patient.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Age/Gender:</span>
              <span className="ml-2 font-medium">{patient.age} / {patient.gender}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Detected Condition:</span>
              <span className="ml-2 font-medium">{detectedDisease}</span>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Choose a template...</option>
            {ADVICE_TEMPLATES.map(template => (
              <option key={template.id} value={template.id}>
                {template.condition} - {template.createdBy}
              </option>
            ))}
          </select>
        </div>

        {/* Medications */}
        <div>
          <h4 className="font-medium mb-2">Medications</h4>
          <div className="space-y-3">
            {prescription.medications?.map((medication, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Medication name"
                    />
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Dosage"
                    />
                    <input
                      type="text"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Frequency"
                    />
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Duration"
                    />
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="font-medium">{medication.name}</div>
                    <div className="text-gray-600">
                      {medication.dosage} - {medication.frequency} for {medication.duration}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Doctor's Advice */}
        <div>
          <h4 className="font-medium mb-2">Doctor's Advice</h4>
          <div className="space-y-2">
            {prescription.advice?.map((advice, index) => (
              <div key={index} className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={advice}
                    onChange={(e) => handleAdviceChange(index, e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-gray-600">• {advice}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up Date */}
        <div>
          <h4 className="font-medium mb-2">Follow-up</h4>
          {prescription.followUpDate && (
            <div className="text-sm text-gray-600">
              Schedule follow-up on: {new Date(prescription.followUpDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}