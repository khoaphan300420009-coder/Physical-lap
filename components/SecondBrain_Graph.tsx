
import React, { useState, useEffect, useRef } from 'react';
import { Rotate3D } from 'lucide-react';
import { Note } from '../types';

const SecondBrainGraph: React.FC<{ notes: Note[] }> = ({ notes }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const cvs = canvasRef.current; if (!cvs) return;
        const ctx = cvs.getContext('2d'); if (!ctx) return;
        
        // Generate node positions if empty or re-map
        const nodes = notes.map((n) => {
            // Seed random based on ID or just random for now (simple)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 300 + Math.random() * 100;
            return {
                ...n,
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi),
                color: n.color || '#fff',
                size: 4 + Math.random() * 4
            };
        });

        let animId: number;
        let time = 0;

        const render = () => {
            time += 0.005;
            const w = cvs.width = cvs.clientWidth;
            const h = cvs.height = cvs.clientHeight;
            const cx = w/2; const cy = h/2;
            const fov = 800;

            ctx.fillStyle = '#05080f'; ctx.fillRect(0,0,w,h);

            const autoRotY = time * 0.2;
            const rx = rotation.x;
            const ry = rotation.y + autoRotY;

            const cosX = Math.cos(rx); const sinX = Math.sin(rx);
            const cosY = Math.cos(ry); const sinY = Math.sin(ry);

            const projected = nodes.map(n => {
                let x1 = n.x * cosY - n.z * sinY;
                let z1 = n.z * cosY + n.x * sinY;
                let y1 = n.y * cosX - z1 * sinX;
                let z2 = z1 * cosX + n.y * sinX;
                
                const scale = fov / (fov + z2 + 600); 
                const x2D = cx + x1 * scale;
                const y2D = cy + y1 * scale;
                
                return { ...n, x2D, y2D, z: z2, scale };
            });

            projected.sort((a,b) => b.z - a.z);

            ctx.lineWidth = 1;
            
            // Draw connections
            projected.forEach(n => {
                n.linkedTo.forEach(tid => {
                    const target = projected.find(t => t.id === tid);
                    if (target) {
                        const depthAlpha = Math.max(0.05, Math.min(0.5, (n.scale + target.scale)/2 * 0.5));
                        const grad = ctx.createLinearGradient(n.x2D, n.y2D, target.x2D, target.y2D);
                        grad.addColorStop(0, `${n.color}00`);
                        grad.addColorStop(0.5, `rgba(255,255,255,${depthAlpha})`);
                        grad.addColorStop(1, `${target.color}00`);
                        ctx.strokeStyle = grad;
                        ctx.beginPath(); ctx.moveTo(n.x2D, n.y2D); ctx.lineTo(target.x2D, target.y2D); ctx.stroke();
                    }
                });
            });

            // Draw nodes
            projected.forEach(n => {
                const alpha = Math.max(0.2, n.scale);
                ctx.globalAlpha = alpha;
                
                const r = n.size * n.scale;
                
                const glow = ctx.createRadialGradient(n.x2D, n.y2D, r*0.2, n.x2D, n.y2D, r*4);
                glow.addColorStop(0, n.color);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(n.x2D, n.y2D, r*4, 0, Math.PI*2); ctx.fill();
                
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(n.x2D, n.y2D, r, 0, Math.PI*2); ctx.fill();
                
                if (n.z < 0) {
                    ctx.fillStyle = 'rgba(255,255,255,0.8)';
                    ctx.font = `bold ${10 * n.scale}px sans-serif`;
                    ctx.fillText(n.title, n.x2D + 10, n.y2D + 4);
                }
                ctx.globalAlpha = 1;
            });

            animId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animId);
    }, [notes, rotation]);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const dx = (e.clientX - lastMouse.current.x) * 0.005;
        const dy = (e.clientY - lastMouse.current.y) * 0.005;
        setRotation(r => ({ x: r.x - dy, y: r.y + dx }));
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    return (
        <div 
            className="w-full h-full relative cursor-move bg-black overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => isDragging.current = false}
            onMouseLeave={() => isDragging.current = false}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,20,40,0.5)_0%,_#05080f_100%)] pointer-events-none"></div>
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute bottom-6 left-6 text-xs text-slate-500 font-mono pointer-events-none">
                <Rotate3D size={14} className="inline mr-2"/> Drag to rotate Universe
            </div>
        </div>
    );
};

export default SecondBrainGraph;
