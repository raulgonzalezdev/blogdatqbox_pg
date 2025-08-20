import { useState } from 'react';

interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success' | 'error';
}

interface DialogState {
  isOpen: boolean;
  options: DialogOptions;
  onConfirm: (() => void) | null;
  isConfirm: boolean;
}

export const useDialog = () => {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    options: {
      title: 'Diálogo',
      message: '',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'info'
    },
    onConfirm: null,
    isConfirm: false
  });

  const confirm = (options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options: {
          title: 'Confirmar',
          confirmText: 'Confirmar',
          cancelText: 'Cancelar',
          type: 'warning',
          ...options
        },
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, isOpen: false, onConfirm: null }));
          resolve(true);
        },
        isConfirm: true
      });
    });
  };

  const alert = (options: DialogOptions) => {
    setDialogState({
      isOpen: true,
      options: {
        title: 'Alerta',
        type: 'info',
        ...options
      },
      onConfirm: null,
      isConfirm: false
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  };

  const handleConfirm = () => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
  };

  return {
    confirm,
    alert,
    closeDialog,
    handleConfirm,
    isOpen: dialogState.isOpen,
    options: dialogState.options,
    isConfirm: dialogState.isConfirm
  };
};
