"use client";
import { createContext, useContext, ReactNode } from 'react';
import { useDialog } from '@/hooks/useDialog';
import ConfirmDialog from './ConfirmDialog';
import ErrorDialog from './ErrorDialog';

interface DialogContextType {
  confirm: (options: any) => Promise<boolean>;
  alert: (options: any) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};

interface DialogProviderProps {
  children: ReactNode;
}

export default function DialogProvider({ children }: DialogProviderProps) {
  const {
    confirm,
    alert,
    closeDialog,
    handleConfirm,
    isOpen,
    options,
    isConfirm
  } = useDialog();

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      
      {/* Diálogo de confirmación */}
      {isConfirm && (
        <ConfirmDialog
          isOpen={isOpen}
          onClose={closeDialog}
          onConfirm={handleConfirm}
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          type={options.type as any}
        />
      )}

      {/* Diálogo de alerta/error */}
      {!isConfirm && (
        <ErrorDialog
          isOpen={isOpen}
          onClose={closeDialog}
          title={options.title}
          message={options.message}
          type={options.type as any}
        />
      )}
    </DialogContext.Provider>
  );
}
