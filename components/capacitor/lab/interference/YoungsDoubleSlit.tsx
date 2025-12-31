
import React, { useState, useEffect, useRef } from 'react';
import { nmToRGB } from './InterferenceCommon';
import { Info, Ruler, MoveHorizontal, CheckCircle2, RotateCcw } from 'lucide-react';
import { VirtualCaliper, TapeMeasure } from './OpticalComponents';

type Step = 'SETUP' | 'MEASURE_D' | 'MEASURE_i' | 'CALCULATE';

const YoungsDoubleSlit: React.FC = () => {
    // Parameters
    const [lambda, setLambda] = useState(600); // nm
    const [d, setD] = useState(1.0); // mm
    const [L, setL] = useState(1.5); // m
    
    // Workflow State
    const [step, setStep] = useState<Step>('SETUP');
    const [placedItems, setPlacedItems] = useState<string[]>([]); // 'laser', 'slit', 'screen'
    const [measuredD, setMeasuredD] = useState<number | null>(null);
    const [measuredI, setMeasuredI] = useState<number | null>(null);
    const [userResult, setUserResult] = useState('');
    const [checkResult, setCheckResult] = useState<'correct' | 'incorrect' | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 3D Projection
    const project = (x: number, y: number, z: number, w: number, h: number) => {
        const fov = 800; const viewDist = 3.5;
        const zCam = z + viewDist;
        const scale = fov / (fov + zCam * 100);
        return { x: w/2 + x * scale * 120, y: h/2 + y * scale * 120, scale };
    };

    // --- RENDER LOOP ---
    useEffect(() => {
        const cvs = canvasRef.current; if(!cvs) return;
        const ctx = cvs.getContext('2d'); if(!ctx) return;
        
        const render = () => {
            const w = cvs.width = cvs.clientWidth;
            const h = cvs.height = cvs.clientHeight;
            ctx.fillStyle = '#020408'; ctx.fillRect(0,0,w,h);

            // If setup not complete, show dark/empty room
            if (step === 'SETUP' && placedItems.length < 3) {
                // Draw Rail
                const start = project(0, 0.5, -2.5, w, h);
                const end = project(0, 0.5, 2.5, w, h);
                ctx.strokeStyle = '#333'; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
                
                // Draw Ghost Placeholders
                const items = [
                    { id: 'laser', z: -2.0, label: '1. Nguồn Laser' },
                    { id: 'slit', z: 0, label: '2. Khe Young' },
                    { id: 'screen', z: 1.5, label: '3. Màn Hứng' }
                ];

                items.forEach(item => {
                    const pos = project(0, 0, item.z, w, h);
                    const isPlaced = placedItems.includes(item.id);
                    
                    ctx.fillStyle = isPlaced ? '#4ade80' : 'rgba(255,255,255,0.1)';
                    ctx.strokeStyle = isPlaced ? '#4ade80' : '#666';
                    ctx.setLineDash(isPlaced ? [] : [5,5]);
                    
                    ctx.beginPath(); ctx.arc(pos.x, pos.y, 20 * pos.scale, 0, Math.PI*2); 
                    ctx.fill(); ctx.stroke();
                    
                    ctx.fillStyle = isPlaced ? '#4ade80' : '#666';
                    ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText(item.label, pos.x, pos.y + 40);
                });
                
                ctx.setLineDash([]);
                return;
            }

            // --- FULL EXPERIMENT VISUALIZATION ---
            // Colors
            const lightColor = nmToRGB(lambda);
            const lightColorAlpha = lightColor.replace('rgb', 'rgba').replace(')', ', 0.3)');

            // 1. Source
            const zSrc = -2.0;
            const srcPos = project(-1.0, 0, zSrc, w, h); // Offset left slightly visually
            ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(srcPos.x, srcPos.y, 15*srcPos.scale, 0, Math.PI*2); ctx.fill();
            // Beam
            const slitPos = project(0, 0, 0, w, h);
            const grad = ctx.createLinearGradient(srcPos.x, srcPos.y, slitPos.x, slitPos.y);
            grad.addColorStop(0, lightColorAlpha); grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.moveTo(srcPos.x, srcPos.y); 
            const slT = project(0, -0.5, 0, w, h); const slB = project(0, 0.5, 0, w, h);
            ctx.lineTo(slT.x, slT.y); ctx.lineTo(slB.x, slB.y); ctx.fill();

            // 2. Slit Plate
            const plTL = project(0, -1.5, 0, w, h); const plBR = project(0.1, 1.5, 0, w, h);
            ctx.fillStyle = '#7f1d1d'; ctx.fillRect(plTL.x, plTL.y, (plBR.x-plTL.x)||10, plBR.y-plTL.y);
            
            // 3. Screen (Moveable based on L)
            const zScreen = L; // Use state L
            const scTL = project(0, -2, zScreen, w, h); const scBR = project(0.5, 2, zScreen, w, h);
            ctx.fillStyle = '#1e3a8a'; ctx.fillRect(scTL.x, scTL.y, scBR.x-scTL.x, scBR.y-scTL.y);

            // 4. Interference Pattern on Screen
            const patternH = scBR.y - scTL.y;
            const startY = scTL.y;
            for(let i=0; i<100; i++) {
                const prog = i/100;
                const yPhys = (prog - 0.5) * 0.05; // Physical width on screen
                const phase = (Math.PI * (d * 1e-3) * yPhys) / (lambda * 1e-9 * L);
                const I = Math.cos(phase)**2;
                if(I > 0.1) {
                    ctx.fillStyle = lightColor.replace('rgb', 'rgba').replace(')', `,${I})`);
                    ctx.fillRect(scTL.x, startY + prog*patternH, scBR.x-scTL.x, patternH/100 + 1);
                }
            }

            // Rays
            ctx.strokeStyle = lightColorAlpha; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(slitPos.x, slitPos.y); ctx.lineTo(scTL.x, scTL.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(slitPos.x, slitPos.y); ctx.lineTo(scTL.x, scBR.y); ctx.stroke();

        };
        render();
    }, [step, placedItems, lambda, d, L]);

    const handlePlaceItem = (id: string) => {
        if(!placedItems.includes(id)) setPlacedItems([...placedItems, id]);
    };

    const checkCalculation = () => {
        // Formula: i = lambda * D / a
        // We have measuredD ~ L, measuredI ~ 5*i
        // Let's check against theoretical lambda
        const inputLambda = parseFloat(userResult);
        if(isNaN(inputLambda)) return;
        
        const error = Math.abs(inputLambda - lambda) / lambda;
        if(error < 0.05) setCheckResult('correct'); // 5% tolerance
        else setCheckResult('incorrect');
    };

    return (
        <div className="flex h-full w-full bg-[#020408] text-slate-300 font-sans">
            {/* MAIN CANVAS */}
            <div className="flex-1 relative overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full block"/>
                
                {/* INTERACTIVE OVERLAYS */}
                
                {/* Step 0: Placement Click Zones */}
                {step === 'SETUP' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex gap-8 pointer-events-auto">
                            {!placedItems.includes('laser') && <button onClick={() => handlePlaceItem('laser')} className="w-24 h-24 rounded-xl bg-white/10 border-2 border-dashed border-white/30 hover:border-green-400 hover:bg-green-900/20 flex flex-col items-center justify-center gap-2 transition-all"><div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div><span className="text-xs font-bold">Nguồn</span></button>}
                            {!placedItems.includes('slit') && <button onClick={() => handlePlaceItem('slit')} className="w-24 h-24 rounded-xl bg-white/10 border-2 border-dashed border-white/30 hover:border-green-400 hover:bg-green-900/20 flex flex-col items-center justify-center gap-2 transition-all"><div className="w-1 h-8 bg-white/50"></div><span className="text-xs font-bold">Khe Young</span></button>}
                            {!placedItems.includes('screen') && <button onClick={() => handlePlaceItem('screen')} className="w-24 h-24 rounded-xl bg-white/10 border-2 border-dashed border-white/30 hover:border-green-400 hover:bg-green-900/20 flex flex-col items-center justify-center gap-2 transition-all"><div className="w-8 h-12 bg-blue-500/50 rounded"></div><span className="text-xs font-bold">Màn</span></button>}
                        </div>
                    </div>
                )}

                {/* Step 1: Tape Measure */}
                {step === 'MEASURE_D' && (
                    <TapeMeasure 
                        pixelToMeter={120} // Calibrated to visual scale (project function)
                        onMeasure={(val) => setMeasuredD(val)} 
                    />
                )}

                {/* Step 2: Caliper */}
                {step === 'MEASURE_i' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.5s]">
                        <div className="relative w-[600px] h-[400px] bg-[#0a0f18] border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Zoomed Fringe View */}
                            <div className="absolute inset-0 flex flex-col" style={{background: `linear-gradient(to bottom, #000 0%, ${nmToRGB(lambda)} 50%, #000 100%)`}}>
                                {/* Draw pattern repeated horizontally? No, typically fringes are vertical or horizontal stripes. 
                                    In visual, they are horizontal. Let's make them vertical for standard caliper usage. */}
                                {Array.from({length: 20}).map((_, i) => (
                                    <div key={i} className="absolute top-0 bottom-0 w-2 bg-black/50 blur-sm" style={{left: `${i * 40}px`}}></div>
                                ))}
                            </div>
                            
                            <div className="absolute top-4 left-4 text-xs font-bold text-white bg-black/50 px-3 py-1 rounded">View qua Kính lúp (Zoom 10x)</div>
                            <VirtualCaliper 
                                width={600} height={400} 
                                pixelToMM={40} // 40px = 1mm in zoomed view
                                onMeasure={(mm) => setMeasuredI(mm)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* SIDEBAR CONTROLS */}
            <div className="w-80 bg-[#0a0f18] border-l border-white/10 flex flex-col z-20 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white mb-2">Thí nghiệm Young</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={`px-2 py-1 rounded ${step === 'SETUP' ? 'bg-teal-500 text-white' : 'bg-white/10'}`}>1. Lắp đặt</span>
                        <span className={`px-2 py-1 rounded ${step === 'MEASURE_D' || step === 'MEASURE_i' ? 'bg-teal-500 text-white' : 'bg-white/10'}`}>2. Đo đạc</span>
                        <span className={`px-2 py-1 rounded ${step === 'CALCULATE' ? 'bg-teal-500 text-white' : 'bg-white/10'}`}>3. Tính</span>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {/* Setup Controls */}
                    {step === 'SETUP' && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-300">Kéo thả các dụng cụ vào đường ray quang học để bắt đầu.</p>
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded text-xs border ${placedItems.includes('laser') ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-600'}`}>Laser</span>
                                <span className={`px-3 py-1 rounded text-xs border ${placedItems.includes('slit') ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-600'}`}>Khe Young</span>
                                <span className={`px-3 py-1 rounded text-xs border ${placedItems.includes('screen') ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-600'}`}>Màn hứng</span>
                            </div>
                            {placedItems.length === 3 && (
                                <button onClick={() => setStep('MEASURE_D')} className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl animate-bounce">
                                    Tiếp tục đo đạc <RotateCcw className="inline ml-2" size={16}/>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Measure Controls */}
                    {(step === 'MEASURE_D' || step === 'MEASURE_i') && (
                        <div className="space-y-6">
                            <div className="bg-white/5 p-4 rounded-xl space-y-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase">Điều chỉnh thông số</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs"><span>Khoảng cách a</span><span className="text-teal-400">{d} mm</span></div>
                                    <input type="range" min="0.5" max="2" step="0.1" value={d} onChange={e => setD(Number(e.target.value))} className="w-full accent-teal-500 h-1 bg-white/10 rounded"/>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs"><span>Vị trí màn D</span><span className="text-teal-400">{L} m</span></div>
                                    <input type="range" min="1" max="2.5" step="0.1" value={L} onChange={e => setL(Number(e.target.value))} className="w-full accent-teal-500 h-1 bg-white/10 rounded"/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button 
                                    onClick={() => setStep('MEASURE_D')} 
                                    className={`w-full py-3 rounded-xl border flex items-center justify-between px-4 transition-all ${step==='MEASURE_D' ? 'bg-teal-900/30 border-teal-500 text-teal-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <span className="flex items-center gap-2 text-sm font-bold"><Ruler size={16}/> Đo khoảng cách D</span>
                                    {measuredD && <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded">{measuredD.toFixed(2)}m</span>}
                                </button>

                                <button 
                                    onClick={() => setStep('MEASURE_i')} 
                                    className={`w-full py-3 rounded-xl border flex items-center justify-between px-4 transition-all ${step==='MEASURE_i' ? 'bg-teal-900/30 border-teal-500 text-teal-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <span className="flex items-center gap-2 text-sm font-bold"><MoveHorizontal size={16}/> Đo khoảng vân i</span>
                                    {measuredI && <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded">{measuredI.toFixed(2)}mm</span>}
                                </button>
                            </div>

                            {measuredD && measuredI && (
                                <button onClick={() => setStep('CALCULATE')} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg mt-4">
                                    Tính toán kết quả
                                </button>
                            )}
                        </div>
                    )}

                    {/* Calculation */}
                    {step === 'CALCULATE' && (
                        <div className="space-y-6 animate-[fadeIn_0.3s]">
                            <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30 text-sm space-y-2">
                                <p className="font-bold text-indigo-300">Dữ liệu thu được:</p>
                                <ul className="list-disc pl-4 text-slate-300 space-y-1">
                                    <li>Khoảng cách D = {measuredD?.toFixed(2)} m</li>
                                    <li>Bề rộng 5 khoảng vân L = {measuredI?.toFixed(2)} mm</li>
                                    <li>Khoảng vân i = {(measuredI! / 5).toFixed(2)} mm</li>
                                    <li>Khoảng cách a = {d} mm</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400">Nhập bước sóng tính được (nm):</label>
                                <input 
                                    type="number" 
                                    value={userResult} 
                                    onChange={e => setUserResult(e.target.value)} 
                                    className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-teal-500 outline-none"
                                    placeholder="Ví dụ: 600"
                                />
                                <button onClick={checkCalculation} className="w-full py-2 bg-teal-600 rounded-lg text-white font-bold text-sm">Kiểm tra</button>
                            </div>

                            {checkResult && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 ${checkResult==='correct' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                    {checkResult==='correct' ? <CheckCircle2 size={24}/> : <Info size={24}/>}
                                    <div>
                                        <div className="font-bold">{checkResult==='correct' ? 'Chính xác!' : 'Sai số quá lớn'}</div>
                                        <div className="text-xs opacity-80">Giá trị thực: {lambda}nm. Công thức: {'$\\lambda = \\frac{a \\cdot i}{D}$'}</div>
                                    </div>
                                </div>
                            )}
                            
                            <button onClick={() => {setStep('SETUP'); setPlacedItems([]); setMeasuredD(null); setMeasuredI(null); setCheckResult(null);}} className="text-xs text-slate-500 hover:text-white mx-auto block mt-4 underline">
                                Làm lại thí nghiệm
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YoungsDoubleSlit;
