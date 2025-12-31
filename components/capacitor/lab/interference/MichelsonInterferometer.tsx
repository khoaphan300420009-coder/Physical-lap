
import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Keyboard } from 'lucide-react';
import { rgba } from './InterferenceCommon';
import { PrecisionKnob, applyBacklash } from './OpticalComponents';

const MichelsonInterferometer: React.FC = () => {
    // Physical state
    const [lambda] = useState(633); // HeNe
    const [count, setCount] = useState(0);
    const [mirrorPos, setMirrorPos] = useState(0); // Actual mirror position (microns)
    const [knobVal, setKnobVal] = useState(0); // User knob rotation
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Handle Spacebar counting
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setCount(c => c + 1);
                // Visual feedback effect could go here
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Knob Handler with Backlash
    const handleKnob = (delta: number) => {
        // Update knob visual state
        const newKnob = knobVal + delta;
        setKnobVal(newKnob);
        
        // Apply Backlash to actual mirror
        // Assume 20 units of "slack" in the gear
        const newMirror = applyBacklash(mirrorPos, newKnob * 0.1, 2.0); // 0.1 ratio, 2.0 slack
        setMirrorPos(newMirror);
    };

    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return;
        const ctx = cvs.getContext('2d'); if (!ctx) return;
        
        const render = () => {
            const w = cvs.width = cvs.clientWidth;
            const h = cvs.height = cvs.clientHeight;
            const cx = w/2; const cy = h/2;
            
            ctx.fillStyle = '#050508'; ctx.fillRect(0,0,w,h);
            
            // Phase delta = 2 * d * 2pi/lambda
            const d_nm = mirrorPos * 1000;
            const phaseShift = (4 * Math.PI * d_nm) / lambda;
            
            const maxR = Math.min(w,h)/2;
            
            // Haidinger fringes (Concentric)
            // Intensity I ~ cos^2(delta/2)
            // Delta varies with angle theta (radius r)
            // delta(r) = delta_0 * cos(theta) ~ delta_0 * (1 - r^2/2f^2)
            
            const f_eff = 1000; // effective focal length scaling
            
            for(let r=0; r<maxR; r+=2) {
                const thetaTerm = (r*r) / (2 * f_eff * f_eff);
                const totalPhase = phaseShift * (1 - thetaTerm);
                const I = Math.cos(totalPhase/2)**2;
                
                if (I > 0.1) {
                    ctx.strokeStyle = rgba(lambda, I);
                    ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
                }
            }
            
            // Crosshair
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
        };
        render();
    }, [mirrorPos, lambda]);

    return (
        <div className="flex h-full w-full bg-[#020408] font-sans">
            <div className="flex-1 relative">
                <canvas ref={canvasRef} className="w-full h-full block"/>
                
                {/* Counter Overlay */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none animate-[fadeIn_0.5s]">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                        <Keyboard size={12}/> Nhấn Space để đếm
                    </div>
                    <div className="text-8xl font-black text-red-500 font-mono drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                        {count.toString().padStart(3, '0')}
                    </div>
                </div>
            </div>
            
            <div className="w-96 bg-[#0a0f18] border-l border-white/10 p-8 flex flex-col gap-12 shadow-2xl z-20">
                <div className="border-b border-white/10 pb-6">
                    <h2 className="text-2xl font-bold text-red-400 flex items-center gap-3"><Sliders/> Michelson</h2>
                    <p className="text-xs text-slate-500 mt-2">Xoay tay quay vi cấp để thay đổi quang trình.</p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="bg-[#15151a] p-8 rounded-3xl shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] border border-white/5">
                        <PrecisionKnob 
                            label="MICROMETER" 
                            value={knobVal} 
                            onChange={handleKnob} 
                            sensitivity={0.2}
                        />
                    </div>
                    <div className="text-xs text-center text-slate-500 italic max-w-[200px]">
                        "Tay quay có độ rơ. Hãy quay chậm và đều tay."
                    </div>
                </div>

                <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-sm items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400 font-bold">Vị trí Gương</span>
                        <span className="font-mono text-white text-lg">{mirrorPos.toFixed(2)} µm</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-slate-400 font-bold">Mục tiêu</span>
                        <span className="font-mono text-green-400">100 vân</span>
                    </div>
                    
                    <button 
                        onClick={() => setCount(0)} 
                        className="w-full py-3 mt-2 bg-white/5 hover:bg-red-500/20 text-xs font-bold rounded-xl transition-all text-slate-300 hover:text-red-400 border border-transparent hover:border-red-500/30"
                    >
                        Reset Bộ đếm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MichelsonInterferometer;
