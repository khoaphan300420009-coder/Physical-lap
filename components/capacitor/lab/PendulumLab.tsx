
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, ArrowRight, Zap, Settings, Ruler, Timer, Wind, Anchor, Move, Layers, TrendingUp, Scissors, Magnet } from 'lucide-react';

type LabType = 'Simple' | 'Spring';
type ScenarioId = number;

interface PendulumState {
    theta: number;
    omega: number;
    time: number;
    history: {t: number, val: number}[];
    energyHistory: {ke: number, pe: number}[];
}

interface SpringState {
    x: number;
    v: number;
    time: number;
    history: {t: number, val: number}[];
    energyHistory: {ke: number, pe: number}[];
}

const PendulumLab: React.FC = () => {
    const [labType, setLabType] = useState<LabType>('Simple');
    const [scenario, setScenario] = useState<ScenarioId>(1);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Feature Toggles
    const [showVectors, setShowVectors] = useState(false);
    const [showGraph, setShowGraph] = useState(true);

    // Common Params
    const [g, setG] = useState(9.81);
    const [mass, setMass] = useState(1.0);
    const [damping, setDamping] = useState(0.0);
    const [drivingFreq, setDrivingFreq] = useState(0);
    const [drivingAmp, setDrivingAmp] = useState(0);

    // Simple Pendulum Specifics
    const [length, setLength] = useState(1.0);
    const [initialAngle, setInitialAngle] = useState(10); // Degrees
    const [elevatorAcc, setElevatorAcc] = useState(0); // m/s^2
    const [carAcc, setCarAcc] = useState(0); // m/s^2
    const [pegY, setPegY] = useState(0.5); // Distance from top
    const [isCut, setIsCut] = useState(false);
    
    // Spring Pendulum Specifics
    const [k, setK] = useState(50);
    const [initialX, setInitialX] = useState(0.2); // Meters
    const [inclineAngle, setInclineAngle] = useState(0); // Degrees
    const [electricField, setElectricField] = useState(0);
    const [charge, setCharge] = useState(0);
    const [isVertical, setIsVertical] = useState(false);
    const [isDetached, setIsDetached] = useState(false);

    // Physics Refs
    const pRef = useRef<PendulumState>({ theta: 0, omega: 0, time: 0, history: [], energyHistory: [] });
    const sRef = useRef<SpringState>({ x: 0, v: 0, time: 0, history: [], energyHistory: [] });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Reset logic
    const reset = () => {
        setIsPlaying(false);
        setIsCut(false);
        setIsDetached(false);
        pRef.current = { theta: initialAngle * Math.PI / 180, omega: 0, time: 0, history: [], energyHistory: [] };
        sRef.current = { x: initialX, v: 0, time: 0, history: [], energyHistory: [] };
        
        // Scenario specific defaults
        if(scenario === 2 && labType==='Spring') setIsVertical(true);
        if(scenario === 7 && labType==='Spring') setInclineAngle(30); else if (scenario !== 7) setInclineAngle(0);
    };

    useEffect(() => { reset(); }, [labType, scenario]);

    // Helper: Draw Arrow
    const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
        const headlen = 10;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY); ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.fill();
    };

    // Physics Engine
    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return;
        const ctx = cvs.getContext('2d'); if (!ctx) return;
        let frameId: number;

        const dt = 0.016;

        const updateSimple = () => {
            if (!isPlaying) return;
            const s = pRef.current;
            s.time += dt;

            if (isCut) {
                s.theta += s.omega * dt; 
                return;
            }

            let effG = g;
            let eqShift = 0;
            // Scenario 7: Elevator
            effG = g + elevatorAcc;
            // Scenario 8: Car
            if (carAcc !== 0) {
                effG = Math.sqrt(g*g + carAcc*carAcc);
                eqShift = Math.atan(carAcc/g);
            }

            let currL = length;
            if (scenario === 5 && s.theta > 0) currL = length - pegY;

            const driving = drivingAmp * Math.cos(drivingFreq * s.time);
            const alpha = -(effG / currL) * Math.sin(s.theta - eqShift) - damping * s.omega + driving;
            
            s.omega += alpha * dt;
            s.theta += s.omega * dt;

            if (s.time % 0.05 < dt) {
                s.history.push({t: s.time, val: s.theta});
                if (s.history.length > 100) s.history.shift();
                const ke = 0.5 * mass * (currL * s.omega)**2;
                const pe = mass * effG * currL * (1 - Math.cos(s.theta));
                s.energyHistory.push({ke, pe});
                if (s.energyHistory.length > 100) s.energyHistory.shift();
            }
        };

        const updateSpring = () => {
            if (!isPlaying) return;
            const s = sRef.current;
            s.time += dt;

            let eqPos = 0; 
            let effK = k;
            if (scenario === 2 || isVertical) eqPos = (mass * g) / k;
            if (scenario === 7) eqPos = (mass * g * Math.sin(inclineAngle * Math.PI/180)) / k;
            if (scenario === 11) eqPos += (charge * electricField) / k;

            const driving = drivingAmp * Math.cos(drivingFreq * s.time);
            const accel = (-(effK * (s.x - eqPos)) - damping * s.v + driving) / mass;
            
            s.v += accel * dt;
            s.x += s.v * dt;

            if (scenario === 13 && isVertical && accel < -g) setIsDetached(true);

             if (s.time % 0.05 < dt) {
                s.history.push({t: s.time, val: s.x - eqPos}); 
                if (s.history.length > 100) s.history.shift();
                const ke = 0.5 * mass * s.v**2;
                const pe = 0.5 * k * (s.x - eqPos)**2;
                s.energyHistory.push({ke, pe});
                if (s.energyHistory.length > 100) s.energyHistory.shift();
            }
        };

        const render = () => {
            const w = cvs.width = cvs.clientWidth;
            const h = cvs.height = cvs.clientHeight;
            const cx = w / 2;
            const cy = labType === 'Simple' ? h/4 : h/2;

            ctx.fillStyle = '#050508'; ctx.fillRect(0,0,w,h);
            
            // Grid
            ctx.strokeStyle = '#1e293b'; ctx.beginPath();
            for(let x=0; x<w; x+=50) { ctx.moveTo(x,0); ctx.lineTo(x,h); }
            for(let y=0; y<h; y+=50) { ctx.moveTo(0,y); ctx.lineTo(w,y); }
            ctx.stroke();

            // --- DRAWING PHYSICS ---
            if (labType === 'Simple') {
                updateSimple();
                const s = pRef.current;
                
                // Pivot
                ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - 20, cy - 5, 40, 5);

                let bobX, bobY;
                const scale = 200; 
                
                // Peg logic
                if (scenario === 5 && s.theta > 0) {
                    const pegScreenY = cy + pegY * scale;
                    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(cx, pegScreenY, 3, 0, Math.PI*2); ctx.fill();
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, pegScreenY); ctx.stroke();
                    const subL = length - pegY;
                    bobX = cx + subL * scale * Math.sin(s.theta);
                    bobY = pegScreenY + subL * scale * Math.cos(s.theta);
                    ctx.beginPath(); ctx.moveTo(cx, pegScreenY); ctx.lineTo(bobX, bobY); ctx.stroke();
                } else {
                    bobX = cx + length * scale * Math.sin(s.theta);
                    bobY = cy + length * scale * Math.cos(s.theta);
                    if (!isCut) {
                        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bobX, bobY); ctx.stroke();
                    } else {
                        bobY += s.time * 50; 
                    }
                }

                // Bob
                ctx.fillStyle = '#3b82f6'; 
                ctx.beginPath(); ctx.arc(bobX, bobY, 15 * Math.pow(mass, 0.3), 0, Math.PI*2); ctx.fill();
                
                // Vectors (Simple)
                if (showVectors && !isCut) {
                     // Gravity P (Always down)
                     drawArrow(ctx, bobX, bobY, bobX, bobY + mass * g * 5, '#ef4444');
                     ctx.fillStyle = '#ef4444'; ctx.fillText('P', bobX + 5, bobY + mass * g * 5);

                     // Tension T (Along string)
                     const dx = cx - bobX; const dy = cy - bobY; // Vector to pivot (approx)
                     const len = Math.sqrt(dx*dx + dy*dy);
                     // T approx equals component of P + centripetal force
                     const T_mag = mass * g * Math.cos(s.theta) + mass * length * s.omega**2;
                     const tx = (dx/len) * T_mag * 5;
                     const ty = (dy/len) * T_mag * 5;
                     
                     if (scenario !== 5 || s.theta <= 0) { // Only draw simple T when straight
                        drawArrow(ctx, bobX, bobY, bobX + tx, bobY + ty, '#facc15');
                        ctx.fillStyle = '#facc15'; ctx.fillText('T', bobX + tx + 5, bobY + ty);
                     }
                }

            } else {
                // SPRING RENDER
                updateSpring();
                const s = sRef.current;
                const scale = 200;
                let bobX = cx, bobY = cy;
                
                let eqVis = 0;

                if (scenario === 2 || isVertical) {
                    // Vertical
                    bobY = cy - 200 + s.x * scale;
                    eqVis = cy - 200 + ((mass * g) / k) * scale;
                    
                    ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - 20, cy - 200, 40, 5); 
                    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.beginPath();
                    const startY = cy - 200;
                    const endY = bobY - 15;
                    const coils = 12;
                    ctx.moveTo(cx, startY);
                    for(let i=0; i<=coils; i++) {
                        const y = startY + (endY - startY) * (i/coils);
                        const x = cx + (i%2===0 ? 10 : -10);
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(cx, endY);
                    ctx.stroke();

                    // Mass
                    ctx.fillStyle = '#3b82f6'; ctx.fillRect(bobX - 15, bobY - 15, 30, 30);

                    // Vectors
                    if (showVectors) {
                        // Gravity P
                        drawArrow(ctx, bobX, bobY, bobX, bobY + mass * g * 5, '#ef4444');
                        // Elastic F
                        const deltaL = s.x; // Total extension
                        const Fdh = -k * deltaL; // Force vector magnitude
                        drawArrow(ctx, bobX, bobY-15, bobX, bobY-15 + Fdh * 0.5, '#facc15');
                    }

                } else if (scenario === 7) {
                    // Inclined Plane (omitted complex vectors for brevity, just draw main setup)
                    const angle = inclineAngle * Math.PI / 180;
                    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
                    ctx.fillStyle = '#334155'; ctx.fillRect(-300, 20, 600, 10);
                    bobX = (s.x - 0.5) * scale; bobY = 0;
                    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.beginPath();
                    ctx.moveTo(-300, 0); ctx.lineTo(bobX - 15, 0); ctx.stroke();
                    ctx.fillStyle = '#3b82f6'; ctx.fillRect(bobX - 15, -15, 30, 30);
                    
                    if(showVectors) {
                        drawArrow(ctx, bobX, 0, bobX, 0 + mass*g*3, '#ef4444'); // P relative to world (rotated view) -> messy in rotated ctx
                    }
                    ctx.restore();
                    // Skip graph for inclined for now
                    frameId = requestAnimationFrame(render); return;

                } else {
                    // Horizontal
                    bobX = cx + (s.x - 0.5) * scale;
                    eqVis = cx + ((0) - 0.5) * scale; // x=0 is spring natural length position usually?
                    
                    ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - 300, cy - 20, 10, 40);
                    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.beginPath();
                    const startX = cx - 290; const endX = bobX - 15;
                    const coils = 15;
                    ctx.moveTo(startX, cy);
                    for(let i=0; i<=coils; i++) {
                        const x = startX + (endX - startX) * (i/coils);
                        const y = cy + (i%2===0 ? 10 : -10);
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(endX, cy); ctx.stroke();
                    ctx.fillStyle = '#3b82f6'; ctx.fillRect(bobX - 15, bobY - 15, 30, 30);

                    if (showVectors) {
                        // Friction or F_elastic
                        const Fdh = -k * (s.x - 0.5); // Deviation from natural length?
                        drawArrow(ctx, bobX, bobY, bobX + Fdh * 0.5, bobY, '#facc15');
                    }
                }
            }

            // --- REAL-TIME MINI GRAPH (Bottom Right) ---
            if (showGraph) {
                const history = labType === 'Simple' ? pRef.current.history : sRef.current.history;
                const eh = labType === 'Simple' ? pRef.current.energyHistory : sRef.current.energyHistory;
                
                const gw = 250, gh = 150;
                const gx = w - gw - 20, gy = h - gh - 20;
                
                // Background
                ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; ctx.fillRect(gx, gy, gw, gh);
                ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh);
                
                // Labels
                ctx.font = '10px monospace';
                ctx.fillStyle = '#22d3ee'; ctx.fillText('Li độ (x)', gx + 10, gy + 15);
                ctx.fillStyle = '#ef4444'; ctx.fillText('Động năng (Wđ)', gx + 70, gy + 15);
                ctx.fillStyle = '#a855f7'; ctx.fillText('Thế năng (Wt)', gx + 150, gy + 15);

                if (history.length > 1) {
                    const t0 = history[0].t;
                    const tMax = history[history.length-1].t;
                    const duration = tMax - t0 || 1;
                    
                    // Draw Displacement (Cyan)
                    ctx.beginPath(); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
                    history.forEach((pt, i) => {
                        const x = gx + ((pt.t - t0) / duration) * gw;
                        const scale = labType === 'Simple' ? 20 : 50; 
                        const y = gy + gh/2 - pt.val * scale;
                        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                    });
                    ctx.stroke();

                    // Draw Energy (Red KE, Purple PE)
                    // Scale energy to fit graph height (find max E?)
                    const maxE = 100; // Arbitrary scale factor
                    const eScale = (gh/2) / maxE; 

                    ctx.beginPath(); ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; ctx.lineWidth = 1; // Red KE
                    eh.forEach((e, i) => {
                        const x = gx + (i / eh.length) * gw;
                        const y = gy + gh - e.ke * 2; // Simple scale
                        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                    });
                    ctx.stroke();

                    ctx.beginPath(); ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)'; ctx.lineWidth = 1; // Purple PE
                    eh.forEach((e, i) => {
                        const x = gx + (i / eh.length) * gw;
                        const y = gy + gh - e.pe * 2;
                        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                    });
                    ctx.stroke();
                }
            }

            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, [labType, scenario, isPlaying, g, length, mass, k, damping, drivingAmp, drivingFreq, initialAngle, initialX, inclineAngle, elevatorAcc, carAcc, pegY, isCut, charge, electricField, showVectors, showGraph]);


    // --- UI CONFIG ---
    const SCENARIOS = {
        Simple: [
            "Cơ bản & Chu kỳ", "Đồ thị động học", "Chuyển hóa năng lượng", "Dao động tắt dần", "Con lắc vướng đinh",
            "Dao động cưỡng bức", "Thang máy (HQC phi quán tính)", "Toa xe gia tốc ngang", "Góc lệch lớn (Phi tuyến)",
            "Phân tích lực Vector", "Không gian pha", "Con lắc đứt dây", "Cuộc đua trọng trường", "Bài toán trùng phùng", "Hỗn loạn (Double)"
        ],
        Spring: [
            "Lò xo ngang lý tưởng", "Lò xo thẳng đứng", "Ghép lò xo", "Lực đàn hồi vs Hồi phục", "Va chạm mềm",
            "Biểu đồ năng lượng", "Mặt phẳng nghiêng", "Giảm xóc ô tô", "Vòng tròn lượng giác", "Cắt ghép lò xo",
            "Trong điện trường", "Hệ ròng rọc", "Hiện tượng buông tay", "Đồ thị Lực", "Lissajous 2D"
        ]
    };

    return (
        <div className="flex h-full w-full bg-[#020408] font-sans">
            {/* Sidebar Controls */}
            <div className="w-80 shrink-0 bg-[#0a0f18] border-r border-white/10 flex flex-col h-full overflow-hidden z-20 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="text-orange-500"/> Lab Dao Động
                    </h2>
                    
                    <div className="flex bg-white/5 p-1 rounded-xl mb-4">
                        <button onClick={() => setLabType('Simple')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${labType==='Simple' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}>Con Lắc Đơn</button>
                        <button onClick={() => setLabType('Spring')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${labType==='Spring' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Lò Xo</button>
                    </div>

                    <div className="relative">
                        <select 
                            value={scenario} 
                            onChange={(e) => setScenario(Number(e.target.value))}
                            className="w-full bg-[#1e293b] border border-white/10 text-white text-sm rounded-lg p-3 appearance-none focus:ring-2 ring-orange-500 outline-none"
                        >
                            {SCENARIOS[labType].map((name, i) => (
                                <option key={i} value={i+1}>{i+1}. {name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6">
                    {/* General Controls */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button onClick={() => setIsPlaying(!isPlaying)} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 mr-2 transition-all ${isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}>
                                {isPlaying ? <><Pause size={18}/> Dừng</> : <><Play size={18}/> Chạy</>}
                            </button>
                            <button onClick={reset} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors"><RotateCcw size={18}/></button>
                        </div>
                        
                        <div className="pt-2 flex flex-col gap-2">
                            <label className="flex items-center justify-between cursor-pointer bg-white/5 p-2 rounded-lg border border-white/5 hover:border-orange-500/50">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><Move size={14}/> Vector Lực</span>
                                <input type="checkbox" checked={showVectors} onChange={e => setShowVectors(e.target.checked)} className="accent-orange-500"/>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer bg-white/5 p-2 rounded-lg border border-white/5 hover:border-orange-500/50">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><TrendingUp size={14}/> Biểu đồ Năng lượng</span>
                                <input type="checkbox" checked={showGraph} onChange={e => setShowGraph(e.target.checked)} className="accent-orange-500"/>
                            </label>
                        </div>
                    </div>

                    <div className="h-px bg-white/10"></div>

                    {/* Parameters */}
                    <div className="space-y-5 animate-[fadeIn_0.3s]">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Thông số vật lý</h3>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300"><span>Khối lượng (m)</span><span className="text-orange-400">{mass} kg</span></div>
                            <input type="range" min="0.1" max="10" step="0.1" value={mass} onChange={e => setMass(Number(e.target.value))} className="w-full accent-orange-500 h-1 bg-white/10 rounded"/>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300"><span>Trọng trường (g)</span><span className="text-orange-400">{g.toFixed(2)} m/s²</span></div>
                            <input type="range" min="1" max="20" step="0.1" value={g} onChange={e => setG(Number(e.target.value))} className="w-full accent-orange-500 h-1 bg-white/10 rounded"/>
                        </div>

                        {labType === 'Simple' ? (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-300"><span>Chiều dài dây (l)</span><span className="text-orange-400">{length} m</span></div>
                                    <input type="range" min="0.1" max="3" step="0.1" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full accent-orange-500 h-1 bg-white/10 rounded"/>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-300"><span>Góc lệch ban đầu</span><span className="text-orange-400">{initialAngle}°</span></div>
                                    <input type="range" min="0" max="90" value={initialAngle} onChange={e => { setInitialAngle(Number(e.target.value)); reset(); }} className="w-full accent-orange-500 h-1 bg-white/10 rounded"/>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-300"><span>Độ cứng (k)</span><span className="text-indigo-400">{k} N/m</span></div>
                                    <input type="range" min="10" max="200" step="5" value={k} onChange={e => setK(Number(e.target.value))} className="w-full accent-indigo-500 h-1 bg-white/10 rounded"/>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-300"><span>Biên độ đầu (A)</span><span className="text-indigo-400">{initialX} m</span></div>
                                    <input type="range" min="0.05" max="1.0" step="0.05" value={initialX} onChange={e => { setInitialX(Number(e.target.value)); reset(); }} className="w-full accent-indigo-500 h-1 bg-white/10 rounded"/>
                                </div>
                            </>
                        )}
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300"><span>Ma sát (Damping)</span><span className="text-red-400">{damping}</span></div>
                            <input type="range" min="0" max="1.0" step="0.01" value={damping} onChange={e => setDamping(Number(e.target.value))} className="w-full accent-red-500 h-1 bg-white/10 rounded"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative bg-[#050508] overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full block" />
                
                {/* Overlay Info */}
                <div className="absolute top-4 left-4 p-4 bg-black/40 backdrop-blur rounded-xl border border-white/5 pointer-events-none">
                    <h1 className="text-2xl font-black text-white font-display uppercase tracking-wide opacity-50">{labType === 'Simple' ? 'Con Lắc Đơn' : 'Con Lắc Lò Xo'}</h1>
                    <p className="text-sm text-orange-400 font-bold mt-1">{SCENARIOS[labType][scenario-1]}</p>
                </div>
            </div>
        </div>
    );
};

export default PendulumLab;
