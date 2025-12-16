
import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownRight, RotateCw, BrainCircuit, GripHorizontal, Eye } from 'lucide-react';
import { generatePhysicsResponse } from '../../../services/geminiService';

const RefractionDiagram: React.FC = () => {
    // Physics State
    const [n1, setN1] = useState(1.0); // Air
    const [n2, setN2] = useState(1.5); // Glass
    const [angleI, setAngleI] = useState(45); // Incidence Angle
    
    // UI State
    const [showValues, setShowValues] = useState(true);
    const [showNormal, setShowNormal] = useState(true);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Render Diagram
    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return;
        const ctx = cvs.getContext('2d'); if (!ctx) return;
        
        const w = cvs.width = cvs.clientWidth;
        const h = cvs.height = cvs.clientHeight;
        const cx = w/2; const cy = h/2;

        // Clear
        ctx.clearRect(0,0,w,h);

        // 1. Draw Mediums
        // Top (Medium 1)
        const grad1 = ctx.createLinearGradient(0, 0, 0, cy);
        grad1.addColorStop(0, '#e0f2fe'); grad1.addColorStop(1, '#bae6fd'); // Light Blue (Air-ish)
        ctx.fillStyle = n1 === 1 ? '#f8fafc' : (n1 < n2 ? '#e0f2fe' : '#93c5fd'); // Color coding density
        ctx.fillRect(0, 0, w, cy);
        
        // Bottom (Medium 2)
        const grad2 = ctx.createLinearGradient(0, cy, 0, h);
        grad2.addColorStop(0, '#3b82f6'); grad2.addColorStop(1, '#1d4ed8'); // Dark Blue (Water/Glass)
        ctx.fillStyle = n2 === 1 ? '#f8fafc' : (n2 > n1 ? '#60a5fa' : '#bfdbfe');
        ctx.fillRect(0, cy, w, h-cy);

        // Boundary Line
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

        // 2. Draw Normal Line
        if (showNormal) {
            ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
            ctx.beginPath(); ctx.moveTo(cx, 50); ctx.lineTo(cx, h-50); ctx.stroke();
            ctx.setLineDash([]);
        }

        // 3. Physics Calculations (Snell's Law)
        // n1 * sin(i) = n2 * sin(r)
        const radI = angleI * Math.PI / 180;
        let radR = Math.asin((n1 / n2) * Math.sin(radI));
        
        // Total Internal Reflection check
        const isTIR = isNaN(radR);
        if (isTIR) radR = Math.PI / 2; // Clamp visually or handle reflection only

        // 4. Draw Rays
        const rayLen = 250;
        
        // Incident Ray (Top Left usually)
        const ix = cx - rayLen * Math.sin(radI);
        const iy = cy - rayLen * Math.cos(radI);
        drawRay(ctx, ix, iy, cx, cy, '#ef4444', 'Incident Ray'); // Red

        // Angle Arc i
        drawAngleArc(ctx, cx, cy, -Math.PI/2 - radI, -Math.PI/2, 40, `i = ${angleI}°`);

        if (isTIR) {
            // Total Internal Reflection
            const rx = cx + rayLen * Math.sin(radI);
            const ry = cy - rayLen * Math.cos(radI);
            drawRay(ctx, cx, cy, rx, ry, '#ef4444', 'Total Internal Reflection');
            
            ctx.fillStyle = '#ef4444'; ctx.font = 'bold 16px sans-serif';
            ctx.fillText("PHẢN XẠ TOÀN PHẦN!", cx + 20, cy - 20);
        } else {
            // Reflected Ray (Weak)
            const rx = cx + rayLen * Math.sin(radI);
            const ry = cy - rayLen * Math.cos(radI);
            ctx.globalAlpha = 0.4;
            drawRay(ctx, cx, cy, rx, ry, '#ef4444', 'Reflected');
            ctx.globalAlpha = 1;

            // Refracted Ray
            const rfx = cx + rayLen * Math.sin(radR);
            const rfy = cy + rayLen * Math.cos(radR);
            drawRay(ctx, cx, cy, rfx, rfy, '#2563eb', 'Refracted Ray'); // Blue

            // Angle Arc r
            const degR = Math.round(radR * 180 / Math.PI);
            drawAngleArc(ctx, cx, cy, Math.PI/2, Math.PI/2 - radR, 50, `r = ${degR}°`);
        }

        // Labels
        ctx.fillStyle = '#334155'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`Môi trường 1 (n=${n1})`, 20, 30);
        ctx.fillStyle = '#fff';
        ctx.fillText(`Môi trường 2 (n=${n2})`, 20, h - 20);

    }, [n1, n2, angleI, showNormal, showValues]);

    // Helpers
    const drawRay = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label: string) => {
        ctx.strokeStyle = color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(y2-y1, x2-x1);
        const midX = (x1+x2)/2; const midY = (y1+y2)/2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX - 15*Math.cos(angle-Math.PI/6), midY - 15*Math.sin(angle-Math.PI/6));
        ctx.lineTo(midX - 15*Math.cos(angle+Math.PI/6), midY - 15*Math.sin(angle+Math.PI/6));
        ctx.fill();

        if (showValues) {
            ctx.fillStyle = color; ctx.font = '12px sans-serif';
            ctx.fillText(label, x1 + (x2-x1)*0.2, y1 + (y2-y1)*0.2 - 10);
        }
    };

    const drawAngleArc = (ctx: CanvasRenderingContext2D, cx: number, cy: number, start: number, end: number, r: number, label: string) => {
        if (!showValues) return;
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, start, end); ctx.stroke();
        
        const midAng = (start + end) / 2;
        const lx = cx + (r + 20) * Math.cos(midAng);
        const ly = cy + (r + 20) * Math.sin(midAng);
        ctx.fillStyle = '#000'; ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, lx, ly);
    };

    const handleAIAnalyze = async () => {
        setIsAnalyzing(true);
        const prompt = `Phân tích hiện tượng khúc xạ ánh sáng trong sơ đồ:
        - Môi trường tới: n1 = ${n1}
        - Môi trường khúc xạ: n2 = ${n2}
        - Góc tới: i = ${angleI} độ
        
        Hãy tính góc khúc xạ r (hoặc góc giới hạn nếu có phản xạ toàn phần) và giải thích đường đi của tia sáng.`;
        
        try {
            const res = await generatePhysicsResponse(prompt);
            setAiAnalysis(res);
        } catch (e) {
            setAiAnalysis("Lỗi kết nối AI.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex h-full w-full bg-[#020408] font-sans text-slate-200">
            {/* CANVAS */}
            <div className="flex-1 relative overflow-hidden flex flex-col bg-white">
                <canvas ref={canvasRef} className="w-full flex-1 block" />
            </div>

            {/* SIDEBAR */}
            <div className="w-80 bg-[#0a0a0f] border-l border-white/10 flex flex-col h-full z-20 shadow-2xl overflow-y-auto custom-scroll">
                <div className="p-6 space-y-8">
                    <h2 className="text-xl font-display font-bold text-blue-400 flex items-center gap-2 border-b border-white/10 pb-4">
                        <ArrowDownRight size={20}/> Khúc Xạ & Phản Xạ
                    </h2>

                    {/* Controls */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-300"><span>Góc tới (i)</span><span className="text-red-400">{angleI}°</span></div>
                            <div className="flex items-center gap-2">
                                <input type="range" min="0" max="90" value={angleI} onChange={e => setAngleI(Number(e.target.value))} className="flex-1 accent-red-500 h-1 bg-white/10 rounded"/>
                                <RotateCw size={16} className="text-slate-500"/>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-300"><span>Môi trường 1 (Trên)</span><span className="text-blue-200">n={n1}</span></div>
                            <input type="range" min="1.0" max="3.0" step="0.01" value={n1} onChange={e => setN1(Number(e.target.value))} className="w-full accent-blue-300 h-1 bg-white/10 rounded"/>
                            <div className="flex gap-1 justify-between text-[10px] text-slate-500"><span>Khí (1)</span><span>Nước (1.33)</span><span>Kính (1.5)</span><span>Kim cương (2.4)</span></div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-300"><span>Môi trường 2 (Dưới)</span><span className="text-blue-500">n={n2}</span></div>
                            <input type="range" min="1.0" max="3.0" step="0.01" value={n2} onChange={e => setN2(Number(e.target.value))} className="w-full accent-blue-600 h-1 bg-white/10 rounded"/>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="pt-4 border-t border-white/10 space-y-3">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-2"><GripHorizontal size={14}/> Pháp tuyến</span>
                            <input type="checkbox" checked={showNormal} onChange={e => setShowNormal(e.target.checked)} className="accent-blue-500"/>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-2"><Eye size={14}/> Hiển thị giá trị</span>
                            <input type="checkbox" checked={showValues} onChange={e => setShowValues(e.target.checked)} className="accent-blue-500"/>
                        </label>
                    </div>

                    {/* AI */}
                    <div className="pt-4 border-t border-white/10">
                        <button onClick={handleAIAnalyze} disabled={isAnalyzing} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                            <BrainCircuit size={14}/> {isAnalyzing ? 'Đang tính toán...' : 'Phân tích đường đi tia sáng'}
                        </button>
                    </div>
                    {aiAnalysis && (
                        <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg text-[10px] text-indigo-200 leading-relaxed max-h-40 overflow-y-auto custom-scroll animate-[fadeIn_0.3s]">
                            {aiAnalysis}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RefractionDiagram;
