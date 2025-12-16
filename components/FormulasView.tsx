
import React, { useState, useEffect, useRef } from 'react';
import { FORMULAS_DB } from '../constants';
import { Formula } from '../types';
import { Search, BookOpen, Atom, ArrowLeft, Grid, List } from 'lucide-react';

const CATEGORY_IMAGES: Record<string, string> = {
    'Cơ học': 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=2070&auto=format&fit=crop',
    'Nhiệt học': 'https://images.unsplash.com/photo-1525114758654-21915908b88d?q=80&w=2070&auto=format&fit=crop',
    'Điện từ': 'https://images.unsplash.com/photo-1620204738596-4db0928925d4?q=80&w=2070&auto=format&fit=crop',
    'Quang học': 'https://images.unsplash.com/photo-1505506874110-6a7a69069a08?q=80&w=2167&auto=format&fit=crop',
    'Lượng tử': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
    'Tương đối': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2013&auto=format&fit=crop'
};

const GRADE_IMAGES: Record<number, string> = {
    10: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // Mechanics/Gravity
    11: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2041&auto=format&fit=crop', // Electric/Optics
    12: 'https://images.unsplash.com/photo-1614726365723-49cfa0b86561?q=80&w=2070&auto=format&fit=crop'  // Quantum/Atom
};

const FormulasView: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grades' | 'list' | 'detail'>('grades');
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (viewMode === 'detail' && selectedFormula && contentRef.current && (window as any).MathJax) {
             requestAnimationFrame(() => {
                 (window as any).MathJax.typesetPromise([contentRef.current]).catch(() => {
                     (window as any).MathJax.typesetClear();
                 });
             });
        }
    }, [viewMode, selectedFormula]);

    const handleGradeClick = (grade: number) => {
        setSelectedGrade(grade);
        setViewMode('list');
    };

    const handleFormulaClick = (f: Formula) => {
        setSelectedFormula(f);
        setViewMode('detail');
    };

    const handleBack = () => {
        if (viewMode === 'detail') setViewMode('list');
        else if (viewMode === 'list') {
            setSelectedGrade(null);
            setViewMode('grades');
        }
    };

    const filteredFormulas = FORMULAS_DB.filter(f => 
        (selectedGrade ? f.grade === selectedGrade : true) &&
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col font-sans h-full overflow-hidden relative text-white">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://i.pinimg.com/736x/a6/85/ce/a685ce59b2100250286ca0900e6e2500.jpg" 
                    alt="Library Background" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#020408]/85 backdrop-blur-sm"></div>
            </div>

            {/* Header */}
            <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0f]/60 backdrop-blur-xl shrink-0 z-20">
                <div className="flex items-center gap-4">
                    {viewMode !== 'grades' && (
                        <button onClick={handleBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-all">
                            <ArrowLeft size={20}/>
                        </button>
                    )}
                    <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                        <BookOpen size={24} className="text-indigo-400"/> 
                        {viewMode === 'grades' ? 'Thư Viện Công Thức THPT' : (selectedGrade ? `Vật Lý Lớp ${selectedGrade}` : 'Tìm kiếm')}
                    </h2>
                </div>
                <div className="relative w-64">
                    <Search size={16} className="absolute left-3 top-3 text-slate-500"/>
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => { setSearchTerm(e.target.value); if(viewMode==='grades' && e.target.value) { setViewMode('list'); } }} 
                        placeholder="Tìm công thức..." 
                        className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 backdrop-blur-md"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll p-8 relative z-10">
                {viewMode === 'grades' && !searchTerm && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto animate-[fadeIn_0.3s] pt-10">
                        {[10, 11, 12].map(grade => (
                            <div key={grade} onClick={() => handleGradeClick(grade)} className="group relative h-96 rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/10 hover:border-indigo-500/50 transition-all shadow-2xl hover:shadow-indigo-500/30">
                                <img src={GRADE_IMAGES[grade]} alt={`Lớp ${grade}`} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000 group-hover:opacity-80"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                <div className="absolute bottom-10 left-10">
                                    <div className="text-7xl font-black text-white/10 absolute -top-16 -left-4 font-display">
                                        {grade}
                                    </div>
                                    <h3 className="text-4xl font-black text-white group-hover:text-indigo-300 transition-colors font-display relative z-10">
                                        Lớp {grade}
                                    </h3>
                                    <p className="text-base text-slate-300 mt-2 relative z-10 font-light max-w-[200px]">
                                        {grade === 10 && "Cơ học Newton, Nhiệt học"}
                                        {grade === 11 && "Điện từ trường, Quang hình học"}
                                        {grade === 12 && "Sóng, Lượng tử, Hạt nhân"}
                                    </p>
                                    <div className="mt-6 flex items-center gap-2 text-indigo-400 font-bold uppercase text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                        Khám phá <ArrowLeft className="rotate-180" size={14}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {viewMode === 'list' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto animate-[fadeIn_0.3s]">
                        {filteredFormulas.map(f => (
                            <div key={f.id} onClick={() => handleFormulaClick(f)} className="group bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-all hover:-translate-y-1 shadow-lg">
                                <div className="h-32 overflow-hidden relative">
                                    <img src={f.image || CATEGORY_IMAGES[f.cat]} alt={f.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
                                </div>
                                <div className="p-6 relative">
                                    <span className="absolute top-[-12px] right-6 text-[10px] uppercase font-bold bg-cyan-900/80 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 backdrop-blur">{f.cat}</span>
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{f.name}</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2">{f.intro}</p>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                        <span className="font-serif text-slate-300 italic text-sm opacity-70">Click để xem chi tiết</span>
                                        <ArrowLeft className="rotate-180 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" size={16}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {viewMode === 'detail' && selectedFormula && (
                    <div ref={contentRef} className="max-w-4xl mx-auto animate-[fadeInUp_0.4s]">
                        <div className="relative rounded-[2.5rem] overflow-hidden mb-10 border border-white/10 group shadow-2xl bg-black/40 backdrop-blur-xl">
                            <div className="absolute inset-0 z-0">
                                <img src={selectedFormula.image} alt={selectedFormula.name} className="w-full h-full object-cover opacity-40 blur-sm"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020408] to-transparent"></div>
                            </div>
                            <div className="relative z-10 p-10 md:p-16 flex flex-col items-center text-center">
                                <span className="mb-6 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-sm font-bold uppercase tracking-wider shadow-lg">{selectedFormula.cat} • Lớp {selectedFormula.grade}</span>
                                <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-8 tracking-tight drop-shadow-lg">{selectedFormula.name}</h1>
                                <div className="px-12 py-8 rounded-2xl bg-black/60 border border-white/10 shadow-xl backdrop-blur-md">
                                    <div className="text-2xl md:text-4xl text-cyan-300 font-serif">$$ {selectedFormula.eq} $$</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="prose prose-invert prose-lg max-w-none">
                            <p className="text-xl text-slate-300 leading-relaxed font-light border-l-4 border-cyan-500 pl-6 italic mb-10 bg-black/40 backdrop-blur-md p-6 rounded-r-xl border-y border-r border-white/5">"{selectedFormula.intro}"</p>
                            <div className="bg-[#0f172a]/80 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl">
                                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3 border-b border-white/10 pb-4">
                                    <Atom size={20} className="text-purple-400"/> Phân tích chuyên sâu
                                </h3>
                                <p className="text-slate-300 text-justify leading-9 font-light whitespace-pre-line text-lg">
                                    {selectedFormula.detail}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormulasView;
