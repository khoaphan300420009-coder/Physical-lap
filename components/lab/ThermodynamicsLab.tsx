
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, Wind, Thermometer, Gauge, BoxSelect, Droplets, MoveRight, ChevronRight, Settings } from 'lucide-react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    color: string;
    mass: number;
}

const ThermodynamicsLab: React.FC = () => {
    const [scenario, setScenario] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    
    // Physics State (Refs for performance)
    const particlesRef = useRef<Particle[]>([]);
    
    // UI State (Trigger re-renders)
    const [temperature, setTemperature] = useState(300); // Kelvin
    const [volumeX, setVolumeX] = useState(600); // Controls box width
    const [pressure, setPressure] = useState(0);
    const [particleCount, setParticleCount] = useState(0);
    const [pistonMass, setPistonMass] = useState(10);
    
    // Feature Toggles
    const [showVectors, setShowVectors] = useState(false);
    const [trackParticle, setTrackParticle] = useState(false);
    const [isPistonActive, setIsPistonActive] = useState(false);
    const [hasHole, setHasHole] = useState(false);
    const [mixingMode, setMixingMode] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pressureAccumulator = useRef(0);
    const frameCount = useRef(0);

    const SCENARIOS = [
        "Phòng thí nghiệm chung",
        "Đẳng tích (ĐL Charles)",
        "Đẳng nhiệt (ĐL Boyle)",
        "Đẳng áp (ĐL Gay-Lussac)",
        "Trộn khí Nóng/Lạnh",
        "Mô phỏng Piston",
        "Thoát khí (Lỗ thủng)"
    ];

    const createParticle = (xCenter: number, yCenter: number, temp: number, color?: string, mass: number = 1): Particle => {
        const speed = Math.sqrt(temp) * 0.2;
        const angle = Math.random() * Math.PI * 2;
        return {
            x: xCenter + (Math.random() - 0.5) * 100,
            y: yCenter + (Math.random() - 0.5) * 100,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: mass > 1 ? 8 : 4,
            color: color || '#38bdf8',
            mass: mass
        };
    };

    // Initialize logic
    useEffect(() => {
        // Reset state
        particlesRef.current = [];
        setVolumeX(600);
        setTemperature(300);
        setPressure(0);
        setMixingMode(false);
        setIsPistonActive(false);
        setHasHole(false);

        let initialParticles: Particle[] = [];

        if (scenario === 0) {
            // General lab: start empty
        } else if (scenario === 4) {
            // Mixing: Pre-fill left (hot) and right (cold)
            for(let i=0; i<30; i++) initialParticles.push(createParticle(100 + Math.random()*200, 200, 300, 'red')); // Hot
            for(let i=0; i<30; i++) initialParticles.push(createParticle(400 + Math.random()*200, 200, 100, 'blue')); // Cold
            setMixingMode(true);
        } else {
            // Others: Start with some gas
            for(let i=0; i<50; i++) initialParticles.push(createParticle(300, 200, 300));
        }

        if (scenario === 5) setIsPistonActive(true);
        if (scenario === 6) setHasHole(true);

        particlesRef.current = initialParticles;
        setParticleCount(initialParticles.length);

    }, [scenario]);

    const addParticles = (count: number, type: 'Normal' | 'Heavy' | 'Light' = 'Normal') => {
        let mass = 1; let color = '#38bdf8';
        if (type === 'Heavy') { mass = 5; color = '#fbbf24'; }
        
        const newP: Particle[] = [];
        for(let i=0; i<count; i++) newP.push(createParticle(volumeX/2, 200, temperature, color, mass));
        
        particlesRef.current = [...particlesRef.current, ...newP];
        setParticleCount(particlesRef.current.length);
    };

    const clearParticles = () => {
        particlesRef.current = [];
        setParticleCount(0);
        setPressure(0);
    };

    // Physics Loop
    useEffect(() => {
        const cvs = canvasRef.current; if(!cvs) return;
        const ctx = cvs.getContext('2d'); if(!ctx) return;
        let animationId: number;

        const render = () => {
            const width = cvs.width = cvs.clientWidth;
            const height = cvs.height = cvs.clientHeight;
            
            // Box dimensions
            const boxH = 400;
            const boxY = (height - boxH)/2;
            const boxW = volumeX; // Dynamic width
            
            // Piston logic
            if (isPistonActive && isPlaying) {
                const targetVol = (particlesRef.current.length * temperature) / (pistonMass * 10); 
                setVolumeX(v => v + (targetVol - v) * 0.05);
            }

            // Draw Background
            ctx.fillStyle = '#050508'; ctx.fillRect(0,0,width,height);
            
            // Draw Box
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
            ctx.strokeRect(50, boxY, boxW, boxH);
            
            // Hole Logic
            if (hasHole) {
                ctx.clearRect(boxW + 40, boxY + boxH/2 - 20, 20, 40); // Visual hole
            }

            // Piston Lid
            if (scenario === 5) {
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(50 + boxW, boxY, 20, boxH);
            }

            // Mixing wall
            if (mixingMode && boxW > 300) {
                ctx.beginPath(); ctx.moveTo(350, boxY); ctx.lineTo(350, boxY+boxH); 
                ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.stroke();
            }

            if (isPlaying) {
                const particles = particlesRef.current;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    
                    if (!mixingMode) {
                        const currentSpeed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
                        const targetSpeed = Math.sqrt(temperature) * 0.2 / Math.sqrt(p.mass);
                        // Smoothly adjust speed towards target temp
                        const scale = targetSpeed / (currentSpeed || 1);
                        p.vx = p.vx * 0.95 + p.vx * scale * 0.05;
                        p.vy = p.vy * 0.95 + p.vy * scale * 0.05;
                    }

                    p.x += p.vx;
                    p.y += p.vy;

                    // Wall Collisions
                    // Left
                    if (p.x < 50 + p.r) { 
                        p.x = 50 + p.r; p.vx *= -1; 
                        pressureAccumulator.current += Math.abs(p.vx * p.mass);
                    }
                    // Right
                    if (p.x > 50 + boxW - p.r) {
                        if (hasHole && p.y > boxY + boxH/2 - 20 && p.y < boxY + boxH/2 + 20) {
                            // Escaped!
                            p.x = 9999; 
                        } else {
                            p.x = 50 + boxW - p.r; p.vx *= -1;
                            pressureAccumulator.current += Math.abs(p.vx * p.mass);
                        }
                    }
                    // Top
                    if (p.y < boxY + p.r) {
                        p.y = boxY + p.r; p.vy *= -1;
                        pressureAccumulator.current += Math.abs(p.vy * p.mass);
                    }
                    // Bottom
                    if (p.y > boxY + boxH - p.r) {
                        p.y = boxY + boxH - p.r; p.vy *= -1;
                        pressureAccumulator.current += Math.abs(p.vy * p.mass);
                    }
                }
            }

            // Cleanup escaped particles periodically
            if (hasHole && frameCount.current % 60 === 0) {
                particlesRef.current = particlesRef.current.filter(p => p.x < 2000);
            }

            // Draw Particles
            const particles = particlesRef.current;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.x > 2000) continue;
                
                ctx.beginPath(); 
                ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                
                if (trackParticle && i === 0) ctx.fillStyle = '#ef4444'; // Red tracker
                else ctx.fillStyle = p.color;
                
                ctx.fill();

                if (showVectors) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); 
                    ctx.lineTo(p.x + p.vx * 10, p.y + p.vy * 10);
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth=1; ctx.stroke();
                }
            }

            // Calculate Pressure
            frameCount.current++;
            if (frameCount.current % 10 === 0) { 
                setPressure(Math.round(pressureAccumulator.current / 10)); 
                pressureAccumulator.current = 0;
                // Sync count only occasionally to avoid re-renders
                if (frameCount.current % 30 === 0 && hasHole) {
                    setParticleCount(particles.length);
                }
            }

            animationId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationId);
    }, [volumeX, isPlaying, showVectors, trackParticle, hasHole, isPistonActive, temperature, mixingMode, scenario, pistonMass]);


    return (
        <div className="flex h-full w-full bg-[#020408] font-sans">
            {/* Sidebar Controls */}
            <div className="w-80 shrink-0 bg-[#0a0f18] border-r border-white/10 flex flex-col h-full overflow-hidden z-20 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                        <Flame className="text-red-500"/> Nhiệt Học Lab
                    </h2>
                    
                    <div className="relative mb-6">
                        <select 
                            value={scenario} 
                            onChange={(e) => setScenario(Number(e.target.value))}
                            className="w-full bg-[#1e293b] border border-white/10 text-white text-sm rounded-lg p-3 appearance-none focus:ring-2 ring-red-500 outline-none cursor-pointer"
                        >
                            {SCENARIOS.map((name, i) => (
                                <option key={i} value={i}>{i+1}. {name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400"><ChevronRight size={16} className="rotate-90"/></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => addParticles(10)} className="py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white flex flex-col items-center gap-1 transition-colors">
                            <Wind size={16}/> +10 Hạt
                        </button>
                        <button onClick={clearParticles} className="py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-colors">
                            <RotateCcw size={16}/> Xóa hết
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-8">
                    {/* Meters */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                            <Gauge size={20} className="mx-auto text-green-400 mb-2"/>
                            <div className="text-xs text-slate-400 font-bold uppercase">Áp suất</div>
                            <div className="text-xl font-mono text-white">{pressure} <span className="text-[10px]">Pa</span></div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                            <BoxSelect size={20} className="mx-auto text-blue-400 mb-2"/>
                            <div className="text-xs text-slate-400 font-bold uppercase">Hạt</div>
                            <div className="text-xl font-mono text-white">{particleCount}</div>
                        </div>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-300">
                                <span className="flex items-center gap-2"><Thermometer size={14}/> Nhiệt độ (T)</span>
                                <span className="text-red-400">{temperature} K</span>
                            </div>
                            <input type="range" min="0" max="1000" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="w-full accent-red-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"/>
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>Đông đặc</span>
                                <span>Nóng chảy</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-300">
                                <span className="flex items-center gap-2"><BoxSelect size={14}/> Thể tích (V)</span>
                                <span className="text-blue-400">{Math.round(volumeX)} L</span>
                            </div>
                            <input type="range" min="200" max="800" value={volumeX} onChange={e => setVolumeX(Number(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg cursor-pointer" disabled={isPistonActive}/>
                        </div>

                        {isPistonActive && (
                            <div className="space-y-3 animate-[fadeIn_0.3s]">
                                <div className="flex justify-between text-xs font-bold text-slate-300">
                                    <span className="flex items-center gap-2"><Settings size={14}/> Khối lượng Piston</span>
                                    <span className="text-yellow-400">{pistonMass} kg</span>
                                </div>
                                <input type="range" min="1" max="50" value={pistonMass} onChange={e => setPistonMass(Number(e.target.value))} className="w-full accent-yellow-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"/>
                            </div>
                        )}
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Vector vận tốc</span>
                            <input type="checkbox" checked={showVectors} onChange={e => setShowVectors(e.target.checked)} className="accent-cyan-500"/>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Theo dõi 1 hạt</span>
                            <input type="checkbox" checked={trackParticle} onChange={e => setTrackParticle(e.target.checked)} className="accent-red-500"/>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Lỗ thoát khí</span>
                            <input type="checkbox" checked={hasHole} onChange={e => setHasHole(e.target.checked)} className="accent-yellow-500"/>
                        </label>
                    </div>

                    <button onClick={() => addParticles(5, 'Heavy')} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-xs font-bold text-yellow-400 hover:bg-white/5 transition-all">
                        + Thả hạt nặng (So sánh)
                    </button>
                </div>
            </div>

            {/* Main View */}
            <div className="flex-1 relative bg-[#050508] overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full block" />
                
                {/* Overlay Controls */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all border border-white/5">
                        {isPlaying ? <Pause size={20} className="text-white"/> : <Play size={20} className="text-white"/>}
                    </button>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-none opacity-50">
                    <Droplets size={24} className="text-blue-500"/>
                    <MoveRight size={24} className="text-slate-500 animate-pulse"/>
                    <Flame size={24} className="text-red-500"/>
                </div>
            </div>
        </div>
    );
};

export default ThermodynamicsLab;
