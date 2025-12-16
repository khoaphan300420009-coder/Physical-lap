
import React, { useState } from 'react';
import { ArrowUpRight, Waves, Battery, Glasses, Activity, Tally5, Flame, Magnet, Zap, Rainbow } from 'lucide-react';
import ProjectileSim from './ProjectileSim';
import WaveSim from './WaveSim';
import CapacitorSim from './CapacitorSim';
import OpticsSim from './OpticsSim';
import DoublePendulumSim from './DoublePendulumSim';
import PendulumLab from './lab/PendulumLab';
import ThermodynamicsLab from './lab/ThermodynamicsLab';
import FaradayLab from './lab/FaradayLab';
import ElectrostaticsLab from './lab/ElectrostaticsLab';
import InterferenceLab from './lab/InterferenceLab';

const SimulationsView: React.FC = () => {
    const [mode, setMode] = useState<'projectile' | 'wave' | 'capacitor' | 'optics' | 'pendulum' | 'lab' | 'thermo' | 'faraday' | 'static' | 'interference'>('projectile');

    return (
        <div className="flex flex-col h-full bg-[#020408] text-slate-200">
            {/* Top Navigation Bar */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0f] shrink-0 overflow-x-auto custom-scroll">
                <div className="flex gap-2 bg-black/40 p-1 rounded-xl shrink-0">
                    <button onClick={() => setMode('projectile')} className={`p-2 rounded-lg transition-all ${mode === 'projectile' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`} title="Ném xiên"><ArrowUpRight size={20} /></button>
                    <button onClick={() => setMode('wave')} className={`p-2 rounded-lg transition-all ${mode === 'wave' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`} title="Sóng cơ"><Waves size={20} /></button>
                    <button onClick={() => setMode('capacitor')} className={`p-2 rounded-lg transition-all ${mode === 'capacitor' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`} title="Tụ điện"><Battery size={20} /></button>
                    <button onClick={() => setMode('optics')} className={`p-2 rounded-lg transition-all ${mode === 'optics' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white'}`} title="Quang học"><Glasses size={20} /></button>
                    <button onClick={() => setMode('pendulum')} className={`p-2 rounded-lg transition-all ${mode === 'pendulum' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white'}`} title="Con lắc đôi (Chaos)"><Activity size={20} /></button>
                    <div className="w-px h-8 bg-white/10 mx-1"></div>
                    <button onClick={() => setMode('lab')} className={`p-2 rounded-lg transition-all ${mode === 'lab' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`} title="PTN Dao Động"><Tally5 size={20} /></button>
                    <button onClick={() => setMode('thermo')} className={`p-2 rounded-lg transition-all ${mode === 'thermo' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-white'}`} title="Nhiệt Học"><Flame size={20} /></button>
                    <button onClick={() => setMode('faraday')} className={`p-2 rounded-lg transition-all ${mode === 'faraday' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`} title="Cảm ứng Từ"><Magnet size={20} /></button>
                    <button onClick={() => setMode('static')} className={`p-2 rounded-lg transition-all ${mode === 'static' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'text-slate-400 hover:text-white'}`} title="Tĩnh Điện"><Zap size={20} /></button>
                    <button onClick={() => setMode('interference')} className={`p-2 rounded-lg transition-all ${mode === 'interference' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white'}`} title="Giao Thoa Ánh Sáng"><Rainbow size={20} /></button>
                </div>

                <div className="flex items-center gap-4 ml-4">
                     <h2 className="hidden md:block font-bold text-sm uppercase tracking-widest text-slate-500 whitespace-nowrap">
                        {mode === 'projectile' && 'Chuyển động Ném Xiên'}
                        {mode === 'wave' && 'Giao thoa Sóng'}
                        {mode === 'capacitor' && 'Mô phỏng Tụ điện Pro'}
                        {mode === 'optics' && 'Quang hình học'}
                        {mode === 'pendulum' && 'Hệ Hỗn Loạn: Con lắc đôi'}
                        {mode === 'lab' && 'Phòng Thí Nghiệm Dao Động'}
                        {mode === 'thermo' && 'Chất Khí & Nhiệt Động Lực Học'}
                        {mode === 'faraday' && 'Thí Nghiệm Faraday & Cảm Ứng Từ'}
                        {mode === 'static' && 'Điện Tích & Điện Trường'}
                        {mode === 'interference' && 'Giao Thoa & Nhiễu Xạ Ánh Sáng'}
                    </h2>
                </div>
            </div>

            {/* Main Simulation Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {mode === 'projectile' && <ProjectileSim />}
                {mode === 'wave' && <WaveSim />}
                {mode === 'capacitor' && <CapacitorSim />}
                {mode === 'optics' && <OpticsSim />}
                {mode === 'pendulum' && <DoublePendulumSim />}
                {mode === 'lab' && <PendulumLab />}
                {mode === 'thermo' && <ThermodynamicsLab />}
                {mode === 'faraday' && <FaradayLab />}
                {mode === 'static' && <ElectrostaticsLab />}
                {mode === 'interference' && <InterferenceLab />}
            </div>
        </div>
    );
};

export default SimulationsView;
