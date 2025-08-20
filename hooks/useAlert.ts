import { useState } from 'react';

interface AlertOptions {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
}

interface AlertState {
  isOpen: boolean;
  options: AlertOptions;
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    options: {
      title: 'Alerta',
      message: '',
      type: 'info'
    }
  });

  const alert = (options: AlertOptions) => {
    setAlertState({
      isOpen: true,
      options: {
        title: 'Alerta',
        type: 'info',
        ...options
      }
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    alert,
    closeAlert,
    isOpen: alertState.isOpen,
    options: alertState.options
  };
};
