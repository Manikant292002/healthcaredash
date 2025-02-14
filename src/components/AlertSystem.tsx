import React from 'react';
import { AlertTriangle, Bell, CheckCircle, Info, X } from 'lucide-react';
import type { Alert } from '../types';

interface AlertSystemProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

export function AlertSystem({ alerts, onAcknowledge }: AlertSystemProps) {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertStyle = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md w-full">
      {alerts.filter(alert => !alert.acknowledged).map(alert => (
        <div
          key={alert.id}
          className={`${getAlertStyle(alert.type)} p-4 rounded-lg border shadow-sm flex items-start gap-3 animate-slide-in`}
        >
          {getAlertIcon(alert.type)}
          <div className="flex-1">
            <p className="text-sm font-medium">{alert.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}