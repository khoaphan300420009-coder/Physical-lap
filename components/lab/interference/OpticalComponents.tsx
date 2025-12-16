
import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, MoveHorizontal, RotateCw, Ruler, ArrowRightLeft } from 'lucide-react';

// --- HELPER: Backlash Logic ---
// Returns the new actual position based on the screw position and backlash
export const applyBacklash = (currentLoadPos: number, newScrewPos: number, backlashAmount: number) => {
    // If screw moves right, load gets pushed right (max of load, screw - backlash)
    // If screw moves left, load gets pulled left (min of load, screw + backlash)
    // This creates a "dead zone" of width = backlash
    
    // However, for simple simulation where we track screw vs load:
    // Load tracks screw but lags by +/- half backlash or stays put inside deadzone?
    // Standard model: Load position is constrained to [Screw - Backlash, Screw] (pushing) or similar.
    
    // Let's use a simple hysteresis model:
    // The load can be anywhere between [Screw - Backlash/2] and [Screw + Backlash/2] without moving?
    // No, usually screw engages one side of the thread.
    
    // Model:
    // If Screw > Load, Load = Screw
    // If Screw < Load - Backlash, Load = Screw + Backlash
    // (This implies pulling/pushing model)
    
    let newLoad = currentLoadPos;
    const upperLimit = newScrewPos;
    const lowerLimit = newScrewPos - backlashAmount;
    
    if (newLoad < lowerLimit) newLoad = lowerLimit;
    if (newLoad > upperLimit) newLoad = upperLimit;
    
    return newLoad;
};

// --- 1. PRECISION KNOB (Visual only, parent handles logic) ---
interface KnobProps {
    label: string;
    value: number; // Visual rotation value (0-100 or unbounded)
    onChange: (delta: number) => void;
    step?: number;
    sensitivity?: number;
}

export const PrecisionKnob: React.FC<KnobProps> = ({ label, value, onChange, step = 1, sensitivity = 1 }) => {
    const [angle, setAngle] = useState(0);
    const lastY = useRef(0);
    const isDragging = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        lastY.current = e.clientY;
        document.body.style.cursor = 'ns-resize';
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const dy = lastY.current - e.clientY;
            lastY.current = e.clientY;
            
            if (dy !== 0) {
                const delta = dy * step * sensitivity;
                setAngle(prev => prev + dy * 5); // Visual rotation
                onChange(delta);
            }
        };
        const handleUp = () => {
            isDragging.current = false;
            document.body.style.cursor = 'default';
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [onChange, step, sensitivity]);

    return (
        <div className="flex flex-col items-center gap-2 group select-none">
            <div 
                className="w-20 h-20 rounded-full bg-gradient-to-b from-[#333] to-[#111] border-4 border-[#222] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-ns-resize relative overflow-hidden active:scale-95 transition-transform"
                onMouseDown={handleMouseDown}
            >
                {/* Texture */}
                <div className="absolute inset-0 opacity-30 bg-[repeating-conic-gradient(#222_0deg_10deg,#111_10deg_20deg)]"></div>
                
                {/* Indicator */}
                <div className="w-1.5 h-8 bg-orange-500 rounded-full absolute top-2 shadow-[0_0_5px_rgba(249,115,22,0.5)]" style={{ transformOrigin: '50% 36px', transform: `rotate(${angle}deg)` }}></div>
                
                {/* Center Cap */}
                <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#1a1a1a] shadow-[0_2px_5px_rgba(0,0,0,0.8)] border border-[#333]"></div>
                
                <RotateCw size={14} className="text-slate-500 absolute opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"/>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest bg-black/40 px-2 py-1 rounded">{label}</span>
        </div>
    );
};

// --- 2. ANALOG VERNIER MICROMETER (Canvas Render) ---
interface MicrometerProps {
    valueMM: number;
}

