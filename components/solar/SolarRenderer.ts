
import { PlanetConfig } from './SolarData';

export const drawSunGlow = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    const grd = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 3);
    grd.addColorStop(0, "rgba(255, 200, 50, 1)");
    grd.addColorStop(0.2, "rgba(253, 184, 19, 0.4)");
    grd.addColorStop(0.5, "rgba(253, 100, 0, 0.1)");
    grd.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();
};

export const drawOrbitTrail = (ctx: CanvasRenderingContext2D, path: {x:number, y:number}[], color: string) => {
    if (path.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.moveTo(path[0].x, path[0].y);
    for(let i=1; i<path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();
};
