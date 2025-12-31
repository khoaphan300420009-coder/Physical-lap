import React, { useState, useEffect, useRef, memo } from 'react';
import { Flashcard } from '../../types';
import { Gamepad2, Timer, RotateCcw } from 'lucide-react';
import { shuffleArray } from '../../utils/helpers';

interface MatchModeProps {
    flashcards: Flashcard[];
}

interface Tile {
    id: string;
    content: string;
    pairId: string;
    type: 'Q' | 'A';
    status: 'hidden' | 'selected' | 'matched' | 'wrong';
}

// --- OPTIMIZATION: Memoized Timer Component ---
// Separated to prevent full grid re-renders every frame
const GameTimer = memo(({ isRunning, onFinish, penalty }: { isRunning: boolean; onFinish: (time: number) => void; penalty: number }) => {
    const [displayTime, setDisplayTime] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        if (isRunning) {
            // If starting/resuming, set start time relative to already elapsed time
            startTimeRef.current = Date.now() - (displayTime * 1000);
            
            const animate = () => {
                const now = Date.now();
                if (startTimeRef.current !== null) {
                    const elapsed = (now - startTimeRef.current) / 1000;
                    setDisplayTime(elapsed);
                }
                requestRef.current = requestAnimationFrame(animate);
            };
            requestRef.current = requestAnimationFrame(animate);
        } else {
            // Paused or Stopped
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            // Report final time only when stopping
            if (startTimeRef.current !== null && displayTime > 0) {
                onFinish(displayTime);
            }
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isRunning]); // Removed displayTime dependency to prevent loop

    const totalTime = displayTime + penalty;

    return (
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border font-mono text-2xl font-bold transition-colors ${penalty > 0 ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-blue-900/20 border-blue-500/50 text-blue-400'}`}>
            <Timer size={24}/>
            {totalTime.toFixed(1)}s
        </div>
    );
});

