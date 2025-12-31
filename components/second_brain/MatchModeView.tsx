
import React, { useState, useEffect, useRef, memo } from 'react';
import { Flashcard } from '../../types';
import { Gamepad2, Timer, AlertCircle } from 'lucide-react';
import { shuffleArray } from '../../utils/helpers'; // Assuming helper file created

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
// This prevents the entire grid from re-rendering every 100ms
const GameTimer = memo(({ isPlaying, onTick, penalty }: { isPlaying: boolean, onTick: (t: number) => void, penalty: number }) => {
    const [time, setTime] = useState(0);
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        if (isPlaying) {
            startTimeRef.current = performance.now() - (time * 1000);
            const animate = (now: number) => {
                const elapsed = (now - startTimeRef.current) / 1000;
                setTime(elapsed);
                onTick(elapsed); // Sync back to parent only for final score
                requestRef.current = requestAnimationFrame(animate);
            };
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if(requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if(requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying]);

    // Apply penalty visually
    const displayTime = time + penalty;

    return (
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border font-mono text-2xl font-bold transition-colors ${penalty > 0 ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-blue-900/20 border-blue-500/50 text-blue-400'}`}>
            <Timer size={24}/>
            {displayTime.toFixed(1)}s
        </div>
    );
});

const MatchModeView: React.FC<MatchModeProps> = ({ flashcards }) => {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'won'>('intro');
    const [penalty, setPenalty] = useState(0);
    
    // UseRef for final time capture to avoid state re-renders
    const finalTimeRef = useRef(0);
    
    // Logic Refs
    const selectedRef = useRef<Tile[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRefs = useRef<any[]>([]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            timeoutRefs.current.forEach(clearTimeout);
        };
    }, []);

    // MathJax
    useEffect(() => {
        if (containerRef.current && (window as any).MathJax) {
            requestAnimationFrame(() => {
                (window as any).MathJax.typesetPromise([containerRef.current]).catch(() => {});
            });
        }
    }, [tiles]);

    const startGame = () => {
        if (flashcards.length < 4) {
            alert("Cần ít nhất 4 thẻ để chơi ghép cặp.");
            return;
        }

        const shuffledCards = shuffleArray([...flashcards]).slice(0, 8);
        
        let newTiles: Tile[] = [];
        shuffledCards.forEach(c => {
            newTiles.push({ id: c.id + '-q', content: c.question, pairId: c.id, type: 'Q', status: 'hidden' });
            newTiles.push({ id: c.id + '-a', content: c.type === 'Quiz' && c.options ? c.options[c.correctIndex||0] : c.answer, pairId: c.id, type: 'A', status: 'hidden' });
        });

        // Robust Shuffle
        newTiles = shuffleArray(newTiles);
        
        setTiles(newTiles);
        setGameState('playing');
        setPenalty(0);
        selectedRef.current = [];
        finalTimeRef.current = 0;
    };

    const handleTileClick = (tile: Tile) => {
        // Prevent interaction if tile is already acted upon or we have 2 selected (busy state)
        if (gameState !== 'playing' || tile.status !== 'hidden' || selectedRef.current.length >= 2) return;

        // 1. Select First
        if (selectedRef.current.length === 0) {
            updateTileStatus(tile.id, 'selected');
            selectedRef.current = [tile];
            return;
        }

        // 2. Select Second
        if (selectedRef.current.length === 1) {
            // Check matching ID (prevent clicking same tile twice)
            if (tile.id === selectedRef.current[0].id) return;

            updateTileStatus(tile.id, 'selected');
            selectedRef.current.push(tile);
            
            checkMatch(selectedRef.current[0], tile);
        }
    };

    const checkMatch = (t1: Tile, t2: Tile) => {
        if (t1.pairId === t2.pairId) {
            // MATCH!
            const tId = setTimeout(() => {
                // Batch updates for performance
                setTiles(prev => {
                    const next = prev.map(t => (t.id === t1.id || t.id === t2.id) ? { ...t, status: 'matched' as const } : t);
                    
                    // Check Win Condition inside the state update to ensure sync
                    if (next.every(t => t.status === 'matched')) {
                        setGameState('won');
                    }
                    return next;
                });
                selectedRef.current = [];
            }, 200);
            timeoutRefs.current.push(tId);
        } else {
            // WRONG!
            const t1Id = setTimeout(() => {
                updateTileStatus(t1.id, 'wrong');
                updateTileStatus(t2.id, 'wrong');
            }, 300);
            
            const t2Id = setTimeout(() => {
                setTiles(prev => prev.map(t => (t.id === t1.id || t.id === t2.id) ? { ...t, status: 'hidden' as const } : t));
                selectedRef.current = [];
                setPenalty(p => p + 2); // Add 2s penalty
            }, 1000);

            timeoutRefs.current.push(t1Id, t2Id);
        }
    };

    const updateTileStatus = (id: string, status: Tile['status']) => {
        setTiles(prev => prev.map(t => t.id === id ? { ...t, status } : t));
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
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500"
                >
                    Chơi lại
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#020408] p-6 relative overflow-hidden" ref={containerRef}>
            {/* HUD */}
            <div className="flex justify-center items-center mb-6 relative z-10">
                <GameTimer 
                    isPlaying={gameState === 'playing'} 
                    onTick={(t) => finalTimeRef.current = t}
                    penalty={penalty}
                />
                {penalty > 0 && <div className="absolute top-12 text-red-500 text-xs font-bold animate-bounce">+2s PENALTY</div>}
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
