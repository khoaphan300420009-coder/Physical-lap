
export interface TimelineEvent {
    id: number;
    year: string;
    numericYear: number;
    title: string;
    physicist: string;
    shortDesc: string;
    fullDesc: string;
    highlights: string[]; 
    img: string;
    link?: string;
    category?: 'Cơ học' | 'Thiên văn' | 'Điện từ' | 'Quang học' | 'Lượng tử' | 'Hạt nhân' | 'Tương đối' | 'Nhiệt học' | 'Khác';
}

export interface Scientist {
    id: string;
    name: string;
    life: string;
    field: string;
    desc: string;
    image: string;
}

export interface Formula {
    id: string;
    grade: 10 | 11 | 12; 
    cat: string;
    name: string;
    eq: string;
    intro: string;
    detail: string;
    image?: string;
}

export interface ProjectileParams {
    v0: number;
    angle: number;
    h0: number;
    g: number;
    m: number;
    drag: number;
    spin: number; 
    elasticity: number; 
    zoom: number;
    simSpeed: number;
}

export interface AnalysisData {
    flightTime: number;
    maxHeight: number;
    range: number;
    impactVelocity: number;
    impactAngle: number;
}

export interface WaveSource {
    id: string;
    name: string;
    type: 'Sine' | 'Square' | 'Triangle';
    x: number; 
    y: number; 
    vx?: number; 
    freq: number;
    amp: number;
    phase: number;
    color: string; // Added color
}

export interface Body {
    id: string;
    name: string;
    color: string;
    mass: number;
    radius: number; 
    x: number;
    y: number;
    vx: number;
    vy: number;
    trail: {x: number, y: number}[];
}

export interface SolarState {
    bodies: Body[];
    scale: number;
    timeScale: number;
    viewMode: 'heliocentric' | 'geocentric' | 'comparator' | 'surface';
    showGravityWell: boolean;
    showLagrange: boolean;
    showRealScale: boolean;
    showVoyager: boolean;
    soundEnabled: boolean;
    isPaused: boolean;
    showOrbits: boolean; 
    showLabels: boolean; 
}

export interface DielectricMaterial {
    name: string;
    k: number; 
    strength: number; 
    color: string;
}

export interface CapacitorState {
    circuitMode: 'RC' | 'Bulb' | 'Mic' | 'Touch';
    sourceType: 'DC' | 'AC';
    switchState: 'Charge' | 'Discharge' | 'Open'; 
    voltage: number; 
    capacitance: number;
    charge: number;
    energy: number;
    time: number;
    resistance: number;
    sourceVoltage: number; 
    bulbBrightness: number;
    
    // Geometry
    plateArea: number; 
    plateDist: number; 
    materialIndex: number; 
    
    // Interaction
    isDraggingPlates: boolean;
    
    // Advanced Physics
    leakageResistance: number; 
    esr: number; 
    temperature: number; 
    acFrequency: number; 
    
    // Pro Features
    isFuseBlown: boolean;
    fuseRating: number; 
    wireTemperature: number; 
    inductance: number; 
    showLissajous: boolean; 
    audioSensitivity: number; 
    
    // Visuals
    showEField: boolean; 
    showElectrons: boolean;
    showDipoles: boolean;
    showChargeZoom: boolean;
    showValues: boolean;
    showSafetyBar: boolean; 
    
    // Advanced Interactions
    soundLevel: number; 
    isTouched: boolean; 
    
    // Physics Flags
    isBreakdown: boolean; 
    simSpeed: number; 
    
    graphData: {t: number, v: number, i: number}[]; 
}

export interface OpticsState {
    mode: 'bench' | 'eye'; 
    componentType: 'lens' | 'mirror';
    type: 'convex' | 'concave';
    focalLength: number;
    objectDistance: number;
    objectHeight: number;
    diameter: number;
    autoSize: boolean; 
    showRays: boolean;
    showFocalPoints: boolean;
    showImage: boolean;
    zoom: number; 
    eyeAccommodation: number; 
    eyeDefect: 'none' | 'myopia' | 'hyperopia';
}

export interface DoublePendulumState {
    m1: number;
    m2: number;
    l1: number;
    l2: number;
    g: number;
    damping: number; 
    simSpeed: number;
    theta1_0: number;
    theta2_0: number;
    showShadow: boolean; 
    showHeatmap: boolean; 
    showPhaseSpace: boolean; 
    stroboscopic: boolean; 
    showVectors: boolean;
    isPlaying: boolean;
}

export interface PhysicsState {
    time: number;
    obj: { x: number; y: number; vx: number; vy: number };
    trace: { x: number; y: number }[];
    history: { x: number; y: number }[][];
    prediction: { x: number; y: number }[];
    view: { offsetX: number; offsetY: number; isDragging: boolean; lastMouseX: number; lastMouseY: number };
    stats: { t: number; h: number; l: number };
    analysis: AnalysisData;
    wave: {
        sources: WaveSource[];
        buffer: Uint32Array | null;
        imgData: ImageData | null;
        width: number;
        height: number;
        mode: 'interference' | 'standing'; 
    };
    solar: SolarState;
    capacitor: CapacitorState;
    optics: OpticsState;
    doublePendulum: DoublePendulumState;
}

export interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
    image?: string;
    isError?: boolean;
}

// --- SECOND BRAIN TYPES ---

export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    linkedTo: string[];
    lastReviewed: number;
    createdDate: number;
    type: 'Concept' | 'Person' | 'Event' | 'Formula';
    color: string;
}

export interface Flashcard {
    id: string;
    noteId: string;
    type: 'Basic' | 'Quiz' | 'TrueFalse'; 
    question: string;
    answer: string; // Used for Basic/Explanation
    options?: string[]; // For Quiz
    correctIndex?: number; // For Quiz
    correctValue?: boolean; // For TrueFalse
    
    // Spaced Repetition Fields
    nextReview: number;
    interval: number; // days
    easeFactor: number;
    streak: number;
    
    // Advanced Study Status (New)
    status?: 'new' | 'learning' | 'reviewing' | 'mastered';
    successRate?: number;
    lastReviewed?: number;
}

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    timestamp: number;
}
