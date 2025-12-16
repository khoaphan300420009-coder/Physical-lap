
import React, { useState } from 'react';
import { Rainbow, ChevronRight, SplitSquareHorizontal, ArrowDownRight, CircleDashed, Sliders, Columns, Layers } from 'lucide-react';
import YoungsDoubleSlit from './interference/YoungsDoubleSlit';
import RefractionDiagram from './interference/ThinFilm';
import NewtonsRings from './interference/NewtonsRings';
import MichelsonInterferometer from './interference/MichelsonInterferometer';
import FresnelMirror from './interference/FresnelMirror';
import AirWedge from './interference/AirWedge';

type LabMode = 'Young' | 'Newton' | 'Fresnel' | 'Refraction' | 'Michelson' | 'Wedge';

const InterferenceLab: React.FC = () => {
    const [mode, setMode] = useState<LabMode>('Young');

    const NavButton = ({ id, icon: Icon, label }: { id: LabMode, icon: any, label: string }) => (
        <button 
            onClick={() => setMode(id)} 
            className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center justify-between transition-all group ${
                mode === id 
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-900/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${mode === id ? 'bg-black/20' : 'bg-black/40'}`}>
                    <Icon size={18}/>
                </div>
                <span>{label}</span>
            </div>
            <ChevronRight size={16} className={`transition-transform ${mode === id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-50 group-hover:translate-x-0'}`}/>
        </button>
    );

    return (
        <div className="flex h-full w-full bg-[#020408] font-sans overflow-hidden">
            {/* SIDEBAR */}
            <div className="w-72 shrink-0 bg-[#0a0f18] border-r border-white/10 flex flex-col z-20 shadow-2xl">
                <div className="p-8 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                    <h2 className="text-2xl font-display font-black text-white flex items-center gap-3">
                        <Rainbow className="text-teal-400" size={28}/> 
                        <div>
                            QUANG HỌC
                            <span className="block text-xs font-sans font-normal text-slate-500 tracking-wider">LABORATORY</span>
                        </div>
                    </h2>
                </div>
                
                <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scroll">
                    <NavButton id="Young" icon={SplitSquareHorizontal} label="Giao thoa Young" />
                    <NavButton id="Newton" icon={CircleDashed} label="Vân tròn Newton" />
                    <NavButton id="Wedge" icon={Layers} label="Nêm không khí" />
                    <NavButton id="Fresnel" icon={Columns} label="Gương Fresnel" />
                    <NavButton id="Michelson" icon={Sliders} label="Michelson" />
                    <div className="my-4 h-px bg-white/10 mx-4"></div>
                    <NavButton id="Refraction" icon={ArrowDownRight} label="Khúc xạ & Phản xạ" />
                </div>

                <div className="p-6 border-t border-white/10">
                    <div className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
                        Pro Mode Enabled
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 relative overflow-hidden bg-[#050508] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
                {mode === 'Young' && <YoungsDoubleSlit />}
                {mode === 'Refraction' && <RefractionDiagram />}
                {mode === 'Newton' && <NewtonsRings />}
                {mode === 'Michelson' && <MichelsonInterferometer />}
                {mode === 'Fresnel' && <FresnelMirror />}
                {mode === 'Wedge' && <AirWedge />}
            </div>
        </div>
    );
};

export default InterferenceLab;
