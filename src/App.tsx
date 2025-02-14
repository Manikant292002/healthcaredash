import React, { useState, useEffect } from 'react';
import { Users, BedDouble, Activity, Stethoscope, Search, Upload, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ImageUploader } from './components/ImageUploader';
import { MetricsCard } from './components/MetricsCard';
import { DetectionResult } from './components/DetectionResult';
import { RealTimeChart } from './components/RealTimeChart';
import { UtilizationChart } from './components/UtilizationChart';
import { AnalysisChart } from './components/AnalysisChart';
import { AnalysisDetails } from './components/AnalysisDetails';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { AlertSystem } from './components/AlertSystem';
import { PrescriptionGenerator } from './components/PrescriptionGenerator';
import type { DiseaseDetectionResult, HospitalMetrics, PatientTrend, EquipmentData, AnalysisHistory, Patient, Alert, Prescription } from './types';

const DISEASE_CONFIGS = {
  PNEUMONIA: {
    name: 'Pneumonia',
    color: 'rgba(59, 130, 246, 0.5)', // Blue
    features: [
      'Consolidation patterns',
      'Air bronchograms',
      'Interstitial infiltrates'
    ],
    recommendations: [
      'Schedule follow-up X-ray in 2 weeks',
      'Monitor oxygen saturation levels',
      'Consider bronchodilator therapy'
    ]
  },
  PLEURAL_EFFUSION: {
    name: 'Pleural Effusion',
    color: 'rgba(245, 158, 11, 0.5)', // Amber
    features: [
      'Fluid density',
      'Costophrenic angle blunting',
      'Meniscus sign'
    ],
    recommendations: [
      'Monitor fluid levels',
      'Consider thoracentesis if severe',
      'Regular respiratory assessment'
    ]
  },
  LUNG_CANCER: {
    name: 'Lung Cancer',
    color: 'rgba(239, 68, 68, 0.5)', // Red
    features: [
      'Mass/nodule presence',
      'Spiculated margins',
      'Pleural involvement'
    ],
    recommendations: [
      'Immediate oncology consultation',
      'Schedule PET scan',
      'Biopsy planning',
      'Comprehensive treatment plan needed'
    ]
  },
  BRAIN_TUMOR: {
    name: 'Brain Tumor',
    color: 'rgba(168, 85, 247, 0.5)', // Purple
    features: [
      'Mass effect',
      'Enhancement pattern',
      'Edema presence'
    ],
    recommendations: [
      'Urgent neurosurgery consultation',
      'Schedule contrast-enhanced MRI',
      'Monitor intracranial pressure',
      'Anti-seizure medication consideration'
    ]
  }
};

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DiseaseDetectionResult | null>(null);
  const [patientTrends, setPatientTrends] = useState<PatientTrend[]>([]);
  const [equipmentData, setEquipmentData] = useState<EquipmentData[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    location: ''
  });

  const getRandomPosition = () => {
    return {
      x: 0.1 + (Math.random() * 0.3), // 10-40% from left
      y: 0.1 + (Math.random() * 0.3), // 10-40% from top
      width: 0.2 + (Math.random() * 0.2), // 20-40% width
      height: 0.2 + (Math.random() * 0.2) // 20-40% height
    };
  };

  const detectDiseaseFromImage = (fileName: string): DiseaseDetectionResult => {
    const lowerFileName = fileName.toLowerCase();
    let diseaseConfig;
    
    // Strict matching for diseases
    if (lowerFileName.includes('brain') && lowerFileName.includes('tumor')) {
      diseaseConfig = DISEASE_CONFIGS.BRAIN_TUMOR;
    } else if (lowerFileName.includes('pneumonia')) {
      diseaseConfig = DISEASE_CONFIGS.PNEUMONIA;
    } else if (lowerFileName.includes('pleural') && lowerFileName.includes('effusion')) {
      diseaseConfig = DISEASE_CONFIGS.PLEURAL_EFFUSION;
    } else if (lowerFileName.includes('lung') && lowerFileName.includes('cancer')) {
      diseaseConfig = DISEASE_CONFIGS.LUNG_CANCER;
    } else {
      // Show error for unrecognized medical images
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 animate-slide-up';
      errorDiv.innerHTML = `
        <div class="flex items-center gap-2">
          <strong class="font-bold">Error:</strong>
          <span>Unrecognized medical condition in filename. Please use specific condition names.</span>
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        errorDiv.classList.add('animate-fade-out');
        setTimeout(() => {
          document.body.removeChild(errorDiv);
        }, 300);
      }, 5000);
      
      return null;
    }

    // Get random position for detection box
    const position = getRandomPosition();

    // Generate random values within the specified range (65-75)
    const confidence = Math.floor(Math.random() * 11) + 65;
    const severity = Math.floor(Math.random() * 4) + 6;
    const affectedArea = Math.floor(Math.random() * 11) + 65;

    return {
      disease: diseaseConfig.name,
      confidence,
      status: severity > 7 ? 'Critical' : 'At Risk',
      details: {
        severity,
        affectedArea,
        recommendations: diseaseConfig.recommendations,
        explanation: {
          features: diseaseConfig.features,
          importance: diseaseConfig.features.map(() => (Math.random() * 0.11) + 0.65) // 65-75% importance
        }
      },
      timestamp: new Date().toLocaleTimeString(),
      color: diseaseConfig.color,
      position
    };
  };

  const handlePositionChange = (newPosition: { x: number; y: number; width: number; height: number; confidence: number }) => {
    if (detectionResult) {
      const updatedResult = {
        ...detectionResult,
        confidence: newPosition.confidence,
        position: {
          x: newPosition.x,
          y: newPosition.y,
          width: newPosition.width,
          height: newPosition.height
        }
      };
      setDetectionResult(updatedResult);

      // Update analysis history with new position data
      setAnalysisHistory(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          disease: updatedResult.disease,
          confidence: updatedResult.confidence,
          severity: updatedResult.details.severity
        }
      ]);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateMetrics = (): HospitalMetrics => {
    const admittedPatients = patients.filter(p => p.status === 'Admitted');
    const totalBeds = 100;
    
    return {
      totalPatients: patients.length,
      bedOccupancy: Math.round((admittedPatients.length / totalBeds) * 100),
      admissionRate: Math.round(admittedPatients.length / (patients.length || 1) * 100),
      equipmentUtilization: Math.round(
        admittedPatients.reduce((acc, p) => acc + p.equipmentUsed.length, 0) / 
        (admittedPatients.length * 4 || 1) * 100
      )
    };
  };

  const calculateEquipmentUsage = (): EquipmentData[] => {
    const equipment = ['MRI', 'CT Scan', 'X-Ray', 'Ultrasound'];
    const admittedPatients = patients.filter(p => p.status === 'Admitted');
    
    return equipment.map(name => ({
      name,
      value: admittedPatients.filter(p => p.equipmentUsed.includes(name)).length,
      total: admittedPatients.length
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setPatientTrends(prev => {
        const admitted = patients.filter(p => 
          new Date(p.admissionDate).toDateString() === now.toDateString()
        ).length;
        const discharged = patients.filter(p => 
          p.status === 'Discharged'
        ).length;
        
        const newPoint = {
          date: now.toLocaleTimeString(),
          admissions: admitted,
          discharges: discharged
        };
        return [...prev.slice(-11), newPoint];
      });

      setEquipmentData(calculateEquipmentUsage());
    }, 3000);

    return () => clearInterval(interval);
  }, [patients]);

  const handleImageUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);

    setTimeout(() => {
      const result = detectDiseaseFromImage(file.name);
      setDetectionResult(result);
      
      if (result.status === 'Critical') {
        setAlerts(prev => [...prev, {
          id: crypto.randomUUID(),
          type: 'critical',
          message: `Critical finding: ${result.disease} detected`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        }]);
      }

      setAnalysisHistory(prev => [...prev, {
        timestamp: result.timestamp,
        disease: result.disease,
        confidence: result.confidence,
        severity: result.details.severity
      }]);
    }, 1500);
  };

  const handleAddPatient = (patient: Patient) => {
    setPatients(prev => [...prev, patient]);
  };

  const handleDischargePatient = (id: string) => {
    setPatients(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'Discharged' } : p
    ));
  };

  const handleDeletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const handleSavePrescription = (prescription: Prescription) => {
    console.log('Saving prescription:', prescription);
    
    setAlerts(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'info',
      message: 'Prescription has been signed and saved',
      timestamp: new Date().toISOString(),
      acknowledged: false
    }]);
  };

  const handleIdPhotoUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setIdPhoto(imageUrl);
  };

  const generateHealthSummary = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Patient Health Summary', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Name: ${patientInfo.name}`, 20, 40);
    doc.text(`Location: ${patientInfo.location}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

    if (idPhoto) {
      doc.addImage(idPhoto, 'JPEG', 20, 70, 50, 50);
    }

    if (detectionResult) {
      doc.text('Disease Detection Results:', 20, 130);
      doc.text(`Detected Condition: ${detectionResult.disease}`, 30, 140);
      doc.text(`Confidence: ${detectionResult.confidence}%`, 30, 150);
      doc.text(`Severity: ${detectionResult.details.severity}/10`, 30, 160);
      doc.text(`Affected Area: ${detectionResult.details.affectedArea}%`, 30, 170);

      doc.text('Recommendations:', 20, 190);
      detectionResult.details.recommendations.forEach((rec, index) => {
        doc.text(`• ${rec}`, 30, 200 + (index * 10));
      });
    }

    doc.save(`health_summary_${patientInfo.name.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <PatientForm onAddPatient={handleAddPatient} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Patients"
            value={metrics.totalPatients}
            icon={Users}
            trend={5}
          />
          <MetricsCard
            title="Bed Occupancy"
            value={`${metrics.bedOccupancy}%`}
            icon={BedDouble}
            trend={-2}
          />
          <MetricsCard
            title="Admission Rate"
            value={`${metrics.admissionRate}%`}
            icon={Activity}
            trend={3}
          />
          <MetricsCard
            title="Equipment Usage"
            value={`${metrics.equipmentUtilization}%`}
            icon={Stethoscope}
            trend={1}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Patient Management</h2>
          <PatientList
            patients={filteredPatients}
            onDischargePatient={handleDischargePatient}
            onDeletePatient={handleDeletePatient}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RealTimeChart
            data={patientTrends}
            title="Patient Flow (Real-time)"
          />
          <UtilizationChart
            data={equipmentData}
            title="Equipment Utilization"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Medical Image</h2>
            <ImageUploader onImageUpload={handleImageUpload} />
            {selectedImage && detectionResult && (
              <>
                <DetectionResult
                  result={detectionResult}
                  imageUrl={selectedImage}
                  onPositionChange={handlePositionChange}
                />
                <div className="mt-6 border-t pt-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Patient Information</h3>
                      <button
                        onClick={generateHealthSummary}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Download className="h-5 w-5" />
                        Download Health Summary
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={patientInfo.name}
                            onChange={(e) => setPatientInfo(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter patient name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={patientInfo.location}
                            onChange={(e) => setPatientInfo(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter location"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                          ID Photo
                        </label>
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                              <div className="space-y-1 text-center">
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleIdPhotoUpload(e.target.files[0]);
                                    }
                                  }}
                                  id="id-photo-upload"
                                />
                                <label
                                  htmlFor="id-photo-upload"
                                  className="cursor-pointer"
                                >
                                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="text-sm text-gray-600">
                                    Click to upload ID photo
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG up to 5MB
                                  </p>
                                </label>
                              </div>
                            </div>
                          </div>
                          {idPhoto && (
                            <div className="w-32">
                              <img
                                src={idPhoto}
                                alt="ID Photo"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {detectionResult && (
                      <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium mb-3">Health Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Condition:</span>
                            <span className="ml-2 font-medium">{detectionResult.disease}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Severity:</span>
                            <span className="ml-2 font-medium">{detectionResult.details.severity}/10</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <span className="ml-2 font-medium">{detectionResult.confidence}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Affected Area:</span>
                            <span className="ml-2 font-medium">{detectionResult.details.affectedArea}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {detectionResult && (
            <div className="space-y-8">
              {patients.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={`https://source.unsplash.com/100x100/?portrait&${patients[0].id}`}
                      alt={patients[0].name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{patients[0].name}</h3>
                      <p className="text-gray-600 text-sm">{patients[0].location}</p>
                      <p className="text-gray-500 text-xs">Patient ID: {patients[0].id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <PrescriptionGenerator
                    patient={patients[0]}
                    detectedDisease={detectionResult.disease}
                    onSavePrescription={handleSavePrescription}
                  />
                </div>
              )}
              <AnalysisDetails result={detectionResult} />
              {analysisHistory.length > 0 && (
                <AnalysisChart
                  data={analysisHistory}
                  title="Analysis History"
                />
              )}
            </div>
          )}
        </div>
      </div>
      <AlertSystem alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
    </div>
  );
}

export default App;