export const AnalogMicrometer: React.FC<MicrometerProps> = ({ valueMM }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return;
        const ctx = cvs.getContext('2d'); if (!ctx) return;
        
        const w = cvs.width = cvs.clientWidth;
        const h = cvs.height = cvs.clientHeight;
        
        // Background: Metallic
        const grad = ctx.createLinearGradient(0,0,0,h);
        grad.addColorStop(0, '#94a3b8'); grad.addColorStop(0.5, '#cbd5e1'); grad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
        
        // Scale Config
        const pxPerMM = 15;
        const startMM = Math.floor(valueMM - 5); // Show range around value
        const offsetX = (valueMM - startMM) * pxPerMM; // Shift for drawing
        const centerX = w/2;

        // Draw Main Scale (Fixed relative to view window? No, this is vernier.
        // Let's model a sliding vernier caliper view.)
        
        // TOP: Main Scale (Fixed in this view, Vernier moves? Or Main moves?)
        // Standard view: Main scale stationary, Vernier slides.
        // To keep specific value centered, we move the Main Scale drawing.
        
        const mainScaleY = h * 0.4;
        ctx.fillStyle = '#0f172a'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1;

        // Draw Main Scale ticks
        for (let i = startMM - 10; i < startMM + 20; i++) {
            const x = centerX + (i - valueMM) * pxPerMM; // Position relative to center based on value
            if (x < -20 || x > w+20) continue;
            
            const isCM = i % 10 === 0;
            const isHalf = i % 5 === 0;
            const tickH = isCM ? 20 : (isHalf ? 15 : 10);
            
            ctx.beginPath(); ctx.moveTo(x, mainScaleY); ctx.lineTo(x, mainScaleY - tickH); ctx.stroke();
            if (isCM) ctx.fillText((i/10).toString(), x, mainScaleY - 25);
        }
        
        // Bottom: Vernier Scale (Fixed in center of view, represents the slider)
        // Vernier length 9mm divided into 10 parts -> 0.9mm per div.
        // So 10 vernier div = 9 main div.
        const vernierY = mainScaleY + 1;
        // The "0" of vernier is at valueMM. Since we shifted main scale so valueMM is at center,
        // The vernier 0 is exactly at center.
        
        // Draw vernier plate
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(centerX - 10, vernierY, pxPerMM * 10 + 20, 30);
        ctx.fillStyle = '#0f172a';
        
        const vernierStep = pxPerMM * 0.9;
        
        for (let j = 0; j <= 10; j++) {
            const vx = centerX + j * vernierStep;
            const tickH = j % 5 === 0 ? 15 : 8;
            ctx.beginPath(); ctx.moveTo(vx, vernierY); ctx.lineTo(vx, vernierY + tickH); ctx.stroke();
            if (j % 5 === 0) ctx.fillText(j.toString(), vx, vernierY + 25);
        }
        
        // Red indicator line at 0
        ctx.strokeStyle = 'red'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(centerX, mainScaleY - 20); ctx.lineTo(centerX, vernierY + 20); ctx.stroke();

    }, [valueMM]);

    return (
        <div className="w-full h-24 rounded-lg border-2 border-slate-600 shadow-inner overflow-hidden relative bg-slate-300">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute top-1 left-1 text-[9px] text-slate-600 font-bold uppercase tracking-wider">Thang đo 0.1mm</div>
        </div>
    );
};

// --- 3. VIRTUAL CALIPER (Tool) ---
interface CaliperProps {
    pixelToMM: number; // Scale factor
    onMeasure: (mm: number) => void;
    width: number;
    height: number;
}