const MatchModeView: React.FC<MatchModeProps> = ({ flashcards }) => {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'won'>('intro');
    const [penalty, setPenalty] = useState(0);
    
    // --- REFS FOR LOGIC STABILITY ---
    // Using refs allows us to handle rapid clicks without waiting for React render cycles
    const clickLockRef = useRef(false);
    const firstSelectionRef = useRef<string | null>(null); // Store ID of first selected tile
    const timeoutRef = useRef<any>(null); // To clear penalty timeout
    const finalTimeRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Trigger MathJax render when tiles change
    useEffect(() => {
        if (containerRef.current && (window as any).MathJax) {
            requestAnimationFrame(() => {
                (window as any).MathJax.typesetPromise([containerRef.current]).catch(() => {
                    (window as any).MathJax.typesetClear();
                });
            });
        }
    }, [tiles]);

    const startGame = () => {
        if (flashcards.length < 4) {
            alert("Cần ít nhất 4 thẻ để chơi ghép cặp.");
            return;
        }

        // 1. Prepare Data
        const shuffledCards = shuffleArray([...flashcards]).slice(0, 8);
        let newTiles: Tile[] = [];
        shuffledCards.forEach(c => {
            newTiles.push({ 
                id: c.id + '-q', 
                content: c.question, 
                pairId: c.id, 
                type: 'Q', 
                status: 'hidden' 
            });
            // Handle quiz options vs answer text
            const answerText = c.type === 'Quiz' && c.options ? c.options[c.correctIndex || 0] : c.answer;
            newTiles.push({ 
                id: c.id + '-a', 
                content: answerText, 
                pairId: c.id, 
                type: 'A', 
                status: 'hidden' 
            });
        });

        // 2. Shuffle Grid
        newTiles = shuffleArray(newTiles);
        
        // 3. Reset State
        setTiles(newTiles);
        setGameState('playing');
        setPenalty(0);
        finalTimeRef.current = 0;
        
        // 4. Reset Logic Refs
        clickLockRef.current = false;
        firstSelectionRef.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleTileClick = (clickedTile: Tile) => {
        // Critical: Guard clauses
        if (
            gameState !== 'playing' || 
            clickLockRef.current || 
            clickedTile.status === 'matched' || 
            clickedTile.status === 'selected' ||
            clickedTile.status === 'wrong'
        ) return;

        // --- Logic Branch ---
        
        if (!firstSelectionRef.current) {
            // --- 1. First Selection ---
            firstSelectionRef.current = clickedTile.id;
            
            // UI Update: Select first
            setTiles(prev => prev.map(t => t.id === clickedTile.id ? { ...t, status: 'selected' } : t));
        } else {
            // --- 2. Second Selection ---
            const firstId = firstSelectionRef.current;
            const secondId = clickedTile.id;

            // Lock immediately to prevent 3rd click
            clickLockRef.current = true;

            // Optimistic UI Update: Select second
            setTiles(prev => prev.map(t => t.id === secondId ? { ...t, status: 'selected' } : t));

            // Check Match Logic
            // Note: We need access to pairId. We can find it in current state 'tiles', 
            // or pass it. Since 'tiles' state is stable in this closure (haven't updated it yet essentially), 
            // we can search it.
            const firstTileObj = tiles.find(t => t.id === firstId);
            const secondTileObj = clickedTile; // Current obj is valid

            if (firstTileObj && firstTileObj.pairId === secondTileObj.pairId) {
                // --- MATCHED ---
                // Delay slightly for visual satisfaction, then clear
                setTimeout(() => {
                    setTiles(prev => {
                        const next = prev.map(t => (t.id === firstId || t.id === secondId) ? { ...t, status: 'matched' as const } : t);
                        // Win Check inside state update
                        if (next.every(t => t.status === 'matched')) {
                            setGameState('won');
                        }
                        return next;
                    });
                    
                    // Reset Logic
                    firstSelectionRef.current = null;
                    clickLockRef.current = false;
                }, 150);
            } else {
                // --- WRONG ---
                // 1. Show Red (Wrong)
                setTiles(prev => prev.map(t => (t.id === firstId || t.id === secondId) ? { ...t, status: 'wrong' as const } : t));

                // 2. Penalty & Reset after delay
                timeoutRef.current = setTimeout(() => {
                    setTiles(prev => prev.map(t => (t.id === firstId || t.id === secondId) ? { ...t, status: 'hidden' as const } : t));
                    setPenalty(p => p + 2);
                    
                    // Reset Logic
                    firstSelectionRef.current = null;
                    clickLockRef.current = false;
                }, 800);
            }
        }
    };

    // Renders
    if (gameState === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-[#020408]">
                <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 p-12 rounded-[3rem] border border-blue-500/30 text-center backdrop-blur-md shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                    <div className="w-24 h-24 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-12">
                        <Gamepad2 size={48} className="text-white"/>
                    </div>
                    <h1 className="text-5xl font-black text-white mb-4 italic tracking-tight font-display">MATCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">MASTER</span></h1>
                    <p className="text-blue-200 text-lg mb-10 max-w-md mx-auto">Ghép các cặp thẻ thuật ngữ & định nghĩa nhanh nhất có thể. Cẩn thận, sai sẽ bị phạt giờ!</p>
                    <button 
                        onClick={startGame}
                        className="px-10 py-4 bg-white text-blue-900 font-black text-xl rounded-2xl hover:scale-105 transition-transform shadow-xl"
                    >
                        START GAME
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'won') {
        const totalTime = finalTimeRef.current + penalty;
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-[#020408] animate-[scaleIn_0.5s]">
                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">VICTORY!</h2>
                <div className="text-white text-4xl font-mono font-bold mb-8 bg-white/10 px-8 py-4 rounded-2xl border border-white/20">
                    {totalTime.toFixed(1)}s
                </div>
                {penalty > 0 && <div className="text-red-400 font-mono mb-8">Penalty: +{penalty}s</div>}
                <button 
                    onClick={startGame}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 flex items-center gap-2"
                >
                    <RotateCcw size={18}/> Chơi lại
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#020408] p-6 relative overflow-hidden" ref={containerRef}>
            {/* HUD */}
            <div className="flex justify-center items-center mb-6 relative z-10">
                <GameTimer 
                    isRunning={gameState === 'playing'} 
                    onFinish={(t) => finalTimeRef.current = t}
                    penalty={penalty}
                />
                {penalty > 0 && <div className="absolute top-14 text-red-500 text-xs font-bold animate-bounce">+2s PENALTY</div>}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto custom-scroll flex items-center justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-5xl aspect-square md:aspect-auto">
                    {tiles.map((tile) => {
                        let baseStyle = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 cursor-pointer";
                        if (tile.status === 'selected') baseStyle = "bg-blue-600 border-blue-400 text-white scale-[0.98] shadow-[0_0_20px_rgba(37,99,235,0.5)]";
                        if (tile.status === 'matched') baseStyle = "bg-emerald-600/0 border-transparent text-transparent opacity-0 pointer-events-none scale-0"; 
                        if (tile.status === 'wrong') baseStyle = "bg-red-600 border-red-500 text-white animate-[shake_0.5s]";

                        return (
                            <div 
                                key={tile.id}
                                onClick={() => handleTileClick(tile)}
                                className={`
                                    relative p-4 rounded-xl border-2 flex items-center justify-center text-center font-medium text-sm md:text-base transition-all duration-300 min-h-[100px] select-none
                                    ${baseStyle}
                                `}
                            >
                                <span className="line-clamp-4">{tile.content}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MatchModeView;