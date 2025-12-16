
import { Note, Flashcard } from '../../types';

export const SEED_NOTES: Note[] = [
    {
        id: 'mech_01',
        title: 'Cơ Học: Các Định Luật Newton',
        content: '1. Định luật I (Quán tính): Vật sẽ đứng yên hoặc chuyển động thẳng đều nếu không có lực tác dụng.\n2. Định luật II: Gia tốc tỷ lệ thuận với lực, tỷ lệ nghịch với khối lượng ($ \\vec{F} = m\\vec{a} $).\n3. Định luật III: Lực và phản lực luôn cùng độ lớn, ngược chiều, cùng phương ($ \\vec{F}_{AB} = -\\vec{F}_{BA} $).',
        tags: ['Cơ học', 'Newton', 'Cốt lõi'],
        linkedTo: [],
        lastReviewed: Date.now(),
        createdDate: Date.now(),
        type: 'Concept',
        color: '#a855f7'
    },
    {
        id: 'thermo_01',
        title: 'Nhiệt Học: Phương Trình Khí Lý Tưởng',
        content: 'Phương trình Clapeyron-Mendeleev:\n$$ pV = nRT $$\nTrong đó:\n$p$: Áp suất (Pa)\n$V$: Thể tích ($m^3$)\n$n$: Số mol khí\n$R$: Hằng số khí lý tưởng ($8.31 \\frac{J}{mol.K}$)\n$T$: Nhiệt độ tuyệt đối (Kelvin).',
        tags: ['Nhiệt học', 'Khí lý tưởng'],
        linkedTo: [],
        lastReviewed: Date.now(),
        createdDate: Date.now(),
        type: 'Formula',
        color: '#f59e0b'
    },
    {
        id: 'elec_01',
        title: 'Điện Từ: Định Luật Coulomb',
        content: 'Lực tương tác giữa hai điện tích điểm đứng yên:\n$$ F = k \\frac{|q_1 q_2|}{\\varepsilon r^2} $$\nTrong đó $k = 9 \\cdot 10^9 \\frac{N \\cdot m^2}{C^2}$.',
        tags: ['Điện từ', 'Tĩnh điện'],
        linkedTo: [],
        lastReviewed: Date.now(),
        createdDate: Date.now(),
        type: 'Formula',
        color: '#22d3ee'
    },
    {
        id: 'optics_01',
        title: 'Quang Học: Khúc Xạ Ánh Sáng',
        content: 'Định luật Snell (Định luật khúc xạ):\n$$ n_1 \\sin(i) = n_2 \\sin(r) $$\n- $n_1, n_2$: Chiết suất môi trường tới và khúc xạ.\n- $i$: Góc tới, $r$: Góc khúc xạ.\nCông thức góc giới hạn phản xạ toàn phần: $\\sin(i_{gh}) = \\frac{n_2}{n_1}$ (với $n_2 < n_1$).',
        tags: ['Quang học', 'Sóng ánh sáng'],
        linkedTo: [],
        lastReviewed: Date.now(),
        createdDate: Date.now(),
        type: 'Concept',
        color: '#ec4899'
    },
    {
        id: 'nuclear_01',
        title: 'Hạt Nhân: Hệ Thức Einstein',
        content: 'Năng lượng nghỉ của một vật tỷ lệ với khối lượng của nó theo công thức:\n$$ E = mc^2 $$\nĐây là cơ sở của năng lượng hạt nhân. Một lượng nhỏ khối lượng mất đi trong phản ứng hạt nhân sinh ra năng lượng khổng lồ.',
        tags: ['Hạt nhân', 'Hiện đại'],
        linkedTo: [],
        lastReviewed: Date.now(),
        createdDate: Date.now(),
        type: 'Event',
        color: '#ef4444'
    }
];

