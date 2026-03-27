import React from 'react';

interface ToastProps {
    message: string;
    action?: () => void;
    actionLabel?: string;
    onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, action, actionLabel, onDismiss }) => {
    return (
        <div className="toast">
            <span className="toast-message">{message}</span>
            <div className="toast-actions">
                {action && actionLabel && (
                    <button
                        type="button"
                        className="toast-action-btn"
                        onClick={() => {
                            action();
                            onDismiss();
                        }}
                    >
                        {actionLabel}
                    </button>
                )}
                <button type="button" className="toast-dismiss" onClick={onDismiss} aria-label="Dismiss">
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Toast;
