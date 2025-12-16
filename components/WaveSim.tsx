
import React, { useState, useEffect, useRef } from 'react';
import { WaveSource } from '../types';
import { Play, Pause, Waves, Trash2, Sliders, Move, Volume2, Plus, Palette, Activity, MousePointer2, AlignJustify, AlignCenter, GripHorizontal } from 'lucide-react';

const WaveSim: React.FC = () => {
    // --- Mode State ---
    const [simType, setSimType] = useState<'Ripple2D' | 'String1D'>('Ripple2D');
    
    // --- Common State ---
    const [isPaused, setIsPaused] = useState(false);
    const [simSpeed, setSimSpeed] = useState(1.0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mousePos, setMousePos] = useState({x: 0, y: 0});

    // --- 2D Ripple State ---
    const [waveSources, setWaveSources] = useState<WaveSource[]>([]);
    const [selectedWaveId, setSelectedWaveId] = useState<string | null>(null);
    const [waveZoom, setWaveZoom] = useState(1.0);
    const [is3DView, setIs3DView] = useState(false);
    const dragRef = useRef<{id: string | null, active: boolean}>({id: null, active: false});

    // --- 1D String State (Standing Waves) ---
    const [stringParams, setStringParams] = useState({
        waveType: 'Transverse' as 'Transverse' | 'Longitudinal', // NEW: Wave Type
        tension: 80,    // N
        density: 0.1,   // kg/m
        damping: 0.01,  // Reduced damping for better sustain
        frequency: 5,   // Hz
        amplitude: 40,
        boundary: 'Fixed' as 'Fixed' | 'Free',
        harmonics: 1,   // n
        showEnergy: false,
        showStrobe: false
    });
    
    // Physics Refs
    const physRef = useRef({
        time: 0,
        buffer: null as Uint32Array | null,
        imgData: null as ImageData | null,
        stringPoints: [] as {baseX: number, currX: number, y: number, v: number}[], // Updated for Longitudinal
        energyHistory: [] as {ke: number, pe: number}[]
    });

    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscRef = useRef<OscillatorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);

    // --- Initialization ---
    useEffect(() => {
        const points = 100; // Fewer points for cleaner Longitudinal view
        physRef.current.stringPoints = new Array(points).fill(0).map((_, i) => ({
            baseX: i, // Will be normalized later
            currX: 0,
            y: 0, 
            v: 0
        }));
        
        if (waveSources.length === 0) {
            setWaveSources([
                { id: 's1', name: 'Nguồn 1', type: 'Sine', x: 35, y: 50, freq: 6, amp: 120, phase: 0, color: '#22d3ee' },
                { id: 's2', name: 'Nguồn 2', type: 'Sine', x: 65, y: 50, freq: 6, amp: 120, phase: 0, color: '#22d3ee' }
            ]);
        }
    }, []);

    // --- Audio ---
    const toggleAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();
            osc.connect(gain);
            gain.connect(audioCtxRef.current.destination);
            osc.start();
            oscRef.current = osc;
            gainRef.current = gain;
            gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
        }
        const gain = gainRef.current;
        if (gain) {
            const val = gain.gain.value > 0 ? 0 : 0.05;
            gain.gain.setTargetAtTime(val, audioCtxRef.current!.currentTime, 0.1);
        }
    };

    useEffect(() => {
        if(oscRef.current) {
            oscRef.current.frequency.setValueAtTime(simType === 'String1D' ? stringParams.frequency * 30 : 100, audioCtxRef.current!.currentTime);
        }
    }, [stringParams.frequency, simType]);

    // --- 1D String Physics ---
    const updateString = (dt: number, width: number) => {
        const pts = physRef.current.stringPoints;
        const len = pts.length;
        const spacing = width / len;
        
        const c = Math.sqrt(stringParams.tension / stringParams.density);
        const cSq = c * c;
        
        // Drive logic
        const omega = 2 * Math.PI * stringParams.frequency;
        const drive = stringParams.amplitude * Math.sin(omega * physRef.current.time);
        
        let ke = 0;
        let pe = 0;

        // Standard Wave Equation solving for Y (displacement)
        // Even for Longitudinal, we calculate displacement 'y' mathematically, then map it to 'x' visually.
        for (let i = 1; i < len - 1; i++) {
            const d2y = pts[i-1].y - 2*pts[i].y + pts[i+1].y;
            // dx is relative to index, so dx=1
            const accel = (cSq * d2y) - (stringParams.damping * pts[i].v);
            
            pts[i].v += accel * dt;
            pts[i].y += pts[i].v * dt;

            // Simple Energy calc
            ke += 0.5 * stringParams.density * pts[i].v * pts[i].v;
            pe += 0.5 * stringParams.tension * Math.pow(pts[i+1].y - pts[i].y, 2); 
        }

        // Left Boundary (Source)
        pts[0].y = drive; 
        
        // Right Boundary
        if (stringParams.boundary === 'Fixed') {
            pts[len-1].y = 0; pts[len-1].v = 0;
        } else {
            pts[len-1].y = pts[len-2].y; pts[len-1].v = pts[len-2].v;
        }
        
        // Map to visual coordinates
        for(let i=0; i<len; i++) {
            pts[i].baseX = i * spacing;
            // If Longitudinal: displacement is added to X
            // If Transverse: displacement is Y
            pts[i].currX = pts[i].baseX + (stringParams.waveType === 'Longitudinal' ? pts[i].y * 1.5 : 0);
        }

        physRef.current.energyHistory.push({ke, pe});
        if(physRef.current.energyHistory.length > 200) physRef.current.energyHistory.shift();
    };

    // --- Interaction Handlers ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        const cx = w/2, cy = h/2;
        
        if (simType === 'Ripple2D') {
            let hit = null;
            for(const s of waveSources) {
                const sx = (s.x * w / 100 - cx) * waveZoom + cx; 
                const sy = (s.y * h / 100 - cy) * waveZoom + cy;
                const d = Math.hypot(mx - sx, my - (is3DView ? (sy-cy)/2+cy : sy));
                if (d < 20) { hit = s.id; break; }
            }

            if (hit) {
                dragRef.current = { id: hit, active: true };
                setSelectedWaveId(hit);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        setMousePos({x: mx, y: my});
        
        if (simType === 'Ripple2D' && dragRef.current.active && dragRef.current.id) {
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;
            const cx = w/2, cy = h/2;
            const invZoom = 1/waveZoom;

            let simX = ((mx - cx) * invZoom + cx) / w * 100;
            let simY = ((my - cy) * invZoom + cy) / h * 100;
            if (is3DView) { 
                 simY = (((my - cy) * 2 + cy) - cy) * invZoom + cy;
                 simY = simY / h * 100;
            }

            setWaveSources(prev => prev.map(s => 
                s.id === dragRef.current.id ? { ...s, x: Math.max(0, Math.min(100, simX)), y: Math.max(0, Math.min(100, simY)) } : s
            ));
        }
    };

    const handleMouseUp = () => { dragRef.current.active = false; };

    // --- Render Loop ---
    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return;
        const ctx = cvs.getContext('2d', { alpha: false }); if (!ctx) return;
        let frameId: number;
        let lastTime = performance.now();

        const render = (now: number) => {
            const rawDt = (now - lastTime) / 1000;
            lastTime = now;
            const dt = Math.min(rawDt, 0.1) * simSpeed;

            const w = cvs.width = cvs.parentElement?.clientWidth || 800;
            const h = cvs.height = cvs.parentElement?.clientHeight || 600;
            const cx = w/2, cy = h/2;

            if (!isPaused) physRef.current.time += dt;

            ctx.fillStyle = '#050508'; ctx.fillRect(0,0,w,h);

            // ================= STRING 1D RENDER =================
            if (simType === 'String1D') {
                if(!isPaused) updateString(dt, w);
                
                // Grid & Guides
                ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.beginPath();
                for(let x=0; x<w; x+=50) { ctx.moveTo(x,0); ctx.lineTo(x,h); }
                ctx.stroke();

                // Equilibrium Line
                ctx.strokeStyle = '#334155'; ctx.setLineDash([5,5]); 
                ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
                ctx.setLineDash([]);

                const pts = physRef.current.stringPoints;
                
                if (stringParams.waveType === 'Transverse') {
                    // --- TRANSVERSE MODE (Sóng ngang) ---
                    // Draw continuous line
                    const grad = ctx.createLinearGradient(0,0,w,0);
                    grad.addColorStop(0, '#6366f1'); grad.addColorStop(0.5, '#a855f7'); grad.addColorStop(1, '#ec4899');
                    ctx.strokeStyle = grad; ctx.lineWidth = 4;
                    ctx.shadowBlur = 10; ctx.shadowColor = '#a855f7';
                    
                    ctx.beginPath();
                    ctx.moveTo(pts[0].baseX, cy + pts[0].y);
                    for(let i=1; i<pts.length; i++) {
                        // Smooth curve
                        const xc = (pts[i].baseX + pts[i+1]?.baseX) / 2 || pts[i].baseX;
                        const yc = cy + (pts[i].y + pts[i+1]?.y) / 2 || cy + pts[i].y;
                        ctx.quadraticCurveTo(pts[i].baseX, cy + pts[i].y, xc, yc);
                    }
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    // Draw particles on string
                    ctx.fillStyle = '#fff';
                    for(let i=0; i<pts.length; i+=2) {
                        ctx.beginPath(); ctx.arc(pts[i].baseX, cy + pts[i].y, 3, 0, Math.PI*2); ctx.fill();
                    }

                } else {
                    // --- LONGITUDINAL MODE (Sóng dọc) ---
                    // Draw spring/particles
                    for(let i=0; i<pts.length; i++) {
                        const x = pts[i].currX;
                        const y = cy;
                        
                        // Color based on compression (density of points)
                        // Simple approximation: check distance to neighbor
                        let dist = 10;
                        if (i > 0) dist = Math.abs(pts[i].currX - pts[i-1].currX);
                        
                        // Compressed = Closer = Hotter Color
                        const hue = Math.max(0, Math.min(240, (dist / (w/pts.length)) * 120)); 
                        
                        ctx.fillStyle = `hsl(${240-hue}, 100%, 60%)`;
                        ctx.beginPath(); 
                        ctx.arc(x, y, 4, 0, Math.PI*2); 
                        ctx.fill();

                        // Draw visual "spring" connection
                        if (i > 0) {
                            ctx.strokeStyle = `hsla(${240-hue}, 100%, 60%, 0.3)`;
                            ctx.lineWidth = 2;
                            ctx.beginPath(); ctx.moveTo(pts[i-1].currX, y); ctx.lineTo(x, y); ctx.stroke();
                        }
                    }
                }

                // Draw Boundary
                ctx.fillStyle = '#ef4444';
                if(stringParams.boundary === 'Fixed') {
                    ctx.fillRect(w - 10, cy - 20, 10, 40);
                } else {
                    // Draw ring on pole
                    const lastPt = pts[pts.length-1];
                    const bx = stringParams.waveType === 'Longitudinal' ? lastPt.currX : lastPt.baseX;
                    const by = stringParams.waveType === 'Longitudinal' ? cy : cy + lastPt.y;
                    
                    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 4;
                    ctx.beginPath(); ctx.moveTo(bx, cy-40); ctx.lineTo(bx, cy+40); ctx.stroke();
                    
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI*2); ctx.fill();
                }

                // Energy Graph (Optional)
                if(stringParams.showEnergy) {
                    const gw = 200, gh = 80;
                    const gx = w - gw - 20, gy = 20;
                    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(gx, gy, gw, gh);
                    ctx.strokeStyle = '#fff'; ctx.strokeRect(gx, gy, gw, gh);
                    
                    ctx.beginPath(); ctx.strokeStyle = '#10b981'; ctx.lineWidth=1;
                    physRef.current.energyHistory.forEach((e, i) => {
                        const x = gx + i; const y = gy + gh - Math.min(gh, e.ke * 0.1);
                        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                    });
                    ctx.stroke();
                }
            } 
            // ================= 2D RIPPLE RENDER =================
            else {
                if (!physRef.current.imgData || physRef.current.imgData.width !== w) {
                     physRef.current.imgData = ctx.createImageData(w, h);
                     physRef.current.buffer = new Uint32Array(physRef.current.imgData.data.buffer);
                }

                const buf = physRef.current.buffer!;
                const t = physRef.current.time;
                const invZoom = 1/waveZoom;

                // Precompute sources for speed
                const activeSources = waveSources.map(s => {
                    return { ...s, sx: s.x*w/100, sy: s.y*h/100 };
                });

                // Optimization: Skip pixels
                const skip = 2; 

                for (let y = 0; y < h; y += skip) {
                    for (let x = 0; x < w; x += skip) {
                        let totalAmp = 0;

                        let tx = x, ty = y;
                        if (is3DView) ty = (y - cy) * 2 + cy;
                        const worldX = (tx - cx) * invZoom + cx; 
                        const worldY = (ty - cy) * invZoom + cy;

                        // 1. Calculate Wave Interference (Superposition Principle)
                        for (const s of activeSources) {
                            const dx = worldX - s.sx; 
                            const dy = worldY - s.sy;
                            const dist = Math.sqrt(dx*dx + dy*dy);
                            
                            // Wave function: y = A * sin(k*r - w*t)
                            // A drops with distance (1/r approx)
                            const att = 500 / (dist + 50); // Attenuation factor
                            const val = Math.sin(dist * 0.15 - t * s.freq) * att;
                            
                            totalAmp += val;
                        }

                        // 2. High Contrast Coloring
                        // If amp > 0 (Peak) -> Cyan/White
                        // If amp < 0 (Trough) -> Blue/Dark
                        // Near 0 (Node) -> Black
                        
                        let r = 0, g = 0, b = 0;
                        const absAmp = Math.abs(totalAmp);
                        const intensity = Math.min(255, absAmp * 40); // Gain

                        if (totalAmp > 0) {
                            // Peak: Cyan
                            r = 0; 
                            g = intensity;
                            b = intensity;
                            // Add white core for very high peaks
                            if (intensity > 200) {
                                r = (intensity - 200) * 5;
                            }
                        } else {
                            // Trough: Deep Blue/Purple
                            r = intensity * 0.2;
                            g = 0;
                            b = intensity * 0.8;
                        }

                        // Clamp
                        r = Math.min(255, r); g = Math.min(255, g); b = Math.min(255, b);
                        
                        const color = (255 << 24) | (b << 16) | (g << 8) | (r << 0);
                        
                        // Block fill
                        for(let dy=0; dy<skip; dy++) {
                            for(let dx=0; dx<skip; dx++) {
                                if (x+dx < w && y+dy < h) {
                                    const idx = (y+dy)*w + (x+dx);
                                    buf[idx] = color;
                                }
                            }
                        }
                    }
                }
                ctx.putImageData(physRef.current.imgData, 0, 0);
                
                // Draw Sources (Handles)
                activeSources.forEach(s => {
                    const sx = (s.sx - cx) * waveZoom + cx; 
                    const sy = (s.sy - cy) * waveZoom + cy;
                    const renderY = is3DView ? (sy-cy)/2+cy : sy;
                    
                    // Glow
                    const grad = ctx.createRadialGradient(sx, renderY, 0, sx, renderY, 20);
                    grad.addColorStop(0, 'rgba(255,255,255,0.8)');
                    grad.addColorStop(1, 'transparent');
                    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(sx, renderY, 15, 0, Math.PI*2); ctx.fill();

                    // Core
                    ctx.fillStyle = '#000'; 
                    ctx.beginPath(); ctx.arc(sx, renderY, selectedWaveId === s.id ? 6 : 4, 0, Math.PI*2); ctx.fill();
                    
                    if(selectedWaveId === s.id) { 
                        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; 
                        ctx.beginPath(); ctx.arc(sx, renderY, 12, 0, Math.PI*2); ctx.stroke();
                    }
                });
            }

            frameId = requestAnimationFrame(render);
        };
        frameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frameId);
    }, [simType, isPaused, stringParams, waveSources, waveZoom, is3DView, simSpeed, selectedWaveId]);

    // Update selected source
    const updateSelectedSource = (updates: Partial<WaveSource>) => {
        if (!selectedWaveId) return;
        setWaveSources(prev => prev.map(s => s.id === selectedWaveId ? { ...s, ...updates } : s));
    };

    const selectedSource = waveSources.find(s => s.id === selectedWaveId);

    return (
        <div className="flex h-full w-full bg-[#020408] text-white overflow-hidden relative font-sans flex-col select-none">
            {/* Main Tabs */}
            <div className="h-14 shrink-0 bg-[#0a0a0f] border-b border-white/10 flex items-center justify-center px-4 gap-4 z-20">
                <button 
                    onClick={() => setSimType('Ripple2D')} 
                    className={`px-8 py-2 rounded-full font-bold transition-all text-sm uppercase tracking-wider flex items-center gap-2 ${
                        simType==='Ripple2D' ? 'bg-cyan-600 shadow-lg shadow-cyan-500/30 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Waves size={16}/> Giao Thoa (2D)
                </button>
                <div className="w-px h-8 bg-white/10"></div>
                <button 
                    onClick={() => setSimType('String1D')} 
                    className={`px-8 py-2 rounded-full font-bold transition-all text-sm uppercase tracking-wider flex items-center gap-2 ${
                        simType==='String1D' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Activity size={16}/> Sóng Dừng (1D)
                </button>
            </div>

            <div className="flex flex-1 relative overflow-hidden">
                {/* Viewport */}
                <div className="flex-1 relative cursor-crosshair group">
                    <canvas 
                        ref={canvasRef} 
                        className="w-full h-full block touch-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                    
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        <button onClick={() => setIsPaused(!isPaused)} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all shadow-xl border border-white/5">
                            {isPaused ? <Play size={24} fill="currentColor"/> : <Pause size={24} fill="currentColor"/>}
                        </button>
                        <button onClick={toggleAudio} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all text-yellow-400 shadow-xl border border-white/5">
                            <Volume2 size={24}/>
                        </button>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="w-80 bg-[#0a0a0f] border-l border-white/10 p-6 overflow-y-auto custom-scroll flex flex-col gap-8 shadow-2xl z-20">
                    
                    {/* 1D STRING CONTROLS */}
                    {simType === 'String1D' && (
                        <div className="space-y-6 animate-[fadeIn_0.3s]">
                            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2"><Sliders size={14}/> Cấu hình Sóng dừng</h3>
                            
                            <div className="flex bg-white/5 p-1 rounded-lg">
                                <button onClick={() => setStringParams({...stringParams, waveType: 'Transverse'})} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 ${stringParams.waveType==='Transverse' ? 'bg-indigo-600' : 'text-slate-400'}`}><AlignJustify size={14} className="rotate-90"/> Sóng Ngang</button>
                                <button onClick={() => setStringParams({...stringParams, waveType: 'Longitudinal'})} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 ${stringParams.waveType==='Longitudinal' ? 'bg-indigo-600' : 'text-slate-400'}`}><GripHorizontal size={14}/> Sóng Dọc</button>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map(n => (
                                    <button key={n} onClick={() => setStringParams(p => ({...p, frequency: n * 5, harmonics: n}))} className="py-2 bg-indigo-900/30 border border-indigo-500/30 rounded hover:bg-indigo-500/50 text-xs font-bold transition-colors">
                                        k={n}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <label className="block space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Lực căng dây (T)</span><span className="text-cyan-400">{stringParams.tension} N</span></div>
                                    <input type="range" min="10" max="150" value={stringParams.tension} onChange={e => setStringParams({...stringParams, tension: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded"/>
                                </label>
                                <label className="block space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Tần số nguồn (f)</span><span className="text-cyan-400">{stringParams.frequency} Hz</span></div>
                                    <input type="range" min="1" max="30" step="0.5" value={stringParams.frequency} onChange={e => setStringParams({...stringParams, frequency: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded"/>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <div className="flex bg-white/5 p-1 rounded-lg">
                                    <button onClick={() => setStringParams({...stringParams, boundary: 'Fixed'})} className={`flex-1 py-1.5 text-xs font-bold rounded ${stringParams.boundary==='Fixed' ? 'bg-indigo-600' : 'text-slate-400'}`}>Đầu Cố định</button>
                                    <button onClick={() => setStringParams({...stringParams, boundary: 'Free'})} className={`flex-1 py-1.5 text-xs font-bold rounded ${stringParams.boundary==='Free' ? 'bg-indigo-600' : 'text-slate-400'}`}>Đầu Tự do</button>
                                </div>
                                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                                    <span className="flex items-center gap-2"><Activity size={14}/> Biểu đồ năng lượng</span>
                                    <input type="checkbox" checked={stringParams.showEnergy} onChange={e => setStringParams({...stringParams, showEnergy: e.target.checked})} className="accent-cyan-500"/>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* 2D RIPPLE CONTROLS */}
                    {simType === 'Ripple2D' && (
                        <div className="space-y-6 animate-[fadeIn_0.3s]">
                            <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2"><Waves size={14}/> Nguồn sóng nước</h3>
                            
                            <div className="space-y-3 max-h-40 overflow-y-auto custom-scroll">
                                {waveSources.map(s => (
                                    <div key={s.id} onClick={() => setSelectedWaveId(s.id)} className={`p-3 rounded border cursor-pointer flex justify-between items-center transition-all ${selectedWaveId===s.id ? 'bg-cyan-900/30 border-cyan-500/50 scale-[1.02]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{backgroundColor: '#22d3ee'}}></div>
                                            <span className="text-xs font-bold text-slate-200">{s.name}</span>
                                        </div>
                                        <button onClick={(e) => {e.stopPropagation(); setWaveSources(prev => prev.filter(x => x.id !== s.id))}} className="text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setWaveSources(prev => [...prev, { id: Math.random().toString(), name: `Nguồn ${prev.length+1}`, type: 'Sine', x: 50 + (Math.random()-0.5)*20, y: 50 + (Math.random()-0.5)*20, freq: 6, amp: 120, phase: 0, color: '#facc15' }])} className="w-full py-2 border border-dashed border-white/20 hover:border-cyan-500 hover:text-cyan-400 rounded text-xs font-bold transition-all flex items-center justify-center gap-2"><Plus size={14}/> Thêm nguồn</button>

                            {/* Selected Source Controls */}
                            {selectedSource && (
                                <div className="bg-white/5 p-4 rounded-xl space-y-3 border border-white/5 animate-[fadeIn_0.3s]">
                                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide border-b border-white/10 pb-1 mb-2">Cấu hình {selectedSource.name}</h4>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-slate-400"><span>Tần số (f)</span><span>{selectedSource.freq.toFixed(1)} Hz</span></div>
                                        <input type="range" min="1" max="15" step="0.1" value={selectedSource.freq} onChange={e => updateSelectedSource({freq: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded"/>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-slate-400"><span>Biên độ (A)</span><span>{selectedSource.amp}</span></div>
                                        <input type="range" min="0" max="200" value={selectedSource.amp} onChange={e => updateSelectedSource({amp: Number(e.target.value)})} className="w-full accent-cyan-500 h-1 bg-white/10 rounded"/>
                                    </div>
                                    
                                    <div className="text-[10px] text-slate-500 italic pt-2 flex items-center gap-1">
                                        <MousePointer2 size={10}/> Kéo thả chấm tròn trên màn hình để di chuyển.
                                    </div>
                                </div>
                            )}

                            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer pt-4 border-t border-white/10">
                                <span className="flex items-center gap-2"><Move size={14}/> Chế độ 3D Tilt</span>
                                <input type="checkbox" checked={is3DView} onChange={e => setIs3DView(e.target.checked)} className="accent-cyan-500"/>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WaveSim;
