import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import type { AnalysisHistory } from '../types';

interface AnalysisChartProps {
  data: AnalysisHistory[];
  title: string;
}

export function AnalysisChart({ data, title }: AnalysisChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis yAxisId="left" domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <ReferenceLine y={75} yAxisId="left" stroke="#ff0000" strokeDasharray="3 3" />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="confidence"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Confidence %"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="severity"
              stroke="#ef4444"
              strokeWidth={2}
              name="Severity Level"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}