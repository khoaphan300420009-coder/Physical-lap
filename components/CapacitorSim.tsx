import React, { useState, useEffect, useRef } from 'react';
import { calculateCapacitance, calculateReactance, calculateImpedance } from './capacitor/CapacitorLogic';
import { drawEField, drawCharges, drawWire, drawBattery, drawSwitch, drawRealBulb } from './capacitor/CapacitorRenderer';
import { Play, Pause, RotateCcw, Settings, Zap, Battery, Activity, BoxSelect, Lightbulb, TrendingUp } from 'lucide-react';

const CapacitorSim: React.FC = () => {
    // Inputs
    const [simMode, setSimMode] = useState<'AC' | 'DC'>('AC'); // Chế độ: Xoay chiều hoặc Một chiều (Bóng đèn)
    const [voltage, setVoltage] = useState(12);
    const [resistance, setResistance] = useState(100);
    const [area, setArea] = useState(50); // cm^2
    const [dist, setDist] = useState(5);  // mm
    const [dielectricK, setDielectricK] = useState(1.0);
    const [frequency, setFrequency] = useState(60);
    
    // DC Specific State
    const [switchState, setSwitchState] = useState<'Charge' | 'Discharge'>('Charge');
    const [capVoltage, setCapVoltage] = useState(0); // Điện áp tức thời trên tụ (DC)
    
    // Sim State
    const [isPlaying, setIsPlaying] = useState(true);
    const [time, setTime] = useState(0);
    const [simSpeed, setSimSpeed] = useState(1);

    // Results
    const [C, setC] = useState(0);
    const [Xc, setXc] = useState(0);
    const [Z, setZ] = useState(0);
    const [I, setI] = useState(0); // Current RMS (AC) or Instant (DC)
    const [Q, setQ] = useState(0); // Max Charge

    const canvasRef = useRef<HTMLCanvasElement>(null); 
    const graphRef = useRef<HTMLCanvasElement>(null);

    // Physics Calculation Loop
    useEffect(() => {
        const cap = calculateCapacitance(dielectricK, area, dist);
        
        if (simMode === 'AC') {
            const reac = calculateReactance(frequency, cap);
            const imp = calculateImpedance(resistance, reac);
            const current = voltage / imp;
            const charge = cap * voltage;
            
            setC(cap); setXc(reac); setZ(imp); setI(current); setQ(charge);
        } else {
            // DC Mode Calculations
            setC(cap);
            setXc(0); setZ(resistance);
            // I and Q are calculated in the animation loop for transient response
        }
    }, [voltage, resistance, area, dist, dielectricK, frequency, simMode]);

    // Visual & Physics Loop
    useEffect(() => {
        const cvs = canvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;

        let lastTime = performance.now();
        let frameId: number;

        const render = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1) * simSpeed; // seconds
            lastTime = now;

            const w = cvs.width = cvs.clientWidth;
            const h = cvs.height = cvs.clientHeight;
            const cx = w / 2;
            const cy = h / 2;

            // --- 1. Physics Update (DC Transient) ---
            let currentV = 0;
            let currentI = 0;

            if (simMode === 'DC' && isPlaying) {
                // RC Circuit Physics
                // dV/dt = I / C
                if (switchState === 'Charge') {
                    // Charging from Battery: V_source -> R -> C
                    // I = (V_source - V_c) / R
                    currentI = (voltage - capVoltage) / resistance;
                    const dV = (currentI / C) * dt;
                    if (C > 0) setCapVoltage(v => Math.min(voltage, v + dV));
                } else {
                    // Discharging to Bulb: C -> Bulb (Resistance)
                    // I = V_c / R_bulb (Assume Bulb R = Input Resistance for simplicity)
                    currentI = capVoltage / resistance; 
                    const dV = -(currentI / C) * dt;
                    if (C > 0) setCapVoltage(v => Math.max(0, v + dV));
                }
                currentV = capVoltage;
                setI(currentI);
                setQ(C * currentV);
            } else if (simMode === 'AC') {
                if (isPlaying) setTime(t => t + 0.05 * simSpeed);
                currentV = voltage * Math.sin(time);
                currentI = I * Math.sin(time + Math.PI/2); // Approx phase
            }

            // --- 2. Drawing ---
            ctx.clearRect(0, 0, w, h);

            // Layout Constants
            const plateW = Math.min(w * 0.3, 20 + area * 1.5); 
            const plateH = 12;
            const gap = Math.min(h * 0.3, 10 + dist * 5); 
            const plateTopY = cy - gap/2 - plateH;
            const plateBotY = cy + gap/2;
            const batX = cx - w * 0.3;
            const bulbX = cx + w * 0.3;
            const swX = cx; 
            const swY = plateTopY - 60;

            // --- Draw Wires ---
            // Common Top Wire (to Switch)
            drawWire(ctx, [{x: cx, y: plateTopY}, {x: cx, y: swY}]);
            
            // Common Bottom Wire (Loop return)
            drawWire(ctx, [{x: cx, y: plateBotY + plateH}, {x: cx, y: plateBotY + 60}, {x: batX, y: plateBotY + 60}]);
            drawWire(ctx, [{x: cx, y: plateBotY + 60}, {x: bulbX, y: plateBotY + 60}]);

            // Left Circuit (Battery)
            drawWire(ctx, [{x: batX, y: plateBotY + 60}, {x: batX, y: swY}]);
            drawWire(ctx, [{x: batX - 40, y: swY}, {x: swX - 40, y: swY}]); // From battery top to switch left

            if (simMode === 'DC') {
                // Right Circuit (Bulb)
                drawWire(ctx, [{x: bulbX, y: plateBotY + 60}, {x: bulbX, y: swY}]);
                drawWire(ctx, [{x: bulbX, y: swY}, {x: swX + 40, y: swY}]); // From bulb top to switch right
                
                // Draw Components
                drawBattery(ctx, batX, cy, voltage);
                
                const brightness = Math.min(1, (currentI * resistance) / 12); 
                drawRealBulb(ctx, bulbX, cy, brightness);

                // Draw Switch
                drawSwitch(ctx, swX, swY, switchState === 'Charge' ? 'Left' : 'Right', 'Nguồn', 'Đèn');

            } else {
                // AC Mode: Simple loop
                drawWire(ctx, [{x: batX, y: plateBotY + 60}, {x: batX, y: swY}, {x: cx, y: swY}]);
                // AC Source Symbol
                ctx.beginPath(); ctx.arc(batX, cy, 25, 0, Math.PI*2); ctx.fillStyle='#1e293b'; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle='#fff'; ctx.stroke();
                ctx.beginPath(); ctx.moveTo(batX-15, cy); ctx.bezierCurveTo(batX-5, cy-15, batX+5, cy+15, batX+15, cy); ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.fillText('~AC', batX, cy + 35);
                
                // Switch closed to AC (Left) implicitly or just draw wire
                drawSwitch(ctx, swX, swY, 'Left', 'AC', '');
            }

            // --- Draw Capacitor ---
            // Top Plate
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - plateW/2, plateTopY, plateW, plateH);
            // Bottom Plate
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - plateW/2, plateBotY, plateW, plateH);
            // Metallic borders
            ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; 
            ctx.strokeRect(cx - plateW/2, plateTopY, plateW, plateH);
            ctx.strokeRect(cx - plateW/2, plateBotY, plateW, plateH);

            // Dielectric
            if (dielectricK > 1) {
                ctx.fillStyle = dielectricK > 5 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(253, 224, 71, 0.3)';
                ctx.fillRect(cx - plateW/2, cy - gap/2, plateW, gap);
                ctx.strokeStyle = dielectricK > 5 ? 'rgba(56, 189, 248, 0.8)' : 'rgba(253, 224, 71, 0.8)';
                ctx.strokeRect(cx - plateW/2, cy - gap/2, plateW, gap);
                
                ctx.fillStyle = '#fff'; ctx.font='10px sans-serif'; ctx.fillText(`k=${dielectricK}`, cx, cy);
            }

            // E-Field
            if (Math.abs(currentV) > 0.1) {
                drawEField(ctx, cx - plateW/2, cy - gap/2, plateW, gap, Math.abs(currentV));
            }

            // Charges (Visualizing Q)
            const chargeVal = C * currentV; // Q = C * V
            
            // Top Plate
            drawCharges(ctx, cx - plateW/2, plateTopY, plateW, plateH, chargeVal * 1e6);
            // Bottom Plate (Opposite)
            drawCharges(ctx, cx - plateW/2, plateBotY, plateW, plateH, -chargeVal * 1e6);

            frameId = requestAnimationFrame(render);
        };
        
        frameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frameId);
    }, [area, dist, dielectricK, voltage, simMode, switchState, isPlaying, capVoltage, simSpeed, C, resistance, I, Q, time]);

    // Graph Render Loop
    useEffect(() => {
        const cvs = graphRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;

        let frameId: number;
        const renderGraph = () => {
            const w = cvs.width = cvs.clientWidth;
            const h = cvs.height = cvs.clientHeight;
            ctx.fillStyle = '#111722'; ctx.fillRect(0,0,w,h);
            
            // Grid
            ctx.strokeStyle = '#232f48'; ctx.lineWidth = 1; ctx.beginPath();
            for(let x=0; x<w; x+=40) { ctx.moveTo(x,0); ctx.lineTo(x,h); }
            for(let y=0; y<h; y+=40) { ctx.moveTo(0,y); ctx.lineTo(w,y); }
            ctx.stroke();

            const cy = h/2;
            
            if (simMode === 'AC') {
                const scaleV = 30; 
                ctx.lineWidth = 2;
                
                // Draw Voltage (Green)
                ctx.beginPath(); ctx.strokeStyle = '#10b981';
                for (let x=0; x<w; x++) {
                    const tVal = time + x * 0.05;
                    ctx.lineTo(x, cy - (voltage * Math.sin(tVal) / voltage * scaleV));
                }
                ctx.stroke();

                // Draw Current (Yellow)
                ctx.beginPath(); ctx.strokeStyle = '#facc15';
                for (let x=0; x<w; x++) {
                    const tVal = time + x * 0.05;
                    // Current phase logic
                    const phase = Math.atan2(Xc, resistance);
                    const iNorm = I * Math.sin(tVal + phase);
                    
                    ctx.lineTo(x, cy - (iNorm * resistance / voltage * scaleV));
                }
                ctx.stroke();
            } else {
                // DC Bar indicators
                const barW = w/4;
                
                // Voltage Bar
                const vHeight = (capVoltage / 20) * (h/2);
                ctx.fillStyle = '#10b981'; ctx.fillRect(w/4 - barW/2, h - vHeight, barW, vHeight);
                ctx.fillStyle = '#fff'; ctx.fillText('V_c', w/4 - 10, h - 10);

                // Current Bar
                const iHeight = (I * resistance / 20) * (h/2); 
                ctx.fillStyle = '#facc15'; ctx.fillRect(3*w/4 - barW/2, h - iHeight, barW, iHeight);
                ctx.fillStyle = '#fff'; ctx.fillText('I', 3*w/4 - 5, h - 10);
            }

            frameId = requestAnimationFrame(renderGraph);
        };
        frameId = requestAnimationFrame(renderGraph);
        return () => cancelAnimationFrame(frameId);
    }, [simMode, time, voltage, I, Xc, resistance, capVoltage]);

    return (
        <div className="flex h-full w-full relative">
            <div className="flex-1 relative bg-[#050508] overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full block" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all border border-white/5 text-white">
                        {isPlaying ? <Pause size={20}/> : <Play size={20}/>}
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-40 bg-[#0a0f18] border-t border-white/10 flex">
                    <div className="w-64 p-4 border-r border-white/10 flex flex-col justify-center gap-2">
                        <div className="flex justify-between text-xs text-slate-400"><span>Điện dung (C)</span><span className="text-white">{(C * 1e6).toFixed(2)} µF</span></div>
                        <div className="flex justify-between text-xs text-slate-400"><span>Dung kháng (Zc)</span><span className="text-white">{Xc.toFixed(1)} Ω</span></div>
                        <div className="flex justify-between text-xs text-slate-400"><span>Tổng trở (Z)</span><span className="text-white">{Z.toFixed(1)} Ω</span></div>
                        <div className="flex justify-between text-xs text-slate-400"><span>Dòng điện (I)</span><span className="text-yellow-400">{I.toFixed(2)} A</span></div>
                    </div>
                    <div className="flex-1 relative">
                        <canvas ref={graphRef} className="w-full h-full block" />
                        <div className="absolute top-2 left-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp size={12}/> Biểu đồ pha (V - Xanh, I - Vàng)
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-80 bg-[#0a0a0f] border-l border-white/5 overflow-y-auto custom-scroll p-6 space-y-8 z-10 shrink-0 shadow-2xl">
                {/* Controls */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2"><Settings size={14}/> Thiết lập</h3>
                    
                    <div className="flex bg-white/5 p-1 rounded-xl">
                        <button onClick={() => setSimMode('AC')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${simMode==='AC' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Nguồn AC (~)</button>
                        <button onClick={() => setSimMode('DC')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${simMode==='DC' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Nguồn DC (=)</button>
                    </div>

                    {simMode === 'DC' && (
                        <div className="flex bg-white/5 p-1 rounded-xl">
                            <button onClick={() => setSwitchState('Charge')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${switchState==='Charge' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Nạp điện</button>
                            <button onClick={() => setSwitchState('Discharge')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${switchState==='Discharge' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>Phóng điện</button>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300"><span>Điện áp nguồn (U)</span><span className="text-yellow-400">{voltage} V</span></div>
                            <input type="range" min="1" max="24" value={voltage} onChange={e => setVoltage(Number(e.target.value))} className="w-full accent-yellow-500 h-1 bg-white/10 rounded"/>
                        </div>
                        {simMode === 'AC' && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-300"><span>Tần số (f)</span><span className="text-purple-400">{frequency} Hz</span></div>
                                <input type="range" min="10" max="200" step="10" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-white/10 rounded"/>
                            </div>
                        )}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300"><span>Điện trở (R)</span><span className="text-red-400">{resistance} Ω</span></div>
                            <input type="range" min="10" max="500" step="10" value={resistance} onChange={e => setResistance(Number(e.target.value))} className="w-full accent-red-500 h-1 bg-white/10 rounded"/>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2 pt-2"><BoxSelect size={14}/> Cấu tạo tụ điện</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300"><span>Diện tích bản (S)</span><span className="text-blue-400">{area} cm²</span></div>
                            <input type="range" min="10" max="200" value={area} onChange={e => setArea(Number(e.target.value))} className="w-full accent-blue-500 h-1 bg-white/10 rounded"/>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300"><span>Khoảng cách (d)</span><span className="text-blue-400">{dist} mm</span></div>
                            <input type="range" min="1" max="20" value={dist} onChange={e => setDist(Number(e.target.value))} className="w-full accent-blue-500 h-1 bg-white/10 rounded"/>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300"><span>Hằng số điện môi (ε)</span><span className="text-green-400">{dielectricK}</span></div>
                            <input type="range" min="1" max="10" step="0.5" value={dielectricK} onChange={e => setDielectricK(Number(e.target.value))} className="w-full accent-green-500 h-1 bg-white/10 rounded"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CapacitorSim;