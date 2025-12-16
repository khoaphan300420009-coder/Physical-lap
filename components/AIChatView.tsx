
import React, { useState, useRef, useEffect } from 'react';
import { generatePhysicsResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Sparkles, Bot, User, ImagePlus, X, Camera, Zap, BrainCircuit } from 'lucide-react';
import { useToast } from './Toast';

const AIChatView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'ai', text: 'Chào bạn! Tôi là trợ lý ảo của Phan Hoang Dang Khoa. Tôi có thể giải thích các định luật vật lý hoặc giải bài tập thông qua Vision AI. Hãy gửi câu hỏi hoặc hình ảnh cho tôi.' }
    ]);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    const handleSend = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMsg = input;
        const userImg = selectedImage;
        
        setInput('');
        setSelectedImage(null);
        
        setMessages(prev => [...prev, { role: 'user', text: userMsg, image: userImg || undefined }]);
        setIsLoading(true);

        try {
            const aiText = await generatePhysicsResponse(userMsg, userImg || undefined);
            setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.message || 'Xin lỗi, tôi gặp sự cố khi kết nối tới máy chủ AI.';
            setMessages(prev => [...prev, { role: 'ai', text: errorMsg, isError: true }]);
            addToast(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (e.g., limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                addToast("Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.", 'warning');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                addToast("Đã tải ảnh lên thành công", 'success', 2000);
            };
            reader.onerror = () => {
                addToast("Lỗi khi đọc file ảnh", 'error');
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
            (window as any).MathJax.typesetPromise();
        }
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col bg-[#020408] h-full relative overflow-hidden font-sans">
             {/* Background Image Layer */}
             <div className="absolute inset-0 z-0">
                <img 
                    src="https://i.pinimg.com/736x/ee/ac/f9/eeacf9987606133d7aabb444451f5c85.jpg" 
                    alt="AI Background" 
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#020408]/90 via-[#020408]/60 to-[#020408]/90"></div>
             </div>

            {/* Header */}
            <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0f]/60 backdrop-blur-xl z-20 sticky top-0">
                <div className="flex items-center gap-4 font-display font-bold text-white tracking-wide">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <BrainCircuit className="text-white relative z-10" size={22}/> 
                    </div>
                    <div>
                        <h2 className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">AI Assistant</h2>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/80 font-bold font-sans block">Powered by Gemini 2.5</span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 backdrop-blur-md">
                    <Zap size={12} className="text-yellow-400 fill-yellow-400"/> Vision AI Active
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scroll z-10 scroll-smooth">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.4s_cubic-bezier(0.2,0.8,0.2,1)]`}>
                        <div className={`flex max-w-[90%] md:max-w-[75%] gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10 relative overflow-hidden ${m.role === 'ai' ? 'bg-[#1a1a24]' : 'bg-indigo-600'}`}>
                                {m.role === 'ai' ? (
                                    <>
                                        <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
                                        <Bot size={20} className="text-cyan-400 relative z-10"/>
                                    </>
                                ) : (
                                    <User size={20} className="text-white"/>
                                )}
                            </div>
                            
                            {/* Message Body */}
                            <div className="flex flex-col gap-2">
                                {m.image && (
                                    <div className="rounded-2xl overflow-hidden border border-white/10 max-w-sm shadow-2xl relative group cursor-pointer transition-transform hover:scale-[1.02]">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <img src={m.image} alt="Upload" className="w-full h-auto" />
                                    </div>
                                )}
                                <div className={`p-6 rounded-[1.5rem] leading-relaxed text-sm md:text-base shadow-xl backdrop-blur-lg border relative overflow-hidden ${
                                    m.role === 'user' 
                                    ? 'bg-gradient-to-br from-indigo-600/90 to-cyan-700/90 text-white border-white/20 rounded-tr-sm' 
                                    : `bg-[#13131f]/90 text-slate-200 rounded-tl-sm ${m.isError ? 'border-red-500/30 bg-red-900/40' : 'border-white/10 hover:border-cyan-500/30 transition-colors'}`
                                }`}>
                                    {/* Subtle gradient overlay for AI bubbles */}
                                    {m.role === 'ai' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-transparent opacity-30"></div>}
                                    
                                    <div className="prose prose-invert max-w-none prose-p:leading-7 prose-headings:text-cyan-300 prose-strong:text-white prose-a:text-cyan-400">
                                        <p className="whitespace-pre-line">{m.text}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-500 px-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded py-0.5 backdrop-blur-sm self-start">
                                    {m.role === 'ai' ? 'Nova AI' : 'You'} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex items-center gap-4 ml-16 animate-[fadeIn_0.2s]">
                        <div className="flex gap-1.5 p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                        </div>
                        <span className="text-xs text-cyan-500/80 font-mono animate-pulse bg-black/30 px-2 py-1 rounded">PROCESSING DATA...</span>
                    </div>
                )}
                <div ref={endRef} className="h-4"></div>
            </div>

            {/* Input Area (Floating) */}
            <div className="p-4 md:p-6 relative z-30">
                <div className="max-w-4xl mx-auto">
                    {selectedImage && (
                        <div className="absolute bottom-full left-0 mb-4 ml-6 animate-[slideUp_0.3s_ease-out]">
                            <div className="flex items-center gap-4 bg-[#1a1a24]/90 p-2 pl-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                                <img src={selectedImage} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-white/10" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">Image attached</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Vision Analysis Ready</span>
                                </div>
                                <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-red-400 transition-colors"><X size={16}/></button>
                            </div>
                        </div>
                    )}

                    <div className="relative group">
                        {/* Glowing Border Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        
                        <div className="relative flex gap-3 bg-[#0a0a0f]/80 rounded-[22px] p-2 pr-3 border border-white/10 shadow-2xl items-end backdrop-blur-xl">
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                className="hidden"
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-2xl transition-all h-[52px] w-[52px] flex items-center justify-center shrink-0"
                                title="Upload Image"
                            >
                                <ImagePlus size={22}/>
                            </button>
                            
                            <div className="flex-1 py-3.5">
                                <input 
                                    type="text" 
                                    value={input} 
                                    onChange={e => setInput(e.target.value)} 
                                    onKeyDown={e => e.key === 'Enter' && handleSend()} 
                                    placeholder="Đặt câu hỏi hoặc tải ảnh bài tập..." 
                                    className="w-full bg-transparent border-none p-0 text-white focus:ring-0 placeholder:text-slate-500 font-light text-base"
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                            
                            <button 
                                onClick={handleSend} 
                                disabled={isLoading || (!input.trim() && !selectedImage)}
                                className={`h-[52px] w-[52px] rounded-2xl flex items-center justify-center transition-all shadow-lg shrink-0 relative overflow-hidden ${
                                    isLoading || (!input.trim() && !selectedImage) 
                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed' 
                                    : 'bg-gradient-to-br from-cyan-500 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-cyan-500/20'
                                }`}
                            >
                                <Send size={20} className={isLoading ? "opacity-0" : "opacity-100"} strokeWidth={2.5}/>
                                {isLoading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></div>}
                            </button>
                        </div>
                    </div>
                    <div className="text-center mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold bg-black/20 inline-block px-3 py-1 rounded-full mx-auto backdrop-blur-sm">
                        Phan Hoang Dang Khoa • Physical Lab AI Model
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatView;
