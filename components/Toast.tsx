
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, X, Terminal, AlertOctagon, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
    const config = {
        error: {
            borderColor: 'border-red-500',
            shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
            text: 'text-red-500',
            bg: 'bg-red-950/90',
            icon: <AlertOctagon className="w-5 h-5" />,
            title: 'SYSTEM_FAILURE'
        },
        success: {
            borderColor: 'border-[#00f2ff]',
            shadow: 'shadow-[0_0_15px_rgba(0,242,255,0.4)]',
            text: 'text-[#00f2ff]',
            bg: 'bg-cyan-950/90',
            icon: <CheckCircle className="w-5 h-5" />,
            title: 'SYSTEM_NORMAL'
        },
        info: {
            borderColor: 'border-purple-500',
            shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
            text: 'text-purple-400',
            bg: 'bg-purple-950/90',
            icon: <Terminal className="w-5 h-5" />,
            title: 'SYSTEM_INFO'
        },
        warning: {
            borderColor: 'border-yellow-500',
            shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
            text: 'text-yellow-500',
            bg: 'bg-yellow-950/90',
            icon: <AlertTriangle className="w-5 h-5" />,
            title: 'SYSTEM_WARNING'
        }
    };

    const style = config[toast.type] || config.info;

    return (
        <motion.div
            layout
            initial={{ x: 100, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
                relative w-80 mb-3 p-4 overflow-hidden group rounded-r-lg
                ${style.bg} backdrop-blur-md 
                border-l-4 ${style.borderColor} border-y border-r border-white/5
                ${style.shadow}
            `}
        >
            {/* Visual: Scanline Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]" />
            
            {/* Visual: Glitch Overlay (Only for Error) */}
            {toast.type === 'error' && (
                <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay animate-pulse pointer-events-none" />
            )}

            <div className="relative z-10 flex items-start gap-3">
                {/* Animated Icon */}
                <div className={`mt-0.5 ${style.text} ${toast.type === 'error' ? 'animate-pulse' : ''}`}>
                    {style.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-[10px] font-bold font-mono tracking-widest ${style.text} opacity-90`}>
                            [{style.title}]
                        </h4>
                        <span className="text-[10px] text-gray-500 font-mono">
                            {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit' })}
                        </span>
                    </div>
                    
                    {/* Message */}
                    <p className="text-sm font-mono text-gray-300 leading-snug break-words">
                        <span className="text-gray-600 mr-2">{'>'}</span>
                        {toast.message}
                    </p>
                </div>

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="text-gray-600 hover:text-white transition-colors shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            
            {/* Toast Container (Bottom Right) */}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end pointer-events-none">
                {/* Enable pointer events only for the toasts themselves, not the container area */}
                <div className="pointer-events-auto">
                    <AnimatePresence mode='popLayout'>
                        {toasts.map((toast) => (
                            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </ToastContext.Provider>
    );
};
