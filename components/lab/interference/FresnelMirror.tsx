
import React, { useState, useEffect, useRef } from 'react';
import { Columns, Eye, MousePointer2 } from 'lucide-react';
import { rgba, nmToRGB } from './InterferenceCommon';
import { PrecisionKnob } from './OpticalComponents';

const FresnelMirror: React.FC = () => {
    const [slitWidth, setSlitWidth] = useState(0.1); // mm
    const [lambda] = useState(550); // Green
    const [intensityProfile, setIntensityProfile] = useState<number[]>([]);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const graphRef = useRef<HTMLCanvasElement>(null);

    // Sensor Drag
    const [sensorX, setSensorX] = useState(300);
    const isDragging = useRef(false);

    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return;
        const ctx = cvs.getContext('2d'); if (!ctx) return;
        
        const w = cvs.width = cvs.clientWidth;
        const h = cvs.height = cvs.clientHeight;
        const cx = w/2;
        
        ctx.fillStyle = '#050508'; ctx.fillRect(0,0,w,h);
        
        // Physics:
        // Fringe visibility V = |sinc(pi * b * theta / lambda)|
        // As b (slitWidth) increases, V decreases -> stripes washout
        
        const contrast = Math.max(0, Math.min(1, 1.5 - slitWidth * 2)); 
        const brightness = Math.min(1, slitWidth * 3); // Wider slit = more light
        
        const spacing = 40; // px
        
        const profile = [];
        
        for(let x=0; x<w; x++) {
            // Interference term
            const dist = Math.abs(x - cx);
            const phase = (Math.PI * 2 * dist) / spacing;
            const I_interf = (1 + contrast * Math.cos(phase));
            
            // Envelope (Field width)
            const env = Math.exp(-Math.pow(dist / (w/3), 2));
            
            const I = I_interf * env * brightness * 0.5;
            profile.push(I);
            
            ctx.fillStyle = rgba(lambda, I);
            ctx.fillRect(x, 0, 1, h);
        }
        setIntensityProfile(profile);
        
        // Draw Sensor Line
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1;
        ctx.setLineDash([5,5]);
        ctx.beginPath(); ctx.moveTo(sensorX, 0); ctx.lineTo(sensorX, h); ctx.stroke();
        
        // Sensor Box
        ctx.fillStyle = '#ef4444'; 
        ctx.fillRect(sensorX - 15, h/2 - 15, 30, 30);
        ctx.fillStyle = '#fff'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center';
        ctx.fillText('SENSOR', sensorX, h/2 + 4);

    }, [slitWidth, lambda, sensorX]);

    // Graph Render
    useEffect(() => {
        const cvs = graphRef.current; if (!cvs || intensityProfile.length === 0) return;
        const ctx = cvs.getContext('2d'); if (!ctx) return;
        
        const w = cvs.width = cvs.clientWidth;
        const h = cvs.height = cvs.clientHeight;
        
        ctx.fillStyle = '#111'; ctx.fillRect(0,0,w,h);
        ctx.strokeStyle = '#333'; ctx.lineWidth=1; ctx.beginPath();
        ctx.moveTo(0, h); ctx.lineTo(w, h); ctx.stroke(); // Base
        
        // Draw Profile
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
        ctx.beginPath();
        intensityProfile.forEach((val, i) => {
            const x = (i / intensityProfile.length) * w;
            const y = h - val * h * 0.9;
            if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
        ctx.stroke();
        
        // Draw Sensor Readout Dot
        const idx = Math.floor((sensorX / cvs.width) * intensityProfile.length) || 0; // Approx mapping
        // Need to map canvas coord to graph coord (they match in width)
        const valAtSensor = intensityProfile[Math.floor(sensorX / 800 * intensityProfile.length)] || 0; 
        // Assuming widths match approx or we map correctly.
        // Let's simplify: profile is computed for canvas width. Graph scales to container.
        
        const sx = (sensorX / 800) * w; // Assuming canvas is 800ish or flex
        // Actually best to recompute profile for graph resolution or just subsample.
        
    }, [intensityProfile, sensorX]);

    const handleSensorDrag = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if(!rect) return;
        const x = e.clientX - rect.left;
        setSensorX(Math.max(0, Math.min(rect.width, x)));
    };

    return (
        <div className="flex h-full w-full bg-[#020408]">
            <div className="flex-1 flex flex-col relative">
                <canvas 
                    ref={canvasRef} 
                    className="flex-1 block w-full cursor-crosshair"
                    onMouseDown={() => isDragging.current = true}
                    onMouseUp={() => isDragging.current = false}
                    onMouseMove={(e) => isDragging.current && handleSensorDrag(e)}
                />
                <div className="h-40 bg-[#0a0f18] border-t border-white/10 p-4 relative">
                    <canvas ref={graphRef} className="w-full h-full block rounded border border-white/5"/>
                    <div className="absolute top-2 left-2 text-xs font-bold text-green-400">Cường độ sáng I(x)</div>
                </div>
            </div>

            <div className="w-80 bg-[#0a0a0f] border-l border-white/10 p-8 flex flex-col gap-10 shadow-2xl z-20">
                <div>
                    <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2"><Columns/> Gương Fresnel</h2>
                    <p className="text-xs text-slate-500 mt-2">Ảnh hưởng của độ rộng khe nguồn đến độ tương phản vân.</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <PrecisionKnob 
                        label="Độ rộng khe (Slit Width)"
                        value={slitWidth} // Visual only, knob uses delta
                        onChange={(d) => setSlitWidth(Math.max(0.01, Math.min(1.0, slitWidth + d * 0.01)))}
                        step={1}
                    />
                    <div className="text-2xl font-mono text-white">{slitWidth.toFixed(2)} mm</div>
                </div>

                <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/20 text-xs text-indigo-200">
                    <p className="mb-2 font-bold">Quan sát:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Khe hẹp: Vân tối đen tuyệt đối (Tương phản cao) nhưng tối.</li>
                        <li>Khe rộng: Vân sáng lên nhưng bị nhòe (Tương phản giảm).</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FresnelMirror;
