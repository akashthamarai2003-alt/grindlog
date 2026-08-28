"use client";
import React, { useEffect, useRef } from 'react';

export const animationConfig = {
    speed: 1.0,
    particleCount: typeof window !== 'undefined' && window.innerWidth < 768 ? 400 : 1000,
    trailCount: 16,
    glowIntensity: 1.0,
    turbulence: 0.6,
    loop: true,
    backgroundOverlayOpacity: 0.1
};

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function getTimelineIntensity(p: number): number {
    if (p < 0.15) return 0.05 + 0.05 * (p / 0.15);
    if (p < 0.5) return 0.1 + 0.7 * easeInOutCubic((p - 0.15) / 0.35);
    if (p < 0.8) return 0.8 + 0.2 * Math.sin(((p - 0.5) / 0.3) * Math.PI); 
    return 0.8 - 0.75 * easeInOutCubic((p - 0.8) / 0.2); 
}

export default function CinematicFitnessEnergy({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Use standard compositing for background, and lighter for the energy to avoid expensive shadowBlur
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let width = canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
        let height = canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
        let cx = width / 2;
        let cy = height / 2;

        const resize = () => {
            width = canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
            height = canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
            cx = width / 2;
            cy = height / 2;
        };
        window.addEventListener('resize', resize);

        // Interaction state
        let mouseX = cx;
        let mouseY = cy;
        let pointerActive = false;

        const onPointerMove = (e: MouseEvent | TouchEvent) => {
            pointerActive = true;
            if ('touches' in e) {
                mouseX = e.touches[0].clientX * (window.devicePixelRatio || 1);
                mouseY = e.touches[0].clientY * (window.devicePixelRatio || 1);
            } else {
                mouseX = (e as MouseEvent).clientX * (window.devicePixelRatio || 1);
                mouseY = (e as MouseEvent).clientY * (window.devicePixelRatio || 1);
            }
        };
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);

        // Data structures
        class Trail {
            index: number;
            angle: number;
            speed: number;
            baseRadius: number;
            history: {x: number, y: number}[];
            length: number;
            thickness: number;
            hue: number;
            zOffset: number;

            constructor(index: number) {
                this.index = index;
                this.angle = Math.random() * Math.PI * 2;
                this.speed = (Math.random() * 0.015 + 0.005) * (index % 2 === 0 ? 1 : -1);
                this.baseRadius = Math.random() * 150 + 50;
                this.history = [];
                this.length = Math.floor(Math.random() * 40 + 30);
                this.thickness = Math.random() * 3 + 1.5;
                this.hue = 130 + Math.random() * 25; // Emerald to Lime
                this.zOffset = Math.random() * Math.PI * 2;
            }

            update(time: number, globalIntensity: number, targetCX: number, targetCY: number) {
                this.angle += this.speed * animationConfig.speed;
                
                // Procedural turbulence (flowing plasma)
                const turb = Math.sin(time * 0.002 + this.index) * 80 * animationConfig.turbulence * globalIntensity;
                const r = (this.baseRadius + turb) * (0.5 + globalIntensity * 1.5);
                
                // 3D projection illusion
                const zDepth = Math.sin(time * 0.001 + this.zOffset); 
                const scale = 1 + zDepth * 0.3; // Items closer (z > 0) are larger
                
                // Interactive shift
                const shiftX = pointerActive ? (mouseX - cx) * 0.05 * zDepth : 0;
                const shiftY = pointerActive ? (mouseY - cy) * 0.05 * zDepth : 0;

                const x = targetCX + Math.cos(this.angle) * r * scale + shiftX;
                const y = targetCY + Math.sin(this.angle) * (r * 0.4) * scale + Math.cos(time * 0.0015 + this.index)*50 * globalIntensity + shiftY;
                
                this.history.unshift({x, y});
                if (this.history.length > this.length) this.history.pop();
            }

            draw(ctx: CanvasRenderingContext2D, globalIntensity: number) {
                if (this.history.length < 2) return;

                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                // We draw the trail 3 times for a performant bloom effect
                const opacityMult = globalIntensity * animationConfig.glowIntensity;
                
                ctx.beginPath();
                ctx.moveTo(this.history[0].x, this.history[0].y);
                for (let i = 1; i < this.history.length; i++) {
                    ctx.lineTo(this.history[i].x, this.history[i].y);
                }

                // 1. Outer faint glow
                ctx.lineWidth = this.thickness * 5;
                ctx.strokeStyle = `hsla(${this.hue}, 100%, 30%, ${0.1 * opacityMult})`;
                ctx.stroke();

                // 2. Core ribbon
                ctx.lineWidth = this.thickness * 1.5;
                ctx.strokeStyle = `hsla(${this.hue}, 100%, 55%, ${0.6 * opacityMult})`;
                ctx.stroke();

                // 3. Hot center
                ctx.lineWidth = this.thickness * 0.4;
                ctx.strokeStyle = `hsla(120, 100%, 95%, ${0.9 * opacityMult})`;
                ctx.stroke();
            }
        }

        class Particle {
            x: number = 0;
            y: number = 0;
            vx: number = 0;
            vy: number = 0;
            size: number = 0;
            life: number = 0;
            maxLife: number = 100;
            hue: number = 140;
            angle: number = 0;
            dist: number = 0;

            constructor(targetCX: number, targetCY: number) {
                this.reset(targetCX, targetCY);
                this.life = Math.random() * this.maxLife; // stagger starts
            }

            reset(targetCX: number, targetCY: number) {
                this.angle = Math.random() * Math.PI * 2;
                this.dist = Math.random() * 40; 
                this.x = targetCX + Math.cos(this.angle) * this.dist;
                this.y = targetCY + Math.sin(this.angle) * this.dist;
                this.size = Math.random() * 2 + 0.5;
                this.life = 0;
                this.maxLife = Math.random() * 100 + 60;
                this.hue = 130 + Math.random() * 30;
            }

            update(targetCX: number, targetCY: number, time: number, globalIntensity: number) {
                this.angle += 0.02 * (Math.random() > 0.5 ? 1 : -1) * animationConfig.speed;
                this.dist += (1 + globalIntensity * 4) * animationConfig.speed; // Expand faster during hero
                
                const noiseX = Math.sin(this.y * 0.01 + time * 0.002) * 20 * globalIntensity;
                const noiseY = Math.cos(this.x * 0.01 + time * 0.002) * 20 * globalIntensity;
                
                const shiftX = pointerActive ? (mouseX - cx) * 0.02 : 0;
                const shiftY = pointerActive ? (mouseY - cy) * 0.02 : 0;

                this.x = targetCX + Math.cos(this.angle) * this.dist + noiseX + shiftX;
                this.y = targetCY + Math.sin(this.angle) * (this.dist * 0.6) + noiseY + shiftY;
                
                this.life += animationConfig.speed;
                if (this.life >= this.maxLife || this.dist > Math.max(width, height)) {
                    this.reset(targetCX, targetCY);
                }
            }

            draw(ctx: CanvasRenderingContext2D, globalIntensity: number) {
                const lifeProgress = this.life / this.maxLife;
                const opacity = Math.sin(lifeProgress * Math.PI) * globalIntensity * animationConfig.glowIntensity;
                
                ctx.fillStyle = `hsla(${this.hue}, 100%, ${60 + globalIntensity*20}%, ${opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * (1 + globalIntensity), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const trails = Array.from({ length: animationConfig.trailCount }, (_, i) => new Trail(i));
        const particles = Array.from({ length: animationConfig.particleCount }, () => new Particle(cx, cy));

        let startTime = performance.now();
        let req: number;

        const loop = (timestamp: number) => {
            const elapsed = timestamp - startTime;
            
            // Loop duration is 9.5 seconds = 9500ms
            const loopProgress = animationConfig.loop ? (elapsed % 9500) / 9500 : Math.min(elapsed / 9500, 1);
            const globalIntensity = getTimelineIntensity(loopProgress);

            // 1. Draw solid dark background (Composite: source-over)
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#020604'; // Deep dark background
            ctx.fillRect(0, 0, width, height);

            // 2. Draw atmospheric radial glow
            const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.6);
            radGrad.addColorStop(0, `rgba(5, 46, 22, ${0.4 * globalIntensity})`); // Deep green core
            radGrad.addColorStop(1, 'rgba(2, 6, 4, 0)');
            ctx.fillStyle = radGrad;
            ctx.fillRect(0, 0, width, height);

            // Switch to lighter for cinematic glow blending
            ctx.globalCompositeOperation = 'lighter';

            // 3. Draw energy core (center)
            const coreRadius = 40 + 80 * globalIntensity;
            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
            coreGrad.addColorStop(0, `rgba(215, 255, 215, ${0.8 * globalIntensity})`); // White-green hot center
            coreGrad.addColorStop(0.2, `rgba(57, 255, 20, ${0.6 * globalIntensity})`); // Lime
            coreGrad.addColorStop(1, 'rgba(22, 163, 74, 0)'); // Primary neon fade
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
            ctx.fill();

            // 4. Update and Draw Trails
            trails.forEach(trail => {
                trail.update(elapsed, globalIntensity, cx, cy);
                trail.draw(ctx, globalIntensity);
            });

            // 5. Update and Draw Particles
            particles.forEach(p => {
                p.update(cx, cy, elapsed, globalIntensity);
                p.draw(ctx, globalIntensity);
            });

            // 6. Draw UI Safety overlay
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = `rgba(2, 6, 4, ${animationConfig.backgroundOverlayOpacity})`;
            ctx.fillRect(0, 0, width, height);

            req = requestAnimationFrame(loop);
        };
        req = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            cancelAnimationFrame(req);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`} 
        />
    );
}
