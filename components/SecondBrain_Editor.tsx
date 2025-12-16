
import React, { useState, useRef } from 'react';
import { Paperclip, Save, Sparkles, Trash2, BrainCircuit, FileText } from 'lucide-react';
import { Note } from '../types';
import { useToast } from './Toast';
import mammoth from 'mammoth';
import readXlsxFile from 'read-excel-file';

interface EditorProps {
    notes: Note[];
    onSaveNote: (n: Note) => void;
    onDeleteNote: (id: string) => void;
    onGenerateCards: (noteId: string, content: string) => void;
}

const SecondBrainEditor: React.FC<EditorProps> = ({ notes, onSaveNote, onDeleteNote, onGenerateCards }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    const handleSave = () => {
        if (!title.trim()) { addToast('Vui lòng nhập tiêu đề', 'warning'); return; }
        
        const linkedTo: string[] = [];
        notes.forEach(n => { if (n && n.title && content.includes(n.title)) linkedTo.push(n.id); });
        
        let type: Note['type'] = 'Concept';
        if (content.includes('=')) type = 'Formula';
        else if (content.match(/\d{4}/)) type = 'Event';
        else if (title.split(' ').length <= 3 && /^[A-Z]/.test(title)) type = 'Person';
        
        const colorMap: Record<string, string> = { Concept: '#a855f7', Person: '#ec4899', Event: '#f59e0b', Formula: '#22d3ee' };
        
        const newNote: Note = { 
            id: Date.now().toString(), 
            title, 
            content, 
            tags: ['Mới'], 
            linkedTo, 
            lastReviewed: Date.now(), 
            createdDate: Date.now(), 
            type, 
            color: colorMap[type] || '#a855f7' 
        };
        
        onSaveNote(newNote);
        addToast('Đã lưu bài viết vào Graph!', 'success');
        
        if (content.length > 20) {
            handleAIAnalyze(newNote.id, content);
        } else { 
            setTitle(''); setContent(''); 
        }
    };

    const handleAIAnalyze = async (noteId: string, noteContent: string) => {
        setIsAnalyzing(true);
        try { 
            await onGenerateCards(noteId, noteContent); 
            setTitle(''); setContent(''); 
        } catch (e) { 
            console.error(e); 
        } finally { 
            setIsAnalyzing(false); 
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            let extractedText = '';
            if (file.name.endsWith('.docx')) {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                extractedText = result.value;
            } else if (file.name.endsWith('.xlsx')) {
                const rows = await readXlsxFile(file);
                extractedText = rows.map((row: any) => row.join(' ')).join('\n');
            } else {
                addToast("Định dạng file không hỗ trợ. Dùng .docx hoặc .xlsx", 'error');
                return;
            }

            if (extractedText) {
                setContent(prev => prev + (prev ? '\n\n' : '') + extractedText);
                addToast(`Đã trích xuất nội dung từ ${file.name}`, 'success');
            }
        } catch (error) {
            console.error(error);
            addToast("Lỗi đọc file.", 'error');
        }
        
        // Reset input
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEditNote = (note: Note) => {
        setTitle(note.title);
        setContent(note.content);
        addToast(`Đang chỉnh sửa: ${note.title}`, 'info');
    };

    return (
        <div className="flex h-full animate-[fadeIn_0.3s]">
            <div className="w-72 bg-[#0a0f18] border-r border-white/10 p-4 overflow-y-auto custom-scroll flex flex-col gap-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 flex justify-between items-center">
                    Danh sách đã lưu <span>{notes.length}</span>
                </h3>
                {notes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <FileText size={32} className="text-slate-600 mb-2"/>
                        <p className="text-sm text-slate-600 italic">Chưa có bài nào.</p>
                    </div>
                )}
                {notes.map(note => (
                    <div key={note.id} className="group relative flex items-center justify-between p-3 rounded-xl bg-[#0f172a] hover:bg-white/5 border border-white/5 transition-all cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div onClick={() => handleEditNote(note)} className="flex-1 truncate relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: note.color}}></div>
                                <div className="text-sm font-bold text-slate-200 truncate">{note.title}</div>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate pl-4">{new Date(note.createdDate).toLocaleDateString()} • {note.type}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }} className="relative z-10 p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" title="Xóa học phần">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex-1 p-8 flex flex-col h-full bg-[#05080f]">
                <div className="flex justify-between items-center mb-6">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề học phần..." className="bg-transparent text-3xl font-black text-white placeholder:text-slate-700 border-none outline-none flex-1 mr-4 focus:ring-0"/>
                    <div className="flex gap-2 shrink-0">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".docx, .xlsx" onChange={handleFileUpload} />
                        <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5" title="Import File"><Paperclip size={20}/></button>
                        
                        <button 
                            onClick={handleSave} 
                            disabled={isAnalyzing} 
                            className={`px-6 py-2 rounded-xl font-bold flex items-center gap-3 transition-all ${isAnalyzing ? 'bg-indigo-900/50 text-indigo-300 cursor-wait border border-indigo-500/30' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30'}`}
                        >
                            {isAnalyzing ? (
                                <><BrainCircuit size={18} className="animate-pulse"/> Đang phân tích...</>
                            ) : (
                                <><Save size={18}/> Lưu & Tạo Flashcards</>
                            )}
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-[#0f172a] rounded-3xl p-6 border border-white/10 relative shadow-inner">
                    <textarea 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        className="w-full h-full bg-transparent text-slate-300 text-lg leading-relaxed border-none outline-none resize-none font-sans custom-scroll placeholder:text-slate-600 focus:ring-0" 
                        placeholder="Nhập nội dung bài học tại đây (văn bản, công thức, định lý...)... Hệ thống Vision AI sẽ tự động đọc hiểu, phân tích sâu và tạo ra bộ Flashcards trắc nghiệm toàn diện nhất cho bạn."
                    />
                </div>
            </div>
        </div>
    );
};

export default SecondBrainEditor;
