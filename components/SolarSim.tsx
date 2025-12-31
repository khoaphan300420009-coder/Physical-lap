
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { PLANETS_DATA, PlanetConfig } from './solar/SolarData';
import { Play, Pause, Zap, Settings2, Calendar, Eye, Layers, Wind, Crosshair, Edit3, Info, Sun, ZoomIn, ZoomOut, CircleDashed } from 'lucide-react';

const HALLEY = {
    a: 17.8, e: 0.967, i: 162.3, 
    color: '#38bdf8', name: "Halley's Comet"
};

const SolarSim: React.FC = () => {
    // Configuration State (UI triggers)
    const [config, setConfig] = useState({
        speed: 1,
        paused: false,
        scaleMode: 'Visual' as 'Visual' | 'Real',
        viewCenter: 'sun',
        showOrbits: true,
        showLabels: true,
        tilt: 0.8, 
        showAsteroids: true,
        showComet: true,
        selectedPlanet: null as string | null,
        showRings: true,
    });

    // Animation State (Refs for 60fps)
    const timeRef = useRef(0);
    const [displayTime, setDisplayTime] = useState(0); // Sync for UI date display
    const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 0.7 });
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameCountRef = useRef(0);

    const asteroids = useMemo(() => {
        const count = 2000;
        const belt = [];
        for(let i=0; i<count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 2.5 + Math.random() * 1.5; 
            const height = (Math.random() - 0.5) * 0.2; 
            belt.push({ angle, dist, height, speed: 0.05 / Math.sqrt(dist) });
        }
        return belt;
    }, []);

    const calculatePosition = (p: PlanetConfig, t: number) => {
        if (!p || !p.orbit) return { x: 0, y: 0, realR: 0 };
        const { a, e, L } = p.orbit;
        if (a === 0) return { x: 0, y: 0, realR: 0 };

        const n = 0.9856 / Math.sqrt(a * a * a);
        const M = (L + n * t) % 360;
        const M_rad = M * Math.PI / 180;
        
        let E = M_rad;
        for (let i = 0; i < 5; i++) E = E - (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
        
        const r = a * (1 - e * Math.cos(E));
        const v = 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2));
        const theta = v + (p.orbit.longPeri * Math.PI / 180);
        
        // Scale Logic Improved
        let scale = r * 10;
        if (config.scaleMode === 'Visual') {
            scale = Math.pow(r, 0.4) * 80; 
        }
        
        return {
            x: scale * Math.cos(theta),
            y: scale * Math.sin(theta), 
            realR: r
        };
    };

    const calculateCometPos = (t: number) => {
        const n = 0.9856 / Math.sqrt(HALLEY.a**3);
        const M = (0 + n * t) % 360; 
        const M_rad = M * Math.PI / 180;
        let E = M_rad; 
        for(let i=0; i<10; i++) E = E - (E - HALLEY.e*Math.sin(E)-M_rad)/(1-HALLEY.e*Math.cos(E));
        const r = HALLEY.a * (1 - HALLEY.e*Math.cos(E));
        const v = 2 * Math.atan(Math.sqrt((1+HALLEY.e)/(1-HALLEY.e))*Math.tan(E/2));
        const theta = v + Math.PI; 
        
        let scale = r * 10;
        if (config.scaleMode === 'Visual') {
             scale = Math.pow(r, 0.4) * 80;
        }

        return { x: scale * Math.cos(theta), y: scale * Math.sin(theta) };
    };

    useEffect(() => {
        const cvs = canvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;

        let frameId: number;
        const render = () => {
            const w = cvs.width = cvs.clientWidth;
            const h = cvs.height = cvs.clientHeight;
            const cx = w / 2;
            const cy = h / 2;

            // Physics Update
            if (!config.paused) {
                timeRef.current += config.speed * 0.1;
                frameCountRef.current++;
                // Sync UI only every 10 frames to avoid React lag
                if (frameCountRef.current % 10 === 0) {
                    setDisplayTime(timeRef.current);
                }
            }

            const currentTime = timeRef.current;
            const planetPos = PLANETS_DATA.filter(p => p).map(p => ({...p, ...calculatePosition(p, currentTime)}));
            
            let viewX = 0, viewY = 0;
            if (config.viewCenter !== 'sun') {
                const target = planetPos.find(p => p.id === config.viewCenter);
                if (target) { viewX = target.x; viewY = target.y; }
            }

            // Draw
            ctx.fillStyle = '#020408'; ctx.fillRect(0, 0, w, h);
            
            // Stars
            ctx.save();
            ctx.translate(cx, cy);
            for(let i=0; i<200; i++) {
                const sx = (Math.sin(i*543) * w) - viewX * 0.05;
                const sy = (Math.cos(i*123) * h) - viewY * 0.05 * Math.cos(config.tilt);
                ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.5})`;
                ctx.fillRect(sx % w, sy % h, 1, 1);
            }
            ctx.restore();

            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(camera.zoom, camera.zoom);
            
            // Orbits
            if (config.showOrbits) {
                planetPos.forEach(p => {
                    if (p.id === 'sun') return;
                    ctx.beginPath();
                    const r = Math.sqrt(p.x*p.x + p.y*p.y); 
                    ctx.ellipse(-viewX, -viewY * Math.cos(config.tilt), r, r * Math.cos(config.tilt), 0, 0, Math.PI*2);
                    ctx.strokeStyle = p.color;
                    ctx.globalAlpha = 0.15;
                    ctx.lineWidth = 1/camera.zoom;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                });
            }

            // Asteroids
            if (config.showAsteroids) {
                ctx.fillStyle = '#64748b';
                asteroids.forEach((ast, i) => {
                    const currAngle = ast.angle + ast.speed * currentTime * 0.01;
                    let scale = ast.dist * 10;
                    if (config.scaleMode === 'Visual') scale = Math.pow(ast.dist, 0.4) * 80;

                    const x = Math.cos(currAngle) * scale - viewX;
                    const y = (Math.sin(currAngle) * scale - viewY) * Math.cos(config.tilt) + ast.height * 50 * Math.sin(config.tilt);
                    
                    if (y < 0) ctx.globalAlpha = 0.3; else ctx.globalAlpha = 0.8; 
                    ctx.fillRect(x, y, 1.5/camera.zoom, 1.5/camera.zoom);
                });
            }

            // Comet
            if (config.showComet) {
                const cometPos = calculateCometPos(currentTime);
                const cx_scr = cometPos.x - viewX;
                const cy_scr = (cometPos.y - viewY) * Math.cos(config.tilt);
                
                const dx = cometPos.x; 
                const dy = cometPos.y;
                const len = Math.sqrt(dx*dx + dy*dy);
                const tailLen = 50 / camera.zoom * (100/len); 
                
                const gradient = ctx.createLinearGradient(cx_scr, cy_scr, cx_scr + (dx/len)*tailLen, cy_scr + (dy/len)*tailLen * Math.cos(config.tilt));
                gradient.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
                gradient.addColorStop(1, 'transparent');
                
                ctx.lineWidth = 4/camera.zoom;
                ctx.strokeStyle = gradient;
                ctx.beginPath(); ctx.moveTo(cx_scr, cy_scr); ctx.lineTo(cx_scr + (dx/len)*tailLen, cy_scr + (dy/len)*tailLen * Math.cos(config.tilt)); ctx.stroke();
                
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(cx_scr, cy_scr, 2/camera.zoom, 0, Math.PI*2); ctx.fill();
            }

            const sortedPlanets = [...planetPos].sort((a, b) => {
                 const ay = (a.y - viewY) * Math.cos(config.tilt);
                 const by = (b.y - viewY) * Math.cos(config.tilt);
                 return ay - by;
            });

            // Draw Planets (Detailed)
            sortedPlanets.forEach(p => {
                if (!p) return;
                const screenX = p.x - viewX;
                const screenY = (p.y - viewY) * Math.cos(config.tilt);
                
                let radius = config.scaleMode === 'Visual' ? Math.max(3, Math.log(p.radiusKM)*1.5) : p.radiusKM / 1000;
                if (p.id === 'sun') radius = 25;
                const rRender = radius/camera.zoom;

                if (p.id === 'sun') {
                    // Sun Glow
                    const grd = ctx.createRadialGradient(screenX, screenY, rRender*0.5, screenX, screenY, rRender*4);
                    grd.addColorStop(0, '#fdb813');
                    grd.addColorStop(0.3, 'rgba(253, 184, 19, 0.4)');
                    grd.addColorStop(1, 'transparent');
                    ctx.fillStyle = grd;
                    ctx.beginPath(); ctx.arc(screenX, screenY, rRender*4, 0, Math.PI*2); ctx.fill();
                    
                    // Sun Core
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(screenX, screenY, rRender, 0, Math.PI*2); ctx.fill();
                } else {
                    ctx.save();
                    ctx.translate(screenX, screenY);
                    
                    // Shadow side logic (simple vector to sun)
                    const angToSun = Math.atan2(-p.y, -p.x);

                    // Base Planet Circle
                    ctx.beginPath();
                    ctx.arc(0, 0, rRender, 0, Math.PI*2);
                    ctx.fillStyle = p.color;
                    ctx.fill();

                    // --- Detailed Features ---
                    if (p.id === 'jupiter') {
                        // Bands
                        ctx.save();
                        ctx.clip();
                        ctx.rotate(Math.PI/4); // Tilt
                        ctx.fillStyle = 'rgba(0,0,0,0.1)';
                        ctx.fillRect(-rRender, -rRender*0.2, rRender*2, rRender*0.1);
                        ctx.fillRect(-rRender, rRender*0.3, rRender*2, rRender*0.1);
                        ctx.fillStyle = 'rgba(255,255,255,0.1)';
                        ctx.fillRect(-rRender, -rRender*0.5, rRender*2, rRender*0.1);
                        ctx.restore();
                    } else if (p.id === 'earth') {
                        // Continents
                        ctx.save();
                        ctx.clip();
                        ctx.rotate(currentTime * 0.1); // Spin
                        ctx.fillStyle = '#16a34a'; // Green
                        ctx.beginPath(); ctx.arc(rRender*0.4, rRender*0.3, rRender*0.4, 0, Math.PI*2); ctx.fill();
                        ctx.beginPath(); ctx.arc(-rRender*0.3, -rRender*0.2, rRender*0.5, 0, Math.PI*2); ctx.fill();
                        ctx.restore();
                    }

                    // Rings (Saturn/Uranus)
                    if (config.showRings && (p.id === 'saturn' || p.id === 'uranus')) {
                        ctx.restore(); // Pop back to world coords
                        ctx.save();
                        ctx.translate(screenX, screenY);
                        
                        ctx.beginPath();
                        const rx = rRender * 2.2;
                        const ry = rx * 0.3 * Math.cos(config.tilt); 
                        ctx.ellipse(0, 0, rx, ry, p.id==='uranus'?Math.PI/2:0, 0, Math.PI*2);
                        ctx.strokeStyle = p.id === 'saturn' ? 'rgba(200, 180, 150, 0.4)' : 'rgba(200, 240, 255, 0.2)';
                        ctx.lineWidth = rRender * 0.8;
                        ctx.stroke();
                        
                        // Gap in rings
                        ctx.beginPath();
                        ctx.ellipse(0, 0, rx*0.7, ry*0.7, p.id==='uranus'?Math.PI/2:0, 0, Math.PI*2);
                        ctx.strokeStyle = '#020408'; // Background color to cut
                        ctx.lineWidth = 1; 
                        ctx.stroke();
                    } else {
                        ctx.restore(); // Pop
                    }

                    // Shadow (Night side)
                    ctx.save();
                    ctx.translate(screenX, screenY);
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.beginPath();
                    ctx.arc(0, 0, rRender, angToSun + Math.PI/2, angToSun - Math.PI/2, false);
                    ctx.fill();
                    ctx.restore();
                }

                if (config.selectedPlanet === p.id) {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1.5/camera.zoom;
                    ctx.setLineDash([4/camera.zoom, 4/camera.zoom]);
                    ctx.beginPath(); ctx.arc(screenX, screenY, (rRender+5), 0, Math.PI*2); ctx.stroke();
                    ctx.setLineDash([]);
                }

                if (config.showLabels) {
                    ctx.fillStyle = '#fff';
                    ctx.font = `${10/camera.zoom}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.fillText(p.name, screenX, screenY + rRender + 15/camera.zoom);
                }
            });

            ctx.restore();
            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, [config, camera, asteroids]); // Reduced dependencies

    const handleWheel = (e: React.WheelEvent) => setCamera(c => ({...c, zoom: Math.max(0.1, Math.min(5, c.zoom - e.deltaY * 0.001))}));
    
    // UI Date Sync
    const currentDate = new Date(2024, 0, 1);
    currentDate.setDate(currentDate.getDate() + displayTime);
    const dateStr = currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const selectedInfo = config.selectedPlanet ? PLANETS_DATA.find(p => p && p.id === config.selectedPlanet) : null;

    return (
        <div className="flex flex-col h-full w-full bg-[#020408] text-white font-sans overflow-hidden relative group/canvas">
            
            <div className="flex-1 relative overflow-hidden">
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full block cursor-move"
                    onWheel={handleWheel}
                    onMouseDown={() => {}} 
                />

                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-20">
                    <div className="pointer-events-auto flex flex-col gap-3">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-xl">
                            <button onClick={() => setConfig(s => ({...s, paused: !s.paused}))} className="w-10 h-10 flex items-center justify-center bg-cyan-600 rounded-xl hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20">
                                {config.paused ? <Play size={20} fill="currentColor"/> : <Pause size={20} fill="currentColor"/>}
                            </button>
                            <div className="h-8 w-px bg-white/20"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulation Date</span>
                                <div className="flex items-center gap-2 text-xl font-mono font-bold text-white">
                                    <Calendar size={18} className="text-cyan-400"/> {dateStr}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3 w-fit">
                            <span className="text-xs font-bold text-slate-400">SPEED</span>
                            <input type="range" min="0" max="100" value={config.speed} onChange={e => setConfig(s => ({...s, speed: Number(e.target.value)}))} className="w-32 accent-cyan-500 h-1 bg-white/20 rounded cursor-pointer"/>
                            <span className="text-xs font-mono text-cyan-400">{config.speed.toFixed(1)}x</span>
                        </div>

                         <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3 w-fit">
                            <span className="text-xs font-bold text-slate-400">ZOOM</span>
                            <input type="range" min="0.1" max="5.0" step="0.1" value={camera.zoom} onChange={e => setCamera(s => ({...s, zoom: Number(e.target.value)}))} className="w-32 accent-cyan-500 h-1 bg-white/20 rounded cursor-pointer"/>
                        </div>
                    </div>

                    <div className="pointer-events-auto flex flex-col gap-2 items-end">
                        <button onClick={() => setConfig(s => ({...s, tilt: s.tilt === 0 ? 0.8 : 0}))} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all text-white" title="Toggle 2D/3D">
                            <Layers size={20}/>
                        </button>
                        
                         <button onClick={() => setConfig(s => ({...s, showRings: !s.showRings}))} className={`p-3 rounded-xl border transition-all text-white ${config.showRings ? 'bg-purple-500/30 border-purple-400' : 'bg-white/10 border-white/10'}`} title="Planetary Rings">
                            <CircleDashed size={20}/>
                        </button>

                        <div className="bg-black/60 px-3 py-1 rounded-lg text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-white/5">
                            {config.tilt === 0 ? 'Top-Down View' : 'Orbital View (3D)'}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto z-20">
                    <div className="flex bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                        <button onClick={() => setConfig(s => ({...s, scaleMode: 'Visual'}))} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${config.scaleMode==='Visual' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Visual Scale</button>
                        <button onClick={() => setConfig(s => ({...s, scaleMode: 'Real'}))} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${config.scaleMode==='Real' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Real Scale</button>
                    </div>
                </div>

                {selectedInfo && (
                    <div className="absolute top-24 right-6 w-80 bg-[#0a0f18]/90 backdrop-blur-2xl border border-cyan-500/30 p-6 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-[slideInRight_0.3s] z-30">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-display font-black text-white">{selectedInfo.name}</h2>
                            <button onClick={() => setConfig(s => ({...s, selectedPlanet: null}))} className="p-2 hover:bg-white/10 rounded-full"><Info size={20} className="text-cyan-400"/></button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-300 leading-relaxed font-light">{selectedInfo.desc}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Mass</span>
                                    <span className="text-sm font-mono text-cyan-300">{(selectedInfo.massKG / 1e24).toFixed(2)} Yg</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Radius</span>
                                    <span className="text-sm font-mono text-cyan-300">{selectedInfo.radiusKM.toLocaleString()} km</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="h-32 bg-[#0a0f18]/80 backdrop-blur-xl border-t border-white/10 shrink-0 flex flex-col justify-center px-6 relative z-30">
                 <div className="flex items-center gap-4 overflow-x-auto custom-scroll pb-2">
                    <button 
                         onClick={() => setConfig(s => ({...s, viewCenter: 'sun', selectedPlanet: 'sun'}))}
                         className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[80px] ${config.viewCenter === 'sun' ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
                    >
                         <div className="w-12 h-12 rounded-full border-2 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.5)]" style={{backgroundColor: '#FDB813'}}></div>
                         <span className="text-xs font-bold text-white">Mặt Trời</span>
                    </button>

                    <div className="w-px h-16 bg-white/10"></div>

                    {PLANETS_DATA.filter(p => p && p.id !== 'sun').map(p => (
                        <button 
                            key={p.id} 
                            onClick={() => setConfig(s => ({...s, viewCenter: p.id, selectedPlanet: p.id}))}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[80px] ${config.viewCenter === p.id ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
                        >
                            <div className="w-10 h-10 rounded-full border border-white/20 shadow-lg" style={{backgroundColor: p.color}}></div>
                            <span className="text-xs font-bold text-white">{p.name}</span>
                        </button>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default SolarSim;
