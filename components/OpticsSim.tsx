
import React, { useState, useEffect, useRef } from 'react';
import { Glasses, Sliders, Eye, ZoomIn, ZoomOut, ScanEye } from 'lucide-react';

const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string, width: number = 2) => {
    const headlen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY); ctx.fill();
};

const OpticsSim: React.FC = () => {
    const [params, setParams] = useState({
        mode: 'bench' as 'bench' | 'eye',
        componentType: 'lens' as 'lens' | 'mirror',
        type: 'convex' as 'convex' | 'concave',
        focalLength: 30, objectDistance: 60, objectHeight: 20, diameter: 100,
        autoSize: true, showRays: true, showFocalPoints: true, showImage: true,
        eyeAccommodation: 50, // 0 to 100%
        eyeDefect: 'none' as 'none' | 'myopia' | 'hyperopia',
        zoom: 0.8
    });
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return; 
        const ctx = cvs.getContext('2d', { alpha: false }); if (!ctx) return;
        let frameId: number;

        const render = () => {
            const w = cvs.width = cvs.parentElement?.clientWidth || 800;
            const h = cvs.height = cvs.parentElement?.clientHeight || 600;
            const cx = w/2; const cy = h/2;

            ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, w, h);
            
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(params.zoom, params.zoom);
            ctx.translate(-cx, -cy);

            // Grid
            ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1 / params.zoom; ctx.beginPath();
            const gridSize = 50;
            const rangeX = (w / params.zoom) * 2; 
            const rangeY = (h / params.zoom) * 2;
            const startX = cx - rangeX; const endX = cx + rangeX;
            const startY = cy - rangeY; const endY = cy + rangeY;

            for (let x = Math.floor(startX/gridSize)*gridSize; x < endX; x += gridSize) { ctx.moveTo(x, startY); ctx.lineTo(x, endY); }
            for (let y = Math.floor(startY/gridSize)*gridSize; y < endY; y += gridSize) { ctx.moveTo(startX, y); ctx.lineTo(endX, y); }
            ctx.stroke();

            // Axis
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2 / params.zoom; ctx.beginPath(); ctx.moveTo(startX, cy); ctx.lineTo(endX, cy); ctx.stroke();

            if (params.mode === 'bench') {
                let f = params.focalLength;
                if (params.componentType === 'lens' && params.type === 'concave') f = -f;
                if (params.componentType === 'mirror' && params.type === 'convex') f = -f;

                const d = params.objectDistance; 
                const di = 1 / ((1/f) - (1/d)); 
                const visualImX = params.componentType === 'lens' ? cx + di : cx - di;
                const m = -di/d;
                const imH = params.objectHeight * m;
                
                let reqH = params.diameter;
                if (params.autoSize) {
                    reqH = Math.max(params.diameter, Math.abs(params.objectHeight) * 3);
                    if (Math.abs(imH) > reqH/2) reqH = Math.abs(imH) * 1.5;
                }
                const hOpt = reqH;

                ctx.fillStyle = params.componentType === 'lens' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(56, 189, 248, 0.1)';
                ctx.strokeStyle = params.componentType === 'lens' ? '#a855f7' : '#38bdf8';
                ctx.lineWidth = 3 / params.zoom;
                
                ctx.beginPath();
                if (params.componentType === 'lens') {
                    ctx.ellipse(cx, cy, 6, hOpt/2, 0, 0, Math.PI*2);
                } else {
                    const curv = params.type === 'convex' ? -30 : 30;
                    ctx.beginPath(); ctx.moveTo(cx, cy - hOpt/2); ctx.quadraticCurveTo(cx + curv, cy, cx, cy + hOpt/2);
                }
                ctx.stroke(); ctx.fill();
                
                const objX = cx - params.objectDistance; const objY = cy - params.objectHeight;
                drawArrow(ctx, objX, cy, objX, objY, '#10b981', 4 / params.zoom);
                
                if (params.showRays) {
                    ctx.strokeStyle = 'rgba(255, 255, 100, 0.6)'; ctx.lineWidth = 2 / params.zoom;
                    const visualImY = cy - imH;
                    
                    ctx.beginPath(); ctx.moveTo(objX, objY); ctx.lineTo(cx, objY); ctx.lineTo(visualImX, visualImY); 
                    const slope1 = (visualImY - objY) / (visualImX - cx);
                    ctx.lineTo(endX, objY + slope1 * (endX - cx));
                    ctx.stroke();
                    
                    ctx.beginPath(); ctx.moveTo(objX, objY); ctx.lineTo(cx, cy); ctx.lineTo(visualImX, visualImY);
                    const slope2 = (visualImY - cy) / (visualImX - cx);
                    ctx.lineTo(endX, cy + slope2 * (endX - visualImX));
                    ctx.stroke();

                    if (params.showImage && Math.abs(di) < 10000) {
                        drawArrow(ctx, visualImX, cy, visualImX, visualImY, '#facc15', 4 / params.zoom);
                    }
                    
                    if (params.showFocalPoints) {
                        ctx.fillStyle = '#ef4444'; 
                        const rad = 4 / params.zoom;
                        if (params.componentType === 'lens') {
                            ctx.beginPath(); ctx.arc(cx + Math.abs(f), cy, rad, 0, Math.PI*2); ctx.fill();
                            ctx.beginPath(); ctx.arc(cx - Math.abs(f), cy, rad, 0, Math.PI*2); ctx.fill();
                        } else {
                            const fp = params.type === 'concave' ? cx - Math.abs(f) : cx + Math.abs(f);
                            ctx.beginPath(); ctx.arc(fp, cy, rad, 0, Math.PI*2); ctx.fill();
                        }
                    }
                }
            } else {
                // --- HUMAN EYE SIMULATION ---
                const eyeRadius = 60;
                const eyeCx = cx + 50;
                
                // 1. Draw Eye Globe
                ctx.beginPath();
                ctx.arc(eyeCx, cy, eyeRadius, 0, Math.PI * 2);
                ctx.fillStyle = '#fff'; ctx.fill();
                ctx.lineWidth = 2/params.zoom; ctx.strokeStyle = '#cbd5e1'; ctx.stroke();
                
                // 2. Cornea (Front bulge)
                ctx.beginPath();
                ctx.arc(eyeCx - eyeRadius + 5, cy, 30, Math.PI*0.7, Math.PI*1.3, true);
                ctx.fillStyle = 'rgba(200, 240, 255, 0.3)'; ctx.fill(); ctx.stroke();
                
                // 3. Crystalline Lens
                let baseF = 45; // Simulated focal length in pixels for normal vision
                if (params.eyeDefect === 'myopia') baseF = 38; // Too strong, focuses before retina
                if (params.eyeDefect === 'hyperopia') baseF = 55; // Too weak, focuses behind retina
                
                const accommodationPower = (params.eyeAccommodation / 100) * 10; 
                const currentF = baseF - accommodationPower;
                
                const lensX = eyeCx - eyeRadius + 15;
                const lensH = 40 - (params.eyeAccommodation/100)*5; // Lens gets thicker/smaller when accommodating
                const lensW = 8 + (params.eyeAccommodation/100)*4;
                
                ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
                ctx.beginPath(); ctx.ellipse(lensX, cy, lensW/2, lensH/2, 0, 0, Math.PI*2); ctx.fill();
                
                // 4. Object
                const objX = lensX - params.objectDistance;
                const objH = 30;
                drawArrow(ctx, objX, cy, objX, cy - objH, '#10b981', 4/params.zoom);
                
                // 5. Retina
                const retinaX = eyeCx + eyeRadius - 5;
                ctx.beginPath(); ctx.moveTo(retinaX, cy - 40); ctx.quadraticCurveTo(retinaX - 10, cy, retinaX, cy + 40);
                ctx.lineWidth = 4/params.zoom; ctx.strokeStyle = '#ef4444'; ctx.stroke();
                
                // 6. Ray Tracing for Eye
                const d = params.objectDistance;
                const di = 1 / ((1/currentF) - (1/d));
                const imageX = lensX + di;
                const m = -di/d;
                const imageH = objH * m;
                
                // Draw Rays
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)'; ctx.lineWidth = 1/params.zoom;
                
                // Ray 1: Top to Lens Center
                ctx.beginPath(); ctx.moveTo(objX, cy - objH); ctx.lineTo(lensX, cy); ctx.lineTo(imageX, cy + imageH); ctx.stroke();
                // Ray 2: Parallel
                ctx.beginPath(); ctx.moveTo(objX, cy - objH); ctx.lineTo(lensX, cy - objH); ctx.lineTo(imageX, cy + imageH); ctx.stroke();
                // Ray 3: Bottom
                ctx.beginPath(); ctx.moveTo(objX, cy); ctx.lineTo(lensX, cy); ctx.lineTo(imageX, cy); ctx.stroke();

                // 7. Visualizing Focus on Retina
                const focusDiff = Math.abs(imageX - retinaX);
                const isFocused = focusDiff < 5;
                
                ctx.fillStyle = isFocused ? '#10b981' : '#ef4444';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(isFocused ? "RÕ NÉT" : "MỜ", retinaX + 10, cy);
                
                // Draw circle of confusion on retina if blurred
                if (!isFocused) {
                    const blurRadius = Math.min(20, focusDiff * 0.2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.beginPath(); ctx.arc(retinaX, cy, blurRadius, 0, Math.PI*2); ctx.fill();
                }
            }
            
            ctx.restore(); 
            frameId = requestAnimationFrame(render);
        };
        frameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frameId);
    }, [params]);

    return (
        <div className="flex h-full w-full relative">
            <div className="flex-1 relative bg-[#050508] overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full block" />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button onClick={() => setParams(p => ({...p, zoom: Math.min(5, p.zoom + 0.1)}))} className="p-2 bg-black/50 backdrop-blur rounded-lg border border-white/10 hover:bg-white/10 text-white"><ZoomIn size={16}/></button>
                    <button onClick={() => setParams(p => ({...p, zoom: Math.max(0.1, p.zoom - 0.1)}))} className="p-2 bg-black/50 backdrop-blur rounded-lg border border-white/10 hover:bg-white/10 text-white"><ZoomOut size={16}/></button>
                </div>
            </div>

            <div className="w-80 bg-[#0a0a0f] border-l border-white/5 overflow-y-auto custom-scroll p-6 space-y-8 z-10 shrink-0 shadow-2xl">
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2"><Glasses size={14}/> Cấu hình</h3>
                     <div className="bg-white/5 p-4 rounded-xl space-y-3">
                         <label className="text-xs font-bold text-slate-300">Chế độ</label>
                         <div className="flex gap-2">
                             <button onClick={() => setParams(p => ({...p, mode: 'bench'}))} className={`flex-1 py-2 text-xs rounded border transition-colors ${params.mode === 'bench' ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/10 text-slate-400'}`}>Quang cụ</button>
                             <button onClick={() => setParams(p => ({...p, mode: 'eye'}))} className={`flex-1 py-2 text-xs rounded border transition-colors ${params.mode === 'eye' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-white/10 text-slate-400'}`}>Mắt người</button>
                         </div>
                    </div>

                    {params.mode === 'bench' ? (
                        <>
                            <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                                <button onClick={() => setParams({...params, componentType: 'lens'})} className={`flex-1 py-1.5 text-xs rounded ${params.componentType === 'lens' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Thấu kính</button>
                                <button onClick={() => setParams({...params, componentType: 'mirror'})} className={`flex-1 py-1.5 text-xs rounded ${params.componentType === 'mirror' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Gương cầu</button>
                            </div>
                            <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                                <button onClick={() => setParams({...params, type: 'convex'})} className={`flex-1 py-1.5 text-xs rounded ${params.type === 'convex' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>{params.componentType==='lens'?'Hội tụ':'Lồi'}</button>
                                <button onClick={() => setParams({...params, type: 'concave'})} className={`flex-1 py-1.5 text-xs rounded ${params.type === 'concave' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>{params.componentType==='lens'?'Phân kì':'Lõm'}</button>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-white/5">
                                <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Tiêu cự (f)</span><span className="text-purple-400">{params.focalLength} cm</span></div>
                                <input type="range" min="10" max="100" value={params.focalLength} onChange={(e) => setParams({...params, focalLength: Number(e.target.value)})} className="w-full accent-purple-500 h-1 bg-white/10 rounded appearance-none cursor-pointer"/>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Khoảng cách vật (d)</span><span className="text-purple-400">{params.objectDistance} cm</span></div>
                                <input type="range" min="10" max="200" value={params.objectDistance} onChange={(e) => setParams({...params, objectDistance: Number(e.target.value)})} className="w-full accent-purple-500 h-1 bg-white/10 rounded appearance-none cursor-pointer"/>
                            </div>
                        </>
                    ) : (
                        <>
                             <div className="space-y-4 animate-[fadeIn_0.3s]">
                                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-2"><ScanEye size={12}/> Điều tiết mắt</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Vật ở cách mắt</span><span className="text-emerald-400">{params.objectDistance} cm</span></div>
                                    <input type="range" min="10" max="200" value={params.objectDistance} onChange={(e) => setParams({...params, objectDistance: Number(e.target.value)})} className="w-full accent-emerald-500 h-1 bg-white/10 rounded appearance-none cursor-pointer"/>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400 font-bold"><span>Độ phồng thủy tinh thể</span><span className="text-emerald-400">{params.eyeAccommodation}%</span></div>
                                    <input type="range" min="0" max="100" value={params.eyeAccommodation} onChange={(e) => setParams({...params, eyeAccommodation: Number(e.target.value)})} className="w-full accent-emerald-500 h-1 bg-white/10 rounded appearance-none cursor-pointer"/>
                                    <p className="text-[10px] text-slate-500 italic border-l-2 border-white/10 pl-2">Mắt tự động điều tiết (thay đổi độ cong) để ảnh hiện rõ trên võng mạc.</p>
                                </div>
                                
                                <div className="pt-4 border-t border-white/10">
                                    <h4 className="text-xs font-bold text-red-300 mb-2">Tật khúc xạ</h4>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => setParams(p => ({...p, eyeDefect: 'none'}))} className={`px-3 py-2 text-xs rounded text-left border ${params.eyeDefect==='none' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-white/10 text-slate-400'}`}>Mắt thường</button>
                                        <button onClick={() => setParams(p => ({...p, eyeDefect: 'myopia'}))} className={`px-3 py-2 text-xs rounded text-left border ${params.eyeDefect==='myopia' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-white/10 text-slate-400'}`}>Cận thị (Ảnh trước võng mạc)</button>
                                        <button onClick={() => setParams(p => ({...p, eyeDefect: 'hyperopia'}))} className={`px-3 py-2 text-xs rounded text-left border ${params.eyeDefect==='hyperopia' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-white/10 text-slate-400'}`}>Viễn thị (Ảnh sau võng mạc)</button>
                                    </div>
                                </div>
                             </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpticsSim;
