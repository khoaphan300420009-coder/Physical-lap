
import React, { useState, useEffect, useRef } from 'react';
import { Flashcard } from '../../types';
import { Zap, CheckCircle2, XCircle, ChevronRight, FileQuestion } from 'lucide-react';

interface TestModeProps {
    flashcards: Flashcard[];
}

interface TestQuestion {
    id: string;
    cardId: string;
    question: string;
    type: 'multiple' | 'truefalse';
    options: string[]; // [A, B, C, D] or [True, False]
    correctIndex: number;
    userAnswer?: number;
    isCorrect?: boolean;
    explanation: string;
}

const TestModeView: React.FC<TestModeProps> = ({ flashcards }) => {
    const [status, setStatus] = useState<'setup' | 'testing' | 'result'>('setup');
    const [questionCount, setQuestionCount] = useState(10);
    const [questions, setQuestions] = useState<TestQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    
    const containerRef = useRef<HTMLDivElement>(null);

    // MathJax re-render
    useEffect(() => {
        if (containerRef.current && (window as any).MathJax) {
            requestAnimationFrame(() => {
                (window as any).MathJax.typesetPromise([containerRef.current]).catch(() => {});
            });
        }
    }, [status, currentIdx]);

    const generateTest = () => {
        if (flashcards.length < 4) {
            alert("Cần ít nhất 4 thẻ để tạo bài kiểm tra trắc nghiệm (để tạo đáp án nhiễu).");
            return;
        }

        const shuffled = [...flashcards].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, questionCount);
        
        const generatedQuestions: TestQuestion[] = selected.map((card, index) => {
            // Distractor Logic
            const otherCards = flashcards.filter(c => c.id !== card.id);
            // Shuffle others to pick distractors
            const distractors = otherCards
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(c => c.type === 'Quiz' && c.options ? c.options[c.correctIndex || 0] : c.answer) // Get correct answers of other cards
                // Cleanup: remove LaTeX delimiters if strictly text matching needed, but here we display them so ok.
                .filter(a => a !== card.answer); // Basic duplicate check

            // If card is already Quiz, use its options if valid, else mix
            let options: string[] = [];
            let correctIdx = 0;

            if (card.type === 'Quiz' && card.options && card.options.length === 4) {
                options = card.options;
                correctIdx = card.correctIndex || 0;
            } else if (card.type === 'TrueFalse') {
                options = ["Đúng", "Sai"];
                correctIdx = card.correctValue ? 0 : 1;
            } else {
                // Basic Card -> Turn into Multiple Choice
                // Real correct answer
                const correct = card.answer;
                // Pad distractors if not enough
                while(distractors.length < 3) distractors.push("Không có dữ liệu nhiễu phù hợp");
                
                options = [correct, ...distractors];
                // Shuffle options
                options = options.sort(() => 0.5 - Math.random());
                correctIdx = options.indexOf(correct);
            }

            return {
                id: `q-${index}`,
                cardId: card.id,
                question: card.question,
                type: card.type === 'TrueFalse' ? 'truefalse' : 'multiple',
                options,
                correctIndex: correctIdx,
                explanation: card.answer // Or detailed explanation
            };
        });

        setQuestions(generatedQuestions);
        setStatus('testing');
        setCurrentIdx(0);
        setScore(0);
    };

    const handleAnswer = (optionIdx: number) => {
        const currentQ = questions[currentIdx];
        const isCorrect = optionIdx === currentQ.correctIndex;
        
        const updatedQ = { ...currentQ, userAnswer: optionIdx, isCorrect };
        const newQuestions = [...questions];
        newQuestions[currentIdx] = updatedQ;
        setQuestions(newQuestions);

        if (isCorrect) setScore(s => s + 1);

        // Auto move next after delay
        setTimeout(() => {
            if (currentIdx < questions.length - 1) {
                setCurrentIdx(c => c + 1);
            } else {
                setStatus('result');
            }
        }, 500);
    };

    if (status === 'setup') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-[#020408]">
                <div className="bg-[#0f172a] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-400">
                        <Zap size={40}/>
                    </div>
                    <h2 className="text-3xl font-display font-black text-white mb-2">Kiểm Tra Năng Lực</h2>
                    <p className="text-slate-400 mb-8">Hệ thống sẽ tạo đề ngẫu nhiên từ kho dữ liệu của bạn với các đáp án nhiễu thông minh.</p>
                    
                    <div className="space-y-4 mb-8 text-left">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Số lượng câu hỏi</label>
                        <div className="flex gap-2">
                            {[5, 10, 20, 50].map(n => (
                                <button 
                                    key={n} 
                                    onClick={() => setQuestionCount(n)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${questionCount === n ? 'bg-rose-600 text-white border-rose-500' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={generateTest}
                        className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-rose-900/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        Bắt đầu làm bài <ChevronRight size={20}/>
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'result') {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="h-full overflow-y-auto custom-scroll p-8 bg-[#020408] flex flex-col items-center">
                <div className="w-full max-w-4xl">
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 mb-8 border border-white/10 text-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 h-2 bg-gradient-to-r from-rose-500 to-purple-500 transition-all duration-1000`} style={{width: `${percentage}%`}}></div>
                        <h2 className="text-6xl font-black text-white mb-2 font-mono">{score}/{questions.length}</h2>
                        <p className="text-xl text-slate-400 font-light">Điểm số: <span className={percentage >= 80 ? 'text-emerald-400' : 'text-rose-400'}>{percentage}%</span></p>
                    </div>

                    <div className="space-y-4" ref={containerRef}>
                        <h3 className="text-lg font-bold text-white mb-4">Chi tiết bài làm</h3>
                        {questions.map((q, i) => (
                            <div key={q.id} className={`p-6 rounded-2xl border ${q.isCorrect ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
                                <div className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${q.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {q.isCorrect ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium text-lg mb-4">Câu {i+1}: {q.question}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt, optIdx) => (
                                                <div key={optIdx} className={`p-3 rounded-lg text-sm border ${
                                                    optIdx === q.correctIndex 
                                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                                                        : optIdx === q.userAnswer 
                                                            ? 'bg-red-500/20 border-red-500/50 text-red-300' 
                                                            : 'bg-black/20 border-transparent text-slate-500'
                                                }`}>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button onClick={() => setStatus('setup')} className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold mx-auto block">
                        Làm lại bài khác
                    </button>
                </div>
            </div>
        );
    }

    // Testing UI
    const currentQ = questions[currentIdx];
    const progress = ((currentIdx) / questions.length) * 100;

    return (
        <div className="flex flex-col h-full bg-[#020408] p-8" ref={containerRef}>
            {/* Header */}
            <div className="flex justify-between items-center mb-10 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <FileQuestion className="text-rose-400" size={24}/>
                    <span className="text-slate-400 font-mono">Câu {currentIdx + 1}/{questions.length}</span>
                </div>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 transition-all duration-300" style={{width: `${progress}%`}}></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 flex flex-col items-center justify-start max-w-4xl mx-auto w-full animate-[fadeIn_0.3s]">
                <div className="w-full bg-[#0f172a] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl mb-8 min-h-[200px] flex items-center justify-center">
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white text-center leading-relaxed">
                        {currentQ.question}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {currentQ.options.map((opt, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-rose-600 hover:border-rose-500 hover:text-white text-slate-300 text-left transition-all duration-200 group relative overflow-hidden"
                        >
                            <span className="absolute top-6 left-6 font-mono opacity-30 text-xl font-bold group-hover:opacity-100 transition-opacity">
                                {String.fromCharCode(65+idx)}
                            </span>
                            <span className="pl-10 block text-lg font-medium">{opt}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestModeView;
