
import React, { useState, useEffect, useRef } from 'react';
import { Magnet, Zap, Activity, Repeat, Sliders, ChevronRight, BarChart3, MoveLeft, Lightbulb, TrendingUp } from 'lucide-react';

const FaradayLab: React.FC = () => {
    const [scenario, setScenario] = useState(0);
    
    // Physics State
    const [magnetX, setMagnetX] = useState(200);
    const [numLoops, setNumLoops] = useState(5);
    const [loopArea, setLoopArea] = useState(50);
    const [flux, setFlux] = useState(0);
    const [emf, setEmf] = useState(0);
    const [polarity, setPolarity] = useState<'NS' | 'SN'>('NS');
    const [autoMove, setAutoMove] = useState(false);
    
    // Interaction
    const isDragging = useRef(false);
    const lastTime = useRef(0);
    
    // Electron Animation State
    const electronsRef = useRef<number[]>(Array.from({length: 20}).map(() => Math.random() * 100)); // Positions 0-100%
    
    // History for Graph
    const [history, setHistory] = useState<{t: number, v: number}[]>([]);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const graphRef = useRef<HTMLCanvasElement>(null);

    const SCENARIOS = [
        "Thí nghiệm cơ bản",
        "Định luật Lenz (Chiều dòng điện)",
        "Máy phát điện xoay chiều (Mô phỏng)"
    ];

    // Auto move logic
    useEffect(() => {
        let interval: any;
        if (autoMove) {
            let t = 0;
            interval = setInterval(() => {
                t += 0.05;
                const newX = 200 + Math.sin(t * 5) * 180; 
                setMagnetX(newX);
            }, 16);
        }
        return () => clearInterval(interval);
    }, [autoMove]);

    // Physics Engine
    useEffect(() => {
        const now = performance.now();
        const dt = (now - lastTime.current) / 1000;
        lastTime.current = now;

        const coilX = 400; 
        const dist = (magnetX - coilX) / 80; 
        const B_strength = 2000 * (polarity === 'NS' ? 1 : -1);
        
        const B = B_strength / (Math.pow(Math.abs(dist), 2.5) + 0.2); 
        const currentFlux = B * (loopArea/50) * numLoops;
        
        let currentEmf = 0;
        if (dt > 0 && dt < 0.5) {
            const dFlux = currentFlux - flux;
            currentEmf = -(dFlux / dt) * 0.5; 
        }
        
        setFlux(currentFlux);
        setEmf(currentEmf); 

        // Update Electrons
        // Move them based on EMF direction and magnitude
        const speed = currentEmf * 0.5;
        electronsRef.current = electronsRef.current.map(p => {
            let next = p + speed;
            if (next > 100) next -= 100;
            if (next < 0) next += 100;
            return next;
        });

        setHistory(prev => {
            const newH = [...prev, {t: now, v: currentEmf}];
            if (newH.length > 300) newH.shift(); 
            return newH;
        });

    }, [magnetX, loopArea, numLoops, polarity, flux]); 

    // Canvas Render
    useEffect(() => {
        const cvs = canvasRef.current; if(!cvs) return;
        const ctx = cvs.getContext('2d'); if(!ctx) return;
        
        const w = cvs.width = cvs.clientWidth;
        const h = cvs.height = cvs.clientHeight;
        const cy = h/2;
        const coilX = w/2;

        ctx.fillStyle = '#050508'; ctx.fillRect(0,0,w,h);

        // --- DRAW MAGNETIC FIELDS (Curved) ---
        ctx.save();
        ctx.translate(magnetX, cy);
        if (polarity === 'SN') ctx.rotate(Math.PI);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
        
        // Draw Bezier curves from N (left side) to S (right side)
        const magW = 120;
        const startX = -magW/2; 
        const endX = magW/2;
        
        for(let i=1; i<=6; i++) {
            const spread = i * 60;
            // Top loops
            ctx.beginPath();
            ctx.moveTo(startX, -10);
            ctx.bezierCurveTo(startX - spread, -spread, endX + spread, -spread, endX, -10);
            ctx.stroke();
            // Bottom loops
            ctx.beginPath();
            ctx.moveTo(startX, 10);
            ctx.bezierCurveTo(startX - spread, spread, endX + spread, spread, endX, 10);
            ctx.stroke();
        }
        // Center line
        ctx.beginPath(); ctx.moveTo(startX - 200, 0); ctx.lineTo(endX + 200, 0); ctx.stroke();
        
        ctx.restore();

        // --- MAGNET ---
        const magH = 40;
        ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(0,0,0,0.5)';
        if (polarity === 'NS') {
            ctx.fillStyle = '#ef4444'; ctx.fillRect(magnetX - magW/2, cy - magH/2, magW/2, magH);
            ctx.fillStyle = '#3b82f6'; ctx.fillRect(magnetX, cy - magH/2, magW/2, magH);
            ctx.fillStyle = 'white'; ctx.font='bold 20px sans-serif'; ctx.fillText('N', magnetX - 40, cy + 7); ctx.fillText('S', magnetX + 25, cy + 7);
        } else {
            ctx.fillStyle = '#3b82f6'; ctx.fillRect(magnetX - magW/2, cy - magH/2, magW/2, magH);
            ctx.fillStyle = '#ef4444'; ctx.fillRect(magnetX, cy - magH/2, magW/2, magH);
            ctx.fillStyle = 'white'; ctx.font='bold 20px sans-serif'; ctx.fillText('S', magnetX - 40, cy + 7); ctx.fillText('N', magnetX + 25, cy + 7);
        }
        ctx.shadowBlur = 0;

        // --- COIL & CIRCUIT ---
        const coilRad = loopArea / 2 + 30;
        const circuitLeft = coilX - 50; 
        const circuitRight = coilX + 200;
        
        // Define path for circuit: 
        // Coil Top -> Wire Top -> Bulb -> Wire Bottom -> Coil Bottom
        
        // 1. Draw Wires
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(coilX, cy - coilRad); ctx.lineTo(coilX, cy - 150); ctx.lineTo(circuitRight, cy - 150);
        ctx.moveTo(coilX, cy + coilRad); ctx.lineTo(coilX, cy + 150); ctx.lineTo(circuitRight, cy + 150);
        ctx.stroke();

        // 2. Draw Bulb
        const bulbX = circuitRight; const bulbY = cy;
        const brightness = Math.min(1, Math.abs(emf) / 30);
        ctx.fillStyle = '#333'; ctx.fillRect(bulbX - 10, bulbY - 150, 20, 300); // Resistor/Load visual? No just connect.
        // Actually wire goes to bulb.
        ctx.beginPath(); ctx.moveTo(circuitRight, cy - 150); ctx.lineTo(circuitRight, cy + 150); ctx.stroke();
        
        // Real Bulb Draw
        ctx.beginPath(); ctx.arc(bulbX, bulbY, 25, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255, 255, 0, ${0.1 + brightness})`;
        ctx.shadowBlur = brightness * 80; ctx.shadowColor = 'yellow';
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.stroke();

        // 3. Draw Coil Loops
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 4;
        const visualLoops = Math.min(15, Math.max(1, Math.floor(numLoops / 5)) + 2);
        for(let i=0; i<visualLoops; i++) {
            const offset = (i - visualLoops/2) * 8;
            ctx.beginPath(); ctx.ellipse(coilX + offset, cy, 10, coilRad, 0, 0, Math.PI*2); ctx.stroke();
        }

        // --- ELECTRONS ANIMATION ---
        // Path: Rectangular loop. 
        // 0-25: Right side (Bulb) down
        // 25-50: Bottom wire left
        // 50-75: Coil up
        // 75-100: Top wire right
        
        ctx.fillStyle = '#60a5fa'; // Blue electrons
        ctx.shadowBlur = 5; ctx.shadowColor = '#60a5fa';
        
        electronsRef.current.forEach(p => {
            let ex = 0, ey = 0;
            if (p < 25) { // Right side
                const prog = p / 25; 
                ex = circuitRight; ey = (cy - 150) + prog * 300;
            } else if (p < 50) { // Bottom
                const prog = (p - 25) / 25;
                ex = circuitRight - prog * (circuitRight - coilX); ey = cy + 150;
            } else if (p < 75) { // Left (Coil)
                const prog = (p - 50) / 25;
                // Spiral effect approx
                ex = coilX + Math.sin(prog * Math.PI * 8) * 10; 
                ey = (cy + 150) - prog * 300;
            } else { // Top
                const prog = (p - 75) / 25;
                ex = coilX + prog * (circuitRight - coilX); ey = cy - 150;
            }
            
            ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI*2); ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Induced Current Arrow
        if (Math.abs(emf) > 2) {
            ctx.fillStyle = '#fff';
            const arrowY = cy - coilRad - 20;
            const dir = emf > 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(coilX - 15 * dir, arrowY);
            ctx.lineTo(coilX + 15 * dir, arrowY);
            ctx.lineTo(coilX + 8 * dir, arrowY - 8);
            ctx.lineTo(coilX + 8 * dir, arrowY + 8);
            ctx.fill();
        }

    }, [magnetX, loopArea, numLoops, polarity, emf]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect && e.clientX - rect.left < magnetX + 70 && e.clientX - rect.left > magnetX - 70) {
            isDragging.current = true;
        }
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging.current) {
            const rect = canvasRef.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setMagnetX(x);
        }
    };
    const handleMouseUp = () => isDragging.current = false;

    // Graph Render
    useEffect(() => {
        if (!graphRef.current) return;
        const ctx = graphRef.current.getContext('2d'); if(!ctx) return;
        const w = graphRef.current.width = graphRef.current.clientWidth;
        const h = graphRef.current.height = graphRef.current.clientHeight;
        
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,w,h);
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); 
        for(let x=0; x<w; x+=50) { ctx.moveTo(x,0); ctx.lineTo(x,h); }
        ctx.stroke();
        
        if (history.length > 1) {
            ctx.beginPath(); 
            ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
            const t0 = history[0].t;
            const dur = history[history.length-1].t - t0 || 1;
            
            history.forEach((pt, i) => {
                const x = (pt.t - t0) / dur * w;
                const y = h/2 - pt.v * 1; 
                if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
            });
            ctx.stroke();
        }
    }, [history]);

    return (
        <div className="flex h-full w-full bg-[#020408] font-sans">
            {/* Sidebar */}
            <div className="w-80 shrink-0 bg-[#0a0f18] border-r border-white/10 flex flex-col h-full z-20 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                        <Magnet className="text-blue-500"/> Faraday Lab
                    </h2>
                    
                    <div className="relative mb-6">
                        <select value={scenario} onChange={(e) => setScenario(Number(e.target.value))} className="w-full bg-[#1e293b] border border-white/10 text-white text-sm rounded-lg p-3 outline-none">
                            {SCENARIOS.map((name, i) => <option key={i} value={i}>{name}</option>)}
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400"><ChevronRight size={16} className="rotate-90"/></div>
                    </div>
                </div>

                <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                <span>Số vòng dây (N)</span>
                                <span className="text-blue-400">{numLoops}</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={numLoops} 
                                onChange={e => setNumLoops(Number(e.target.value))} 
                                className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                <span>Diện tích vòng (S)</span>
                                <span className="text-blue-400">{loopArea}%</span>
                            </div>
                            <input type="range" min="20" max="100" value={loopArea} onChange={e => setLoopArea(Number(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg"/>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setPolarity(p => p==='NS'?'SN':'NS')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 border border-white/5">
                                <Repeat size={16}/> Đảo cực {polarity}
                            </button>
                            <button onClick={() => setAutoMove(!autoMove)} className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-white/5 ${autoMove ? 'bg-green-600 text-white' : 'bg-white/10 text-slate-300'}`}>
                                <Activity size={16}/> Tự động
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-xs text-slate-500 uppercase font-bold">Từ thông (Φ)</span>
                            <span className="font-mono text-yellow-400">{flux.toFixed(2)} Wb</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 uppercase font-bold">Suất điện động (e)</span>
                            <span className="font-mono text-red-400">{emf.toFixed(2)} V</span>
                        </div>
                        {/* Flux Bar */}
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden flex items-center justify-center relative">
                            <div className="absolute h-full bg-yellow-500 transition-all duration-75" style={{width: `${Math.min(100, Math.abs(flux)/10)}%`, left: '50%', transform: flux > 0 ? 'none' : 'translateX(-100%)'}}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 flex flex-col bg-[#050508] relative overflow-hidden">
                <div className="flex-1 relative cursor-ew-resize"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <canvas ref={canvasRef} className="w-full h-full block" />
                    
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-xs text-slate-300 backdrop-blur pointer-events-none flex items-center gap-2 border border-white/10">
                        <MoveLeft size={14}/> Kéo Nam châm qua lại <MoveLeft size={14} className="rotate-180"/>
                    </div>
                </div>

                <div className="h-48 border-t border-white/10 bg-[#0a0f18] p-4 relative shrink-0">
                    <h4 className="text-xs font-bold text-slate-400 absolute top-3 left-4 flex items-center gap-2 z-10 bg-black/50 px-2 py-1 rounded"><TrendingUp size={14} className="text-green-400"/> Dòng điện cảm ứng ($I \sim e$)</h4>
                    <canvas ref={graphRef} className="w-full h-full block rounded-lg border border-white/5 bg-[#0f172a]" />
                </div>
            </div>
        </div>
    );
};

export default FaradayLab;
