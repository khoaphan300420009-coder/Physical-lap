
import React, { useState, useEffect } from 'react';
import { Key, Save, ExternalLink, X } from 'lucide-react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
    const [key, setKey] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('GEMINI_API_KEY');
        if (stored) setKey(stored);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (key.trim()) {
            onSave(key.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-6 animate-[scaleIn_0.3s]">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                    <X size={20} />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                        <Key size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Cấu hình API Key</h2>
                        <p className="text-xs text-slate-400">Kết nối với Google Gemini AI</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Google Gemini API Key</label>
                        <input 
                            type="password" 
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all font-mono text-sm"
                        />
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex gap-3 items-start">
                        <div className="mt-1 text-blue-400"><ExternalLink size={14}/></div>
                        <div className="text-xs text-blue-200 leading-relaxed">
                            Bạn cần có API Key miễn phí từ Google để sử dụng tính năng AI.
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="block mt-1 text-cyan-400 hover:underline font-bold">
                                Lấy Key tại Google AI Studio &rarr;
                            </a>
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Lưu Cấu Hình
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
