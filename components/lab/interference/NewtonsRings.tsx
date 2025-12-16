
import React, { useState, useEffect, useRef } from 'react';
import { CircleDashed, Eye, Focus, RotateCw } from 'lucide-react';
import { rgba, nmToRGB } from './InterferenceCommon';
import { PrecisionKnob, AnalogMicrometer, applyBacklash } from './OpticalComponents';

const NewtonsRings: React.FC = () => {
    // Physics Config
    const [R] = useState(3.0); // m
    const [lambda] = useState(589); // nm
    
    // Mechanics State
    const [screwPos, setScrewPos] = useState(0); // The user's hand input
    const [crosshairPos, setCrosshairPos] = useState(0); // Actual mechanical position
    const [focus, setFocus] = useState(20); // 0-100, starts blurry
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Handle Knob Turn with Backlash
    const handleKnobTurn = (delta: number) => {
        // Delta is raw input from knob
        const newScrew = screwPos + delta * 0.05; // Gear ratio
        setScrewPos(newScrew);
        
        // Backlash amount: 0.5 units
        const newLoad = applyBacklash(crosshairPos, newScrew, 0.5);
        setCrosshairPos(newLoad);
    };

    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return;
        const ctx = cvs.getContext('2d'); if (!ctx) return;
        
        const render = () => {
            const w = cvs.width = cvs.clientWidth;
            const h = cvs.height = cvs.clientHeight;
            const cx = w/2; const cy = h/2;
            
            ctx.fillStyle = '#000'; ctx.fillRect(0,0,w,h);
            
            // Focus Blur
            const blurPx = Math.max(0, (100 - focus) / 5);
            ctx.filter = `blur(${blurPx}px)`;
            
            // Draw Rings
            ctx.save();
            ctx.translate(cx, cy);
            
            // Physics: r = sqrt(k * lambda * R)
            // Scale: let 1mm = 50px
            const pxPerMM = 50;
            const maxR = Math.min(w,h)/2;
            
            // Draw many rings
            ctx.strokeStyle = nmToRGB(lambda);
            for(let k=0; k<50; k++) {
                // Dark ring radius
                const r_m = Math.sqrt(k * lambda*1e-9 * R);
                const r_px = r_m * 1000 * pxPerMM;
                
                if (r_px > maxR) break;
                
                // Draw Bright ring between k and k+1 approx
                // Simplify: Draw concentric circles with spacing decreasing
                ctx.lineWidth = Math.max(1, 200 / (r_px + 10)); // Thinner as go out
                ctx.beginPath(); ctx.arc(0, 0, r_px, 0, Math.PI*2); ctx.stroke();
            }
            ctx.restore();
            ctx.filter = 'none';
            
            // Draw Crosshair (Moves with knob)
            // We simulate the VIEW moving relative to crosshair, or Crosshair moving?
            // In microscope, crosshair is fixed, stage moves. 
            // So the Rings should move. 
            // Let's move the RINGS by -crosshairPos.
            // Wait, standard lab: crosshair moves via screw.
            
            const xOffset = crosshairPos * pxPerMM; // mm to px
            
            // Draw Crosshair (Fixed in center of viewport? No, it moves across image)
            // Actually usually the crosshair is fixed in the eyepiece and the stage moves the sample.
            // So if stage moves right (pos increases), image moves left.
            // Let's implement: Image fixed, Crosshair moves.
            
            const chX = cx + xOffset;
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(chX, 0); ctx.lineTo(chX, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
            
            // Crosshair ticks
            ctx.beginPath(); 
            ctx.moveTo(chX - 10, cy - 10); ctx.lineTo(chX + 10, cy + 10);
            ctx.moveTo(chX - 10, cy + 10); ctx.lineTo(chX + 10, cy - 10);
            ctx.stroke();

        };
        render();
    }, [focus, crosshairPos, lambda, R]);

    return (
        <div className="flex h-full w-full bg-[#111] font-sans">
            <div className="flex-1 relative flex flex-col items-center justify-center p-10 bg-[#050508]">
                {/* Microscope Mask */}
                <div className="relative w-[500px] h-[500px] rounded-full border-[20px] border-[#222] shadow-2xl overflow-hidden bg-black">
                    <canvas ref={canvasRef} className="w-full h-full block"/>
                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)] pointer-events-none rounded-full"></div>
                </div>
                <div className="mt-6 text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">Kính hiển vi trắc vi (15x)</div>
            </div>

            <div className="w-96 bg-[#18181b] border-l border-white/5 p-8 flex flex-col gap-8 shadow-2xl z-20">
                <div className="border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-yellow-500 flex items-center gap-3"><CircleDashed/> Vân tròn Newton</h2>
                    <p className="text-xs text-slate-500 mt-2">Đo đường kính các vân tối để xác định bán kính cong thấu kính.</p>
                </div>

                {/* Hardcore Analog Reading */}
                <div className="space-y-2 bg-[#27272a] p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                        <span>THƯỚC DU XÍCH (Vernier)</span>
                        <span className="text-yellow-600">Sai số: 0.05mm</span>
                    </div>
                    {/* The value displayed is the mechanical position */}
                    <AnalogMicrometer valueMM={10 + crosshairPos} />
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-8 items-end pb-8">
                    <PrecisionKnob 
                        label="Vi chỉnh (Backlash)" 
                        value={screwPos} // Visual rotation
                        onChange={handleKnobTurn} 
                        sensitivity={0.1}
                    />
                    <PrecisionKnob 
                        label="Lấy nét (Focus)" 
                        value={focus} 
                        onChange={(d) => setFocus(Math.max(0, Math.min(100, focus + d)))} 
                        step={2}
                    />
                </div>

                <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-xl text-xs text-yellow-200/80 space-y-2">
                    <div className="font-bold text-yellow-500 uppercase flex items-center gap-2"><RotateCw size={12}/> Lưu ý thao tác</div>
                    <p>Hệ thống vi chỉnh có độ rơ (backlash). Khi đảo chiều quay, thước sẽ không dịch chuyển ngay lập tức. Hãy quay theo một chiều thống nhất khi đo.</p>
                </div>
            </div>
        </div>
    );
};

export default NewtonsRings;
