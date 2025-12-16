
export const drawEField = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, intensity: number) => {
    // Vẽ các đường sức điện trường từ bản dương sang bản âm
    const lines = Math.floor(w / 15);
    ctx.strokeStyle = `rgba(255, 255, 50, ${Math.min(1, intensity * 0.5)})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    
    for (let i = 0; i <= lines; i++) {
        const lx = x + (i * (w / lines));
        ctx.beginPath();
        ctx.moveTo(lx, y);
        ctx.lineTo(lx, y + h);
        ctx.stroke();
        
        // Mũi tên chỉ hướng (luôn từ + sang - hoặc ngược lại tùy điện áp, ở đây giả sử static visual)
        ctx.beginPath();
        ctx.moveTo(lx - 3, y + h/2 - 3);
        ctx.lineTo(lx, y + h/2 + 2);
        ctx.lineTo(lx + 3, y + h/2 - 3);
        ctx.stroke();
    }
};

export const drawCharges = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, q: number) => {
    // q là mật độ tương đối. 
    // Nếu q > 0: Bản này tích điện Dương (+)
    // Nếu q < 0: Bản này tích điện Âm (-)
    
    const density = Math.min(50, Math.abs(q) * 1e9); 
    if (density < 1) return;

    const isPositive = q > 0;
    
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < density; i++) {
        // Phân bố ngẫu nhiên nhưng có trật tự một chút
        const cx = x + (i / density) * w + (Math.random() - 0.5) * 5;
        const cy = y + h/2;
        
        if (isPositive) {
            ctx.fillStyle = "#ef4444"; // Đỏ (+)
            ctx.fillText("+", cx, cy);
        } else {
            ctx.fillStyle = "#3b82f6"; // Xanh (-)
            ctx.fillText("-", cx, cy);
        }
    }
};

// --- NEW VISUAL COMPONENTS ---

export const drawWire = (ctx: CanvasRenderingContext2D, points: {x: number, y: number}[], color: string = '#64748b') => {
    if (points.length < 2) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Outer glow/stroke
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#1e293b'; // Dark border
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i=1; i<points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();

    // Inner wire
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i=1; i<points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
};

export const drawBattery = (ctx: CanvasRenderingContext2D, x: number, y: number, voltage: number, vertical: boolean = true) => {
    ctx.save();
    ctx.translate(x, y);
    if (!vertical) ctx.rotate(-Math.PI/2);

    // Battery Body Gradient
    const grd = ctx.createLinearGradient(-15, 0, 15, 0);
    grd.addColorStop(0, "#334155");
    grd.addColorStop(0.5, "#475569");
    grd.addColorStop(1, "#334155");
    
    ctx.fillStyle = grd;
    ctx.fillRect(-15, -25, 30, 50);
    
    // Terminals
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-8, -30, 16, 5); // Top (+)
    
    // Label
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage}V`, 0, 5);
    
    // Signs
    ctx.fillStyle = '#ef4444'; ctx.fillText('+', 0, -12);
    ctx.fillStyle = '#3b82f6'; ctx.fillText('-', 0, 20);

    ctx.restore();
};

export const drawSwitch = (ctx: CanvasRenderingContext2D, x: number, y: number, state: 'Left' | 'Right' | 'Open', leftLabel: string = '', rightLabel: string = '') => {
    // Pivot point at x,y
    ctx.fillStyle = '#fff'; 
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill(); // Pivot
    
    // Connection points
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath(); ctx.arc(x - 40, y, 4, 0, Math.PI*2); ctx.fill(); // Left Node
    ctx.beginPath(); ctx.arc(x + 40, y, 4, 0, Math.PI*2); ctx.fill(); // Right Node

    // Labels
    ctx.font = '10px sans-serif'; ctx.fillStyle = '#64748b';
    if(leftLabel) ctx.fillText(leftLabel, x - 40, y - 10);
    if(rightLabel) ctx.fillText(rightLabel, x + 40, y - 10);

    // The Blade
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (state === 'Left') {
        ctx.lineTo(x - 40, y);
    } else if (state === 'Right') {
        ctx.lineTo(x + 40, y);
    } else {
        ctx.lineTo(x, y - 35); // Vertical Open
    }
    ctx.stroke();
};

export const drawRealBulb = (ctx: CanvasRenderingContext2D, x: number, y: number, brightness: number) => {
    ctx.save();
    const r = 25;
    
    // Glass Bulb
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    
    // Glow Effect
    if (brightness > 0.05) {
        ctx.shadowBlur = brightness * 60;
        ctx.shadowColor = `rgba(255, 230, 100, ${brightness})`;
        ctx.fillStyle = `rgba(255, 255, 200, ${0.1 + brightness * 0.8})`;
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.shadowBlur = 0;
    }
    ctx.fill();
    
    // Glass Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Filament
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 20); // Base left
    ctx.lineTo(x - 5, y - 5);   // Support left
    
    // Coiled part
    ctx.bezierCurveTo(x - 5, y - 15, x + 5, y - 15, x + 5, y - 5);
    
    ctx.lineTo(x + 10, y + 20); // Base right
    
    ctx.strokeStyle = brightness > 0.1 ? '#fff' : '#555';
    ctx.lineWidth = brightness > 0.1 ? 2 : 1;
    ctx.stroke();
    
    // Socket base
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(x - 12, y + 18, 24, 15);
    ctx.strokeStyle = '#4b5563';
    ctx.strokeRect(x - 12, y + 18, 24, 15);
    
    ctx.restore();
};
