
import React from 'react';
import { TimelineEvent } from '../types';
import { User, ArrowRight, X, Calendar, BookOpen, Star, ExternalLink } from 'lucide-react';

export const TimelineItem: React.FC<{ 
    event: TimelineEvent; 
    index: number; 
    isVisible: boolean; 
    onSelect: (e: TimelineEvent) => void 
}> = ({ event: e, index, isVisible, onSelect }) => {
    const isEven = index % 2 === 0;
    
    return (
        <div 
            data-id={e.id}
            className={`timeline-item relative flex flex-col md:flex-row items-center gap-8 md:gap-20 transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-24 blur-sm'
            }`}
        >
            {/* Year Node */}
            <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-14 h-14 flex items-center justify-center z-20 mt-8 md:mt-0">
                <div className="w-5 h-5 bg-cyan-400 rounded-full shadow-[0_0_25px_rgba(34,211,238,1)] ring-8 ring-black/80 z-10 border-2 border-white"></div>
                <div className="absolute w-full h-full border border-cyan-500/30 rounded-full animate-ping opacity-20 duration-[3s]"></div>
                <div className="absolute left-16 md:left-auto md:top-14 bg-black/80 px-4 py-1 rounded-full border border-cyan-500/30 text-cyan-300 font-mono font-bold text-lg whitespace-nowrap backdrop-blur-md shadow-xl">
                    {e.year}
                </div>
            </div>

            {/* Content Card */}
            <div className={`w-full md:w-1/2 pl-20 md:pl-0 flex ${isEven ? 'md:justify-end text-right' : 'md:order-2 md:justify-start text-left'}`}>
                <div 
                    onClick={() => onSelect(e)}
                    className="group relative w-full max-w-xl cursor-pointer perspective-1000"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition duration-500"></div>
                    <div className="relative bg-[#0f1420] border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:translate-y-[-8px] hover:rotate-x-2 transition-all duration-500">
                        
                        {/* Card Image */}
                        <div className="h-64 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1420] via-transparent to-transparent z-10"></div>
                            <img src={e.img} alt={e.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:brightness-110"/>
                            <div className={`absolute top-4 ${isEven ? 'left-4' : 'right-4'} z-20`}>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-cyan-600/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border border-white/20">{e.category}</span>
                            </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-8 pt-4 relative z-20">
                            <h3 className="text-3xl font-black text-white mb-3 group-hover:text-cyan-300 transition-colors leading-tight font-display">{e.title}</h3>
                            <div className={`flex items-center gap-2 text-sm text-white/70 mb-5 font-mono ${isEven ? 'md:justify-end' : ''}`}>
                                <User size={16} className="text-cyan-500"/> <span className="text-cyan-100">{e.physicist}</span>
                            </div>
                            <p className="text-base text-slate-300 leading-relaxed line-clamp-3 mb-6 opacity-90">{e.shortDesc}</p>
                            <div className={`flex items-center text-xs font-bold text-cyan-400 uppercase tracking-widest gap-2 opacity-80 group-hover:opacity-100 group-hover:gap-3 transition-all ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                Xem chi tiết <ArrowRight size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="hidden md:block w-1/2"></div>
        </div>
    );
};

export const DetailModal: React.FC<{
    event: TimelineEvent | null;
    onClose: () => void;
}> = ({ event: selected, onClose }) => {
    if (!selected) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#020408]/95 backdrop-blur-xl animate-[fadeIn_0.3s]" onClick={onClose}></div>
            <div className="relative w-full max-w-6xl h-[95vh] bg-[#0a0f18] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-[scaleIn_0.3s] group/modal ring-1 ring-white/10">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 z-50 p-3 bg-black/60 hover:bg-white/20 rounded-full text-white border border-white/10 transition-all hover:rotate-90 hover:scale-110">
                    <X size={24}/>
                </button>

                <div className="flex-1 overflow-y-auto custom-scroll">
                    {/* Hero Image Header */}
                    <div className="relative h-[45vh] min-h-[400px] w-full shrink-0">
                        <img src={selected.img} alt={selected.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0a0f18] z-10"></div>
                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20">
                            <div className="flex items-center gap-4 mb-6 animate-[fadeInUp_0.3s]">
                                <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.2)]">{selected.category}</span>
                                <div className="flex items-center gap-2 text-white/80 text-base font-mono bg-black/40 px-3 py-1 rounded-full backdrop-blur"><Calendar size={16}/> {selected.year}</div>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white leading-none mb-4 drop-shadow-2xl animate-[fadeInUp_0.4s] font-display">{selected.title}</h2>
                            <p className="text-2xl md:text-3xl text-indigo-200 font-light flex items-center gap-4 animate-[fadeInUp_0.5s]">
                                <span className="w-12 h-[2px] bg-cyan-500"></span> <User size={28} className="text-cyan-400"/> {selected.physicist}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 md:p-16 pt-8">
                        {/* Main Content (30 lines logic) */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] p-8 rounded-3xl border-l-4 border-cyan-500 backdrop-blur-sm shadow-xl">
                                <p className="text-2xl text-white font-light italic leading-relaxed font-serif">"{selected.shortDesc}"</p>
                            </div>
                            
                            <div className="prose prose-invert prose-lg max-w-none">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><BookOpen size={24}/></div>
                                    <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-lg m-0">
                                        Nội dung chi tiết
                                    </h3>
                                </div>
                                {/* Whitespace-pre-line ensures the long text from constants renders with breaks */}
                                <p className="text-slate-300 font-light leading-8 text-justify whitespace-pre-line text-lg">
                                    {selected.fullDesc}
                                </p>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-[#131b2c]/80 rounded-3xl p-8 border border-white/10 shadow-xl sticky top-8 backdrop-blur-md">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-white/10 pb-4">
                                    <Star size={18} className="text-yellow-400 fill-yellow-400"/> Điểm nổi bật
                                </h3>
                                <ul className="space-y-6">
                                    {selected.highlights?.map((point, i) => (
                                        <li key={i} className="flex gap-4 text-indigo-100 text-base group/item">
                                            <div className="w-8 h-8 rounded-full bg-cyan-900/40 flex items-center justify-center shrink-0 border border-cyan-500/30 group-hover/item:bg-cyan-500/20 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,1)]"></div>
                                            </div>
                                            <span className="py-1 leading-relaxed font-medium">{point}</span>
                                        </li>
                                    ))}
                                </ul>

                                {selected.link && (
                                    <div className="mt-10 pt-8 border-t border-white/10">
                                        <a href={selected.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-2xl text-white font-bold text-sm uppercase tracking-wider transition-all hover:scale-[1.02] shadow-lg shadow-cyan-900/20">
                                            Tra cứu Wikipedia <ExternalLink size={16}/>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
