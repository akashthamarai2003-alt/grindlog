"use client";
import React, { useEffect, useRef } from 'react';
import { Activity, User, Timer, Calendar, Dumbbell, Ruler, Weight, Utensils, Flame } from 'lucide-react';

const NODES_DATA = [
  { id: 0, label: "Intermediate", icon: Activity, angle: 0, distBase: 130 },
  { id: 1, label: "Fat Loss", icon: Flame, angle: 36, distBase: 160 },
  { id: 2, label: "45 min", icon: Timer, angle: 72, distBase: 140 },
  { id: 3, label: "4 per week", icon: Calendar, angle: 108, distBase: 160 },
  { id: 4, label: "Gym", icon: Dumbbell, angle: 144, distBase: 130 },
  { id: 5, label: "Very Active", icon: Activity, angle: 180, distBase: 160 },
  { id: 6, label: "Male", icon: User, angle: 216, distBase: 140 },
  { id: 7, label: "75 kg", icon: Weight, angle: 252, distBase: 150 },
  { id: 8, label: "175 cm", icon: Ruler, angle: 288, distBase: 130 },
  { id: 9, label: "High Protein", icon: Utensils, angle: 324, distBase: 160 }
];

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function getTimelineIntensity(p: number): number {
    if (p < 0.15) return 0.05 + 0.05 * (p / 0.15);
    if (p < 0.5) return 0.1 + 0.7 * easeInOutCubic((p - 0.15) / 0.35);
    if (p < 0.8) return 0.8 + 0.2 * Math.sin(((p - 0.5) / 0.3) * Math.PI); 
    return 0.8 - 0.75 * easeInOutCubic((p - 0.8) / 0.2); 
}

