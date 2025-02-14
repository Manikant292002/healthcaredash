import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { Patient } from '../types';

interface PatientFormProps {
  onAddPatient: (patient: Patient) => void;
}

export function PatientForm({ onAddPatient }: PatientFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    location: '',
    diagnosis: '',
    bedNumber: '',
    equipmentUsed: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      ...formData,
      age: parseInt(formData.age),
      admissionDate: new Date().toISOString(),
      status: 'Admitted',
      equipmentUsed: formData.equipmentUsed
    };
    onAddPatient(newPatient);
    setIsOpen(false);
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      location: '',
      diagnosis: '',
      bedNumber: '',
      equipmentUsed: []
    });
  };

  const handleEquipmentChange = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipmentUsed: prev.equipmentUsed.includes(equipment)
        ? prev.equipmentUsed.filter(e => e !== equipment)
        : [...prev.equipmentUsed, equipment]
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        <UserPlus className="h-5 w-5" />
        Add New Patient
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-4">Add New Patient</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              required
              value={formData.age}
              onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              value={formData.gender}
              onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' | 'Other' }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
            <input
              type="text"
              required
              value={formData.diagnosis}
              onChange={e => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bed Number</label>
            <input
              type="text"
              required
              value={formData.bedNumber}
              onChange={e => setFormData(prev => ({ ...prev, bedNumber: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Used</label>
          <div className="flex flex-wrap gap-3">
            {['MRI', 'CT Scan', 'X-Ray', 'Ultrasound'].map(equipment => (
              <label key={equipment} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.equipmentUsed.includes(equipment)}
                  onChange={() => handleEquipmentChange(equipment)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">{equipment}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600"
          >
            Add Patient
          </button>
        </div>
      </form>
    </div>
  );
}