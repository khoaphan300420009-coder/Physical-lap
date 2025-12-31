
import React, { useState, useEffect, useRef } from 'react';
import { Zap, Plus, Minus, MousePointer2, Grid, ChevronRight, Sliders, Trash2, ArrowUpRight } from 'lucide-react';

interface Charge {
    id: string;
    x: number;
    y: number;
    q: number; // nanoCoulombs
    dragging: boolean;
}

const ElectrostaticsLab: React.FC = () => {
    const [scenario, setScenario] = useState(0);
    const [charges, setCharges] = useState<Charge[]>([]);
    
    // Feature Toggles
    const [showField, setShowField] = useState(true);
    const [showGrid, setShowGrid] = useState(false);
    const [showForces, setShowForces] = useState(true);
    const [showValues, setShowValues] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selectedChargeId = useRef<string | null>(null);

    const SCENARIOS = [
        "Tự do (Sandbox)",
        "Tương tác 2 điện tích",
        "Tụ điện phẳng",
        "Súng Electron (Parabol)"
    ];

    // Initialization
    useEffect(() => {
        setCharges([]);
        if (scenario === 1) {
            setCharges([
                { id: '1', x: 300, y: 300, q: 2, dragging: false },
                { id: '2', x: 500, y: 300, q: -2, dragging: false }
            ]);
        } else if (scenario === 2) {
            // Capacitor Setup (Line of + and Line of -)
            const newC: Charge[] = [];
            for(let i=0; i<8; i++) {
                newC.push({ id: `p${i}`, x: 300 + i*30, y: 200, q: 1, dragging: false }); // Top +
                newC.push({ id: `n${i}`, x: 300 + i*30, y: 400, q: -1, dragging: false }); // Bot -
            }
            setCharges(newC);
        }
    }, [scenario]);

    const addCharge = (q: number) => {
        const cvs = canvasRef.current;
        if(!cvs) return;
        setCharges(prev => [...prev, {
            id: Math.random().toString(),
            x: cvs.width/2 + (Math.random()-0.5)*50,
            y: cvs.height/2 + (Math.random()-0.5)*50,
            q,
            dragging: false
        }]);
    };

    // Physics & Rendering
    useEffect(() => {
        const cvs = canvasRef.current; if(!cvs) return;
        const ctx = cvs.getContext('2d'); if(!ctx) return;
        let animationId: number;

        const render = () => {
            const w = cvs.width = cvs.clientWidth;
            const h = cvs.height = cvs.clientHeight;
            
            ctx.fillStyle = '#050508'; ctx.fillRect(0,0,w,h);

            // 1. Draw Field Vectors (Grid)
            if (showField || showGrid) {
                const step = 40;
                ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
                ctx.lineWidth = 1;
                
                for(let x=20; x<w; x+=step) {
                    for(let y=20; y<h; y+=step) {
                        let Ex = 0, Ey = 0;
                        charges.forEach(c => {
                            const dx = x - c.x; const dy = y - c.y;
                            const r2 = dx*dx + dy*dy;
                            const r = Math.sqrt(r2);
                            const E = 5000 * c.q / r2; // Scale factor
                            Ex += E * (dx/r);
                            Ey += E * (dy/r);
                        });
                        
                        const E_mag = Math.sqrt(Ex*Ex + Ey*Ey);
                        if (E_mag > 0.1) {
                            const len = Math.min(30, E_mag * 5); // Clamp length
                            const ang = Math.atan2(Ey, Ex);
                            
                            // Color by strength
                            const alpha = Math.min(1, E_mag / 2);
                            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
                            
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            ctx.lineTo(x + Math.cos(ang)*len, y + Math.sin(ang)*len);
                            ctx.stroke();
                            
                            // Arrowhead
                            if (showField && len > 5) {
                                ctx.beginPath();
                                ctx.arc(x + Math.cos(ang)*len, y + Math.sin(ang)*len, 1, 0, Math.PI*2);
                                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                                ctx.fill();
                            }
                        }
                    }
                }
            }

            // 2. Draw Charges
            charges.forEach(c => {
                // Glow
                const grad = ctx.createRadialGradient(c.x, c.y, 5, c.x, c.y, 30);
                grad.addColorStop(0, c.q > 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(c.x, c.y, 30, 0, Math.PI*2); ctx.fill();

                // Core
                ctx.fillStyle = c.q > 0 ? '#ef4444' : '#3b82f6';
                ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, Math.PI*2); ctx.fill();
                
                // Sign
                ctx.fillStyle = '#fff'; ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
                ctx.fillText(c.q > 0 ? '+' : '-', c.x, c.y);

                // Value Label
                if (showValues) {
                    ctx.font='10px sans-serif'; 
                    ctx.fillText(`${c.q > 0 ? '+' : ''}${c.q}nC`, c.x, c.y + 20);
                }

                // Force Vectors (on this charge from others)
                if (showForces && scenario !== 2) { // Don't show forces in capacitor mode, too messy
                    charges.forEach(other => {
                        if (c.id === other.id) return;
                        const dx = c.x - other.x; const dy = c.y - other.y;
                        const r2 = dx*dx + dy*dy;
                        const r = Math.sqrt(r2);
                        if (r < 1) return;
                        
                        const F_mag = 10000 * Math.abs(c.q * other.q) / r2; // Fake K
                        const isRepel = (c.q * other.q) > 0;
                        const dir = isRepel ? 1 : -1;
                        
                        const Fx = F_mag * (dx/r) * dir;
                        const Fy = F_mag * (dy/r) * dir;
                        
                        // Draw Arrow
                        const len = Math.min(100, Math.sqrt(Fx*Fx + Fy*Fy));
                        const ang = Math.atan2(Fy, Fx);
                        
                        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(c.x, c.y); 
                        ctx.lineTo(c.x + Math.cos(ang)*len, c.y + Math.sin(ang)*len); 
                        ctx.stroke();
                        
                        // Value
                        if (showValues) {
                            ctx.fillStyle = '#fbbf24';
                            ctx.fillText(`F`, c.x + Math.cos(ang)*len/2 + 10, c.y + Math.sin(ang)*len/2);
                        }
                    });
                }
            });

            // 3. Electron Gun Logic (Scenario 3)
            if (scenario === 3) {
                // Animate a particle
                const t = (performance.now() / 1000) % 2; // Loop every 2s
                const startX = 50; const startY = h/2;
                const v0 = 200;
                let px = startX + v0 * t;
                let py = startY;
                
                // Deflection
                // Simple integration over grid is hard, let's just calc E at current pos
                let Ex = 0, Ey = 0;
                charges.forEach(c => {
                    const dx = px - c.x; const dy = py - c.y;
                    const r2 = dx*dx + dy*dy;
                    const r = Math.sqrt(r2);
                    const E = 5000 * c.q / r2;
                    Ex += E * (dx/r);
                    Ey += E * (dy/r);
                });
                // F = qE (electron q is negative) -> a ~ -E
                // Very simplified visual path: y = y0 + 0.5 * ay * t^2
                // We need full integration for curve, drawing a trail is better
                
                ctx.beginPath();
                ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2;
                ctx.moveTo(startX, startY);
                // Trace path
                let tx = startX, ty = startY, vy = 0;
                for(let dt=0; dt<t; dt+=0.01) {
                    let lEx=0, lEy=0;
                    charges.forEach(c => {
                        const dx = tx - c.x; const dy = ty - c.y;
                        const r2 = dx*dx + dy*dy; const r = Math.sqrt(r2);
                        const E = 5000 * c.q / r2;
                        lEx += E * (dx/r); lEy += E * (dy/r);
                    });
                    const ay = -lEy * 5; // Electron accel
                    vy += ay * 0.01;
                    tx += v0 * 0.01;
                    ty += vy * 0.01;
                    ctx.lineTo(tx, ty);
                }
                ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI*2); ctx.fill();
            }

            animationId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationId);
    }, [charges, showField, showGrid, showForces, showValues, scenario]);

    // Interaction
    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if(!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find clicked charge
        const clicked = charges.find(c => Math.hypot(c.x - x, c.y - y) < 20);
        if (clicked) {
            selectedChargeId.current = clicked.id;
            setCharges(prev => prev.map(c => c.id === clicked.id ? {...c, dragging: true} : c));
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!selectedChargeId.current) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if(!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCharges(prev => prev.map(c => c.id === selectedChargeId.current ? {...c, x, y} : c));
    };

    const handleMouseUp = () => {
        selectedChargeId.current = null;
        setCharges(prev => prev.map(c => ({...c, dragging: false})));
    };

    const clearCharges = () => setCharges([]);

    return (
        <div className="flex h-full w-full bg-[#020408] font-sans">
            {/* Sidebar */}
            <div className="w-80 shrink-0 bg-[#0a0f18] border-r border-white/10 flex flex-col h-full z-20 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="text-pink-500"/> Tĩnh Điện Lab
                    </h2>
                    
                    <div className="relative mb-6">
                        <select value={scenario} onChange={(e) => setScenario(Number(e.target.value))} className="w-full bg-[#1e293b] border border-white/10 text-white text-sm rounded-lg p-3 outline-none cursor-pointer">
                            {SCENARIOS.map((name, i) => <option key={i} value={i}>{name}</option>)}
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400"><ChevronRight size={16} className="rotate-90"/></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => addCharge(1)} className="py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 flex flex-col items-center gap-1 transition-all">
                            <Plus size={20}/> Dương (+)
                        </button>
                        <button onClick={() => addCharge(-1)} className="py-3 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-400 flex flex-col items-center gap-1 transition-all">
                            <Minus size={20}/> Âm (-)
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors flex items-center gap-2"><ArrowUpRight size={14}/> Vector Điện trường</span>
                            <input type="checkbox" checked={showField} onChange={e => setShowField(e.target.checked)} className="accent-pink-500"/>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors flex items-center gap-2"><Grid size={14}/> Lưới Vector (Grid)</span>
                            <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="accent-pink-500"/>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors flex items-center gap-2"><Sliders size={14}/> Vector Lực (Force)</span>
                            <input type="checkbox" checked={showForces} onChange={e => setShowForces(e.target.checked)} className="accent-yellow-500"/>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors flex items-center gap-2">123 Hiển thị giá trị</span>
                            <input type="checkbox" checked={showValues} onChange={e => setShowValues(e.target.checked)} className="accent-white"/>
                        </label>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <button onClick={clearCharges} className="w-full py-3 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all">
                            <Trash2 size={16}/> Xóa màn hình
                        </button>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-[#050508] overflow-hidden">
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full block cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
                
                <div className="absolute top-4 left-4 pointer-events-none bg-black/50 px-4 py-2 rounded-full text-xs text-slate-400 backdrop-blur border border-white/5 flex items-center gap-2">
                    <MousePointer2 size={12}/> Kéo thả điện tích để di chuyển
                </div>
            </div>
        </div>
    );
};

export default ElectrostaticsLab;
