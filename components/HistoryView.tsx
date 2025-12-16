
import React, { useState, useEffect, useRef } from 'react';
import { EVENTS_DATA, SCIENTISTS_DATA } from '../constants';
import { TimelineEvent } from '../types';
import { Search, X, BookOpen, Star, ExternalLink } from 'lucide-react';
import { TimelineItem, DetailModal } from './HistoryParts';

// --- CẤU HÌNH HÌNH NỀN ---
// Bạn hãy thay thế đường dẫn trong dấu ngoặc kép bằng link ảnh của bạn
const BACKGROUND_IMAGE_URL = "https://i.pinimg.com/736x/be/f4/29/bef42939d1d1ddbce8d3cb06e12681a6.jpg";

const CATEGORIES = ['Tất cả', 'Cơ học', 'Thiên văn', 'Điện từ', 'Quang học', 'Lượng tử', 'Hạt nhân'];

const HistoryView: React.FC = () => {
    const [selected, setSelected] = useState<TimelineEvent | null>(null);
    const [filter, setFilter] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [visibleItems, setVisibleItems] = useState<number[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredEvents = (EVENTS_DATA || []).filter(e => {
        if (!e) return false;
        const matchesSearch = e.title.toLowerCase().includes(filter.toLowerCase()) || 
                              e.physicist.toLowerCase().includes(filter.toLowerCase()) || 
                              e.year.includes(filter);
        const matchesCat = activeCategory === 'Tất cả' || e.category === activeCategory;
        return matchesSearch && matchesCat;
    }).sort((a, b) => a.numericYear - b.numericYear);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = Number(entry.target.getAttribute('data-id'));
                    setVisibleItems(prev => prev.includes(id) ? prev : [...prev, id]);
                }
            });
        }, { threshold: 0.1, root: containerRef.current });

        const elements = document.querySelectorAll('.timeline-item');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [filteredEvents]);

    return (
        <div ref={containerRef} className="h-full w-full overflow-y-auto custom-scroll relative bg-[#0a0f18] font-display text-white scroll-smooth group/design-root">
            {/* Backgrounds */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Background Image hiển thị rõ nét hơn (opacity cao hơn) */}
                <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{backgroundImage: `url("${BACKGROUND_IMAGE_URL}")`}}></div>
                
                {/* Gradient chỉ tập trung ở trên và dưới để che các phần mép, để lộ phần giữa */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f18]/90 via-[#0a0f18]/20 to-[#0a0f18]"></div>
                
                {/* Subtle Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
            </div>

            {/* Header */}
            <section className="relative z-10 pt-20 pb-12 px-6 text-center">
                <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
                    {/* Title */}
                    <div className="relative mb-2">
                        <h1 className="text-5xl md:text-8xl font-round font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-indigo-200 uppercase tracking-tight drop-shadow-2xl">
                            Dòng Chảy <span className="text-cyan-400">Lịch Sử</span>
                        </h1>
                        <div className="w-32 h-1 bg-cyan-500 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
                    </div>
                    
                    {/* Search & Filter - Moved Below Title */}
                    <div className="w-full max-w-2xl mt-4 relative group z-20">
                        <div className="relative flex items-center bg-[#0a0f18]/80 backdrop-blur rounded-full border border-white/10 shadow-2xl transition-all group-hover:border-cyan-500/50">
                            <div className="pl-6 text-cyan-400"><Search size={24}/></div>
                            <input 
                                type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
                                placeholder="Tìm kiếm sự kiện, nhà khoa học..." className="w-full bg-transparent border-none py-4 px-4 text-white focus:ring-0 placeholder:text-slate-500"
                            />
                            {filter && <button onClick={() => setFilter('')} className="pr-6 text-slate-500 hover:text-white"><X size={20}/></button>}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                            {CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                        activeCategory === cat ? 'bg-cyan-500/80 border-cyan-500 text-white' : 'bg-black/40 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >{cat}</button>
                            ))}
                        </div>
                    </div>

                    {/* Intro Section - Below Search */}
                    <div className="max-w-4xl mx-auto bg-black/60 border border-white/10 rounded-3xl p-8 backdrop-blur-md text-left shadow-2xl my-8 animate-[fadeIn_0.8s]">
                        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                            <BookOpen className="text-cyan-400"/>
                            <h3 className="text-lg font-bold uppercase tracking-widest text-white">Tổng quan Lịch sử Vật lý</h3>
                        </div>
                        <p className="text-slate-300 leading-8 text-justify font-light whitespace-pre-line">
                            Lịch sử vật lý là câu chuyện vĩ đại nhất về trí tò mò của nhân loại, kéo dài từ những quan sát thiên văn đầu tiên của người cổ đại đến các máy gia tốc hạt khổng lồ ngày nay. Nó bắt đầu khi các triết gia Hy Lạp như Aristotle và Archimedes cố gắng giải thích thế giới bằng lý trí thay vì thần thoại. Tuy nhiên, phải đến thế kỷ 16-17, cuộc cách mạng thực sự mới nổ ra với Galileo Galilei, người đã dám thách thức giáo điều bằng kính viễn vọng và thực nghiệm.
                            
                            Tiếp nối là Isaac Newton, người khổng lồ đã thống nhất chuyển động của quả táo rơi và quỹ đạo mặt trăng bằng một định luật vạn vật hấp dẫn duy nhất, đặt nền móng cho cơ học cổ điển thống trị suốt 200 năm. Thế kỷ 19 chứng kiến sự bùng nổ của Điện từ học với Faraday và Maxwell, biến điện năng thành nguồn sống của nền văn minh hiện đại và chứng minh ánh sáng chính là sóng điện từ.

                            Nhưng bước ngoặt chấn động nhất đến vào đầu thế kỷ 20. Hai đám mây đen trên bầu trời vật lý đã dẫn đến sự ra đời của Thuyết Tương đối và Cơ học Lượng tử. Albert Einstein đã thay đổi hoàn toàn quan niệm về không gian và thời gian, trong khi Planck, Bohr và Heisenberg mở ra cánh cửa vào thế giới vi mô kỳ lạ nơi xác suất ngự trị.

                            Ngày nay, vật lý học tiếp tục đi sâu vào bản chất của vật chất với Mô hình Chuẩn, khám phá các hạt hạ nguyên tử như Boson Higgs, đồng thời hướng ra vũ trụ bao la để giải mã năng lượng tối, vật chất tối và nguồn gốc của Big Bang. Mỗi khám phá không chỉ mở rộng biên giới tri thức mà còn mang lại những ứng dụng công nghệ làm thay đổi cuộc sống con người mãi mãi.
                        </p>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="relative z-10 px-4 sm:px-10 pb-24 max-w-7xl mx-auto min-h-screen">
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent md:-translate-x-1/2"></div>
                <div className="space-y-24">
                    {filteredEvents.map((e, index) => (
                        <TimelineItem key={e.id} event={e} index={index} isVisible={visibleItems.includes(e.id)} onSelect={setSelected} />
                    ))}
                </div>
            </section>

            {/* Scientists Section */}
            <section className="relative z-10 py-20 bg-[#05080f]/90 border-t border-white/5 backdrop-blur">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-16 text-center">
                        Nhà Khoa Học <span className="text-cyan-400">Tiên Phong</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {SCIENTISTS_DATA.map(s => (
                            <div key={s.id} className="group bg-[#0f1420] rounded-3xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all hover:-translate-y-2">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={s.image} alt={s.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1420] to-transparent"></div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-1">{s.name}</h3>
                                    <p className="text-xs text-cyan-400 font-mono mb-4">{s.life}</p>
                                    <p className="text-sm text-slate-400 line-clamp-3 mb-4">{s.desc}</p>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-slate-300">{s.field}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal */}
            <DetailModal event={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

export default HistoryView;
