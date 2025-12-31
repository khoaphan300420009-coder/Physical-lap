
import React, { useState, useEffect } from 'react';
import { 
    Rocket, PlayCircle, Box, Award, Trophy, 
    Brain, ArrowRight, Play, Activity, Flame, 
    Globe, Mail 
} from 'lucide-react';

interface LandingPageProps {
    onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    // Keep internal state minimal as this is mostly presentation
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative flex min-h-screen flex-col bg-background-dark text-white font-body overflow-x-hidden selection:bg-primary/30 selection:text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cyber-grid"></div>
                <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow"></div>
                <div className="absolute bottom-[0%] right-[5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <main className="relative flex-grow flex flex-col items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 gap-16 z-10">
                {/* Hero Section */}
                <section className="w-full flex flex-col items-center text-center gap-6 py-10 lg:py-20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[80px] -z-10 rounded-full"></div>
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-primary/50 shadow-[0_0_15px_rgba(0,242,255,0.3)] animate-float">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-xs font-display font-bold text-primary tracking-wide uppercase">Phiên Bản 2.0 Đã Ra Mắt</span>
                    </div>

                    <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight max-w-5xl">
                        <span className="block text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Chinh Phục</span>
                        <span className="text-gradient drop-shadow-[0_0_20px_rgba(0,242,255,0.4)]">Vũ Trụ Lượng Tử</span>
                    </h1>

                    <p className="text-gray-300 text-lg sm:text-xl max-w-2xl leading-relaxed">
                        Bước vào tương lai của giáo dục. Mô phỏng tương tác, làm chủ kiến thức với AI, và phòng thí nghiệm trò chơi hóa viết lại các định luật vật lý.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
                        <button 
                            onClick={onEnter}
                            className="h-12 px-8 rounded flex items-center justify-center gap-2 bg-primary text-background-dark font-display font-bold text-base hover:bg-white hover:text-primary hover:shadow-neon transition-all transform hover:-translate-y-1 group"
                        >
                            <Rocket className="w-5 h-5 group-hover:animate-pulse" />
                            Bắt Đầu Thí Nghiệm
                        </button>
                        <button className="h-12 px-8 rounded flex items-center justify-center gap-2 glass-panel text-white font-display font-medium text-base hover:bg-white/10 transition-all group">
                            <PlayCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                            Xem Bản Demo
                        </button>
                    </div>
                </section>

                {/* Bento Grid */}
                <section className="w-full grid grid-cols-1 md:grid-cols-3 grid-rows-[auto] md:grid-rows-[340px_300px] gap-6">
                    
                    {/* Free Mode (Large) */}
                    <div onClick={onEnter} className="group relative md:col-span-2 glass-panel rounded-xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,242,255,0.3)] cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#082f49]/80 via-transparent to-transparent z-10 pointer-events-none md:hidden"></div>
                        <div className="absolute inset-0 md:relative w-full md:w-1/2 h-full">
                            <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDhIDRL9kKneAgdWa4m7mVMnWNuz0EBt5a5IXwlXOZ-dZJeIynq8UtkuNxViuiaGAIqNeY2UNqgIcEcbdZoXlyqtg6TR43Z1B_XAuy3PMzTx7q0yu45qzKARh-lY7PMnXUK_dFPWgZFmiij7bIuFNza8iPmFG0JtssNqE-bB6hb8Z3nmQPf_gq5O13he2HUy6lK5YPS-pmI2_nxinWhPFYm1Kco0O1prLHNcdIigyUgNO4RP8SKPkIkxacwhtM_ipRKLhtb61Z6kCsm")' }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2324] via-transparent to-transparent opacity-80 md:hidden"></div>
                        </div>
                        <div className="relative z-20 flex flex-col justify-end md:justify-center p-6 md:p-8 w-full md:w-1/2 gap-4 h-full bg-gradient-to-t md:bg-gradient-to-l from-black/60 to-transparent">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded bg-primary/20 border border-primary/30">
                                    <Box className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-primary text-sm font-bold tracking-wider uppercase">Chế Độ Tự Do</span>
                            </div>
                            <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">Mô Phỏng Vô Tận</h3>
                            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                Bẻ cong thực tại trong môi trường 3D an toàn. Thao tác hạt, trọng lực và trường điện từ trong thời gian thực mà không có hậu quả.
                            </p>
                            <button className="mt-2 w-fit h-10 px-5 rounded bg-primary/10 border border-primary/50 text-primary font-bold text-sm hover:bg-primary hover:text-surface-dark transition-all">
                                Vào Phòng Lab
                            </button>
                        </div>
                    </div>

