
import React, { useState, useEffect } from 'react';
import { History, FlaskConical, Book, Sparkles, Atom, ChevronRight, Brain, Settings } from 'lucide-react';
import HistoryView from './HistoryView';
import SimulationsView from './SimulationsView';
import FormulasView from './FormulasView';
import AIChatView from './AIChatView';
import SecondBrainView from './SecondBrainView';
import { Note, Flashcard } from '../types';
import { SEED_NOTES, SEED_FLASHCARDS } from './second_brain/initialData';

interface DashboardProps {
    onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [activeTab, setActiveTab] = useState<'history' | 'simulations' | 'formulas' | 'ai' | 'brain'>('history');

    // --- SECOND BRAIN PERSISTENT STATE ---
    // Initialize from localStorage or use Seed Data
    const [notes, setNotes] = useState<Note[]>(() => {
        const saved = localStorage.getItem('sb_notes');
        return saved ? JSON.parse(saved) : SEED_NOTES;
    });

    const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
        const saved = localStorage.getItem('sb_flashcards');
        return saved ? JSON.parse(saved) : SEED_FLASHCARDS;
    });

    // Save to LocalStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('sb_notes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('sb_flashcards', JSON.stringify(flashcards));
    }, [flashcards]);
    // -------------------------------------

    const NavBtn = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => {
        const isActive = activeTab === id;
        return (
            <button 
                onClick={() => setActiveTab(id)} 
                className={`relative w-full flex items-center gap-4 p-4 rounded-3xl transition-all duration-500 group overflow-hidden ${
                    isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-cyan-500/30' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
                title={label}
            >
                <div className={`relative z-10 transition-transform duration-500 ${isActive ? 'scale-110 translate-x-1' : 'group-hover:scale-110'}`}>
                    <Icon size={24} className={isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-slate-400 group-hover:text-white transition-colors"} strokeWidth={1.5} />
                </div>
                
                <span className={`font-display font-medium tracking-wide text-sm whitespace-nowrap transition-all duration-500 absolute left-16 ${
                    isHovered 
                    ? 'opacity-100 translate-x-0 blur-0 delay-75' 
                    : 'opacity-0 -translate-x-8 blur-sm pointer-events-none'
                } ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                    {label}
                </span>
                
                {isActive && (
                    <div className="absolute inset-0 bg-cyan-400/5 blur-xl rounded-3xl"></div>
                )}
                
                {isActive && isHovered && <ChevronRight size={16} className="text-cyan-500 ml-auto mr-2 animate-pulse"/>}
            </button>
        );
    };

    return (
        <div className="flex h-screen w-full bg-[#020408] font-sans overflow-hidden relative">
            
            {/* Background Ambient Glow */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[150px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[150px] pointer-events-none"></div>

            {/* Soft Floating Sidebar (Dock Style) */}
            <div 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`fixed inset-y-6 left-6 z-50 bg-[#0a0f18]/60 backdrop-blur-2xl border border-white/10 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) rounded-[3rem] ${isHovered ? 'w-80' : 'w-28'}`}
            >
                {/* Brand Header */}
                <div 
                    className="h-32 flex items-center justify-center relative overflow-hidden shrink-0 cursor-pointer"
                    onClick={onBack}
                    title="Trở về trang chủ"
                >
                    {/* Logo Icon */}
                    <div className={`w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shrink-0 z-20 shadow-[0_0_30px_rgba(124,58,237,0.4)] ring-1 ring-white/20 transition-all duration-700 ${isHovered ? 'rotate-[360deg] scale-90 -translate-x-24' : 'rotate-0'}`}>
                        <Atom size={32} className="animate-[spin_10s_linear_infinite]"/>
                    </div>
                    
                    {/* Sliding Text - Positioned to not overlap when expanded */}
                    <div className={`absolute left-28 top-0 h-full flex flex-col justify-center transition-all duration-500 ease-out ${isHovered ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 translate-x-10 blur-md pointer-events-none'}`}>
                        <h1 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 whitespace-nowrap tracking-tight">Physical Lab</h1>
                        <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold whitespace-nowrap leading-tight mt-1">
                            Powered by <span className="text-white">Phan Hoang Dang Khoa</span>
                        </span>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-6 px-4 space-y-4 overflow-y-auto custom-scroll overflow-x-hidden">
                    <NavBtn id="history" icon={History} label="Dòng Chảy Lịch Sử" />
                    <NavBtn id="simulations" icon={FlaskConical} label="Phòng Thí Nghiệm" />
                    <NavBtn id="formulas" icon={Book} label="Thư Viện Công Thức" />
                    <NavBtn id="ai" icon={Sparkles} label="Trợ Lý Vision AI" />
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6 opacity-50"></div>
                    
                    <NavBtn id="brain" icon={Brain} label="Tri Thức Người Học" />
                </nav>

                {/* Footer User Profile & Settings */}
                <div className="p-6 mt-auto">
                    <div className={`flex items-center gap-3 p-3 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 border-2 border-white/20 shadow-lg shrink-0"></div>
                        <div className="flex flex-col overflow-hidden flex-1">
                            <span className="text-xs font-bold text-white truncate">Phan Hoang Dang Khoa</span>
                            <span className="text-[10px] text-slate-400 truncate">Admin / Developer</span>
                        </div>
                        <button 
                            onClick={() => window.dispatchEvent(new Event('open-api-key-modal'))}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-slate-300 hover:text-cyan-400 transition-colors"
                            title="Cài đặt API Key"
                        >
                            <Settings size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 relative h-full overflow-hidden bg-[#020408] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isHovered ? 'pl-[22rem] pr-6 py-6' : 'pl-40 pr-6 py-6'}`}>
                <div className="w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 bg-[#05080f]/80 backdrop-blur-sm relative ring-1 ring-white/5">
                    {activeTab === 'history' && <HistoryView />}
                    {activeTab === 'simulations' && <SimulationsView />}
                    {activeTab === 'formulas' && <FormulasView />}
                    {activeTab === 'ai' && <AIChatView />}
                    
                    {/* Pass State Down for Persistence */}
                    {activeTab === 'brain' && (
                        <SecondBrainView 
                            notes={notes} 
                            setNotes={setNotes} 
                            flashcards={flashcards} 
                            setFlashcards={setFlashcards} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
