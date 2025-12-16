
import React, { useState, useEffect, useRef } from 'react';
import { DoublePendulumState } from '../types';
import { Play, Pause, RotateCcw, Sliders, Activity, Wind, Layers, MousePointer2, Zap, Clock, Move } from 'lucide-react';

// Standard Lagrangian Physics for Double Pendulum
// Calculates angular acceleration for theta1 and theta2
const getDerivatives = (t1: number, t2: number, v1: number, v2: number, p: DoublePendulumState) => {
    const { m1, m2, l1, l2, g } = p;
    
    // Numerator and Denominator parts for theta1 acceleration (acc1)
    const num1 = -g * (2 * m1 + m2) * Math.sin(t1);
    const num2 = -m2 * g * Math.sin(t1 - 2 * t2);
    const num3 = -2 * Math.sin(t1 - t2) * m2;
    const num4 = v2 * v2 * l2 + v1 * v1 * l1 * Math.cos(t1 - t2);
    const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2));
    
    const acc1 = (num1 + num2 + num3 * num4) / den1;

    // Numerator and Denominator parts for theta2 acceleration (acc2)
    const num5 = 2 * Math.sin(t1 - t2);
    const num6 = v1 * v1 * l1 * (m1 + m2);
    const num7 = g * (m1 + m2) * Math.cos(t1);
    const num8 = v2 * v2 * l2 * m2 * Math.cos(t1 - t2);
    const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2));
    
    const acc2 = (num5 * (num6 + num7 + num8)) / den2;

    // Apply damping directly to velocity
    return { 
        acc1: acc1 - (v1 * p.damping), 
        acc2: acc2 - (v2 * p.damping) 
    };
};

// RK4 Integrator for better stability
const rk4Step = (state: {t1: number, t2: number, v1: number, v2: number}, dt: number, params: DoublePendulumState) => {
    const { t1, t2, v1, v2 } = state;

    const k1 = getDerivatives(t1, t2, v1, v2, params);
    
    const k2_t1 = t1 + 0.5 * dt * v1;
    const k2_t2 = t2 + 0.5 * dt * v2;
    const k2_v1 = v1 + 0.5 * dt * k1.acc1;
    const k2_v2 = v2 + 0.5 * dt * k1.acc2;
    const k2 = getDerivatives(k2_t1, k2_t2, k2_v1, k2_v2, params);

    const k3_t1 = t1 + 0.5 * dt * k2_v1;
    const k3_t2 = t2 + 0.5 * dt * k2_v2;
    const k3_v1 = v1 + 0.5 * dt * k2.acc1;
    const k3_v2 = v2 + 0.5 * dt * k2.acc2;
    const k3 = getDerivatives(k3_t1, k3_t2, k3_v1, k3_v2, params);

    const k4_t1 = t1 + dt * k3_v1;
    const k4_t2 = t2 + dt * k3_v2;
    const k4_v1 = v1 + dt * k3.acc1;
    const k4_v2 = v2 + dt * k3.acc2;
    const k4 = getDerivatives(k4_t1, k4_t2, k4_v1, k4_v2, params);

    return {
        t1: t1 + (dt/6) * (v1 + 2*k2_v1 + 2*k3_v1 + k4_v1),
        t2: t2 + (dt/6) * (v2 + 2*k2_v2 + 2*k3_v2 + k4_v2),
        v1: v1 + (dt/6) * (k1.acc1 + 2*k2.acc1 + 2*k3.acc1 + k4.acc1),
        v2: v2 + (dt/6) * (k1.acc2 + 2*k2.acc2 + 2*k3.acc2 + k4.acc2),
    };
};

