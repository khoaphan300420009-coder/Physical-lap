
import React, { useState } from 'react';
import { useToast } from './Toast';
import { Note, Flashcard } from '../types';
import SecondBrainSidebar from './SecondBrain_Sidebar';
import SecondBrainDashboard from './SecondBrain_Dashboard';
import SecondBrainGraph from './SecondBrain_Graph';
import SecondBrainEditor from './SecondBrain_Editor';
import SecondBrainEvaluation from './SecondBrain_Evaluation';

// New Study Modes
import LearnModeView from './second_brain/LearnModeView';
import TestModeView from './second_brain/TestModeView';
import MatchModeView from './second_brain/MatchModeView';

interface SecondBrainViewProps {
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    flashcards: Flashcard[];
    setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}

const SecondBrainView: React.FC<SecondBrainViewProps> = ({ notes, setNotes, flashcards, setFlashcards }) => {
    const [view, setView] = useState<'dashboard' | 'graph' | 'write' | 'learn' | 'test' | 'match' | 'evaluation'>('dashboard');
    const { addToast } = useToast();

    // Centralized update function for child components
    const updateFlashcard = (updatedCard: Flashcard) => {
        setFlashcards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
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
                
                {view === 'write' && (
                    <SecondBrainEditor 
                        notes={notes} 
                        onSaveNote={(n) => setNotes(prev => [n, ...prev])} 
                        onDeleteNote={handleDeleteNote} 
                        setFlashcards={setFlashcards} 
                    />
                )}

                {/* --- NEW STUDY MODES --- */}
                {view === 'learn' && (
                    <LearnModeView 
                        flashcards={flashcards} 
                        updateFlashcard={updateFlashcard} 
                    />
                )}
                {view === 'test' && (
                    <TestModeView flashcards={flashcards} />
                )}
                {view === 'match' && (
                    <MatchModeView flashcards={flashcards} />
                )}
            </div>
        </div>
    );
};

export default SecondBrainView;