export default function CinematicDataNodes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Cap DPR at 2 for performance on ultra-high res mobile screens
    let dpr = Math.min(window.devicePixelRatio || 1, 2); 
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    let cx = width / 2;
    let cy = height / 2;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      cx = width / 2;
      cy = height / 2;
    };
    window.addEventListener('resize', resize);

    // Particle definition
    class Particle {
        t: number;
        speed: number;
        offset: number;
        nodeIndex: number;
        
        constructor(nodeIndex: number) {
            this.nodeIndex = nodeIndex;
            this.t = Math.random();
            this.speed = 0.002 + Math.random() * 0.008;
            this.offset = Math.random() * 100;
        }
        
        draw(ctx: CanvasRenderingContext2D, time: number, startX: number, startY: number, endX: number, endY: number, intensity: number) {
            this.t += this.speed;
            if (this.t > 1) this.t = 0;
            
            const dx = endX - startX;
            const dy = endY - startY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist === 0) return;

            let px = startX + dx * this.t;
            let py = startY + dy * this.t;
            
            const env = Math.sin(this.t * Math.PI); 
            // We use identical math as the ropes so particles follow the twisting strands perfectly
            const wave1 = Math.sin(this.t * 10 - time * 3 + this.offset) * 15 * env;
            const wave2 = Math.cos(this.t * 15 + time * 4 - this.offset) * 8 * env;
            
            const perpX = -dy / dist;
            const perpY = dx / dist;
            
            px += perpX * (wave1 + wave2);
            py += perpY * (wave1 + wave2);
            
            ctx.fillStyle = `rgba(134, 239, 172, ${1 * intensity})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Initialize 8 particles per node rope
    const particles: Particle[] = [];
    NODES_DATA.forEach((_, i) => {
        for(let p=0; p<8; p++) particles.push(new Particle(i));
    });

    // Helper to draw a single organic glowing strand
    const drawStrand = (startX: number, startY: number, endX: number, endY: number, time: number, offsetPhase: number, intensity: number) => {
        const segments = 25; // Good balance of smoothness and performance
        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist === 0) return;
        
        const points = [];
        for(let i = 0; i <= segments; i++) {
            const t = i / segments; 
            let px = startX + dx * t;
            let py = startY + dy * t;
            
            const env = Math.sin(t * Math.PI); 
            const wave1 = Math.sin(t * 10 - time * 3 + offsetPhase) * 15 * env;
            const wave2 = Math.cos(t * 15 + time * 4 - offsetPhase) * 8 * env;
            
            const perpX = -dy / dist;
            const perpY = dx / dist;
            
            px += perpX * (wave1 + wave2);
            py += perpY * (wave1 + wave2);
            
            points.push({x: px, y: py});
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 1. Outer Bloom
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(let i=1; i<=segments; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.lineWidth = 8;
        ctx.strokeStyle = `rgba(22, 163, 74, ${0.15 * intensity})`;
        ctx.stroke();

        // 2. Core Energy
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(let i=1; i<=segments; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `rgba(57, 255, 20, ${0.6 * intensity})`;
        ctx.stroke();
        
        // 3. Hot white-green thread
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(let i=1; i<=segments; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(215, 255, 215, ${0.9 * intensity})`;
        ctx.stroke();
    };

    let startTime = performance.now();
    let req: number;

    const loop = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const timeSec = elapsed * 0.001; // Seconds for trigonometry
        
        // 9.5s loop duration
        const loopProgress = (elapsed % 9500) / 9500;
        const globalIntensity = getTimelineIntensity(loopProgress);

        // 1. Background
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#030A06';
        ctx.fillRect(0, 0, width, height);

        // 2. Center Core Glow
        ctx.globalCompositeOperation = 'lighter';
        const coreRadius = 50 + 20 * Math.sin(timeSec * 4); // Pulsing
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2);
        coreGrad.addColorStop(0, `rgba(215, 255, 215, ${0.9 * globalIntensity})`); 
        coreGrad.addColorStop(0.3, `rgba(57, 255, 20, ${0.6 * globalIntensity})`); 
        coreGrad.addColorStop(1, 'rgba(22, 163, 74, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Solid inner core to frame the progress text
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(57, 255, 20, ${0.8 * globalIntensity})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.fill();

        // 3. Process each node
        const scale = Math.min(width / 400, 1.2);

        NODES_DATA.forEach((node, i) => {
            const baseAngle = (node.angle * Math.PI) / 180;
            const currentAngle = baseAngle + timeSec * 0.1; // Orbit slowly
            const bob = Math.sin(timeSec * 2 + i) * 12; // Bobbing up and down
            
            const dist = node.distBase * scale + Math.sin(timeSec + i)*10;
            const nx = cx + Math.cos(currentAngle) * dist;
            const ny = cy + Math.sin(currentAngle) * dist + bob;
            
            // Draw 3 interwoven strands for the "rope"
            drawStrand(cx, cy, nx, ny, timeSec, i * 1.5, globalIntensity);
            drawStrand(cx, cy, nx, ny, timeSec, i * 1.5 + 2, globalIntensity * 0.8);
            drawStrand(cx, cy, nx, ny, timeSec, i * 1.5 + 4, globalIntensity * 0.6);

            // Update DOM overlay position
            const el = nodesRef.current[i];
            if (el) {
                // translate3d forces GPU acceleration
                el.style.transform = `translate3d(${nx}px, ${ny}px, 0) translate(-50%, -50%)`;
                // Snap opacity to avoid sub-pixel rendering blur on some devices
                el.style.opacity = globalIntensity < 0.05 ? "0" : (globalIntensity * 0.9 + 0.1).toString();
            }
        });

        // 4. Draw flowing particles
        particles.forEach(p => {
            const node = NODES_DATA[p.nodeIndex];
            const baseAngle = (node.angle * Math.PI) / 180;
            const currentAngle = baseAngle + timeSec * 0.1;
            const bob = Math.sin(timeSec * 2 + p.nodeIndex) * 12;
            const dist = node.distBase * scale + Math.sin(timeSec + p.nodeIndex)*10;
            
            const nx = cx + Math.cos(currentAngle) * dist;
            const ny = cy + Math.sin(currentAngle) * dist + bob;
            
            p.draw(ctx, timeSec, cx, cy, nx, ny, globalIntensity);
        });

        req = requestAnimationFrame(loop);
    };
    req = requestAnimationFrame(loop);

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(req);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0A1108]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      
      {/* HTML Nodes overlay for crisp text rendering on mobile */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {NODES_DATA.map((node, i) => {
          const Icon = node.icon;
          return (
            <div 
              key={node.id}
              ref={el => nodesRef.current[i] = el}
              className="absolute left-0 top-0 flex items-center gap-2 bg-[#020604] border border-[#16A34A]/40 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(22,163,74,0.2)] opacity-0 transition-opacity duration-700"
              style={{ willChange: 'transform, opacity' }}
            >
              <Icon size={14} className="text-[#39FF14]" />
              <span className="text-xs font-bold text-white tracking-wide shadow-black drop-shadow-md">{node.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
