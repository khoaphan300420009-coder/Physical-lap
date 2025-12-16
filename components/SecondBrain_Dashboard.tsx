
import React, { useState, useEffect, useMemo } from 'react';
import { Flame, Clock, Play, Pause, RefreshCw, CheckSquare, CheckCircle, Trash2, Plus, Calendar, Sparkles, Rocket, Quote, Zap } from 'lucide-react';
import { generatePhysicsResponse } from '../services/geminiService';
import { useToast } from './Toast';

// --- MOTIVATIONAL QUOTES ---
const QUOTES = [
    "Sự học như con thuyền đi ngược nước, không tiến ắt sẽ lùi.",
    "Logic sẽ đưa bạn từ A đến B. Trí tưởng tượng sẽ đưa bạn đến mọi nơi. - Albert Einstein",
    "Không có gì là không thể với một người luôn biết cố gắng.",
    "Vật lý không chỉ là những con số, đó là ngôn ngữ của vũ trụ.",
    "Thất bại chỉ là cơ hội để bắt đầu lại một cách thông minh hơn.",
    "Kiến thức là kho báu, nhưng thực hành là chiếc chìa khóa để mở nó."
];

// --- HEADER COMPONENT ---
const EpicHeader: React.FC = () => {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex(prev => (prev + 1) % QUOTES.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            className="relative w-full rounded-[3rem] p-10 overflow-hidden shadow-2xl border border-white/5 group transition-all duration-500 hover:shadow-indigo-500/20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://i.pinimg.com/1200x/c5/09/7b/c5097b9fa0a8682d763775ec79f2f7c6.jpg" 
                    alt="Dashboard Background" 
                    className="w-full h-full object-cover transition-transform duration-[20s] ease-linear scale-100 group-hover:scale-110"
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/70 to-[#1e1b4b]/40"></div>
            </div>

            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse pointer-events-none z-0"></div>
            
            {/* Floating Particles (Simulated) */}
            <div className={`absolute top-10 right-20 w-4 h-4 bg-yellow-400 rounded-full blur-sm transition-all duration-1000 z-10 ${isHovered ? 'translate-y-[-10px] scale-125' : ''}`}></div>
            <div className={`absolute bottom-20 left-1/2 w-2 h-2 bg-pink-400 rounded-full blur-[1px] transition-all duration-1000 delay-100 z-10 ${isHovered ? 'translate-y-[-20px]' : ''}`}></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4 max-w-3xl">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-bold uppercase tracking-widest shadow-lg">
                        <Rocket size={14} className="mr-2 animate-bounce" /> Second Brain OS v2.0
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-cyan-200 leading-tight drop-shadow-xl">
                        Mạng tri thức và <br/> cơ chế nhận thức của người học
                    </h1>
                    
                    <div className="flex items-start gap-3 pt-2">
                        <Quote size={20} className="text-indigo-400 shrink-0 mt-1 opacity-50"/>
                        <p className="text-lg text-slate-300 font-light italic leading-relaxed animate-[fadeIn_1s]">
                            "{QUOTES[quoteIndex]}"
                        </p>
                    </div>
                </div>

                {/* Stat Badges */}
                <div className="flex flex-col gap-3">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-4 rounded-2xl flex items-center gap-4 transition-transform hover:scale-105 hover:bg-white/20 cursor-default shadow-xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Zap size={20} className="text-white fill-white"/>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white leading-none">Top 1%</div>
                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Hiệu suất tuần này</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- WIDGET 1: FOCUS TIMER ---
const FocusTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-[#0f172a]/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border border-white/10 flex flex-col h-full relative overflow-hidden group min-h-[300px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-6 text-slate-300 font-bold text-xs uppercase tracking-widest z-10">
                <Clock size={16} className="text-indigo-400" /> Đồng Hồ Tập Trung
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center z-10">
                <div className="text-6xl font-mono font-bold text-white tracking-wider drop-shadow-md tabular-nums mb-2">
                    {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-indigo-300/60 uppercase tracking-[0.2em] font-bold">Pomodoro Mode</div>
            </div>
            
            <div className="flex gap-3 mt-6 z-10">
                <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                        isRunning 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' 
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 hover:scale-[1.02]'
                    }`}
                >
                    {isRunning ? <><Pause size={16}/> Tạm Dừng</> : <><Play size={16}/> Bắt Đầu</>}
                </button>
                <button 
                    onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }}
                    className="p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    title="Đặt lại"
                >
                    <RefreshCw size={20} />
                </button>
            </div>
        </div>
    );
};

// --- WIDGET 2: HABIT STREAK ---
const HabitStreak: React.FC = () => {
    const [streak, setStreak] = useState(12);
    const [checkedToday, setCheckedToday] = useState(false);

    const handleCheckIn = () => {
        if (!checkedToday) {
            setStreak(s => s + 1);
            setCheckedToday(true);
        }
    };

    return (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-[2.5rem] shadow-2xl text-white flex flex-col items-center justify-between relative overflow-hidden h-full border border-white/10 group min-h-[300px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150 pointer-events-none">
                <Flame size={120} />
            </div>
            
            <div className="z-10 flex items-center gap-2 mb-2 w-full">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-md">
                    <Flame size={20} className="fill-white" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest">Chuỗi Điểm Danh</h3>
            </div>

            <div className="text-center z-10 my-4 flex-1 flex flex-col justify-center">
                <span className="text-8xl font-black tracking-tighter drop-shadow-lg">{streak}</span>
                <p className="text-orange-100 text-sm font-medium uppercase tracking-wider opacity-80">ngày liên tiếp</p>
            </div>

            <button 
                onClick={handleCheckIn}
                disabled={checkedToday}
                className={`w-full py-4 rounded-2xl font-bold transition-all z-10 shadow-lg ${
                    checkedToday 
                    ? 'bg-white/20 cursor-default text-white border border-white/20' 
                    : 'bg-white text-orange-600 hover:bg-orange-50 hover:scale-[1.02] active:scale-95'
                }`}
            >
                {checkedToday ? 'Đã điểm danh!' : 'Điểm danh ngay'}
            </button>
        </div>
    );
};

// --- WIDGET 3: DAILY TASKS (WITH AI) ---
const DailyTasks: React.FC = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: "Ôn tập công thức thấu kính", done: true },
        { id: 2, text: "Làm bài tập sóng cơ", done: false },
    ]);
    const [newTask, setNewTask] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const { addToast } = useToast();

    const addTask = (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
        setNewTask("");
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const removeTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleAISuggest = async () => {
        setIsThinking(true);
        try {
            const prompt = "Hãy đóng vai một gia sư vật lý. Gợi ý 3 nhiệm vụ học tập ngắn gọn, cụ thể trong ngày cho học sinh trung học phổ thông. Chỉ trả về danh sách 3 dòng, không có số thứ tự, không có dấu gạch đầu dòng.";
            const response = await generatePhysicsResponse(prompt);
            const suggestions = response.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
            
            const newTasks = suggestions.map((text, idx) => ({
                id: Date.now() + idx,
                text: text.replace(/^[-*•\d\.]+\s*/, ''), // Clean bullets
                done: false
            }));
            
            setTasks(prev => [...prev, ...newTasks]);
            addToast("Đã thêm nhiệm vụ từ AI!", "success");
        } catch (error) {
            addToast("Lỗi kết nối AI assistant", "error");
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="bg-[#0f172a]/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border border-white/10 flex flex-col h-full relative group min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-widest">
                    <CheckSquare size={16} className="text-emerald-400" /> Nhiệm Vụ Hôm Nay
                </div>
                
                <button 
                    onClick={handleAISuggest}
                    disabled={isThinking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[10px] font-bold uppercase tracking-wide transition-all border border-indigo-500/30"
                    title="AI Gợi ý nhiệm vụ"
                >
                    {isThinking ? <RefreshCw size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                    {isThinking ? 'AI...' : 'Gợi ý'}
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scroll space-y-2 mb-4 pr-1 max-h-[180px]">
                {tasks.length === 0 && <p className="text-slate-600 text-xs italic text-center py-4">Chưa có nhiệm vụ nào.</p>}
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl transition-all hover:bg-white/10 group/item border border-transparent hover:border-white/5 animate-[fadeIn_0.3s]">
                        <button onClick={() => toggleTask(task.id)} className={`flex-shrink-0 transition-colors ${task.done ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}>
                            {task.done ? <CheckCircle size={20} /> : <div className="w-5 h-5 border-2 border-current rounded-full" />}
                        </button>
                        <span className={`flex-grow text-sm ${task.done ? 'text-slate-500 line-through' : 'text-slate-200 font-medium'}`}>{task.text}</span>
                        <button onClick={() => removeTask(task.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all p-1">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={addTask} className="flex gap-2 mt-auto">
                <input 
                    type="text" 
                    placeholder="Thêm việc mới..." 
                    className="flex-grow px-4 py-3 bg-black/30 rounded-xl text-sm border border-white/10 focus:border-emerald-500/50 outline-none transition-all text-white placeholder:text-slate-600"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <button type="submit" className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                    <Plus size={20} />
                </button>
            </form>
        </div>
    );
};

// --- WIDGET 4: 30-DAY CALENDAR HEATMAP ---
const CalendarHeatmap: React.FC = () => {
    // Generate mock days
    const days = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        status: i < 12 ? (Math.random() > 0.3 ? 'done' : 'missed') : (i === 12 ? 'today' : 'future')
    })), []);

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'done': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
            case 'missed': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'today': return 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-110 z-10';
            default: return 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10';
        }
    };

    return (
        <div className="bg-[#0f172a]/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border border-white/10 h-full flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-widest">
                    <Calendar size={16} className="text-blue-400" /> Lịch Trình 30 Ngày
                </div>
                <span className="text-[10px] font-bold px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">Tháng 12</span>
            </div>
            
            <div className="grid grid-cols-7 gap-2.5 text-center flex-1 content-start">
                {/* Header */}
                {['T2','T3','T4','T5','T6','T7','CN'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-slate-500 mb-1">{d}</div>
                ))}
                {/* Grid */}
                {days.map((d) => (
                    <div 
                        key={d.day}
                        className={`aspect-square flex items-center justify-center rounded-xl text-xs font-bold border transition-all ${getStatusStyle(d.status)} cursor-default`}
                        title={d.status === 'today' ? 'Hôm nay' : `Ngày ${d.day}`}
                    >
                        {d.day}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const SecondBrainDashboard: React.FC = () => {
    return (
        <div className="p-8 space-y-8 animate-[fadeIn_0.3s] h-full overflow-y-auto custom-scroll bg-[#05080f]">
            {/* Header Section */}
            <EpicHeader />

            {/* Main Grid Layout - The 4 Core Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-auto">
                <div className="lg:col-span-1">
                    <FocusTimer />
                </div>
                <div className="lg:col-span-1">
                    <HabitStreak />
                </div>
                <div className="lg:col-span-1">
                    <DailyTasks />
                </div>
                <div className="lg:col-span-1">
                    <CalendarHeatmap />
                </div>
            </div>
        </div>
    );
};

export default SecondBrainDashboard;
