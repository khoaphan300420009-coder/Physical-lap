
import React, { useState, useEffect, useRef } from 'react';
import { Flashcard } from '../../types';
import { Check, X, RotateCcw, Brain, ChevronRight, Layers } from 'lucide-react';

interface LearnModeProps {
    flashcards: Flashcard[];
    updateFlashcard: (card: Flashcard) => void;
}

// Leitner System adaptation
const LearnModeView: React.FC<LearnModeProps> = ({ flashcards, updateFlashcard }) => {
    // Queue management
    const [sessionQueue, setSessionQueue] = useState<Flashcard[]>([]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    // Stats for current session
    const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, mastered: 0 });

    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize Session
    useEffect(() => {
        if (!isSessionActive && flashcards.length > 0) {
            // Prioritize: Learning > New > Reviewing (Streak < 3)
            // Filter out Mastered (Streak >= 3) unless user resets
            const candidates = flashcards
                .filter(f => (f.status || 'new') !== 'mastered')
                .sort((a, b) => {
                    const statusOrder = { learning: 0, new: 1, reviewing: 2, mastered: 3 };
                    return (statusOrder[a.status || 'new'] || 1) - (statusOrder[b.status || 'new'] || 1);
                })
                .slice(0, 10); // Batch size 10

            if (candidates.length > 0) {
                setSessionQueue(candidates);
                setIsSessionActive(true);
                setCurrentCardIndex(0);
                setIsFlipped(false);
            }
        }
    }, [flashcards, isSessionActive]);

    // MathJax Typesetting
    useEffect(() => {
        if (containerRef.current && (window as any).MathJax) {
            requestAnimationFrame(() => {
                (window as any).MathJax.typesetPromise([containerRef.current]).catch(() => {});
            });
        }
    }, [currentCardIndex, isFlipped, sessionQueue]);

    const handleEvaluation = (remembered: boolean) => {
        const currentCard = sessionQueue[currentCardIndex];
        let nextQueue = [...sessionQueue];
        
        // Update Card Logic
        const updatedCard = { ...currentCard };
        
        if (remembered) {
            updatedCard.streak = (updatedCard.streak || 0) + 1;
            setSessionStats(p => ({ ...p, correct: p.correct + 1 }));
            
            // Leitner Promotion
            if (updatedCard.streak >= 3) {
                updatedCard.status = 'mastered';
                updatedCard.easeFactor = Math.min(updatedCard.easeFactor + 0.1, 5); // Increase ease
                setSessionStats(p => ({ ...p, mastered: p.mastered + 1 }));
            } else {
                updatedCard.status = 'reviewing';
            }
        } else {
            // --- FIX: SOFT RESET ---
            // Instead of streak = 0, we halve it or reduce by step.
            // This prevents demoralization.
            updatedCard.streak = Math.max(0, Math.ceil((updatedCard.streak || 0) * 0.5)); // Soft penalty
            
            updatedCard.status = 'learning';
            updatedCard.easeFactor = Math.max(updatedCard.easeFactor - 0.2, 1.3); // Decrease ease
            setSessionStats(p => ({ ...p, incorrect: p.incorrect + 1 }));
            
            // Punishment: Push to end of queue to review again THIS session
            nextQueue.push(updatedCard);
        }

        updatedCard.lastReviewed = Date.now();
        // Calculate next interval based on streak (Fibonacci-ish)
        updatedCard.nextReview = Date.now() + (updatedCard.streak === 0 ? 0 : Math.pow(2, updatedCard.streak)) * 24 * 60 * 60 * 1000;

        // Persist
        updateFlashcard(updatedCard);
        
        // Move Next
        if (currentCardIndex < nextQueue.length - 1) {
            setSessionQueue(nextQueue); // Update queue if we pushed a card
            setCurrentCardIndex(p => p + 1);
            setIsFlipped(false);
        } else {
            // End Session
            setIsSessionActive(false);
        }
    };

    if (flashcards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Layers size={48} className="mb-4 opacity-50"/>
                <p>Chưa có thẻ nào. Hãy vào "Soạn Thảo" để tạo.</p>
            </div>
        );
    }

    if (!isSessionActive) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-[fadeIn_0.5s]">
                <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/10 text-center max-w-md w-full shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} className="text-emerald-400"/>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Hoàn thành phiên học!</h2>
                    <p className="text-slate-400 mb-8">Bạn đã làm rất tốt. Hãy nghỉ ngơi một chút.</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/5 p-3 rounded-xl">
                            <div className="text-2xl font-bold text-emerald-400">{sessionStats.correct}</div>
                            <div className="text-[10px] uppercase text-slate-500 font-bold">Đúng</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                            <div className="text-2xl font-bold text-red-400">{sessionStats.incorrect}</div>
                            <div className="text-[10px] uppercase text-slate-500 font-bold">Sai</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                            <div className="text-2xl font-bold text-yellow-400">{sessionStats.mastered}</div>
                            <div className="text-[10px] uppercase text-slate-500 font-bold">Mastered</div>
                        </div>
                    </div>

                    <button onClick={() => window.location.reload()} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                        <RotateCcw size={18}/> Học tiếp
                    </button>
                </div>
            </div>
        );
    }

    const currentCard = sessionQueue[currentCardIndex];
    const progress = ((currentCardIndex) / sessionQueue.length) * 100;

    return (
        <div className="flex flex-col h-full bg-[#020408] p-6" ref={containerRef}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                        <Brain size={20}/>
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg">Chế độ Học (Leitner)</h2>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${currentCard.status === 'new' ? 'bg-slate-400' : currentCard.status === 'learning' ? 'bg-yellow-400' : 'bg-blue-400'}`}></span>
                            Status: {currentCard.status?.toUpperCase() || 'NEW'} | Streak: {currentCard.streak}
                        </div>
                    </div>
                </div>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
                </div>
            </div>

            {/* Card Area */}
            <div className="flex-1 flex flex-col items-center justify-center perspective-1000 relative">
                <div 
                    className={`
                        relative w-full max-w-3xl min-h-[400px] cursor-pointer transition-all duration-500 transform-style-3d
                        ${isFlipped ? 'rotate-y-180' : ''}
                    `}
                    onClick={() => !isFlipped && setIsFlipped(true)}
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-[#0f172a] border border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl hover:border-orange-500/30 transition-colors">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Câu hỏi</span>
                        <h3 className="text-2xl md:text-4xl font-display font-bold text-white leading-relaxed">{currentCard.question}</h3>
                        <p className="mt-8 text-xs text-slate-600 animate-pulse">Nhấn để lật thẻ</p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#1e1b4b] border border-indigo-500/30 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6">Đáp án</span>
                        <div className="text-xl text-indigo-100 font-light leading-relaxed prose prose-invert">
                            {currentCard.type === 'Quiz' && currentCard.options 
                                ? <><p className="font-bold text-white mb-2">{currentCard.options[currentCard.correctIndex || 0]}</p><p className="text-sm">{currentCard.answer}</p></>
                                : currentCard.answer
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className={`h-24 flex items-center justify-center gap-6 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <button 
                    onClick={() => handleEvaluation(false)}
                    className="flex flex-col items-center gap-1 group px-8 py-2"
                >
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all shadow-lg">
                        <X size={24}/>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-red-400">Quên</span>
                </button>

                <div className="w-px h-10 bg-white/10"></div>

                <button 
                    onClick={() => handleEvaluation(true)}
                    className="flex flex-col items-center gap-1 group px-8 py-2"
                >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg">
                        <Check size={24}/>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-400">Nhớ</span>
                </button>
            </div>
        </div>
    );
};

export default LearnModeView;
