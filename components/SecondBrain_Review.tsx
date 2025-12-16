
import React, { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle2, CheckCircle, Repeat, ThumbsDown, ThumbsUp, Star } from 'lucide-react';
import { Flashcard } from '../types';

interface ReviewProps {
    flashcards: Flashcard[];
    onRate: (id: string, ease: number) => void;
}

const SecondBrainReview: React.FC<ReviewProps> = ({ flashcards, onRate }) => {
    const queue = flashcards.filter(f => f.nextReview < Date.now());
    const [isRevealed, setIsRevealed] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [selectedBool, setSelectedBool] = useState<boolean | null>(null);
    
    // Ref to contain the review area for MathJax
    const containerRef = useRef<HTMLDivElement>(null);

    // Trigger MathJax whenever the card content or revelation state changes
    useEffect(() => {
        if (containerRef.current && (window as any).MathJax) {
            // Use requestAnimationFrame to ensure DOM is updated before typesetting
            requestAnimationFrame(() => {
                (window as any).MathJax.typesetPromise([containerRef.current]).catch((err: any) => {
                    console.warn('MathJax typeset failed: ', err);
                    (window as any).MathJax.typesetClear();
                });
            });
        }
    }, [queue.length, isRevealed, selectedOption]);

    if (flashcards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-[fadeIn_0.5s] space-y-4">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10"><FileText size={40} className="text-slate-500"/></div>
                <h2 className="text-2xl font-black text-white">Chưa có thẻ ghi nhớ</h2>
                <p className="text-slate-400">Hãy tạo học phần mới để bắt đầu ôn tập.</p>
            </div>
        );
    }

    if (queue.length === 0) return (
        <div className="flex flex-col items-center justify-center h-full text-center animate-[fadeIn_0.5s] space-y-6">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <CheckCircle size={48} className="text-emerald-400"/>
            </div>
            <div>
                <h2 className="text-4xl font-black text-white mb-2">Tuyệt vời!</h2>
                <p className="text-slate-400">Bạn đã hoàn thành tất cả thẻ ôn tập hôm nay.</p>
            </div>
        </div>
    );
    
    const card = queue[0];
    
    const handleNext = (quality: number) => { 
        onRate(card.id, quality); 
        setIsRevealed(false); 
        setSelectedOption(null);
        setSelectedBool(null);
    };

    const handleAnswerQuiz = (index: number) => {
        if (isRevealed) return;
        setSelectedOption(index);
        setIsRevealed(true);
    };

    const handleAnswerBool = (val: boolean) => {
        if (isRevealed) return;
        setSelectedBool(val);
        setIsRevealed(true);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-[#020408]" ref={containerRef}>
            <div className="w-full max-w-2xl flex justify-between text-sm text-slate-500 font-mono mb-8 uppercase tracking-widest">
                <span>Còn lại: {queue.length}</span>
                <span className={`font-bold ${card.type === 'Quiz' ? 'text-purple-400' : card.type === 'TrueFalse' ? 'text-orange-400' : 'text-cyan-400'}`}>{card.type} CARD</span>
                <span>Streak: {card.streak}</span>
            </div>
            <div className="relative w-full max-w-3xl min-h-[400px] bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden transition-all">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 block">Câu hỏi</span>
                <h3 className="text-3xl font-display font-bold text-white leading-relaxed mb-8">{card.question}</h3>
                
                {!isRevealed && card.type === 'Basic' && (
                    <button onClick={() => setIsRevealed(true)} className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all border border-white/5">Hiện đáp án</button>
                )}
                
                {card.type === 'Quiz' && card.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {card.options.map((opt, idx) => {
                            let style = "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300";
                            if (isRevealed) {
                                if (idx === card.correctIndex) style = "bg-emerald-600/20 border-emerald-500 text-emerald-300";
                                else if (idx === selectedOption) style = "bg-red-600/20 border-red-500 text-red-300";
                                else style = "bg-white/5 border-white/5 text-slate-600 opacity-50";
                            }
                            return (
                                <button key={idx} onClick={() => handleAnswerQuiz(idx)} disabled={isRevealed} className={`p-6 rounded-2xl border text-left font-medium transition-all ${style}`}>
                                    <span className="opacity-50 mr-2">{String.fromCharCode(65+idx)}.</span> {opt}
                                </button>
                            );
                        })}
                    </div>
                )}
                
                {card.type === 'TrueFalse' && (
                    <div className="flex gap-6 w-full max-w-lg mt-4">
                        <button onClick={() => handleAnswerBool(true)} disabled={isRevealed} className={`flex-1 py-8 rounded-3xl font-black text-2xl border transition-all ${isRevealed ? (card.correctValue ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : (selectedBool ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-slate-600')) : 'bg-white/5 hover:bg-emerald-900/20 border-white/10 text-emerald-400'}`}>ĐÚNG</button>
                        <button onClick={() => handleAnswerBool(false)} disabled={isRevealed} className={`flex-1 py-8 rounded-3xl font-black text-2xl border transition-all ${isRevealed ? (!card.correctValue ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : (!selectedBool ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-slate-600')) : 'bg-white/5 hover:bg-red-900/20 border-white/10 text-red-400'}`}>SAI</button>
                    </div>
                )}
                
                {isRevealed && (
                    <div className="mt-10 pt-8 border-t border-white/10 w-full animate-[fadeInUp_0.3s]">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 block flex items-center justify-center gap-2"><CheckCircle2 size={16}/> Giải thích</span>
                        <p className="text-lg text-indigo-100 font-light leading-relaxed">{card.answer}</p>
                    </div>
                )}
            </div>
            
            <div className={`mt-8 grid grid-cols-4 gap-4 w-full max-w-2xl transition-all duration-300 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <button onClick={() => handleNext(1)} className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"><Repeat size={20}/><span className="text-xs font-bold uppercase">Học lại</span></button>
                <button onClick={() => handleNext(2)} className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 transition-colors"><ThumbsDown size={20}/><span className="text-xs font-bold uppercase">Khó</span></button>
                <button onClick={() => handleNext(3)} className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-colors"><ThumbsUp size={20}/><span className="text-xs font-bold uppercase">Được</span></button>
                <button onClick={() => handleNext(4)} className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-colors"><Star size={20}/><span className="text-xs font-bold uppercase">Dễ</span></button>
            </div>
        </div>
    );
};

export default SecondBrainReview;
