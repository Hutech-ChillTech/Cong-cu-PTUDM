import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, InfoCircleOutlined, CloseOutlined } from '@ant-design/icons';
import type { ToastMessage } from '../../contexts/ToastContext';
import './Toast.css';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined />;
      case 'error':
        return <CloseCircleOutlined />;
      case 'warning':
        return <WarningOutlined />;
      case 'info':
        return <InfoCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  return (
    <div 
      className="toast-container"
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '300px',
            borderLeft: `4px solid ${
              toast.type === 'success' ? '#52c41a' :
              toast.type === 'error' ? '#ff4d4f' :
              toast.type === 'warning' ? '#faad14' : '#1890ff'
            }`,
            pointerEvents: 'auto',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div className="toast-icon" style={{ fontSize: '20px', flexShrink: 0 }}>
            {getIcon(toast.type)}
          </div>
          <div className="toast-message" style={{ flex: 1, fontSize: '14px', color: '#333' }}>
            {toast.message}
          </div>
          <button 
            className="toast-close" 
            onClick={() => onRemove(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#999',
              fontSize: '14px'
            }}
          >
            <CloseOutlined />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
