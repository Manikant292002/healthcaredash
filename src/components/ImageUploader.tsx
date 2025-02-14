import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const MEDICAL_KEYWORDS = [
  'xray', 'x-ray', 'mri', 'ct', 'scan', 'ultrasound', 'radiograph', 'medical',
  'chest', 'brain', 'lung', 'cardiac', 'bone', 'spine', 'skull', 'abdomen',
  'dicom', 'mammogram', 'ecg', 'ekg', 'pet', 'radiography', 'diagnostic'
];

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const isMedicalImage = (filename: string) => {
    const lowercaseName = filename.toLowerCase();
    return MEDICAL_KEYWORDS.some(keyword => lowercaseName.includes(keyword));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (isMedicalImage(file.name)) {
        onImageUpload(file);
      } else {
        // Show error popup
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 animate-slide-up';
        errorDiv.innerHTML = `
          <div class="flex items-center gap-2">
            <strong class="font-bold">Error:</strong>
            <span>Not a valid medical image. Please upload a medical scan or diagnostic image.</span>
          </div>
        `;
        document.body.appendChild(errorDiv);

        // Remove error after 5 seconds
        setTimeout(() => {
          errorDiv.classList.add('animate-fade-out');
          setTimeout(() => {
            document.body.removeChild(errorDiv);
          }, 300);
        }, 5000);
      }
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.dicom']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive
          ? "Drop the medical image here"
          : "Drag & drop a medical image, or click to select"}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Supported formats: JPG, PNG, DICOM
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Note: File name should include medical terms (e.g., x-ray, scan, mri)
      </p>
    </div>
  );
}