// ConfirmationModal Component - src/components/ui/confirmation-modal.tsx

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'warning'
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#fcc238' }}
            >
              <AlertTriangle 
                className="w-5 h-5 text-white" 
                strokeWidth={2.5}
              />
            </div>
            <h2 
              className="text-xl font-semibold"
              style={{ color: '#686363' }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            style={{ color: '#969696' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p 
            className="text-base leading-relaxed"
            style={{ color: '#969696' }}
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-gray-200 border border-gray-300"
            style={{ color: '#686363' }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            style={{ backgroundColor: variant === 'danger' ? '#fcc238' : '#63bae9' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;