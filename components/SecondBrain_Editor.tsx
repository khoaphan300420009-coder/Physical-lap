
import React, { useState, useRef } from 'react';
import { Paperclip, Save, Trash2, FileText } from 'lucide-react';
import { Note, Flashcard } from '../types';
import { useToast } from './Toast';
import { generatePhysicsResponse } from '../services/geminiService';

interface EditorProps {
    notes: Note[];
    onSaveNote: (n: Note) => void;
    onDeleteNote: (id: string) => void;
    setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}

const SecondBrainEditor: React.FC<EditorProps> = ({ notes, onSaveNote, onDeleteNote, setFlashcards }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { addToast } = useToast();

    // AI Generation Logic (Simplified for Editor context)
    const handleGenerateCards = async (noteId: string, noteContent: string) => {
        try {
            const prompt = `Tạo 5 thẻ ghi nhớ (Flashcard) từ nội dung sau. Trả về định dạng JSON array: [{ "type": "Basic" | "Quiz" | "TrueFalse", "question": "...", "answer": "...", "options": ["..."] (nếu Quiz), "correctIndex": 0 (nếu Quiz), "correctValue": true/false (nếu TrueFalse) }]. Nội dung: ${noteContent.substring(0, 2000)}`;
            
            const response = await generatePhysicsResponse(prompt);
            const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const cardsData = JSON.parse(cleanJson);

            const newCards: Flashcard[] = cardsData.map((c: any, i: number) => ({
                id: `ai_${Date.now()}_${i}`,
                noteId: noteId,
                type: c.type || 'Basic',
                question: c.question,
                answer: c.answer,
                options: c.options,
                correctIndex: c.correctIndex,
                correctValue: c.correctValue,
                nextReview: Date.now(),
                interval: 1,
                easeFactor: 2.5,
                streak: 0
            }));

            setFlashcards(prev => [...prev, ...newCards]);
            addToast(`Đã tạo ${newCards.length} thẻ ghi nhớ từ AI!`, 'success');
        } catch (e) {
            console.error(e);
            addToast('Lỗi khi tạo thẻ AI.', 'error');
        }
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
                        <div onClick={() => {setTitle(note.title); setContent(note.content);}} className="flex-1 truncate relative z-10">
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
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5" title="Import File"><Paperclip size={20}/></button>
                        
                        <button 
                            className={`px-6 py-2 rounded-xl font-bold flex items-center gap-3 transition-all bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30`}
                            onClick={async () => {
                                if (!title.trim()) return;
                                const newNote: Note = { 
                                    id: Date.now().toString(), 
                                    title, 
                                    content, 
                                    tags: ['Mới'], 
                                    linkedTo: [], 
                                    lastReviewed: Date.now(), 
                                    createdDate: Date.now(), 
                                    type: 'Concept', 
                                    color: '#a855f7' 
                                };
                                onSaveNote(newNote);
                                addToast('Đã lưu bài viết!', 'success');
                                
                                // Auto generate cards
                                if (content.length > 50) {
                                    await handleGenerateCards(newNote.id, content);
                                }
                            }}
                        >
                            <Save size={18}/> Lưu & Tạo Thẻ AI
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-[#0f172a] rounded-3xl p-6 border border-white/10 relative shadow-inner">
                    <textarea 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        className="w-full h-full bg-transparent text-slate-300 text-lg leading-relaxed border-none outline-none resize-none font-sans custom-scroll placeholder:text-slate-600 focus:ring-0" 
                        placeholder="Nhập nội dung bài học..."
                    />
                </div>
            </div>
        </div>
    );
};

export default SecondBrainEditor;
