
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<ToastMessage & { onClose: () => void }> = ({ type, message, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for animation
    };

    const icons = {
        success: <CheckCircle size={20} className="text-emerald-400" />,
        error: <AlertCircle size={20} className="text-red-400" />,
        warning: <AlertTriangle size={20} className="text-yellow-400" />,
        info: <Info size={20} className="text-cyan-400" />
    };

    const borders = {
        success: 'border-emerald-500/50',
        error: 'border-red-500/50',
        warning: 'border-yellow-500/50',
        info: 'border-cyan-500/50'
    };

    const bg = {
        success: 'bg-emerald-900/90',
        error: 'bg-red-900/90',
        warning: 'bg-yellow-900/90',
        info: 'bg-[#1e293b]/90'
    };

    return (
        <div 
            className={`pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-md p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${bg[type]} ${borders[type]} ${isExiting ? 'opacity-0 translate-x-full' : 'animate-[slideInRight_0.3s_ease-out]'}`}
        >
            <div className="shrink-0 mt-0.5">{icons[type]}</div>
            <p className="text-sm font-medium text-white leading-relaxed flex-1">{message}</p>
            <button onClick={handleClose} className="text-white/50 hover:text-white transition-colors shrink-0">
                <X size={16} />
            </button>
        </div>
    );
};