export const VirtualCaliper: React.FC<CaliperProps> = ({ pixelToMM, onMeasure, width, height }) => {
    const [pos, setPos] = useState({ x: 100, y: 100 });
    const [jawOpen, setJawOpen] = useState(20); // pixels
    const dragMode = useRef<'none' | 'move' | 'jaw'>('none');
    const lastMouse = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent, mode: 'move' | 'jaw') => {
        dragMode.current = mode;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (dragMode.current === 'none') return;
            const dx = e.clientX - lastMouse.current.x;
            const dy = e.clientY - lastMouse.current.y;
            lastMouse.current = { x: e.clientX, y: e.clientY };

            if (dragMode.current === 'move') {
                setPos(p => ({ x: p.x + dx, y: p.y + dy }));
            } else {
                setJawOpen(prev => {
                    const next = Math.max(0, prev + dx);
                    onMeasure(next / pixelToMM);
                    return next;
                });
            }
        };
        const handleUp = () => { dragMode.current = 'none'; };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [pixelToMM, onMeasure]);

    const mmValue = jawOpen / pixelToMM;

    return (
        <div 
            className="absolute z-50 select-none group" 
            style={{ left: pos.x, top: pos.y }}
        >
            {/* Main Body */}
            <div 
                className="relative cursor-move"
                onMouseDown={(e) => handleMouseDown(e, 'move')}
            >
                {/* Beam */}
                <div className="w-[300px] h-10 bg-[#475569] border border-slate-600 rounded-sm flex items-end pb-1 pl-4 shadow-xl">
                    {/* Scale Markings */}
                    <div className="w-full h-3 border-t border-slate-400 flex">
                        {Array.from({length: 30}).map((_, i) => (
                            <div key={i} className={`h-full border-r border-slate-500 ${i%5===0?'h-full':'h-1/2 mt-1.5'}`} style={{width: `${pixelToMM}px`}}></div>
                        ))}
                    </div>
                </div>
                
                {/* Fixed Jaw */}
                <div className="absolute left-0 top-10 w-4 h-24 bg-[#475569] rounded-b border-x border-b border-slate-600"></div>
                
                {/* Screen */}
                <div className="absolute left-10 top-2 w-20 h-6 bg-[#1e293b] border border-slate-500 rounded flex items-center justify-end px-2">
                    <span className="text-emerald-400 font-mono font-bold text-xs">{mmValue.toFixed(2)}</span>
                    <span className="text-slate-500 text-[8px] ml-1">mm</span>
                </div>
            </div>

            {/* Sliding Jaw */}
            <div 
                className="absolute top-0 h-36 w-12 cursor-ew-resize"
                style={{ left: jawOpen + 4 }} // Offset for visual alignment
                onMouseDown={(e) => handleMouseDown(e, 'jaw')}
            >
                {/* Slider Body */}
                <div className="w-full h-12 bg-[#64748b] border border-slate-500 rounded-t shadow-lg flex flex-col items-center justify-center gap-1">
                    <div className="w-6 h-0.5 bg-slate-400"></div>
                    <div className="w-6 h-0.5 bg-slate-400"></div>
                    <div className="w-6 h-0.5 bg-slate-400"></div>
                </div>
                {/* Jaw Down */}
                <div className="w-4 h-24 bg-[#64748b] rounded-b border-x border-b border-slate-500"></div>
                
                <div className="absolute -bottom-6 left-0 text-[10px] bg-black/50 text-white px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                    Kéo để đo
                </div>
            </div>
        </div>
    );
};

// --- 4. TAPE MEASURE ---
interface TapeProps {
    pixelToMeter: number;
    onMeasure: (m: number) => void;
}

export const TapeMeasure: React.FC<TapeProps> = ({ pixelToMeter, onMeasure }) => {
    const [start, setStart] = useState<{x:number, y:number} | null>(null);
    const [curr, setCurr] = useState<{x:number, y:number} | null>(null);
    const [active, setActive] = useState(false);

    // This component renders an overlay on the whole screen to capture clicks
    // Usage: Parent renders this when "Tape Mode" is active

    const handleDown = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (!active) {
            setStart({x, y});
            setCurr({x, y});
            setActive(true);
        } else {
            setActive(false);
            setStart(null);
            setCurr(null);
        }
    };

    const handleMove = (e: React.MouseEvent) => {
        if (active && start) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setCurr({x, y});
            
            const distPx = Math.hypot(x - start.x, y - start.y);
            onMeasure(distPx / pixelToMeter);
        }
    };

    return (
        <div 
            className={`absolute inset-0 z-40 ${active ? 'cursor-crosshair' : 'cursor-default'}`}
            onMouseDown={handleDown}
            onMouseMove={handleMove}
        >
            {/* Visual Feedback */}
            {active && start && curr && (
                <svg className="w-full h-full pointer-events-none">
                    <line x1={start.x} y1={start.y} x2={curr.x} y2={curr.y} stroke="#facc15" strokeWidth="2" strokeDasharray="5,5" />
                    <circle cx={start.x} cy={start.y} r="4" fill="#facc15" />
                    <circle cx={curr.x} cy={curr.y} r="4" fill="#facc15" />
                    <rect x={curr.x + 10} y={curr.y} width="60" height="24" rx="4" fill="rgba(0,0,0,0.8)" />
                    <text x={curr.x + 40} y={curr.y + 16} fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">
                        {(Math.hypot(curr.x - start.x, curr.y - start.y) / pixelToMeter).toFixed(2)} m
                    </text>
                </svg>
            )}
            
            {!active && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-600/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
                    <Ruler size={14}/> Click điểm bắt đầu để đo
                </div>
            )}
        </div>
    );
};
