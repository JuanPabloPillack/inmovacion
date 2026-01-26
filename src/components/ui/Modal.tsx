// src/components/ui/Modal.tsx
import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';

type ModalVariant = 'success' | 'error' | 'warning' | 'info' | 'danger';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;          // Si está presente, muestra 2 botones (Cancelar + Confirmar)
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  autoClose?: number;              // Auto-cierra después de X milisegundos
}

const variantConfig: Record<ModalVariant, {
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  buttonColor: string;
}> = {
  success: {
    icon: <CheckCircle className="w-6 h-6 text-white" />,
    bgColor: '#10b981',
    textColor: '#065f46',
    buttonColor: '#10b981',
  },
  error: {
    icon: <XCircle className="w-6 h-6 text-white" />,
    bgColor: '#ef4444',
    textColor: '#7f1d1d',
    buttonColor: '#ef4444',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-white" />,
    bgColor: '#f59e0b',
    textColor: '#78350f',
    buttonColor: '#f59e0b',
  },
  info: {
    icon: <Info className="w-6 h-6 text-white" />,
    bgColor: '#3b82f6',
    textColor: '#1e40af',
    buttonColor: '#3b82f6',
  },
  danger: {
    icon: <XCircle className="w-6 h-6 text-white" />,
    bgColor: '#dc2626',
    textColor: '#7f1d1d',
    buttonColor: '#dc2626',
  },
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'info',
  confirmText,
  cancelText = 'Cancelar',
  autoClose,
}) => {
  const config = variantConfig[variant];
  const hasConfirm = !!onConfirm;
  
  // Texto del botón por defecto
  const defaultConfirmText = hasConfirm ? 'Confirmar' : 'Aceptar';
  const finalConfirmText = confirmText || defaultConfirmText;

  // Auto-cerrar si está configurado
  useEffect(() => {
    if (!isOpen || !autoClose) return;
    const timer = setTimeout(onClose, autoClose);
    return () => clearTimeout(timer);
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: config.bgColor }}
            >
              {config.icon}
            </div>
            <h2 
              className="text-lg sm:text-xl font-bold" 
              style={{ color: config.textColor }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 sm:p-6">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 p-5 sm:p-6 bg-gray-50 border-t border-gray-100">
          {hasConfirm && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors order-2 sm:order-1"
            >
              {cancelText}
            </button>
          )}

          <button
            onClick={handleConfirm}
            className={`
              flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95
              ${hasConfirm ? 'order-1 sm:order-2' : ''}
            `}
            style={{ backgroundColor: config.buttonColor }}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;