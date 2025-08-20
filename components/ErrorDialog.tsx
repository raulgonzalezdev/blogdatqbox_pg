"use client";
import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  showConfirmButton?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function ErrorDialog({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Error", 
  message, 
  type = 'error',
  showConfirmButton = false,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}: ErrorDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const getIconColor = () => {
    switch (type) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'success': return 'text-green-500';
      default: return 'text-red-500';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default: return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      case 'success': return 'text-green-600 dark:text-green-400';
      default: return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full border ${getBgColor()} transition-all duration-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${getIconColor()}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-medium ${getTextColor()}`}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            {showConfirmButton ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm?.();
                    onClose();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === 'error' 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : type === 'warning'
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : type === 'info'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  type === 'error' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : type === 'warning'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : type === 'info'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Entendido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
