import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { DiseaseDetectionResult } from '../types';

interface AnalysisDetailsProps {
  result: DiseaseDetectionResult;
}

export function AnalysisDetails({ result }: AnalysisDetailsProps) {
  const getSeverityColor = (severity: number) => {
    if (severity < 3) return 'text-green-500';
    if (severity < 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Info className="h-5 w-5 text-blue-500" />
        Detailed Analysis
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Disease Detection</span>
          <span className="font-semibold">{result.disease}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Confidence Score</span>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${result.confidence}%` }}
              />
            </div>
            <span className="font-semibold">{result.confidence}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Severity Level</span>
          <span className={`font-semibold ${getSeverityColor(result.details.severity)}`}>
            {result.details.severity}/10
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Affected Area</span>
          <span className="font-semibold">{result.details.affectedArea}%</span>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            {result.status === 'Healthy' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            Recommendations
          </h4>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {result.details.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}