                    {/* Learn & Earn (Tall) */}
                    <div className="glass-panel rounded-xl p-0 flex flex-col relative overflow-hidden group md:row-span-2 hover:border-primary/80 transition-all duration-500">
                        <div className="absolute inset-0 hex-bg opacity-30"></div>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                        
                        <div className="p-6 pb-2 relative z-10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary" />
                                <h3 className="font-display font-bold text-white tracking-wider">HỌC & NHẬN THƯỞNG</h3>
                            </div>
                            <div className="px-2 py-1 rounded bg-secondary/20 border border-secondary/50 text-secondary text-[10px] font-bold uppercase tracking-wide animate-pulse">
                                Mùa 4
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center relative py-6">
                            <div className="absolute w-48 h-48 border border-primary/10 rotate-45 rounded-3xl animate-spin-slow"></div>
                            <div className="absolute w-40 h-40 border border-primary/20 rotate-12 rounded-full"></div>
                            <div className="relative z-10 animate-float">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                                <Trophy className="w-28 h-28 text-white drop-shadow-[0_0_15px_rgba(0,242,255,0.8)]" />
                            </div>
                            <div className="mt-4 text-center z-10">
                                <div className="text-xs text-primary font-bold tracking-[0.2em] uppercase mb-1">Xếp Hạng Hiện Tại</div>
                                <div className="text-2xl font-display font-bold text-white">Bậc Thầy Lượng Tử</div>
                            </div>
                        </div>