export const SEED_FLASHCARDS: Flashcard[] = [
    // --- Cơ học (Newton) ---
    { id: 'f_m1', noteId: 'mech_01', type: 'Quiz', question: 'Theo định luật II Newton, biểu thức nào sau đây là chính xác nhất?', options: ['$\\vec{F} = m\\vec{a}$', '$F = ma$', '$\\vec{a} = \\frac{\\vec{F}}{m}$', 'Cả A và C'], correctIndex: 3, answer: 'Định luật II Newton viết dưới dạng vector là $\\vec{F} = m\\vec{a}$ hoặc $\\vec{a} = \\frac{\\vec{F}}{m}$.', nextReview: Date.now(), interval: 1, easeFactor: 2.5, streak: 0 },
    { id: 'f_m2', noteId: 'mech_01', type: 'TrueFalse', question: 'Cặp lực và phản lực trong định luật III Newton cân bằng nhau.', correctValue: false, answer: 'Sai. Chúng tác dụng lên **hai vật khác nhau** nên không thể cộng lại để cân bằng.', nextReview: Date.now(), interval: 1, easeFactor: 2.5, streak: 0 },
    
    // --- Nhiệt học ---
    { id: 'f_t1', noteId: 'thermo_01', type: 'Quiz', question: 'Trong phương trình $pV=nRT$, đơn vị của $T$ là gì?', options: ['Celsius ($^oC$)', 'Fahrenheit ($^oF$)', 'Kelvin ($K$)', 'Rankine'], correctIndex: 2, answer: 'Nhiệt động lực học sử dụng nhiệt giai tuyệt đối Kelvin ($K = ^oC + 273$).', nextReview: Date.now(), interval: 1, easeFactor: 2.5, streak: 0 },
    { id: 'f_t2', noteId: 'thermo_01', type: 'Basic', question: 'Giá trị của hằng số khí lý tưởng $R$ là bao nhiêu?', answer: '$R \\approx 8.31 \\frac{J}{mol \\cdot K}$.', nextReview: Date.now(), interval: 1, easeFactor: 2.5, streak: 0 },

    // --- Điện từ ---
    { id: 'f_e1', noteId: 'elec_01', type: 'Quiz', question: 'Nếu khoảng cách $r$ tăng gấp đôi, lực Coulomb $F$ sẽ:', options: ['Tăng 2 lần', 'Giảm 2 lần', 'Tăng 4 lần', 'Giảm 4 lần'], correctIndex: 3, answer: '$F \\sim \\frac{1}{r^2}$. Nếu $r$ tăng 2 thì $r^2$ tăng 4, suy ra $F$ giảm 4 lần.', nextReview: Date.now(), interval: 1, easeFactor: 2.5, streak: 0 },
    { id: 'f_e3', noteId: 'elec_01', type: 'Basic', question: 'Biểu thức tính hằng số $k$ trong chân không?', answer: '$k = 9 \\cdot 10^9 \\frac{N \\cdot m^2}{C^2}$.', nextReview: Date.now(), interval: 1, easeFactor: 2.5, streak: 0 },

    // --- Quang học ---
    { id: 'f_o1', noteId: 'optics_01', type: 'Quiz', question: 'Điều kiện xảy ra phản xạ toàn phần là gì?', options: ['$n_1 < n_2$', '$n_1 > n_2$ và $i \\ge i_{gh}$', '$i = 0$', '$n_1 = n_2$'], correctIndex: 1, answer: 'Ánh sáng phải đi từ môi trường chiết quang hơn sang kém hơn ($n_1 > n_2$) và góc tới lớn hơn góc giới hạn.', nextReview: Date.now(), interval: 1, easeFactor: 2.5, streak: 0 },
    { id: 'f_o2', noteId: 'optics_01', type: 'Basic', question: 'Công thức định luật Snell?', answer: '$n_1 \\sin(i) = n_2 \\sin(r)$.', nextReview: Date.now(), interval: 1, easeFactor: 2.5, streak: 0 },

    // --- Hạt nhân ---
    { id: 'f_n1', noteId: 'nuclear_01', type: 'Basic', question: 'Trong $E=mc^2$, $c$ là đại lượng gì?', answer: '$c$ là tốc độ ánh sáng trong chân không ($c \\approx 3 \\cdot 10^8 m/s$).', nextReview: Date.now(), interval: 1, easeFactor: 2.5, streak: 0 }
];
