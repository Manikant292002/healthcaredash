import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
}

export function MetricsCard({ title, value, icon: Icon, trend }: MetricsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover-lift animate-scale-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
          {trend !== undefined && (
            <div className="mt-2">
              <span className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'} animate-fade-in`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              <div className="h-1 bg-gray-200 rounded-full mt-1 progress-line">
                <div 
                  className={`h-full rounded-full ${trend >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(trend) * 10, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="animate-pulse-glow rounded-full p-3 bg-blue-50">
          <Icon className="h-8 w-8 text-blue-500" />
        </div>
      </div>
    </div>
  );
}