                        <div className="bg-black/40 backdrop-blur-sm p-6 border-t border-white/10 z-10 space-y-4">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs text-gray-400 font-medium">Tiến Độ XP</span>
                                <span className="text-xs font-bold text-primary">Cấp 5 <span className="text-gray-500 ml-1">1,240/2,000</span></span>
                            </div>
                            <div className="w-full flex gap-1 h-2">
                                <div className="flex-1 bg-primary h-full rounded-sm shadow-[0_0_8px_rgba(0,242,255,0.6)]"></div>
                                <div className="flex-1 bg-primary h-full rounded-sm shadow-[0_0_8px_rgba(0,242,255,0.6)]"></div>
                                <div className="flex-1 bg-primary h-full rounded-sm shadow-[0_0_8px_rgba(0,242,255,0.6)]"></div>
                                <div className="flex-1 bg-gray-700/50 h-full rounded-sm"></div>
                                <div className="flex-1 bg-gray-700/50 h-full rounded-sm"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-primary/30 transition-colors text-center">
                                    <div className="text-xl font-display font-bold text-white">Top 1%</div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Toàn Cầu</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-primary/30 transition-colors text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-xl font-display font-bold text-orange-400">24</span>
                                        <Flame className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Chuỗi Ngày</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Examiner */}
                    <div className="glass-panel rounded-xl p-6 relative group cursor-pointer overflow-hidden hover:bg-blue-900/20 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[50%] w-full -translate-y-full group-hover:animate-scan pointer-events-none z-0"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg group-hover:shadow-neon-purple transition-all duration-300 border border-white/10 group-hover:scale-105">
                                    <Brain className="text-white w-8 h-8" />
                                </div>
                                <span className="bg-primary text-background-dark px-2 py-1 rounded text-[10px] font-bold tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-background-dark rounded-full animate-pulse"></span>
                                    AI KÍCH HOẠT
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                                    Giám Khảo AI
                                    <ArrowRight className="text-primary w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Đánh giá kiến thức tức thì nhờ mạng nơ-ron. Nhận lộ trình học cá nhân hóa và xác định điểm yếu chỉ trong vài giây.
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between group-hover:border-primary/30 transition-colors">
                                <span className="text-xs font-bold text-primary tracking-wide uppercase">Bắt Đầu Đánh Giá</span>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                                    <Play className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Data Analysis */}
                    <div className="glass-panel rounded-xl p-6 flex flex-col relative group overflow-hidden transition-all hover:scale-[1.02] duration-300 ring-1 ring-cyan-500/30 bg-gradient-to-b from-cyan-900/30 to-transparent">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-cyan-500/30 transition-all"></div>
                        <div className="flex justify-between items-start mb-6 z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <p className="text-[10px] text-green-400 font-bold tracking-[0.2em] uppercase">DỮ LIỆU TRỰC TIẾP</p>
                                </div>
                                <h3 className="font-display text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">Phân Tích Dữ Liệu</h3>
                            </div>
                            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:border-cyan-500/50 transition-colors shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                                <Activity className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        
                        <div className="relative flex-1 w-full flex items-end min-h-[140px] mb-4">
                            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-20">
                                <div className="w-full h-[1px] bg-cyan-400/30"></div>
                                <div className="w-full h-[1px] bg-cyan-400/30"></div>
                                <div className="w-full h-[1px] bg-cyan-400/30"></div>
                                <div className="w-full h-[1px] bg-cyan-400/30"></div>
                            </div>
                            <svg className="w-full h-full overflow-visible z-10 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]" preserveAspectRatio="none" viewBox="0 0 100 50">
                                <defs>
                                    <linearGradient id="chartGradientNew" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.5"></stop>
                                        <stop offset="100%" stopColor="#00f2ff" stopOpacity="0"></stop>
                                    </linearGradient>
                                </defs>
                                <path d="M0,50 L0,35 Q15,45 30,25 T60,20 T80,10 L100,5 L100,50 Z" fill="url(#chartGradientNew)"></path>
                                <path d="M0,35 Q15,45 30,25 T60,20 T80,10 L100,5" fill="none" stroke="#00f2ff" strokeWidth="2.5" vectorEffect="non-scaling-stroke"></path>
                                <circle className="animate-pulse shadow-[0_0_10px_#00f2ff]" cx="100" cy="5" fill="#ffffff" r="3.5"></circle>
                            </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 z-10 bg-black/20 rounded-b-xl -mx-6 -mb-6 px-6 pb-6 mt-auto">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Hiệu Suất</span>
                                <div className="flex items-center gap-1 text-white text-lg font-display font-bold">
                                    <span>98.5</span>
                                    <span className="text-xs text-green-400 font-normal self-end mb-1">▲ 2.4%</span>
                                </div>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Điểm Học Tập</span>
                                <div className="text-white text-lg font-display font-bold">A+</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer CTA */}
                <section className="w-full flex flex-col items-center py-16 gap-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-center">
                        Sẵn sàng trở thành <span className="text-white underline decoration-primary decoration-4 underline-offset-4">nhà vật lý tương lai?</span>
                    </h2>
                    <button className="relative group cursor-pointer" onClick={onEnter}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-primary rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative flex items-center justify-center px-12 py-5 bg-background-dark rounded-lg border border-primary/50 leading-none">
                            <span className="text-primary font-display font-bold text-lg group-hover:text-white transition-colors mr-2">Đăng Ký Miễn Phí</span>
                            <ArrowRight className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                        </div>
                    </button>
                </section>
            </main>

            <footer className="w-full border-t border-white/5 py-8 bg-[#020617] relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">© 2023 Physical Lab Inc. Đã đăng ký bản quyền.</p>
                    <div className="flex gap-6">
                        <a className="text-gray-500 hover:text-white transition-colors" href="#">
                            <span className="sr-only">Twitter</span>
                            <Globe className="w-5 h-5" />
                        </a>
                        <a className="text-gray-500 hover:text-white transition-colors" href="#">
                            <span className="sr-only">Contact</span>
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
