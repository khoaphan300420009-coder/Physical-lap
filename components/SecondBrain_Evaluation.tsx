
import React, { useState } from 'react';
import { BookOpen, Sparkles, TrendingUp, AlertTriangle, CheckCircle, BrainCircuit, Activity } from 'lucide-react';
import { Note, Flashcard } from '../types';
import { generatePhysicsResponse } from '../services/geminiService';
import { useToast } from './Toast';

interface KnowledgeNode {
    id: string;
    label: string;
    target: number;
    actual: number;
}

interface EvaluationProps {
    notes: Note[];
    flashcards: Flashcard[];
}

const DEFAULT_DATA: KnowledgeNode[] = [
    { id: '1', label: 'Cơ Học', target: 80, actual: 0 },
    { id: '2', label: 'Nhiệt Học', target: 80, actual: 0 },
    { id: '3', label: 'Điện Từ', target: 80, actual: 0 },
    { id: '4', label: 'Quang Học', target: 80, actual: 0 },
    { id: '5', label: 'Hạt Nhân', target: 80, actual: 0 },
];

const SecondBrainEvaluation: React.FC<EvaluationProps> = ({ notes, flashcards }) => {
    const [aiState, setAiState] = useState<'idle' | 'thinking' | 'result'>('idle');
    const [chartData, setChartData] = useState<KnowledgeNode[]>(DEFAULT_DATA);
    const [report, setReport] = useState<{summary: string, insight: string, risks: string, actions: string[]}>({
        summary: '', insight: '', risks: '', actions: []
    });
    const { addToast } = useToast();

    const handleAnalyze = async () => {
        setAiState('thinking');
        try {
            // Prepare context for AI
            const noteTitles = notes.map(n => n.title).join(", ");
            const totalCards = flashcards.length;
            const masteredCards = flashcards.filter(f => f.streak > 3).length;
            const strugglingCards = flashcards.filter(f => f.easeFactor < 2.0).length;
            const avgStreak = totalCards > 0 ? (flashcards.reduce((sum, f) => sum + f.streak, 0) / totalCards).toFixed(1) : 0;

            const prompt = `
                Bạn là một chuyên gia đánh giá năng lực Vật Lý.
                
                Dữ liệu người dùng:
                - Các chủ đề đã học (Notes): ${noteTitles || "Chưa có bài ghi chú nào."}
                - Tổng số thẻ nhớ (Flashcards): ${totalCards}
                - Số thẻ đã thuộc lòng (Streak > 3): ${masteredCards}
                - Số thẻ đang gặp khó khăn: ${strugglingCards}
                - Chuỗi thắng trung bình: ${avgStreak}

                Nhiệm vụ:
                1. Phân tích dữ liệu trên và ước lượng điểm số năng lực (0-100) cho 5 lĩnh vực: Cơ Học, Nhiệt Học, Điện Từ, Quang Học, Hạt Nhân.
                   Nếu người dùng chưa có note về chủ đề đó, điểm Thực tế (actual) nên thấp. Điểm Mục tiêu (target) luôn khoảng 75-90.
                2. Viết báo cáo đánh giá ngắn gọn gồm: Tổng quan, Nhận định, Rủi ro, và 3 Hành động đề xuất.

                Trả về định dạng JSON DUY NHẤT như sau (không markdown):
                {
                    "chart": [
                        {"id": "1", "label": "Cơ Học", "target": 85, "actual": 40},
                        ... (cho đủ 5 mục)
                    ],
                    "report": {
                        "summary": "Câu tóm tắt...",
                        "insight": "Nhận định...",
                        "risks": "Cảnh báo...",
                        "actions": ["Hành động 1", "Hành động 2", "Hành động 3"]
                    }
                }
            `;

            const response = await generatePhysicsResponse(prompt);
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanResponse);

            if (data.chart && data.report) {
                setChartData(data.chart);
                setReport(data.report);
                setAiState('result');
                addToast("Đã hoàn tất phân tích năng lực!", "success");
            } else {
                throw new Error("Invalid AI format");
            }

        } catch (error) {
            console.error(error);
            addToast("Lỗi khi phân tích dữ liệu. Vui lòng thử lại.", "error");
            setAiState('idle');
        }
    };

    return (
        <div className="h-full w-full bg-[#05080f] p-8 flex flex-col gap-8 animate-[fadeIn_0.3s] overflow-hidden">
            
            {/* ZONE 1: TOP HEADER & ACTION */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Trung Tâm Dữ Liệu Học Tập</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-white tracking-tight">Đánh Giá Năng Lực</h1>
                    <p className="text-slate-400 font-light mt-2 max-w-xl">
                        Hệ thống tự động theo dõi tiến độ và so sánh với mục tiêu đề ra để tối ưu hóa lộ trình học tập của bạn.
                    </p>
                </div>
                
                <button 
                    onClick={handleAnalyze}
                    disabled={aiState === 'thinking'}
                    className={`
                        relative px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center gap-3 transition-all
                        ${aiState === 'thinking' 
                            ? 'bg-slate-800 text-slate-500 cursor-wait' 
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95'
                        }
                    `}
                >
                    {aiState === 'thinking' ? (
                        <><Activity size={18} className="animate-spin"/> Đang xử lý dữ liệu...</>
                    ) : (
                        <><Sparkles size={18}/> Phân tích & Đánh giá</>
                    )}
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                
                {/* ZONE 2: LEFT COLUMN - DOUBLE BAR CHART (66%) */}
                <div className="lg:w-2/3 bg-[#0f172a] rounded-[2.5rem] border border-white/5 p-8 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-400"/> Biểu đồ năng lực
                        </h3>
                        <div className="flex gap-4 text-xs font-bold">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-600"></div> <span className="text-slate-400">Mục tiêu</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-indigo-500"></div> <span className="text-slate-400">Thực tế (Đạt)</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500"></div> <span className="text-slate-400">Cảnh báo</span></div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between px-4 gap-4 relative">
                        {/* Y-Axis Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                            {[100, 75, 50, 25, 0].map(val => (
                                <div key={val} className="w-full h-px bg-white border-t border-dashed border-slate-500 relative">
                                    <span className="absolute -left-8 -top-2 text-[10px] font-mono text-slate-500">{val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Bars */}
                        {chartData.map((node) => {
                            const isWarning = node.actual < node.target * 0.7; // Warning if < 70% of target
                            return (
                                <div key={node.id} className="flex-1 h-full flex flex-col justify-end items-center gap-3 z-10 group cursor-pointer">
                                    <div className="w-full flex justify-center items-end gap-1 h-full relative">
                                        {/* Tooltip */}
                                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-3 py-1 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none z-20 border border-white/10">
                                            Mục tiêu: {node.target} | Thực tế: {node.actual}
                                        </div>

                                        {/* Target Bar (Gray) */}
                                        <div 
                                            className="w-1/3 bg-slate-700/50 rounded-t-lg transition-all duration-1000 ease-out border border-slate-600/30"
                                            style={{ height: `${node.target}%` }}
                                        ></div>
                                        
                                        {/* Actual Bar (Colored) */}
                                        <div 
                                            className={`
                                                w-1/3 rounded-t-lg transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.3)]
                                                ${isWarning ? 'bg-amber-500 shadow-amber-500/20' : 'bg-indigo-500 shadow-indigo-500/20'}
                                            `}
                                            style={{ height: `${node.actual}%` }}
                                        >
                                            {/* Value Label on Top */}
                                            <span className="block -mt-6 text-center text-[10px] font-bold text-white drop-shadow-md">
                                                {node.actual}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 text-center line-clamp-1 group-hover:text-white transition-colors">{node.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ZONE 3: RIGHT COLUMN - AI CONSOLE (33%) */}
                <div className="lg:w-1/3 flex flex-col gap-4">
                    {aiState === 'idle' && (
                        <div className="h-full bg-[#0f172a] rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center justify-center text-center text-slate-500 border-dashed">
                            <BrainCircuit size={48} className="mb-4 opacity-20"/>
                            <p className="text-sm font-medium">Sẵn sàng phân tích.</p>
                            <p className="text-xs opacity-60 mt-1">Dữ liệu từ {notes.length} bài ghi chú và {flashcards.length} thẻ ôn tập.</p>
                        </div>
                    )}

                    {aiState === 'thinking' && (
                        <div className="h-full bg-[#0f172a] rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles size={20} className="text-indigo-400 animate-pulse"/>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg animate-pulse">AI đang phân tích...</h3>
                                <p className="text-slate-400 text-sm mt-2">Đang quét {notes.length} bài học của bạn.</p>
                            </div>
                        </div>
                    )}

                    {aiState === 'result' && (
                        <div className="h-full bg-[#0f172a] rounded-[2.5rem] border border-white/10 p-1 overflow-hidden shadow-2xl animate-[slideUp_0.5s_ease-out] flex flex-col">
                            {/* AI Header */}
                            <div className="bg-indigo-600 p-4 rounded-t-[2.3rem] flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                                    <Sparkles className="text-indigo-600" size={20}/>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Trợ lý ảo Physical Lab</h3>
                                    <p className="text-indigo-200 text-[10px] uppercase tracking-wider">Báo cáo chi tiết</p>
                                </div>
                            </div>

                            {/* AI Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6">
                                {/* Summary */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">A. Tổng Quan</h4>
                                    <p className="text-white font-medium leading-relaxed">
                                        {report.summary}
                                    </p>
                                </div>

                                {/* Insight */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-violet-400 uppercase tracking-widest">B. Nhận định chuyên sâu</h4>
                                    <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-sm text-slate-300">
                                        {report.insight}
                                    </div>
                                </div>

                                {/* Risks */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                                        <AlertTriangle size={14}/> Cảnh báo rủi ro
                                    </h4>
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-200">
                                        {report.risks}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle size={14}/> Lộ trình đề xuất
                                    </h4>
                                    <ul className="space-y-2">
                                        {report.actions.map((action, idx) => (
                                            <li key={idx} className="flex gap-3 items-start text-sm text-slate-300">
                                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</span>
                                                <span>{action}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecondBrainEvaluation;
