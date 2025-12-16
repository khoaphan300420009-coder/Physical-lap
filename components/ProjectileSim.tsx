
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectileParams, AnalysisData } from '../types';
import { generatePhysicsResponse } from '../services/geminiService';
import { Play, Pause, RotateCcw, Sliders, ZoomIn, ZoomOut, BarChart3, ArrowLeft, Zap, Gauge, Trash2, BrainCircuit, MoveVertical, Wind, Activity, Move } from 'lucide-react';

const AIR_DENSITY = 1.225;
const SPHERE_AREA = 0.01;

const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string, width: number = 3, label: string = '') => {
    const headlen = 12;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    const len = Math.hypot(dx, dy);
    
    if(len < 5) return; // Don't draw tiny vectors

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    
    // Main Line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fill();

    // Label
    if (label) {
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(label, toX + 10, toY);
    }
};

const ProjectileSim: React.FC = () => {
    const [params, setParams] = useState<ProjectileParams>({ 
        v0: 60, angle: 45, h0: 10, g: 9.81, m: 1.0, 
        drag: 0.00, spin: 0, elasticity: 0.7, 
        zoom: 0.8, simSpeed: 1.0 
    });
    const [state, setState] = useState({ isPlaying: false, isPaused: false, finished: false });
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [energyData, setEnergyData] = useState({ ke: 0, pe: 0, total: 0 });
    
    // Feature Toggles
    const [interactionMode, setInteractionMode] = useState<'none' | 'pan' | 'dragHeight'>('none');
    const [showVectors, setShowVectors] = useState(false);
    
    // History State
    const [shotHistory, setShotHistory] = useState<{params: ProjectileParams, result: AnalysisData, id: number}[]>([]);
    
    const physRef = useRef({
        time: 0,
        obj: { x: 0, y: 0, vx: 0, vy: 0 },
        trace: [] as {x: number, y: number}[],
        historyTraces: [] as {x: number, y: number}[][],
        prediction: [] as {x: number, y: number}[],
        view: { offsetX: 0, offsetY: 0, lastMouseX: 0, lastMouseY: 0 },
        analysis: { flightTime: 0, maxHeight: 0, range: 0, impactVelocity: 0, impactAngle: 0 } as AnalysisData,
    });
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisData>({ flightTime: 0, maxHeight: 0, range: 0, impactVelocity: 0, impactAngle: 0 });

    const getInitialState = (p: ProjectileParams) => { const rad = (p.angle * Math.PI) / 180; return { x: 0, y: p.h0, vx: p.v0 * Math.cos(rad), vy: p.v0 * Math.sin(rad) }; };
    
    const getDerivatives = (curState: any, p: ProjectileParams) => { 
        const vSq = curState.vx * curState.vx + curState.vy * curState.vy; 
        const v = Math.sqrt(vSq); 
        const dragForce = 0.5 * AIR_DENSITY * p.drag * SPHERE_AREA * vSq; 
        const magnusCoeff = 0.005; 
        const fm = p.spin * v * magnusCoeff;
        let ax = 0, ay = -p.g; 
        
        if (v > 0.0001) { 
            ax -= (dragForce * (curState.vx / v)) / p.m; 
            ay -= (dragForce * (curState.vy / v)) / p.m; 
            ax -= (fm * (curState.vy / v)) / p.m;
            ay += (fm * (curState.vx / v)) / p.m;
        } 
        return { dx: curState.vx, dy: curState.vy, dvx: ax, dvy: ay }; 
    };

    const rk4Step = (curr: any, dt: number, p: ProjectileParams) => { 
        const d1 = getDerivatives(curr, p); 
        const s2 = { vx: curr.vx + d1.dvx * dt * 0.5, vy: curr.vy + d1.dvy * dt * 0.5 }; 
        const d2 = getDerivatives(s2, p); 
        const s3 = { vx: curr.vx + d2.dvx * dt * 0.5, vy: curr.vy + d2.dvy * dt * 0.5 }; 
        const d3 = getDerivatives(s3, p); 
        const s4 = { vx: curr.vx + d3.dvx * dt, vy: curr.vy + d3.dvy * dt }; 
        const d4 = getDerivatives(s4, p); 
        const ax = (d1.dvx + 2*d2.dvx + 2*d3.dvx + d4.dvx) / 6; 
        const ay = (d1.dvy + 2*d2.dvy + 2*d3.dvy + d4.dvy) / 6; 
        const vx = (d1.dx + 2*d2.dx + 2*d3.dx + d4.dx) / 6; 
        const vy = (d1.dy + 2*d2.dy + 2*d3.dy + d4.dy) / 6; 
        return { x: curr.x + vx * dt, y: curr.y + vy * dt, vx: curr.vx + ax * dt, vy: curr.vy + ay * dt }; 
    };

    const calculatePrediction = useCallback(() => {
        const dt = 0.05;
        let temp = getInitialState(params);
        const path = [{x: temp.x, y: temp.y}];
        let t = 0; let maxY = temp.y;
        while (temp.y >= 0 && t < 100) { 
            temp = rk4Step(temp, dt, params); 
            path.push({x: temp.x, y: temp.y}); 
            if (temp.y > maxY) maxY = temp.y; 
            t += dt; 
        }
        const res = { flightTime: t, maxHeight: maxY, range: temp.x, impactVelocity: 0, impactAngle: 0 };
        physRef.current.prediction = path;
        physRef.current.analysis = res;
        setAnalysisResult(res);
    }, [params]);

    useEffect(() => {
        if (!state.isPlaying && !state.finished && !state.isPaused) { 
            physRef.current.obj = getInitialState(params); 
            physRef.current.time = 0; 
            physRef.current.trace = [];
            const vSq = physRef.current.obj.vx**2 + physRef.current.obj.vy**2;
            const ke = 0.5 * params.m * vSq;
            const pe = params.m * params.g * physRef.current.obj.y;
            setEnergyData({ ke, pe, total: ke + pe });
        }
        calculatePrediction();
    }, [params, calculatePrediction, state.isPlaying, state.finished, state.isPaused]);

    // Handle Finish and History
    useEffect(() => {
        if (state.finished) {
            setShotHistory(prev => [
                ...prev, 
                { params: { ...params }, result: { ...analysisResult }, id: Date.now() }
            ]);
        }
    }, [state.finished]);

    // Trigger MathJax re-render when AI content changes
    useEffect(() => {
        if (aiAnalysis && (window as any).MathJax) {
            setTimeout(() => {
                (window as any).MathJax.typesetPromise?.();
            }, 100);
        }
    }, [aiAnalysis]);

    const handleFire = () => {
        if (state.finished || (!state.isPlaying && !state.isPaused && physRef.current.trace.length > 0)) {
            if (physRef.current.trace.length > 0) physRef.current.historyTraces.push([...physRef.current.trace]);
            physRef.current.trace = [];
            physRef.current.obj = getInitialState(params);
            physRef.current.time = 0;
            setState(s => ({...s, isPlaying: true, isPaused: false, finished: false}));
        } else if (state.isPaused) {
             setState(s => ({...s, isPlaying: true, isPaused: false}));
        } else if (state.isPlaying) {
             setState(s => ({...s, isPlaying: false, isPaused: true}));
        } else {
             setState(s => ({...s, isPlaying: true, isPaused: false, finished: false}));
        }
    };

    const handleClearHistory = () => {
        physRef.current.historyTraces = [];
        physRef.current.trace = [];
        setShotHistory([]);
        physRef.current.obj = getInitialState(params);
        setState({ isPlaying: false, isPaused: false, finished: false });
    };

    const handleAnalyzeAI = async () => {
        setShowAnalysis(true);
        setAiAnalysis(null);
        setIsAnalyzing(true);
        try {
            const historyText = shotHistory.length > 0 
                ? shotHistory.map((s, i) => `Lần ${i+1}: Góc ${s.params.angle}°, V0 ${s.params.v0}m/s -> Tầm xa ${s.result.range.toFixed(1)}m, Cao ${s.result.maxHeight.toFixed(1)}m`).join('\n')
                : "Chưa có lịch sử bắn.";

            const prompt = `Phân tích chuyển động ném xiên dựa trên lịch sử bắn của người dùng:\n${historyText}\n\nThông số hiện tại:\n- Vận tốc đầu: ${params.v0} m/s\n- Góc ném: ${params.angle} độ\n- Độ cao ban đầu: ${params.h0} m\n- Khối lượng: ${params.m} kg\n- Hệ số cản: ${params.drag}\n\nKết quả dự đoán:\n- Tầm xa: ${analysisResult.range.toFixed(2)} m\n- Độ cao cực đại: ${analysisResult.maxHeight.toFixed(2)} m\n\nHãy nhận xét về sự thay đổi của kết quả qua các lần bắn nếu có. Giải thích ngắn gọn lý do tại sao thay đổi góc hoặc vận tốc lại ảnh hưởng đến tầm xa. Tránh dùng công thức LaTeX phức tạp, hãy dùng văn bản thông thường hoặc biểu tượng đơn giản (ví dụ h_max, v^2) để tránh lỗi hiển thị.`;
            
            const response = await generatePhysicsResponse(prompt);
            setAiAnalysis(response);
        } catch (error) {
            setAiAnalysis("Không thể kết nối với AI. Vui lòng thử lại.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // --- Interactive Inputs ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const { zoom } = params;
        const { offsetX, offsetY } = physRef.current.view;
        const h = canvasRef.current.height;
        const originX = 50 + offsetX;
        const originY = h - 50 + offsetY;
        const scale = 10 * zoom;
        
        // Launch point screen coords
        const launchScreenX = originX;
        const launchScreenY = originY - params.h0 * scale;

        // Check if hitting the launch platform (drag height)
        const dist = Math.hypot(mouseX - launchScreenX, mouseY - launchScreenY);
        
        if (dist < 30) {
            setInteractionMode('dragHeight');
        } else {
            setInteractionMode('pan');
        }
        
        physRef.current.view.lastMouseX = e.clientX;
        physRef.current.view.lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (interactionMode === 'none') return;
        
        const dx = e.clientX - physRef.current.view.lastMouseX;
        const dy = e.clientY - physRef.current.view.lastMouseY;
        
        if (interactionMode === 'pan') {
            physRef.current.view.offsetX += dx;
            physRef.current.view.offsetY += dy;
        } else if (interactionMode === 'dragHeight') {
            // Dragging Height: dy affects h0
            const { zoom } = params;
            const scale = 10 * zoom;
            // dy > 0 (down) -> decrease height
            const deltaH = -dy / scale; 
            setParams(p => ({...p, h0: Math.max(0, Math.min(100, p.h0 + deltaH))}));
        }

        physRef.current.view.lastMouseX = e.clientX;
        physRef.current.view.lastMouseY = e.clientY;
    };
    
    const handleMouseUp = () => setInteractionMode('none');

    // Drawing Axes Helper
    const drawAxes = (ctx: CanvasRenderingContext2D, originX: number, originY: number, w: number, h: number, zoom: number) => {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        const scale = 10 * zoom;

        // X Axis
        ctx.beginPath();
        ctx.moveTo(0, originY);
        ctx.lineTo(w, originY);
        ctx.stroke();

        // Y Axis
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, h);
        ctx.stroke();

        // Ticks X (Every 10m)
        for (let x = 0; x < w / scale; x += 10) {
            const screenX = originX + x * scale;
            if (screenX > 0 && screenX < w) {
                ctx.beginPath(); ctx.moveTo(screenX, originY - 5); ctx.lineTo(screenX, originY + 5); ctx.stroke();
                ctx.fillText(x.toString(), screenX - 5, originY + 20);
            }
        }

        // Ticks Y (Every 10m)
        for (let y = 10; y < h / scale; y += 10) {
            const screenY = originY - y * scale;
            if (screenY > 0 && screenY < h) {
                ctx.beginPath(); ctx.moveTo(originX - 5, screenY); ctx.lineTo(originX + 5, screenY); ctx.stroke();
                ctx.fillText(y.toString(), originX - 25, screenY + 3);
            }
        }

        // Labels
        ctx.fillText("x (m)", w - 40, originY - 10);
        ctx.fillText("y (m)", originX + 10, 20);
    };

    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return; 
        const ctx = cvs.getContext('2d', { alpha: false }); if (!ctx) return;
        let lastTime = performance.now();
        let animationFrameId: number;

        const render = (now: number) => {
            const dtMs = now - lastTime; lastTime = now;
            const parent = cvs.parentElement;
            if (parent && (cvs.width !== parent.clientWidth || cvs.height !== parent.clientHeight)) {
                cvs.width = parent.clientWidth; cvs.height = parent.clientHeight;
            }
            const w = cvs.width, h = cvs.height;

            ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, w, h);
            const { zoom } = params; const { offsetX, offsetY } = physRef.current.view; 
            const scale = 10 * zoom; 
            const originX = 50 + offsetX; 
            const originY = h - 50 + offsetY;
            
            // Grid (Subtle)
            ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.beginPath();
            for (let x = originX % (50 * zoom); x < w; x += 50 * zoom) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
            for (let y = originY % (50 * zoom); y < h; y += 50 * zoom) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
            ctx.stroke();

            // Draw Coordinate Axes
            drawAxes(ctx, originX, originY, w, h, zoom);
            
            // Ground
            ctx.fillStyle = '#0f172a'; ctx.fillRect(0, originY, w, h - originY);
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(w, originY); ctx.stroke();
            
            // --- Launch Platform ---
            const launchY = originY - params.h0 * scale;
            ctx.fillStyle = '#475569';
            ctx.fillRect(originX - 15, launchY, 30, params.h0 * scale); // Tower
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath(); ctx.arc(originX, launchY, 15, 0, Math.PI*2); ctx.fill(); // Pivot
            
            // Drag Handle Indicator
            ctx.fillStyle = interactionMode === 'dragHeight' ? '#22d3ee' : '#fff';
            ctx.beginPath(); ctx.arc(originX, launchY, 6, 0, Math.PI*2); ctx.fill();
            if (interactionMode === 'dragHeight' || Math.abs(params.h0) > 0) {
                 ctx.fillStyle = '#fff';
                 ctx.font = '10px sans-serif';
                 ctx.fillText(`h=${params.h0.toFixed(1)}m`, originX + 20, launchY);
            }

            // Sim Logic
            if (state.isPlaying && !state.isPaused) {
                const steps = Math.ceil(params.simSpeed * 2); 
                const subDt = (dtMs / 1000 * params.simSpeed) / steps;
                for(let i=0; i<steps; i++) {
                    const nextObj = rk4Step(physRef.current.obj, subDt, params);
                    if (nextObj.y <= 0) { 
                        physRef.current.obj.y = 0;
                        physRef.current.obj.vy = -physRef.current.obj.vy * params.elasticity;
                        physRef.current.obj.vx = physRef.current.obj.vx * 0.95; 
                        if (Math.abs(physRef.current.obj.vy) < 1 && physRef.current.obj.y <= 0.01) {
                            physRef.current.obj.vy = 0; physRef.current.obj.vx = 0;
                            if (!state.finished) {
                                physRef.current.historyTraces.push([...physRef.current.trace]);
                                setState(s => ({...s, isPlaying: false, finished: true})); 
                            }
                        }
                    } else {
                        physRef.current.obj = nextObj;
                        physRef.current.time += subDt;
                    }
                    const lastTrace = physRef.current.trace[physRef.current.trace.length-1];
                    if (!lastTrace || Math.hypot(physRef.current.obj.x - lastTrace.x, physRef.current.obj.y - lastTrace.y) > 0.5) {
                        physRef.current.trace.push({x: physRef.current.obj.x, y: physRef.current.obj.y});
                    }
                }
                const vSq = physRef.current.obj.vx**2 + physRef.current.obj.vy**2;
                const ke = 0.5 * params.m * vSq;
                const pe = params.m * params.g * Math.max(0, physRef.current.obj.y);
                setEnergyData({ ke, pe, total: ke + pe });
            }

            // Draw Paths
            physRef.current.historyTraces.forEach(trace => {
                if (trace.length > 0) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; ctx.lineWidth = 2; 
                    ctx.beginPath(); 
                    ctx.moveTo(originX + trace[0].x * scale, originY - trace[0].y * scale); 
                    for(let p of trace) ctx.lineTo(originX + p.x * scale, originY - p.y * scale); 
                    ctx.stroke(); 
                }
            });

            if (physRef.current.trace.length > 0) {
                ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3; 
                ctx.beginPath(); 
                ctx.moveTo(originX + physRef.current.trace[0].x * scale, originY - physRef.current.trace[0].y * scale); 
                for(let p of physRef.current.trace) ctx.lineTo(originX + p.x * scale, originY - p.y * scale); 
                ctx.stroke(); 
            }
            
            // Prediction Line
            if (!state.isPlaying && !state.finished) {
                 ctx.strokeStyle = '#334155'; ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.beginPath();
                if (physRef.current.prediction.length > 0) { 
                    const start = physRef.current.prediction[0]; 
                    ctx.moveTo(originX + start.x * scale, originY - start.y * scale); 
                    for (let p of physRef.current.prediction) ctx.lineTo(originX + p.x * scale, originY - p.y * scale); 
                    ctx.stroke(); 
                }
                ctx.setLineDash([]);
            }
            
            const objX = originX + physRef.current.obj.x * scale; 
            const objY = originY - physRef.current.obj.y * scale;
            
            // Draw VECTORS
            if (showVectors) {
                // Vector Scale Factor (adjust to make vectors visible but not huge)
                const vScale = 1.5; 
                const gScale = 5;

                const { vx, vy } = physRef.current.obj;
                
                // 1. Total Velocity (Green)
                drawArrow(ctx, objX, objY, objX + vx * vScale, objY - vy * vScale, '#10b981', 3, 'v');
                
                // 2. Components (Dotted Green)
                ctx.setLineDash([3, 3]);
                ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1;
                // vx
                ctx.beginPath(); ctx.moveTo(objX, objY); ctx.lineTo(objX + vx * vScale, objY); ctx.stroke();
                drawArrow(ctx, objX, objY, objX + vx * vScale, objY, '#10b981', 1, 'vx');
                // vy
                ctx.beginPath(); ctx.moveTo(objX, objY); ctx.lineTo(objX, objY - vy * vScale); ctx.stroke();
                drawArrow(ctx, objX, objY, objX, objY - vy * vScale, '#10b981', 1, 'vy');
                ctx.setLineDash([]);

                // 3. Acceleration/Gravity (Red)
                // Always points down
                drawArrow(ctx, objX, objY, objX, objY + params.g * gScale, '#ef4444', 3, 'g');
            }

            // Draw Projectile
            ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(objX, objY, 12, 0, Math.PI * 2); ctx.fill(); 
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

            animationFrameId = requestAnimationFrame(render);
        };
        animationFrameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrameId);
    }, [params, state, interactionMode, showVectors]);

    return (
        <div className="flex h-full w-full relative">
            {showAnalysis && (
                <div className="absolute inset-0 z-50 flex flex-col h-full bg-[#050508]/95 backdrop-blur-xl p-8 animate-[fadeIn_0.3s] overflow-y-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setShowAnalysis(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-white transition-all hover:scale-110"><ArrowLeft size={24}/></button>
                        <h2 className="text-3xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
                            <BarChart3 size={28} className="text-cyan-400"/> Phân Tích Chuyển Động
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full mt-8">
                        <div className="bg-[#0f172a] p-10 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors"></div>
                            <span className="text-slate-400 text-lg uppercase tracking-wider mb-2 font-bold relative z-10">Thời gian bay (t)</span>
                            <span className="text-7xl font-black text-cyan-400 relative z-10 font-display">{analysisResult.flightTime.toFixed(2)}<span className="text-2xl ml-2 text-cyan-600">s</span></span>
                        </div>
                        <div className="bg-[#0f172a] p-10 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
                            <span className="text-slate-400 text-lg uppercase tracking-wider mb-2 font-bold relative z-10">Độ cao cực đại (h)</span>
                            <span className="text-7xl font-black text-purple-400 relative z-10 font-display">{analysisResult.maxHeight.toFixed(2)}<span className="text-2xl ml-2 text-purple-600">m</span></span>
                        </div>
                        <div className="bg-[#0f172a] p-10 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                            <span className="text-slate-400 text-lg uppercase tracking-wider mb-2 font-bold relative z-10">Tầm xa (L)</span>
                            <span className="text-7xl font-black text-emerald-400 relative z-10 font-display">{analysisResult.range.toFixed(2)}<span className="text-2xl ml-2 text-emerald-600">m</span></span>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto w-full mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] p-8 flex flex-col">
                             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BrainCircuit size={24} className="text-indigo-400"/> Phân tích từ AI</h3>
                             <div className="flex-1">
                                 {isAnalyzing ? (
                                     <div className="flex items-center justify-center h-full gap-3 text-cyan-400 animate-pulse min-h-[150px]">
                                         <BrainCircuit size={32}/> Đang phân tích dữ liệu...
                                     </div>
                                 ) : aiAnalysis ? (
                                     <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-light">
                                         {aiAnalysis.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                     </div>
                                 ) : (
                                     <div className="text-center text-slate-500 min-h-[150px] flex items-center justify-center">Chưa có dữ liệu phân tích.</div>
                                 )}
                             </div>
                         </div>

                         <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] p-8">
                             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Zap size={24} className="text-yellow-400"/> Lịch sử bắn</h3>
                             <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scroll pr-2">
                                {shotHistory.length === 0 ? <p className="text-slate-500 text-center italic">Chưa có dữ liệu bắn.</p> : shotHistory.map((shot, idx) => (
                                    <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center text-sm">
                                        <div>
                                            <div className="font-bold text-slate-300 mb-1">Lần {idx + 1}</div>
                                            <div className="text-xs text-slate-500">v0={shot.params.v0}, α={shot.params.angle}°</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-cyan-400 font-mono">{shot.result.range.toFixed(1)}m</div>
                                            <div className="text-xs text-slate-500">Tầm xa</div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                         </div>
                    </div>
                </div>
            )}

            <div className="absolute top-4 right-4 flex flex-col gap-4 z-20 items-end">
                <div className="flex gap-2 justify-end">
                     <button onClick={() => setParams(p => ({...p, zoom: Math.min(2, p.zoom + 0.1)}))} className="p-2 bg-black/50 backdrop-blur rounded-lg border border-white/10 hover:bg-white/10 text-white"><ZoomIn size={16}/></button>
                     <button onClick={() => setParams(p => ({...p, zoom: Math.max(0.2, p.zoom - 0.1)}))} className="p-2 bg-black/50 backdrop-blur rounded-lg border border-white/10 hover:bg-white/10 text-white"><ZoomOut size={16}/></button>
                </div>
            </div>

            <div className={`flex-1 relative bg-[#050508] overflow-hidden ${interactionMode === 'dragHeight' ? 'cursor-ns-resize' : 'cursor-move'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            <div className="w-80 bg-[#0a0a0f] border-l border-white/5 overflow-y-auto custom-scroll p-6 space-y-8 z-10 shrink-0 shadow-2xl">
                <div className="space-y-6">
                    {/* Main Controls Moved Here */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                        <div className="flex gap-2">
                             <button onClick={handleFire} 
                                className={`flex-1 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${state.isPlaying && !state.isPaused
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30' 
                                    : state.isPaused 
                                        ? 'bg-emerald-600 text-white border border-emerald-400'
                                        : 'bg-cyan-600 text-white border border-cyan-400 hover:bg-cyan-500 hover:shadow-cyan-500/40'}`}>
                                {state.isPlaying && !state.isPaused ? <><Pause size={18} fill="currentColor"/> Dừng</> : state.isPaused ? <><Play size={18} fill="currentColor"/> Tiếp tục</> : <><Play size={18} fill="currentColor"/> Bắn</>}
                            </button>
                             <button onClick={handleClearHistory} title="Xóa quỹ đạo cũ" className="p-3 rounded-lg bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 transition-colors border border-white/5 hover:border-red-500/30"><Trash2 size={18} /></button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowAnalysis(true)} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/5"><BarChart3 size={16}/> Xem Chỉ Số</button>
                            <button onClick={handleAnalyzeAI} className="flex-1 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-lg text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-indigo-500/30"><BrainCircuit size={16}/> Hỏi AI</button>
                        </div>
                    </div>

                    <label className="flex items-center justify-between cursor-pointer group bg-white/5 p-3 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-2"><Move size={16}/> Hiển thị Vector</span>
                        <input type="checkbox" checked={showVectors} onChange={e => setShowVectors(e.target.checked)} className="accent-cyan-500 w-4 h-4"/>
                    </label>

                    {/* Energy Chart */}
                    <div className="bg-black/40 border border-white/10 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-white/10 pb-2">
                            <Zap size={14} className="text-yellow-400"/> Biểu đồ năng lượng
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Động năng ($W_đ$)</span><span>{energyData.ke.toFixed(1)} J</span></div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 transition-all duration-75" style={{width: `${(energyData.ke / (energyData.total || 1)) * 100}%`}}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Thế năng ($W_t$)</span><span>{energyData.pe.toFixed(1)} J</span></div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple-400 transition-all duration-75" style={{width: `${(energyData.pe / (energyData.total || 1)) * 100}%`}}></div></div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2"><Sliders size={14}/> Thông số cơ bản</h3>
                    
                    <div className="space-y-2">
                         <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Độ cao (h0)</span><span className="text-cyan-400">{params.h0.toFixed(1)} m</span></div>
                         <div className="flex items-center gap-2">
                            <input type="range" min="0" max="100" value={params.h0} onChange={(e) => setParams({...params, h0: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"/>
                            <MoveVertical size={14} className="text-slate-500"/>
                         </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Vận tốc đầu (v0)</span><span className="text-cyan-400">{params.v0} m/s</span></div>
                        <input type="range" min="0" max="150" value={params.v0} onChange={(e) => setParams({...params, v0: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"/>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Góc ném (α)</span><span className="text-cyan-400">{params.angle}°</span></div>
                        <input type="range" min="0" max="90" value={params.angle} onChange={(e) => setParams({...params, angle: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"/>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Gia tốc ($g$)</span><span className="text-rose-400">{params.g.toFixed(2)} m/s²</span></div>
                        <input type="range" min="0" max="20" step="0.1" value={params.g} onChange={(e) => setParams({...params, g: Number(e.target.value)})} className="w-full accent-rose-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"/>
                    </div>

                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2 pt-4"><Wind size={14}/> Thông số nâng cao</h3>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Khối lượng (m)</span><span className="text-indigo-400">{params.m} kg</span></div>
                        <input type="range" min="0.1" max="50" step="0.1" value={params.m} onChange={(e) => setParams({...params, m: Number(e.target.value)})} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg cursor-pointer"/>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Lực cản không khí</span><span className="text-indigo-400">{params.drag.toFixed(2)}</span></div>
                        <input type="range" min="0" max="1" step="0.01" value={params.drag} onChange={(e) => setParams({...params, drag: Number(e.target.value)})} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg cursor-pointer"/>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Độ xoáy (Magnus)</span><span className="text-indigo-400">{params.spin.toFixed(1)}</span></div>
                        <input type="range" min="-10" max="10" step="0.1" value={params.spin} onChange={(e) => setParams({...params, spin: Number(e.target.value)})} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg cursor-pointer"/>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Độ đàn hồi</span><span className="text-indigo-400">{params.elasticity.toFixed(1)}</span></div>
                        <input type="range" min="0" max="1" step="0.1" value={params.elasticity} onChange={(e) => setParams({...params, elasticity: Number(e.target.value)})} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg cursor-pointer"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectileSim;
    