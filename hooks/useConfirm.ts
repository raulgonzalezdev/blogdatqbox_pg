import { useState } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: (() => void) | null;
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    options: {
      title: 'Confirmar',
      message: '',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'warning'
    },
    onConfirm: null
  });

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options: {
          title: 'Confirmar',
          confirmText: 'Confirmar',
          cancelText: 'Cancelar',
          type: 'warning',
          ...options
        },
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false, onConfirm: null }));
          resolve(true);
        }
      });
    });
  };

  const closeConfirm = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  };

  const handleConfirm = () => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm();
    }
  };

  return {
    confirm,
    closeConfirm,
    handleConfirm,
    isOpen: confirmState.isOpen,
    options: confirmState.options
  };
};
