
import React, { useState, useEffect, useRef } from 'react';
import { Layers, MousePointer2, Grid } from 'lucide-react';
import { nmToRGB } from './InterferenceCommon';

const AirWedge: React.FC = () => {
    const [hairThickness, setHairThickness] = useState(50); // microns
    const [wedgeLength] = useState(100); // mm
    const [lambda] = useState(550); // nm
    
    // Counting Tool State
    const [toolPos, setToolPos] = useState({ x: 100, y: 100 });
    const isDragging = useRef(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Physics: Air Wedge
    // Thickness at x: t = x * (h / L)
    // 2nt = k * lambda (Dark fringes) -> x = k * lambda * L / (2h)
    // Fringe spacing i = lambda * L / (2h)
    
    // Convert units to common baseline (microns)
    // lambda = 0.55 um
    // L = 100,000 um
    // h = 50 um
    // i = 0.55 * 100000 / (2 * 50) = 550 um = 0.55 mm
    
    const i_mm = (lambda * 1e-3 * wedgeLength) / (2 * hairThickness * 1e-3 * 1000); 
    // Wait, let's stick to mm.
    // i = (5.5e-4 mm * 100 mm) / (2 * 0.05 mm) = 0.55 mm
    
    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return;
        const ctx = cvs.getContext('2d'); if (!ctx) return;
        
        const w = cvs.width = cvs.clientWidth;
        const h = cvs.height = cvs.clientHeight;
        
        ctx.fillStyle = '#111'; ctx.fillRect(0,0,w,h);
        
        // Draw Fringes
        // Scale: Let's say screen shows 10mm width total for microscope view?
        // Or show the whole wedge?
        // Let's show a "Microscope View" which is a zoomed section.
        const zoom = 50; // pixels per mm
        const offsetX = 0; 
        
        const color = nmToRGB(lambda);
        const stripW = w; 
        
        for (let x = 0; x < w; x++) {
            const x_mm = x / zoom;
            // Intensity I ~ cos^2(pi * x / i)
            const phase = (Math.PI * x_mm) / (i_mm || 1);
            const intensity = Math.cos(phase) ** 2;
            
            ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `,${intensity})`);
            ctx.fillRect(x, 0, 1, h);
        }
        
        // Draw 1mm Grid overlay? Or tool handles that.
        
    }, [hairThickness, lambda]);

    const handleDrag = (e: React.MouseEvent) => {
        if (isDragging.current) {
            setToolPos({ x: e.clientX - 350, y: e.clientY - 50 }); // Simple offset adjustment
        }
    };

    return (
        <div className="flex h-full w-full bg-[#020408] font-sans" onMouseMove={handleDrag} onMouseUp={() => isDragging.current = false}>
            <div className="flex-1 relative overflow-hidden bg-black cursor-none">
                <canvas ref={canvasRef} className="w-full h-full block"/>
                
                {/* Counting Tool (1mm Box) */}
                <div 
                    className="absolute border-2 border-red-500 bg-red-500/10 w-[50px] h-[50px] flex items-center justify-center cursor-move shadow-[0_0_10px_red]"
                    style={{ left: toolPos.x, top: toolPos.y, width: '50px' }} // 50px = 1mm at zoom 50
                    onMouseDown={() => isDragging.current = true}
                >
                    <span className="text-[10px] font-bold text-red-400 bg-black/50 px-1">1mm</span>
                    <Grid size={12} className="absolute top-1 right-1 opacity-50"/>
                </div>
                
                <div className="absolute top-4 left-4 text-xs text-slate-500">
                    <p>Zoom: 50x (1mm trên màn hình = 50px)</p>
                </div>
            </div>

            <div className="w-80 bg-[#0a0f18] border-l border-white/10 p-8 flex flex-col gap-8 shadow-2xl z-20">
                <div>
                    <h2 className="text-xl font-bold text-teal-400 flex items-center gap-2 border-b border-white/10 pb-4"><Layers/> Nêm Không Khí</h2>
                    <p className="text-xs text-slate-500 mt-2">Đo độ dày sợi tóc bằng cách đếm vân giao thoa.</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl">
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                            <span>Độ dày tóc giả lập ($d$)</span>
                            <span className="text-teal-400">{hairThickness} µm</span>
                        </div>
                        <input 
                            type="range" min="10" max="100" 
                            value={hairThickness} onChange={e => setHairThickness(Number(e.target.value))} 
                            className="w-full accent-teal-500 h-1.5 bg-white/10 rounded-lg"
                        />
                    </div>
                    
                    <div className="bg-teal-900/10 border border-teal-500/20 p-4 rounded-xl text-xs text-teal-200/80 space-y-2">
                        <p className="font-bold uppercase">Hướng dẫn:</p>
                        <ol className="list-decimal pl-4 space-y-1">
                            <li>Kéo khung đỏ (1mm) đếm số vân $N$.</li>
                            <li>Khoảng vân $i = 1 / N$ (mm).</li>
                            <li>Công thức: $d = \frac{\lambda L}{2i}$.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AirWedge;
