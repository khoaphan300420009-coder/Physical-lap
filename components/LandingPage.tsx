
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, PlayCircle, Atom, BrainCircuit, MousePointer2, X } from 'lucide-react';

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    originalX: number;
    originalY: number;
    radius: number;
    color: string;
    connections: number[];
}

interface LandingPageProps {
    onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    const [showIntro, setShowIntro] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<Node[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000, isDown: false });

    // --- Cosmic Web Physics ---
    useEffect(() => {
        const cvs = canvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;

        const initNodes = () => {
            const w = cvs.width = window.innerWidth;
            const h = cvs.height = window.innerHeight;
            const nodes: Node[] = [];
            
            // Grid-like distribution with randomness
            const cols = Math.ceil(w / 100);
            const rows = Math.ceil(h / 100);
            
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * 120 + (Math.random() - 0.5) * 60;
                    const y = j * 120 + (Math.random() - 0.5) * 60;
                    nodes.push({
                        x, y, 
                        vx: 0, vy: 0,
                        originalX: x, originalY: y,
                        radius: Math.random() * 2 + 1,
                        color: Math.random() > 0.8 ? '#22d3ee' : '#6366f1',
                        connections: [] 
                    });
                }
            }
            nodesRef.current = nodes;
        };

        initNodes();
        window.addEventListener('resize', initNodes);

        let animationFrameId: number;

        const render = () => {
            const w = cvs.width;
            const h = cvs.height;
            const nodes = nodesRef.current;
            const mouse = mouseRef.current;
            
            ctx.clearRect(0, 0, w, h);
            
            // Physics Update
            nodes.forEach(node => {
                // Return to original position (Elasticity)
                const dx = node.originalX - node.x;
                const dy = node.originalY - node.y;
                node.vx += dx * 0.02;
                node.vy += dy * 0.02;

                // Mouse Interaction (Repel or Attract)
                const dMx = mouse.x - node.x;
                const dMy = mouse.y - node.y;
                const distM = Math.sqrt(dMx*dMx + dMy*dMy);
                
                if (distM < 200) {
                    const force = mouse.isDown ? 20 : -5; // Pull if clicked, push otherwise
                    const angle = Math.atan2(dMy, dMx);
                    node.vx += Math.cos(angle) * force;
                    node.vy += Math.sin(angle) * force;
                }

                // Damping
                node.vx *= 0.9;
                node.vy *= 0.9;
                
                node.x += node.vx;
                node.y += node.vy;
            });

            // Draw Connections
            ctx.lineWidth = 0.5;
            nodes.forEach((node, i) => {
                nodes.forEach((other, j) => {
                    if (i >= j) return;
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist < 150) {
                        const alpha = 1 - dist / 150;
                        ctx.strokeStyle = `rgba(200, 220, 255, ${alpha * 0.3})`;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                });
            });

            // Draw Nodes
            nodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = node.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', initNodes);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
    };

    return (
        <div className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center font-sans text-slate-100 bg-[#020408]">
            
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                    src="https://i.pinimg.com/736x/53/d1/a5/53d1a5c4d0b705c714e0cec6ebe582e3.jpg" 
                    alt="Cosmic Background" 
                    className="w-full h-full object-cover opacity-100"
                />
                {/* Lớp phủ nhẹ hơn để hình nền rõ hơn */}
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-[#020408]/50"></div>
            </div>

            {/* Interactive Canvas Background */}
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 z-0 cursor-none mix-blend-screen opacity-80"
                onMouseMove={handleMouseMove}
                onMouseDown={() => mouseRef.current.isDown = true}
                onMouseUp={() => mouseRef.current.isDown = false}
            />

            {/* Custom Cursor Hint */}
            <div className="pointer-events-none fixed z-50 mix-blend-difference text-xs font-mono opacity-50" 
                 style={{ left: mouseRef.current.x + 20, top: mouseRef.current.y + 20 }}>
                 INTERACT
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center pointer-events-none select-none">
                
                {/* Modern Badge */}
                <div className="pointer-events-auto animate-[fadeIn_1s_ease-out] mb-12">
                    <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-black/40 border border-white/20 backdrop-blur-xl shadow-2xl group hover:border-cyan-500/50 transition-colors cursor-default">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-200 group-hover:text-white transition-colors">
                            Next-Gen Simulation Platform
                        </span>
                    </div>
                </div>

                {/* Typography */}
                <div className="flex flex-col items-center justify-center mb-10 animate-[fadeInUp_1s_ease-out] relative">
                    <h1 className="text-8xl md:text-[11rem] font-display font-black tracking-tighter text-white leading-[0.85] drop-shadow-2xl">
                        PHYSICAL
                    </h1>
                    <div className="relative">
                        <h1 className="text-8xl md:text-[11rem] font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 leading-[0.85] drop-shadow-2xl blur-sm absolute inset-0 opacity-50 animate-pulse">
                            LAB
                        </h1>
                        <h1 className="text-8xl md:text-[11rem] font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 leading-[0.85] drop-shadow-2xl relative z-10">
                            LAB
                        </h1>
                    </div>
                </div>

                <p className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-100 font-light leading-relaxed mb-16 animate-[fadeInUp_1.2s_ease-out] pointer-events-auto drop-shadow-lg bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                    Khám phá vũ trụ thông qua lăng kính của <span className="text-cyan-300 font-medium font-display">trí tuệ nhân tạo</span> và <span className="text-purple-300 font-medium font-display">mô phỏng thực tế</span>.
                </p>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-8 animate-[fadeInUp_1.4s_ease-out] pointer-events-auto">
                    <button 
                        onClick={onEnter} 
                        className="group relative px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                    >
                        <span className="relative z-10 flex items-center gap-3 tracking-wide">
                            BẮT ĐẦU KHÁM PHÁ <ArrowRight size={20} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform"/>
                        </span>
                    </button>
                    
                    <button 
                        onClick={() => setShowIntro(true)}
                        className="px-10 py-5 rounded-[2rem] font-bold text-lg text-white border border-white/30 bg-black/30 hover:bg-black/50 backdrop-blur-md transition-all flex items-center gap-3 group hover:border-cyan-500/50"
                    >
                        <PlayCircle size={24} className="text-slate-300 group-hover:text-cyan-400 transition-colors"/>
                        GIỚI THIỆU
                    </button>
                </div>

                <div className="mt-16 flex items-center gap-3 text-xs text-slate-300 font-mono animate-[fadeIn_2s] opacity-80">
                    <MousePointer2 size={12}/> 
                    <span className="uppercase tracking-widest">Click & Drag to interact with the cosmic web</span>
                </div>
            </div>

            {/* Intro Modal */}
            {showIntro && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                     <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowIntro(false)}></div>
                     <div className="relative w-full max-w-4xl bg-[#0a0f18] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-[scaleIn_0.3s]">
                        <button onClick={() => setShowIntro(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-white hover:bg-white/10 z-50 transition-colors"><X size={24}/></button>
                        <div className="p-16 text-center">
                            <Atom size={80} className="mx-auto text-cyan-400 mb-8 animate-[spin_10s_linear_infinite]"/>
                            <h2 className="text-4xl font-display font-black text-white mb-6">Chào mừng đến với Physical Lab</h2>
                            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                                Đây là nền tảng mô phỏng vật lý đa chiều, được thiết kế để biến những công thức khô khan thành trải nghiệm thị giác sống động.
                                Từ chuyển động của các hành tinh đến thế giới lượng tử, mọi thứ đều nằm trong tầm tay bạn.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <BrainCircuit className="text-purple-400 mb-4" size={32}/>
                                    <h3 className="font-bold text-white mb-2">Vision AI</h3>
                                    <p className="text-sm text-slate-400">Giải bài tập và phân tích hiện tượng qua hình ảnh.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <Atom className="text-cyan-400 mb-4" size={32}/>
                                    <h3 className="font-bold text-white mb-2">Mô phỏng 3D</h3>
                                    <p className="text-sm text-slate-400">Tương tác thời gian thực với độ chính xác vật lý cao.</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <PlayCircle className="text-indigo-400 mb-4" size={32}/>
                                    <h3 className="font-bold text-white mb-2">Thư viện số</h3>
                                    <p className="text-sm text-slate-400">Kho tàng kiến thức lịch sử và công thức tra cứu nhanh.</p>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
