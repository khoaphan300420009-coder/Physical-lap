
import React, { useState } from 'react';
import { generatePhysicsResponse } from '../services/geminiService';
import { useToast } from './Toast';
import { Note, Flashcard } from '../types';
import SecondBrainSidebar from './SecondBrain_Sidebar';
import SecondBrainDashboard from './SecondBrain_Dashboard';
import SecondBrainGraph from './SecondBrain_Graph';
import SecondBrainEditor from './SecondBrain_Editor';
import SecondBrainReview from './SecondBrain_Review';
import SecondBrainEvaluation from './SecondBrain_Evaluation';

interface SecondBrainViewProps {
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    flashcards: Flashcard[];
    setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}

// --- MAIN WRAPPER ---
const SecondBrainView: React.FC<SecondBrainViewProps> = ({ notes, setNotes, flashcards, setFlashcards }) => {
    const [view, setView] = useState<'dashboard' | 'graph' | 'write' | 'review' | 'evaluation'>('dashboard');
    const { addToast } = useToast();

    // Spaced Repetition Logic (SM-2 simplified)
    const handleRateCard = (cardId: string, rating: number) => {
        setFlashcards(prev => prev.map(card => {
            if (card.id !== cardId) return card;
            let interval = 1;
            let ease = card.easeFactor;
            if (rating >= 3) {
                if (card.streak === 0) interval = 1;
                else if (card.streak === 1) interval = 6;
                else interval = Math.round(card.interval * ease);
                ease = ease + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
            } else {
                interval = 1;
                ease = Math.max(1.3, ease - 0.2);
            }
            return {
                ...card,
                interval,
                easeFactor: ease,
                streak: rating >= 3 ? card.streak + 1 : 0,
                nextReview: Date.now() + interval * 24 * 60 * 60 * 1000
            };
        }));
        addToast('Đã lưu kết quả ôn tập!', 'success');
    };

    const handleGenerateCards = async (noteId: string, content: string) => {
        try {
            // Enhanced prompt for deep analysis
            const prompt = `
                Bạn là một Giáo sư Vật lý và chuyên gia sư phạm hàng đầu (Physical Lab AI).
                
                NHIỆM VỤ:
                Phân tích cực kỳ chi tiết (Deep Analysis) nội dung văn bản dưới đây để tạo ra bộ câu hỏi ôn tập (Flashcards) chất lượng cao nhất.
                Mục tiêu là giúp người học không chỉ nhớ mà còn hiểu sâu sắc bản chất, điều kiện áp dụng và tránh các bẫy tư duy.

                NỘI DUNG ĐẦU VÀO:
                """
                ${content}
                """

                YÊU CẦU XỬ LÝ (QUAN TRỌNG):
                1. QUÉT TOÀN DIỆN: Đừng bỏ sót bất kỳ chi tiết nhỏ nào (hằng số, đơn vị, điều kiện, hệ quả).
                2. SỐ LƯỢNG TỐI ĐA: Hãy tạo ra CÀNG NHIỀU CÂU HỎI CÀNG TỐT (từ 5 đến 20 câu tùy độ dài nội dung). Chia nhỏ kiến thức thành các đơn vị thông tin atomic.
                3. ĐA DẠNG HÓA CÂU HỎI:
                   - "Quiz": Trắc nghiệm 4 lựa chọn (A,B,C,D). Tập trung vào vận dụng và phân biệt khái niệm.
                   - "TrueFalse": Đúng/Sai. Dùng để kiểm tra các quan niệm sai lầm (misconceptions) phổ biến.
                   - "Basic": Hỏi đáp trực tiếp. Dùng cho định nghĩa, định luật, công thức gốc.
                4. GIẢI THÍCH CHI TIẾT ("answer"): 
                   - Không chỉ đưa ra đáp án. Hãy giải thích "Tại sao?".
                   - Phân tích vì sao các phương án nhiễu (distractors) lại sai.
                   - Liên hệ thực tế nếu có.
                
                LƯU Ý VỀ FORMAT JSON (RẤT QUAN TRỌNG):
                - Nếu có công thức LaTeX, hãy dùng 2 dấu gạch chéo ngược (double backslash) để escape. Ví dụ: "\\\\alpha", "\\\\frac{a}{b}".
                - Đảm bảo chuỗi JSON hợp lệ, không có lỗi ký tự escape.

                OUTPUT FORMAT:
                Chỉ trả về một mảng JSON hợp lệ (JSON Array).
                KHÔNG dùng markdown block. KHÔNG có lời dẫn.

                JSON SCHEMA:
                [
                    { 
                        "type": "Quiz", 
                        "question": "Câu hỏi trắc nghiệm...", 
                        "options": ["A...", "B...", "C...", "D..."], 
                        "correctIndex": 0, 
                        "answer": "Giải thích: Đáp án A đúng vì... B sai do..." 
                    },
                    { 
                        "type": "TrueFalse", 
                        "question": "Mệnh đề...", 
                        "correctValue": false, 
                        "answer": "Sai. Thực tế là..." 
                    },
                    {
                        "type": "Basic",
                        "question": "Câu hỏi mở...",
                        "answer": "Câu trả lời chi tiết..."
                    }
                ]
            `;
            
            const response = await generatePhysicsResponse(prompt);
            
            // Robust cleanup for JSON parsing
            const clean = response.replace(/```json/g, '').replace(/```/g, '').trim();
            
            let data;
            try {
                data = JSON.parse(clean);
            } catch (parseError) {
                console.warn("Initial JSON parse failed, trying to sanitize...", parseError);
                // Smart sanitizer: Escape backslashes that are NOT part of a valid escape sequence
                const sanitized = clean.replace(/\\(?![/bfnrtu"\\\\])/g, '\\\\');
                
                try {
                    data = JSON.parse(sanitized);
                } catch(e2) {
                     console.error("Sanitized JSON parse failed", e2);
                     console.log("Failed string:", sanitized);
                     throw new Error("Could not parse AI response as JSON");
                }
            }
            
            const newCards = data.map((item: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                noteId,
                type: item.type || 'Basic',
                question: item.question,
                answer: item.answer,
                options: item.options,
                correctIndex: item.correctIndex,
                correctValue: item.correctValue,
                nextReview: Date.now(),
                interval: 0,
                easeFactor: 2.5,
                streak: 0
            }));
            
            setFlashcards(prev => [...prev, ...newCards]);
            addToast(`AI đã phân tích sâu và tạo ra ${newCards.length} thẻ ghi nhớ!`, 'success');
        } catch (error) {
            console.error(error);
            addToast('Lỗi khi tạo thẻ từ AI. Vui lòng thử lại.', 'error');
        }
    };

    const handleDeleteNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        setFlashcards(prev => prev.filter(f => f.noteId !== id));
        addToast('Đã xóa học phần và thẻ liên quan.', 'info');
    };

    return (
        <div className="flex h-full w-full bg-[#020408] font-sans overflow-hidden">
            <SecondBrainSidebar view={view} setView={setView} />
            <div className="flex-1 relative overflow-hidden bg-[#020408]">
                {view === 'dashboard' && <SecondBrainDashboard />}
                {view === 'graph' && <SecondBrainGraph notes={notes} />}
                {view === 'evaluation' && <SecondBrainEvaluation notes={notes} flashcards={flashcards} />}
                {view === 'write' && <SecondBrainEditor notes={notes} onSaveNote={(n) => setNotes(prev => [n, ...prev])} onDeleteNote={handleDeleteNote} onGenerateCards={handleGenerateCards}/>}
                {view === 'review' && <SecondBrainReview flashcards={flashcards} onRate={handleRateCard} />}
            </div>
        </div>
    );
};

export default SecondBrainView;
