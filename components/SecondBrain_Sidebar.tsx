
import React, { useState } from 'react';
import { LayoutDashboard, Network, PenTool, Zap, BrainCircuit, BarChart2 } from 'lucide-react';

interface SidebarProps {
    view: 'dashboard' | 'graph' | 'write' | 'review' | 'evaluation';
    setView: (v: 'dashboard' | 'graph' | 'write' | 'review' | 'evaluation') => void;
}

const SecondBrainSidebar: React.FC<SidebarProps> = ({ view, setView }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Map color props to full class names so Tailwind scanner picks them up
    const colorStyles: Record<string, { bg: string, border: string, text: string, line: string, blur: string }> = {
        cyan: { 
            bg: 'bg-gradient-to-r from-cyan-500/20 to-cyan-600/10', 
            border: 'border-cyan-500/30', 
            text: 'text-cyan-400',
            line: 'bg-cyan-500',
            blur: 'bg-cyan-400/5'
        },
        purple: { 
            bg: 'bg-gradient-to-r from-purple-500/20 to-purple-600/10', 
            border: 'border-purple-500/30', 
            text: 'text-purple-400',
            line: 'bg-purple-500',
            blur: 'bg-purple-400/5'
        },
        emerald: { 
            bg: 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10', 
            border: 'border-emerald-500/30', 
            text: 'text-emerald-400',
            line: 'bg-emerald-500',
            blur: 'bg-emerald-400/5'
        },
        pink: { 
            bg: 'bg-gradient-to-r from-pink-500/20 to-pink-600/10', 
            border: 'border-pink-500/30', 
            text: 'text-pink-400',
            line: 'bg-pink-500',
            blur: 'bg-pink-400/5'
        },
        orange: { 
            bg: 'bg-gradient-to-r from-orange-500/20 to-orange-600/10', 
            border: 'border-orange-500/30', 
            text: 'text-orange-400',
            line: 'bg-orange-500',
            blur: 'bg-orange-400/5'
        }
    };

    const NavBtn = ({ id, icon: Icon, label, color }: { id: typeof view, icon: any, label: string, color: keyof typeof colorStyles }) => {
        const isActive = view === id;
        const styles = colorStyles[color];

        return (
            <button 
                onClick={() => setView(id)}
                className={`
                    relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 group overflow-hidden w-full
                    ${isActive 
                        ? `${styles.bg} ${styles.text} ${styles.border} border shadow-[0_0_20px_rgba(0,0,0,0.4)]` 
                        : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }
                `}
            >
                <div className={`shrink-0 z-10 transition-transform duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'group-hover:scale-110'}`}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2}/>
                </div>
                
                <span className={`
                    whitespace-nowrap font-bold text-sm tracking-wide transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-left z-10
                    ${isHovered ? 'opacity-100 translate-x-0 w-auto blur-0' : 'opacity-0 -translate-x-8 w-0 blur-sm overflow-hidden'}
                `}>
                    {label}
                </span>

                {isActive && (
                    <div className={`absolute inset-0 ${styles.blur} blur-md`}></div>
                )}
                <div className={`absolute right-0 top-0 h-full w-1 ${styles.line} transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>
        );
    };

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                h-full bg-[#0a0f18]/90 backdrop-blur-2xl border-r border-white/10 
                flex flex-col py-8 px-4 gap-4 z-30 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.25,1)]
                ${isHovered ? 'w-72' : 'w-24'}
            `}
        >
            <div className={`mb-8 flex items-center justify-center transition-all duration-700 ${isHovered ? 'px-2 justify-start gap-4' : ''}`}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-1 ring-white/20">
                    <BrainCircuit size={24} className="text-white"/>
                </div>
                <div className={`flex flex-col overflow-hidden transition-all duration-700 ${isHovered ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-4'}`}>
                    <span className="font-display font-black text-white text-xl leading-none whitespace-nowrap tracking-tight">Second Brain</span>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] whitespace-nowrap mt-1">Operating System</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
                <NavBtn id="dashboard" icon={LayoutDashboard} label="Tổng Quan" color="cyan" />
                <NavBtn id="graph" icon={Network} label="Mạng Lưới 3D" color="purple" />
                <NavBtn id="evaluation" icon={BarChart2} label="Đánh Giá Năng Lực" color="emerald" />
                <NavBtn id="write" icon={PenTool} label="Soạn Thảo & AI" color="pink" />
                <NavBtn id="review" icon={Zap} label="Ôn Tập" color="orange" />
            </div>

            <div className={`mt-auto transition-all duration-700 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Status</p>
                    </div>
                    <div className="text-xs text-white font-medium">All systems operational</div>
                </div>
            </div>
        </div>
    );
};

export default SecondBrainSidebar;
