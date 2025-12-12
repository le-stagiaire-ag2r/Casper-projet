import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ToastItem = styled.div<{ $type: 'success' | 'error' | 'info'; $isExiting: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  min-width: 300px;
  max-width: 400px;
  backdrop-filter: blur(20px);
  animation: ${props => props.$isExiting ? slideOut : slideIn} 0.3s ease forwards;
  cursor: pointer;

  background: ${props => {
    switch (props.$type) {
      case 'success': return 'rgba(48, 209, 88, 0.95)';
      case 'error': return 'rgba(255, 69, 58, 0.95)';
      default: return 'rgba(88, 86, 214, 0.95)';
    }
  }};

  box-shadow: 0 8px 32px ${props => {
    switch (props.$type) {
      case 'success': return 'rgba(48, 209, 88, 0.3)';
      case 'error': return 'rgba(255, 69, 58, 0.3)';
      default: return 'rgba(88, 86, 214, 0.3)';
    }
  }};

  &:hover {
    transform: scale(1.02);
  }
`;

const ToastIcon = styled.span`
  font-size: 24px;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
`;

const ToastMessage = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

const SingleToast: React.FC<{
  toast: ToastData;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    const removeTimer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '';
      case 'error': return '';
      default: return '';
    }
  };

  return (
    <ToastItem $type={toast.type} $isExiting={isExiting} onClick={handleClose}>
      <ToastIcon>{getIcon()}</ToastIcon>
      <ToastContent>
        <ToastTitle>{toast.title}</ToastTitle>
        {toast.message && <ToastMessage>{toast.message}</ToastMessage>}
      </ToastContent>
      <CloseButton onClick={handleClose}>×</CloseButton>
    </ToastItem>
  );
};

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <ToastContainer>
      {toasts.map(toast => (
        <SingleToast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </ToastContainer>
  );
};

// Hook for using toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    ToastComponent: () => <Toast toasts={toasts} onRemove={removeToast} />,
  };
};

export default Toast;