const DoublePendulumSim: React.FC = () => {
    const [params, setParams] = useState<DoublePendulumState>({
        m1: 10, m2: 10, l1: 150, l2: 150, g: 9.81, damping: 0.0, simSpeed: 1.0,
        theta1_0: Math.PI / 2, theta2_0: Math.PI / 2,
        showShadow: false, showHeatmap: false, showPhaseSpace: false,
        stroboscopic: false, showVectors: false, isPlaying: false
    });

    // Refs for physics engine
    const physRef = useRef({
        t1: Math.PI / 2, t2: Math.PI / 2,
        v1: 0, v2: 0,
        // Shadow pendulum (for chaos demonstration)
        s_t1: Math.PI / 2 + 0.01, s_t2: Math.PI / 2,
        s_v1: 0, s_v2: 0,
        trace: [] as {x: number, y: number, v: number, life: number}[],
        phaseData: [] as {t1: number, v1: number}[],
        strobeBuffer: [] as {x1: number, y1: number, x2: number, y2: number, alpha: number}[]
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Reset
    const handleReset = () => {
        setParams(prev => ({ ...prev, isPlaying: false }));
        physRef.current = {
            t1: params.theta1_0, t2: params.theta2_0, v1: 0, v2: 0,
            s_t1: params.theta1_0 + 0.01, s_t2: params.theta2_0, s_v1: 0, s_v2: 0,
            trace: [], phaseData: [], strobeBuffer: []
        };
        const cvs = canvasRef.current;
        if(cvs) {
            const ctx = cvs.getContext('2d');
            ctx?.clearRect(0,0,cvs.width, cvs.height);
        }
    };

    // Render Loop
    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return;
        const ctx = cvs.getContext('2d', { alpha: false }); if (!ctx) return;
        let animationFrameId: number;
        
        const render = () => {
            const w = cvs.width = cvs.parentElement?.clientWidth || 800;
            const h = cvs.height = cvs.parentElement?.clientHeight || 600;
            const cx = w / 2;
            const cy = h / 3;

            // Physics Update (RK4 for stability)
            if (params.isPlaying) {
                const dt = 0.1 * params.simSpeed; 
                const steps = 4; // Sub-steps for precision

                for(let i=0; i<steps; i++) {
                    const nextState = rk4Step(
                        { t1: physRef.current.t1, t2: physRef.current.t2, v1: physRef.current.v1, v2: physRef.current.v2 },
                        dt/steps, params
                    );
                    physRef.current.t1 = nextState.t1; physRef.current.t2 = nextState.t2;
                    physRef.current.v1 = nextState.v1; physRef.current.v2 = nextState.v2;

                    // Shadow Pendulum
                    if (params.showShadow) {
                        const sState = rk4Step(
                            { t1: physRef.current.s_t1, t2: physRef.current.s_t2, v1: physRef.current.s_v1, v2: physRef.current.s_v2 },
                            dt/steps, params
                        );
                        physRef.current.s_t1 = sState.t1; physRef.current.s_t2 = sState.t2;
                        physRef.current.s_v1 = sState.v1; physRef.current.s_v2 = sState.v2;
                    }
                }

                // Calculate coords for trace
                const x1 = cx + params.l1 * Math.sin(physRef.current.t1);
                const y1 = cy + params.l1 * Math.cos(physRef.current.t1);
                const x2 = x1 + params.l2 * Math.sin(physRef.current.t2);
                const y2 = y1 + params.l2 * Math.cos(physRef.current.t2);
                
                const vTotal = Math.sqrt(Math.pow(physRef.current.v1 * params.l1, 2) + Math.pow(physRef.current.v2 * params.l2, 2));

                // Trace Buffer (with lifetime for fade out)
                physRef.current.trace.push({ x: x2, y: y2, v: vTotal, life: 1.0 });
                if (physRef.current.trace.length > 800) physRef.current.trace.shift();

                // Phase Space Buffer
                physRef.current.phaseData.push({ t1: physRef.current.t1, v1: physRef.current.v1 });
                if (physRef.current.phaseData.length > 500) physRef.current.phaseData.shift();
                
                // Stroboscopic Buffer
                if (params.stroboscopic && Math.random() < 0.05) { 
                     physRef.current.strobeBuffer.push({x1, y1, x2, y2, alpha: 1.0});
                }
            }

            // --- DRAWING ---
            ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, w, h);

            // 1. Trace (Heatmap or Solid)
            if (physRef.current.trace.length > 1) {
                // Decay trace life
                physRef.current.trace.forEach(p => p.life -= 0.002);
                physRef.current.trace = physRef.current.trace.filter(p => p.life > 0);

                // Draw segments
                for (let i = 0; i < physRef.current.trace.length - 1; i++) {
                    const p1 = physRef.current.trace[i];
                    const p2 = physRef.current.trace[i+1];
                    
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    
                    // Alpha based on life
                    const alpha = Math.max(0, p1.life);
                    
                    if (params.showHeatmap) {
                        const speed = p1.v;
                        const hue = Math.max(0, 240 - speed * 5); 
                        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
                    } else {
                        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
                    }
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            // 2. Stroboscopic View
            if (params.stroboscopic) {
                physRef.current.strobeBuffer.forEach((s, i) => {
                    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * 0.1})`;
                    ctx.lineWidth = 1; ctx.stroke();
                    s.alpha -= 0.005;
                });
                physRef.current.strobeBuffer = physRef.current.strobeBuffer.filter(s => s.alpha > 0);
            }

            // 3. Shadow Pendulum & VECTORS
            if (params.showShadow) {
                const sx1 = cx + params.l1 * Math.sin(physRef.current.s_t1);
                const sy1 = cy + params.l1 * Math.cos(physRef.current.s_t1);
                const sx2 = sx1 + params.l2 * Math.sin(physRef.current.s_t2);
                const sy2 = sy1 + params.l2 * Math.cos(physRef.current.s_t2);
                
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx1, sy1); ctx.lineTo(sx2, sy2); ctx.stroke();
                ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; ctx.beginPath(); ctx.arc(sx1, sy1, 8, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(sx2, sy2, 8, 0, Math.PI*2); ctx.fill();
            }

            // 4. Main Pendulum
            const x1 = cx + params.l1 * Math.sin(physRef.current.t1);
            const y1 = cy + params.l1 * Math.cos(physRef.current.t1);
            const x2 = x1 + params.l2 * Math.sin(physRef.current.t2);
            const y2 = y1 + params.l2 * Math.cos(physRef.current.t2);

            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

            // Masses
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2); ctx.fill(); // Pivot
            ctx.beginPath(); ctx.arc(x1, y1, Math.sqrt(params.m1)*4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x2, y2, Math.sqrt(params.m2)*4, 0, Math.PI*2); ctx.fill();

            // 5. Force Vectors (Main)
            if (params.showVectors) {
                // Velocity Vector
                const vx2 = physRef.current.v2 * params.l2 * Math.cos(physRef.current.t2);
                const vy2 = -physRef.current.v2 * params.l2 * Math.sin(physRef.current.t2);
                
                ctx.strokeStyle = '#10b981'; ctx.lineWidth=2; 
                ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 + vx2*3, y2 + vy2*3); ctx.stroke();
                
                // Gravity
                ctx.strokeStyle = '#ef4444'; 
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, y1 + params.m1 * params.g * 5); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2, y2 + params.m2 * params.g * 5); ctx.stroke();
            }

            // 6. Phase Space Overlay (Bottom Right)
            if (params.showPhaseSpace) {
                const psW = 200, psH = 150;
                const psX = w - psW - 20, psY = h - psH - 20;
                
                ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(psX, psY, psW, psH);
                ctx.strokeStyle = '#334155'; ctx.strokeRect(psX, psY, psW, psH);
                
                ctx.fillStyle = '#facc15';
                physRef.current.phaseData.forEach(p => {
                    const px = psX + psW/2 + (p.t1 % (Math.PI*2)) * 20; 
                    const py = psY + psH/2 - p.v1 * 50;
                    if(px > psX && px < psX+psW && py > psY && py < psY+psH) ctx.fillRect(px, py, 1, 1);
                });
                ctx.font = '10px sans-serif'; ctx.fillStyle='#fff'; ctx.fillText('Phase Space (θ vs ω)', psX + 5, psY + 15);
            }

            animationFrameId = requestAnimationFrame(render);
        };
        animationFrameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrameId);
    }, [params]);

    const Description = ({ text }: { text: string }) => (
        <p className="text-[10px] text-slate-500 leading-relaxed border-l-2 border-white/10 pl-2 mt-1 italic">{text}</p>
    );

    return (
        <div className="flex h-full w-full relative">
            <div className="flex-1 relative bg-[#050508] overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            <div className="w-80 bg-[#0a0a0f] border-l border-white/5 overflow-y-auto custom-scroll p-6 space-y-8 z-10 shrink-0 shadow-2xl">
                {/* Main Controls */}
                <div className="bg-white/5 p-4 rounded-xl space-y-3">
                    <div className="flex gap-2">
                        <button onClick={() => setParams(p => ({...p, isPlaying: !p.isPlaying}))} 
                            className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${params.isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-cyan-600 text-white'}`}>
                            {params.isPlaying ? <><Pause size={18}/> Stop</> : <><Play size={18}/> Start</>}
                        </button>
                        <button onClick={handleReset} className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white"><RotateCcw size={18} /></button>
                    </div>
                </div>

                {/* Physics Params */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2"><Sliders size={14}/> Vật lý hệ thống</h3>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Khối lượng m1/m2</span><span className="text-cyan-400">{params.m1}/{params.m2}</span></div>
                        <div className="flex gap-2">
                            <input type="range" min="1" max="50" value={params.m1} onChange={(e) => setParams({...params, m1: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded"/>
                            <input type="range" min="1" max="50" value={params.m2} onChange={(e) => setParams({...params, m2: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded"/>
                        </div>
                    </div>

                    <div className="space-y-2">
                         <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Trọng trường (g)</span><span className="text-cyan-400">{params.g}</span></div>
                         <input type="range" min="1" max="30" step="0.1" value={params.g} onChange={(e) => setParams({...params, g: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded"/>
                    </div>

                    <div className="space-y-2">
                         <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Ma sát (Damping)</span><span className="text-cyan-400">{params.damping}</span></div>
                         <input type="range" min="0" max="0.1" step="0.001" value={params.damping} onChange={(e) => setParams({...params, damping: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded"/>
                    </div>
                </div>

                {/* Advanced Features */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2"><Zap size={14}/> Tính năng Pro</h3>
                    
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs text-slate-300 flex items-center gap-2"><Layers size={14}/> Bóng ma hỗn loạn</span>
                        <input type="checkbox" checked={params.showShadow} onChange={e => setParams({...params, showShadow: e.target.checked})} className="accent-red-500"/>
                    </label>
                    <Description text="Thêm con lắc thứ 2 lệch 0.01 rad để thấy sự phân kỳ (Hiệu ứng cánh bướm)."/>

                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs text-slate-300 flex items-center gap-2"><Activity size={14}/> Bản đồ nhiệt vận tốc</span>
                        <input type="checkbox" checked={params.showHeatmap} onChange={e => setParams({...params, showHeatmap: e.target.checked})} className="accent-cyan-500"/>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs text-slate-300 flex items-center gap-2"><Clock size={14}/> Chế độ Hoạt nghiệm</span>
                        <input type="checkbox" checked={params.stroboscopic} onChange={e => setParams({...params, stroboscopic: e.target.checked})} className="accent-cyan-500"/>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs text-slate-300 flex items-center gap-2"><Move size={14}/> Vector Lực</span>
                        <input type="checkbox" checked={params.showVectors} onChange={e => setParams({...params, showVectors: e.target.checked})} className="accent-cyan-500"/>
                    </label>

                     <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs text-slate-300 flex items-center gap-2"><Activity size={14}/> Không gian pha</span>
                        <input type="checkbox" checked={params.showPhaseSpace} onChange={e => setParams({...params, showPhaseSpace: e.target.checked})} className="accent-cyan-500"/>
                    </label>
                </div>

                 <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Tốc độ mô phỏng</span><span className="text-yellow-400">{params.simSpeed}x</span></div>
                        <input type="range" min="0.1" max="3" step="0.1" value={params.simSpeed} onChange={(e) => setParams({...params, simSpeed: Number(e.target.value)})} className="w-full accent-yellow-500 h-1 bg-white/10 rounded"/>
                </div>
            </div>
        </div>
    );
};

export default DoublePendulumSim;
