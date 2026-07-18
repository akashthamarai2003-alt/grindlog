"use client";
import React, { useEffect, useRef, useState } from 'react';
import { getMaxUserStreak } from '@/app/actions/habits';

/**
 * ========================================
 * TREE OF LIFE - ULTRA REALISTIC ENGINE
 * ========================================
 * Professional-grade tree growth simulation
 * Mobile-first performance optimization
 * Realistic physics and natural animations
 * ========================================
 */

// ==================== TYPES ====================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'water' | 'shimmer' | 'dew' | 'leaf' | 'sparkle' | 'pollen' | 'firefly';
  size: number;
  rotation: number;
  rotationSpeed: number;
  color?: string;
  opacity: number;
  gravity: number;
  wind: number;
  scale: number;
}

interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  wingPhase: number;
  perched: boolean;
  bobPhase: number;
  bobOffset: number;
  direction: number; // 1 or -1 for facing direction
  color: string;
  size: number;
  speed: number;
  restTimer: number;
}

interface Butterfly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  wingPhase: number;
  targetX: number;
  targetY: number;
  color: string;
  secondaryColor: string;
  patternType: number;
  size: number;
  speed: number;
}

interface Leaf {
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  rotation: number;
  swayPhase: number;
  swaySpeed: number;
  color: string;
  health: number;
  type: 'oak' | 'maple' | 'willow' | 'birch';
}

interface Branch {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
  length: number;
  thickness: number;
  swayPhase: number;
  generation: number;
  children: Branch[];
  leaves: Leaf[];
}

type TreeStage = 'seed' | 'sprout' | 'sapling' | 'young' | 'mature' | 'ancient' | 'mystic';

interface TreeConfig {
  stage: TreeStage;
  growth: number;
  health: number;
  age: number;
}

// ==================== MAIN CLASS ====================

class TreeOfLife {
  // Canvas & Context
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

  // Animation
  private animationId: number = 0;
  private lastFrame: number = 0;
  private time: number = 0;
  private deltaTime: number = 0;
  private fps: number = 60;
  private frameInterval: number = 1000 / 60;

  // Game State
  private day: number = 1;
  private habitCount: number = 0;
  private stage: TreeStage = 'seed';
  private growth: number = 0;
  private targetGrowth: number = 0;

  // Tree Properties
  private tree: {
    x: number;
    y: number;
    rootY: number;
    trunkWidth: number;
    trunkHeight: number;
    canopyRadius: number;
    health: number;
    energy: number;
    glow: number;
    shake: { x: number; y: number };
    breathPhase: number;
    color: string;
  };

  // Collections
  private particles: Particle[] = [];
  private birds: Bird[] = [];
  private butterflies: Butterfly[] = [];
  private branches: Branch[] = [];
  private roots: Branch[] = [];
  private flowers: any[] = [];

  // Environmental
  private wind: {
    strength: number;
    direction: number;
    phase: number;
    gustTimer: number;
  };

  private weather: {
    type: 'clear' | 'rain' | 'snow' | 'fog';
    intensity: number;
    transition: number;
  };

  private lighting: {
    timeOfDay: number; // 0-1 (midnight to midnight)
    sunAngle: number;
    moonPhase: number;
    ambient: number;
    shadows: boolean;
  };

  // Camera
  private camera: {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    zoom: number;
    targetZoom: number;
    shake: number;
  };

  // Performance
  private maxParticles: number = 200;
  private particlePool: Particle[] = [];
  private isMobile: boolean = false;
  private lowPerformanceMode: boolean = false;

  // Assets Cache
  private gradientCache: Map<string, CanvasGradient> = new Map();
  private pathCache: Map<string, Path2D> = new Map();

  constructor(canvas: HTMLCanvasElement, initialDay: number = 1) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false,
    });
    
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    // Initialize state
    this.day = initialDay;
    this.isMobile = this.detectMobile();
    this.dpr = this.getOptimalDPR();

    // Initialize objects
    this.tree = {
      x: 0,
      y: 0,
      rootY: 0,
      trunkWidth: 20,
      trunkHeight: 0,
      canopyRadius: 0,
      health: 1,
      energy: 1,
      glow: 0,
      shake: { x: 0, y: 0 },
      breathPhase: 0,
      color: '#8B4513',
    };

    this.wind = {
      strength: 0.3,
      direction: 0,
      phase: 0,
      gustTimer: 0,
    };

    this.weather = {
      type: 'clear',
      intensity: 0,
      transition: 0,
    };

    this.lighting = {
      timeOfDay: 0.5, // Start at noon
      sunAngle: 0,
      moonPhase: 0.5,
      ambient: 1,
      shadows: !this.isMobile,
    };

    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      zoom: 1,
      targetZoom: 1,
      shake: 0,
    };

    this.init();
  }

  // ==================== INITIALIZATION ====================

  private init(): void {
    this.setupCanvas();
    this.updateStageProgression();
    this.generateBranchStructure();
    this.bindEvents();
    this.preloadAssets();
    this.startAnimationLoop();
  }

  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    this.ctx.scale(this.dpr, this.dpr);

    // Positioning
    this.tree.x = this.width / 2;
    this.tree.y = this.height - 80;
    this.tree.rootY = this.tree.y;

    // Smooth rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;
  }

  private getOptimalDPR(): number {
    const dpr = window.devicePixelRatio || 1;
    
    // Limit DPR on mobile for performance
    if (this.isMobile) {
      return Math.min(dpr, 2);
    }
    
    // Desktop can handle higher DPR
    return Math.min(dpr, 2.5);
  }

  private preloadAssets(): void {
    // Pre-generate common gradients
    this.createGradient('sky-day', () => {
      const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      grad.addColorStop(0, '#87CEEB');
      grad.addColorStop(0.5, '#B0E0E6');
      grad.addColorStop(1, '#F0E68C');
      return grad;
    });

    this.createGradient('sky-night', () => {
      const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      grad.addColorStop(0, '#000428');
      grad.addColorStop(0.5, '#004e92');
      grad.addColorStop(1, '#1a1a2e');
      return grad;
    });

    // Pre-create particle pool
    for (let i = 0; i < this.maxParticles; i++) {
      this.particlePool.push(this.createParticleObject());
    }
  }

  private createParticleObject(): Particle {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      type: 'shimmer',
      size: 5,
      rotation: 0,
      rotationSpeed: 0,
      opacity: 1,
      gravity: 0,
      wind: 1,
      scale: 1,
    };
  }

  private createGradient(key: string, factory: () => CanvasGradient): void {
    this.gradientCache.set(key, factory());
  }

  private getGradient(key: string): CanvasGradient | undefined {
    return this.gradientCache.get(key);
  }

  // ==================== ANIMATION LOOP ====================

  private startAnimationLoop(): void {
    this.lastFrame = performance.now();
    this.animate(this.lastFrame);
  }

  private animate = (currentTime: number): void => {
    this.animationId = requestAnimationFrame(this.animate);

    const elapsed = currentTime - this.lastFrame;

    // Frame rate limiting
    if (elapsed < this.frameInterval) return;

    this.lastFrame = currentTime - (elapsed % this.frameInterval);
    this.deltaTime = Math.min(elapsed / 1000, 0.1); // Cap at 100ms to prevent huge jumps
    this.time += this.deltaTime;

    // Performance monitoring
    if (this.time % 5 < this.deltaTime) {
      this.checkPerformance(elapsed);
    }

    // Update all systems
    this.update(this.deltaTime);

    // Render frame
    this.render();
  };

  private checkPerformance(frameTime: number): void {
    // If frame time exceeds 33ms (below 30fps), enable low performance mode
    if (frameTime > 33 && !this.lowPerformanceMode) {
      this.lowPerformanceMode = true;
      this.maxParticles = 50;
      this.lighting.shadows = false;
      console.log('Low performance mode enabled');
    }
  }

  // ==================== UPDATE LOGIC ====================

  private update(dt: number): void {
    this.updateEnvironment(dt);
    this.updateTree(dt);
    this.updateCamera(dt);
    this.updateParticles(dt);
    this.updateCreatures(dt);
    this.updatePhysics(dt);
  }

  private updateEnvironment(dt: number): void {
    // Day/Night cycle (24 hour = 120 seconds for demo, can be adjusted)
    this.lighting.timeOfDay += dt * 0.008; // Slow cycle
    if (this.lighting.timeOfDay > 1) this.lighting.timeOfDay -= 1;

    this.lighting.sunAngle = this.lighting.timeOfDay * Math.PI * 2;
    this.lighting.ambient = 0.3 + Math.max(0, Math.sin(this.lighting.sunAngle)) * 0.7;

    // Wind simulation with gusts
    this.wind.phase += dt;
    this.wind.gustTimer -= dt;

    if (this.wind.gustTimer <= 0) {
      // Random gusts
      this.wind.gustTimer = 2 + Math.random() * 4;
      this.wind.strength = 0.2 + Math.random() * 0.6;
      this.wind.direction = (Math.random() - 0.5) * 2;
    }

    // Smooth wind interpolation
    this.wind.strength += (0.3 - this.wind.strength) * dt * 0.5;
    this.wind.direction += (0 - this.wind.direction) * dt * 0.3;

    // Weather transitions
    if (this.weather.transition > 0) {
      this.weather.transition -= dt;
      this.weather.intensity += dt * 0.5;
      if (this.weather.intensity > 1) this.weather.intensity = 1;
    }
  }

  private updateTree(dt: number): void {
    const currentGrowth = this.growth;
    this.growth += (this.growth - currentGrowth) * 0.1; // Smooth growth transitiong animation
    this.tree.breathPhase += dt * 0.8;
    const breathScale = 1 + Math.sin(this.tree.breathPhase) * 0.015;

    // Apply breath to dimensions
    this.tree.trunkWidth = this.getBaseValue('trunkWidth') * breathScale;
    this.tree.canopyRadius = this.getBaseValue('canopyRadius') * breathScale;

    // Shake decay
    this.tree.shake.x *= Math.pow(0.1, dt);
    this.tree.shake.y *= Math.pow(0.1, dt);

    // Glow decay
    this.tree.glow *= Math.pow(0.3, dt);

    // Energy regeneration
    this.tree.energy = Math.min(1, this.tree.energy + dt * 0.1);

    // Update branches
    this.updateBranches(dt);
  }

  private updateBranches(dt: number): void {
    const updateBranchRecursive = (branch: Branch, parentSway: number = 0) => {
      branch.swayPhase += dt * (1 + Math.random() * 0.5);
      
      const sway = parentSway + 
        Math.sin(branch.swayPhase) * 
        this.wind.strength * 
        (0.02 + branch.generation * 0.01);

      const baseAngle = branch.angle;
      branch.angle = baseAngle + sway;

      // Recalculate end position
      branch.endX = branch.startX + Math.cos(branch.angle) * branch.length;
      branch.endY = branch.startY + Math.sin(branch.angle) * branch.length;

      // Update child branches
      branch.children.forEach(child => {
        child.startX = branch.endX;
        child.startY = branch.endY;
        updateBranchRecursive(child, sway);
      });

      // Update leaves on this branch
      branch.leaves.forEach(leaf => {
        leaf.swayPhase += dt * (leaf.swaySpeed + this.wind.strength);
        leaf.rotation = Math.sin(leaf.swayPhase) * 15 * this.wind.strength;
      });
    };

    this.branches.forEach(branch => updateBranchRecursive(branch));
  }

  private getBaseValue(property: string): number {
    const stage = this.stage;
    const growth = this.growth;

    const values: Record<TreeStage, Record<string, number>> = {
      seed: { trunkWidth: 0, trunkHeight: 0, canopyRadius: 0 },
      sprout: { trunkWidth: 3, trunkHeight: 60, canopyRadius: 0 },
      sapling: { trunkWidth: 8, trunkHeight: 120, canopyRadius: 40 },
      young: { trunkWidth: 15, trunkHeight: 180, canopyRadius: 80 },
      mature: { trunkWidth: 25, trunkHeight: 250, canopyRadius: 120 },
      ancient: { trunkWidth: 35, trunkHeight: 300, canopyRadius: 150 },
      mystic: { trunkWidth: 45, trunkHeight: 350, canopyRadius: 180 },
    };

    return (values[stage][property] || 0) * growth;
  }

  private updateCamera(dt: number): void {
    // Smooth camera follow
    this.camera.x += (this.camera.targetX - this.camera.x) * dt * 4;
    this.camera.y += (this.camera.targetY - this.camera.y) * dt * 4;

    // Zoom interpolation
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * dt * 3;

    // Camera shake
    this.camera.shake *= Math.pow(0.1, dt);
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.life -= dt;
      
      if (p.life <= 0) {
        // Return to pool
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.vy += p.gravity * dt;
      p.vx += this.wind.direction * this.wind.strength * p.wind * 50 * dt;

      // Air resistance
      p.vx *= Math.pow(0.98, dt * 60);
      p.vy *= Math.pow(0.98, dt * 60);

      // Update position
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Rotation
      p.rotation += p.rotationSpeed * dt;

      // Opacity fade
      p.opacity = Math.min(1, p.life / p.maxLife);

      // Remove if out of bounds
      if (p.y > this.height + 50 || p.x < -50 || p.x > this.width + 50) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateCreatures(dt: number): void {
    this.updateBirds(dt);
    this.updateButterflies(dt);
  }

  private updateBirds(dt: number): void {
    this.birds.forEach(bird => {
      if (bird.perched) {
        // Perched behavior
        bird.restTimer -= dt;
        bird.bobPhase += dt * 3;
        bird.bobOffset = Math.sin(bird.bobPhase) * 2;

        // Randomly take flight
        if (bird.restTimer <= 0 && Math.random() < 0.01) {
          bird.perched = false;
          bird.restTimer = 5 + Math.random() * 10;
          this.setBirdTarget(bird);
        }
      } else {
        // Flying behavior
        const dx = bird.targetX - bird.x;
        const dy = bird.targetY - bird.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 20) {
          // Reached target
          if (Math.random() < 0.7) {
            bird.perched = true;
            bird.vx = 0;
            bird.vy = 0;
          } else {
            this.setBirdTarget(bird);
          }
        } else {
          // Move towards target
          const speed = bird.speed;
          bird.vx = (dx / dist) * speed;
          bird.vy = (dy / dist) * speed;

          // Set direction
          bird.direction = dx > 0 ? 1 : -1;
        }

        // Apply velocity
        bird.x += bird.vx * dt;
        bird.y += bird.vy * dt;

        // Wing flapping
        bird.wingPhase += dt * 15;
      }

      // Keep in bounds
      if (bird.x < 50) bird.x = 50;
      if (bird.x > this.width - 50) bird.x = this.width - 50;
      if (bird.y < 50) bird.y = 50;
    });
  }

  private setBirdTarget(bird: Bird): void {
    // Choose random perch point or flying point
    const nearTree = Math.random() < 0.6;
    
    if (nearTree) {
      bird.targetX = this.tree.x + (Math.random() - 0.5) * 150;
      bird.targetY = this.tree.y - this.tree.trunkHeight - 50 + (Math.random() - 0.5) * 100;
    } else {
      bird.targetX = Math.random() * this.width;
      bird.targetY = 50 + Math.random() * (this.height * 0.4);
    }
  }

  private updateButterflies(dt: number): void {
    this.butterflies.forEach(butterfly => {
      // Organic flying pattern
      butterfly.phase += dt * butterfly.speed;
      
      const dx = butterfly.targetX - butterfly.x;
      const dy = butterfly.targetY - butterfly.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 30 || Math.random() < 0.01) {
        // New target
        butterfly.targetX = this.tree.x + (Math.random() - 0.5) * 200;
        butterfly.targetY = this.tree.y - 100 + (Math.random() - 0.5) * 200;
      }

      // Smooth movement with sine wave
      const moveSpeed = 50;
      butterfly.vx = (dx / (dist + 1)) * moveSpeed + Math.sin(butterfly.phase * 2) * 30;
      butterfly.vy = (dy / (dist + 1)) * moveSpeed + Math.cos(butterfly.phase * 3) * 20;

      butterfly.x += butterfly.vx * dt;
      butterfly.y += butterfly.vy * dt;

      // Wing animation
      butterfly.wingPhase += dt * 12;

      // Boundaries
      butterfly.x = Math.max(30, Math.min(this.width - 30, butterfly.x));
      butterfly.y = Math.max(30, Math.min(this.height - 100, butterfly.y));
    });
  }

  private updatePhysics(dt: number): void {
    // Additional physics simulations can go here
    // Collision detection, spring physics, etc.
  }
    // ==================== RENDERING ENGINE ====================

  private render(): void {
    const ctx = this.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, this.width, this.height);

    // Save initial state
    ctx.save();

    // Apply camera transformations
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    // Render layers (back to front)
    this.renderSky();
    this.renderCelestialBodies();
    this.renderClouds();
    this.renderDistantMountains();
    this.renderGround();
    this.renderEnvironmentalEffects();
    this.renderTree();
    this.renderCreatures();
    this.renderParticles();
    this.renderWeatherEffects();
    this.renderVignette();

    ctx.restore();

    // UI overlay (no camera transform)
    this.renderUI();
  }

  // ==================== SKY & BACKGROUND ====================

  private renderSky(): void {
    const ctx = this.ctx;
    const tod = this.lighting.timeOfDay;
    
    // Determine if day or night
    const isDay = tod > 0.25 && tod < 0.75;
    const transitionFactor = this.getSkyTransition();

    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);

    if (this.stage === 'mystic') {
      // Mystical aurora sky
      const hue1 = 260 + Math.sin(this.time * 0.3) * 30;
      const hue2 = 280 + Math.cos(this.time * 0.4) * 40;
      skyGrad.addColorStop(0, `hsl(${hue1}, 65%, ${15 + transitionFactor * 20}%)`);
      skyGrad.addColorStop(0.4, `hsl(${hue2}, 60%, ${25 + transitionFactor * 15}%)`);
      skyGrad.addColorStop(0.7, `hsl(${hue1 - 20}, 55%, ${35 + transitionFactor * 10}%)`);
      skyGrad.addColorStop(1, '#2C1810');
    } else if (isDay) {
      // Daytime sky
      const lightness = 60 + transitionFactor * 25;
      skyGrad.addColorStop(0, `hsl(200, 70%, ${lightness}%)`);
      skyGrad.addColorStop(0.4, `hsl(210, 65%, ${lightness + 10}%)`);
      skyGrad.addColorStop(0.7, `hsl(190, 60%, ${lightness + 15}%)`);
      skyGrad.addColorStop(1, `hsl(40, 50%, ${lightness + 5}%)`);
    } else {
      // Nighttime sky
      const darkness = 8 + transitionFactor * 15;
      skyGrad.addColorStop(0, `hsl(220, 60%, ${darkness}%)`);
      skyGrad.addColorStop(0.5, `hsl(230, 55%, ${darkness + 5}%)`);
      skyGrad.addColorStop(1, `hsl(240, 50%, ${darkness + 10}%)`);
    }

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars at night
    if (!isDay || this.stage === 'mystic') {
      this.renderStars(transitionFactor);
    }

    // Gradient horizon glow
    this.renderHorizonGlow();
  }

  private getSkyTransition(): number {
    const tod = this.lighting.timeOfDay;
    
    // Sunrise: 0.2-0.3, Sunset: 0.7-0.8
    if (tod < 0.25) {
      return Math.max(0, (tod - 0.15) / 0.1); // Night to dawn
    } else if (tod < 0.3) {
      return 1 - (tod - 0.25) / 0.05; // Dawn to day
    } else if (tod > 0.7 && tod < 0.75) {
      return (tod - 0.7) / 0.05; // Day to dusk
    } else if (tod > 0.75) {
      return Math.max(0, 1 - (tod - 0.75) / 0.1); // Dusk to night
    }
    
    return tod > 0.3 && tod < 0.7 ? 1 : 0;
  }

  private renderStars(brightness: number): void {
    const ctx = this.ctx;
    const starCount = this.stage === 'mystic' ? 150 : 80;
    const alpha = this.stage === 'mystic' ? 0.9 : (1 - brightness) * 0.8;

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

    for (let i = 0; i < starCount; i++) {
      // Deterministic positions
      const x = (i * 137.508) % this.width;
      const y = (i * 93.731) % (this.height * 0.6);
      
      // Twinkling effect
      const twinkle = (Math.sin(this.time * 3 + i * 0.5) + 1) / 2;
      const size = 0.5 + twinkle * 1.5;

      ctx.globalAlpha = alpha * (0.4 + twinkle * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Bright stars get a cross
      if (i % 7 === 0 && twinkle > 0.6) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * twinkle})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 3, y);
        ctx.lineTo(x + 3, y);
        ctx.moveTo(x, y - 3);
        ctx.lineTo(x, y + 3);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }

  private renderHorizonGlow(): void {
    const ctx = this.ctx;
    const tod = this.lighting.timeOfDay;
    const isDay = tod > 0.25 && tod < 0.75;

    const horizonY = this.height - 150;
    const glowGrad = ctx.createLinearGradient(0, horizonY - 100, 0, horizonY + 50);

    if (isDay) {
      glowGrad.addColorStop(0, 'rgba(255, 250, 200, 0)');
      glowGrad.addColorStop(0.5, 'rgba(255, 240, 180, 0.15)');
      glowGrad.addColorStop(1, 'rgba(255, 220, 150, 0.3)');
    } else {
      glowGrad.addColorStop(0, 'rgba(100, 100, 150, 0)');
      glowGrad.addColorStop(0.5, 'rgba(80, 80, 120, 0.1)');
      glowGrad.addColorStop(1, 'rgba(60, 60, 100, 0.2)');
    }

    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, horizonY - 100, this.width, 150);
  }

  private renderCelestialBodies(): void {
    const tod = this.lighting.timeOfDay;
    const isDay = tod > 0.25 && tod < 0.75;

    if (isDay) {
      this.renderSun();
    } else {
      this.renderMoon();
    }
  }

  private renderSun(): void {
    const ctx = this.ctx;
    const tod = this.lighting.timeOfDay;
    
    // Sun position follows arc
    const sunProgress = (tod - 0.25) / 0.5; // 0 to 1 during day
    const sunAngle = sunProgress * Math.PI; // 0 to PI
    
    const sunX = this.width * 0.75;
    const sunY = 120 - Math.sin(sunAngle) * 50;
    const sunSize = 45;

    // Sun corona
    const coronaGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize * 2.5);
    coronaGrad.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
    coronaGrad.addColorStop(0.3, 'rgba(255, 240, 150, 0.2)');
    coronaGrad.addColorStop(0.6, 'rgba(255, 220, 100, 0.1)');
    coronaGrad.addColorStop(1, 'rgba(255, 200, 80, 0)');

    ctx.fillStyle = coronaGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunSize * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Sun body
    const sunGrad = ctx.createRadialGradient(
      sunX - sunSize * 0.3,
      sunY - sunSize * 0.3,
      0,
      sunX,
      sunY,
      sunSize
    );
    sunGrad.addColorStop(0, '#FFF9E6');
    sunGrad.addColorStop(0.5, '#FFE66D');
    sunGrad.addColorStop(0.8, '#FFD93D');
    sunGrad.addColorStop(1, '#FFB700');

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
    ctx.fill();

    // Sun rays
    this.renderSunRays(sunX, sunY, sunSize);
  }

  private renderSunRays(x: number, y: number, size: number): void {
    const ctx = this.ctx;
    const rayCount = 12;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.time * 0.1);

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const pulse = Math.sin(this.time * 2 + i) * 0.2 + 0.8;
      
      ctx.save();
      ctx.rotate(angle);

      const rayGrad = ctx.createLinearGradient(0, 0, 0, size * 1.8);
      rayGrad.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
      rayGrad.addColorStop(0.5, 'rgba(255, 240, 150, 0.3)');
      rayGrad.addColorStop(1, 'rgba(255, 220, 100, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(0, size);
      ctx.lineTo(-3 * pulse, size * 1.8);
      ctx.lineTo(3 * pulse, size * 1.8);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  private renderMoon(): void {
    const ctx = this.ctx;
    const tod = this.lighting.timeOfDay;
    
    // Moon position
    const moonX = this.width * 0.2;
    const moonY = 100;
    const moonSize = 35;

    // Moon glow
    const glowGrad = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonSize * 2);
    glowGrad.addColorStop(0, 'rgba(200, 220, 255, 0.3)');
    glowGrad.addColorStop(0.5, 'rgba(180, 200, 255, 0.15)');
    glowGrad.addColorStop(1, 'rgba(160, 180, 255, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonSize * 2, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    const moonGrad = ctx.createRadialGradient(
      moonX - 10,
      moonY - 10,
      0,
      moonX,
      moonY,
      moonSize
    );
    moonGrad.addColorStop(0, '#F8F8FF');
    moonGrad.addColorStop(0.7, '#E8E8F0');
    moonGrad.addColorStop(1, '#D0D0E0');

    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
    ctx.fill();

    // Moon craters
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.arc(moonX - 8, moonY - 5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX + 10, moonY + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX + 5, moonY - 12, 4, 0, Math.PI * 2);
    ctx.fill();

    // Moon phase shadow (crescent effect)
    const phaseOffset = (this.lighting.moonPhase - 0.5) * moonSize * 2;
    ctx.fillStyle = 'rgba(0, 0, 30, 0.4)';
    ctx.beginPath();
    ctx.arc(moonX + phaseOffset, moonY, moonSize, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderClouds(): void {
    const ctx = this.ctx;
    const cloudCount = this.isMobile ? 3 : 5;
    const tod = this.lighting.timeOfDay;
    const isDay = tod > 0.25 && tod < 0.75;

    for (let i = 0; i < cloudCount; i++) {
      const speed = 5 + i * 2;
      const x = ((this.time * speed + i * 250) % (this.width + 400)) - 200;
      const y = 60 + i * 35 + Math.sin(this.time * 0.5 + i) * 10;
      const scale = 0.8 + i * 0.15;
      const alpha = isDay ? 0.4 + i * 0.1 : 0.2 + i * 0.05;

      this.drawCloud(x, y, scale, alpha, isDay);
    }
  }

  private drawCloud(x: number, y: number, scale: number, alpha: number, isDay: boolean): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.globalAlpha = alpha;

    const baseColor = isDay ? 'rgb(255, 255, 255)' : 'rgb(150, 150, 180)';
    
    // Cloud shadow
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(x, y + 5, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cloud body - multiple circles for fluffy effect
    ctx.fillStyle = baseColor;
    
    const circles = [
      { ox: -25, oy: 5, rx: 28, ry: 22 },
      { ox: 0, oy: 0, rx: 35, ry: 28 },
      { ox: 25, oy: 5, rx: 30, ry: 24 },
      { ox: 45, oy: 10, rx: 25, ry: 20 },
      { ox: 10, oy: -12, rx: 20, ry: 18 },
    ];

    circles.forEach(c => {
      ctx.beginPath();
      ctx.ellipse(
        x + c.ox * scale,
        y + c.oy * scale,
        c.rx * scale,
        c.ry * scale,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private renderDistantMountains(): void {
    if (this.lowPerformanceMode) return;

    const ctx = this.ctx;
    const tod = this.lighting.timeOfDay;
    const isDay = tod > 0.25 && tod < 0.75;

    // Multiple mountain layers for depth
    this.drawMountainLayer(0.15, isDay ? 'rgba(100, 120, 150, 0.3)' : 'rgba(40, 50, 80, 0.4)', 0.6);
    this.drawMountainLayer(0.25, isDay ? 'rgba(120, 140, 170, 0.4)' : 'rgba(50, 60, 90, 0.5)', 0.8);
    this.drawMountainLayer(0.35, isDay ? 'rgba(140, 160, 190, 0.5)' : 'rgba(60, 70, 100, 0.6)', 1.0);
  }

  private drawMountainLayer(heightFactor: number, color: string, parallax: number): void {
    const ctx = this.ctx;
    const baseY = this.height - 100;
    const peaks = 6;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, baseY);

    for (let i = 0; i <= peaks; i++) {
      const x = (i / peaks) * this.width;
      const peakHeight = 100 + Math.sin(i * 1.3) * 80 * heightFactor;
      const y = baseY - peakHeight;

      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = ((i - 1) / peaks) * this.width;
        const prevHeight = 100 + Math.sin((i - 1) * 1.3) * 80 * heightFactor;
        const prevY = baseY - prevHeight;
        
        const cpX = (prevX + x) / 2;
        const cpY = Math.min(prevY, y) - 20;
        
        ctx.quadraticCurveTo(cpX, cpY, x, y);
      }
    }

    ctx.lineTo(this.width, baseY);
    ctx.closePath();
    ctx.fill();
  }

  private renderGround(): void {
    const ctx = this.ctx;
    const groundY = this.height - 100;

    // Ground gradient
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, this.height);
    groundGrad.addColorStop(0, '#5C4033');
    groundGrad.addColorStop(0.3, '#4A3428');
    groundGrad.addColorStop(0.7, '#3D2817');
    groundGrad.addColorStop(1, '#2B1810');

    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, this.width, 100);

    // Ground texture overlay
    this.renderGroundTexture(groundY);

    // Grass layer
    if (this.stage !== 'seed') {
      this.renderGrass(groundY);
    }
  }

  private renderGroundTexture(groundY: number): void {
    const ctx = this.ctx;
    const particleCount = this.isMobile ? 30 : 50;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';

    for (let i = 0; i < particleCount; i++) {
      const x = (i * 47.123) % this.width;
      const y = groundY + (i * 23.456) % 100;
      const size = 1 + (i % 4);

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soil highlights
    ctx.fillStyle = 'rgba(139, 90, 60, 0.1)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 73.891) % this.width;
      const y = groundY + (i * 41.234) % 100;
      const size = 2 + (i % 3);

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderGrass(groundY: number): void {
    const ctx = this.ctx;
    const grassCount = this.isMobile ? 40 : 80;
    const density = this.stage === 'seed' ? 0 : 
                    this.stage === 'sprout' ? 0.3 :
                    this.stage === 'sapling' ? 0.6 : 1;

    for (let i = 0; i < grassCount * density; i++) {
      const x = (i / grassCount) * this.width + (Math.sin(i) * 10);
      const height = 12 + Math.sin(i * 0.7) * 8;
      const sway = Math.sin(this.time * 2.5 + i * 0.5) * 4 * this.wind.strength;
      
      const hue = 95 + Math.sin(i * 0.3) * 25;
      const lightness = 35 + Math.sin(i * 0.5) * 10;

      ctx.strokeStyle = `hsl(${hue}, 60%, ${lightness}%)`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.quadraticCurveTo(
        x + sway * 0.6,
        groundY - height * 0.6,
        x + sway,
        groundY - height
      );
      ctx.stroke();

      // Grass tips (lighter)
      if (i % 3 === 0) {
        ctx.strokeStyle = `hsl(${hue + 10}, 70%, ${lightness + 15}%)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + sway, groundY - height);
        ctx.lineTo(x + sway + 1, groundY - height - 3);
        ctx.stroke();
      }
    }
  }

  private renderEnvironmentalEffects(): void {
    // Fireflies at night
    const tod = this.lighting.timeOfDay;
    const isNight = tod < 0.25 || tod > 0.75;

    if (isNight && this.stage !== 'seed') {
      this.renderFireflies();
    }

    // Falling leaves in autumn (based on time cycling)
    if (this.stage === 'mature' || this.stage === 'ancient') {
      if (Math.random() < 0.05 && this.particles.length < this.maxParticles) {
        this.spawnParticle(
          this.tree.x + (Math.random() - 0.5) * this.tree.canopyRadius * 2,
          this.tree.y - this.tree.trunkHeight - 50,
          'leaf'
        );
      }
    }
  }

  private renderFireflies(): void {
    const ctx = this.ctx;
    const fireflyCount = 8;

    for (let i = 0; i < fireflyCount; i++) {
      const phase = this.time * 1.5 + i;
      const x = this.tree.x + Math.sin(phase * 0.5) * 150 + Math.cos(phase * 0.7) * 80;
      const y = this.tree.y - 80 + Math.cos(phase * 0.6) * 100 + Math.sin(phase * 0.9) * 60;
      
      const pulse = (Math.sin(phase * 4) + 1) / 2;
      const size = 2 + pulse * 2;
      const alpha = 0.3 + pulse * 0.7;

      // Glow
      const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      glowGrad.addColorStop(0, `rgba(255, 255, 100, ${alpha})`);
      glowGrad.addColorStop(0.5, `rgba(255, 255, 150, ${alpha * 0.5})`);
      glowGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==================== TREE RENDERING ====================

  private renderTree(): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(this.tree.x + this.tree.shake.x, this.tree.y + this.tree.shake.y);

    // Tree glow aura (when active)
    if (this.tree.glow > 0.1) {
      this.renderTreeAura();
    }
    
    this.generateBranchStructure();
    
    // Render based on stage
    switch (this.stage) {
      case 'seed':
        this.renderSeedStage();
        break;
      case 'sprout':
        this.renderSproutStage();
        break;
      case 'sapling':
        this.renderSaplingStage();
        break;
      case 'young':
        this.renderYoungTreeStage();
        break;
      case 'mature':
        this.renderMatureTreeStage();
        break;
      case 'ancient':
        this.renderAncientTreeStage();
        break;
      case 'mystic':
        this.renderMysticTreeStage();
        break;
    }

    ctx.restore();
  }

  private renderTreeAura(): void {
    const ctx = this.ctx;
    const glowSize = 80 + this.tree.glow * 100;
    const pulseSize = glowSize + Math.sin(this.time * 4) * 20;

    const auraGrad = ctx.createRadialGradient(0, -this.tree.trunkHeight / 2, 0, 0, -this.tree.trunkHeight / 2, pulseSize);
    auraGrad.addColorStop(0, `rgba(100, 255, 200, ${this.tree.glow * 0.4})`);
    auraGrad.addColorStop(0.5, `rgba(150, 255, 220, ${this.tree.glow * 0.2})`);
    auraGrad.addColorStop(1, 'rgba(200, 255, 240, 0)');

    ctx.fillStyle = auraGrad;
    ctx.fillRect(-pulseSize, -this.tree.trunkHeight - pulseSize, pulseSize * 2, pulseSize * 2);
  }

  private renderSeedStage(): void {
    const ctx = this.ctx;
    const breath = Math.sin(this.tree.breathPhase) * 2;
    const glowIntensity = this.tree.glow;

    // Magical glow
    if (glowIntensity > 0.05) {
      const glowSize = 60 + breath + glowIntensity * 40;
      const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      glowGrad.addColorStop(0, `rgba(255, 220, 120, ${glowIntensity * 0.6})`);
      glowGrad.addColorStop(0.5, `rgba(255, 200, 100, ${glowIntensity * 0.3})`);
      glowGrad.addColorStop(1, 'rgba(255, 180, 80, 0)');

      ctx.fillStyle = glowGrad;
      ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);
    }

    // Seed shell
    const seedGrad = ctx.createRadialGradient(-6, -10, 0, 0, 0, 28);
    seedGrad.addColorStop(0, '#B8956A');
    seedGrad.addColorStop(0.5, '#A0826D');
    seedGrad.addColorStop(0.8, '#8B4513');
    seedGrad.addColorStop(1, '#654321');

    ctx.fillStyle = seedGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20 + breath, 28 + breath, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Seed texture lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 12);
      ctx.lineTo(Math.cos(angle) * 16, Math.sin(angle) * 22);
      ctx.stroke();
    }

    // Highlight
    const highlightGrad = ctx.createRadialGradient(-8, -12, 0, -6, -10, 12);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.ellipse(-7, -12, 8, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle particles
    if (glowIntensity > 0.3 && Math.random() < 0.1) {
      this.spawnParticle(
        this.tree.x + (Math.random() - 0.5) * 70,
        this.tree.y + (Math.random() - 0.5) * 70,
        'shimmer'
      );
    }
  }

  private renderSproutStage(): void {
    const ctx = this.ctx;
    const height = this.tree.trunkHeight;
    const sway = Math.sin(this.time * 2) * 8 * this.wind.strength;

    // Soil mound
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soil shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 40, 12, 0, 0, Math.PI);
    ctx.fill();

    // Crack in soil (where sprout emerges)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -5);
    ctx.lineTo(0, 0);
    ctx.lineTo(8, -5);
    ctx.stroke();

    // Stem with gradient
    const stemGrad = ctx.createLinearGradient(0, 0, 0, -height);
    stemGrad.addColorStop(0, '#6B8E23');
    stemGrad.addColorStop(0.3, '#8FBC8F');
    stemGrad.addColorStop(0.7, '#90EE90');
    stemGrad.addColorStop(1, '#98FB98');

    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway * 0.4, -height * 0.4, sway * 0.7, -height * 0.7);
    ctx.quadraticCurveTo(sway, -height * 0.85, sway, -height);
    ctx.stroke();

    // First leaves
    if (this.growth > 0.4) {
      const leafY = -height * 0.6;
      this.drawSproutLeaf(sway - 18, leafY, -50 + sway * 3, 1);
      this.drawSproutLeaf(sway + 18, leafY, 50 + sway * 3, 1);
    }

    if (this.growth > 0.7) {
      const leafY2 = -height * 0.85;
      this.drawSproutLeaf(sway - 12, leafY2, -40 + sway * 2, 0.8);
      this.drawSproutLeaf(sway + 12, leafY2, 40 + sway * 2, 0.8);
    }

    // Dew drops occasionally
    if (Math.random() < 0.02) {
      this.spawnParticle(sway, -height * 0.8, 'dew');
    }
  }

  private drawSproutLeaf(x: number, y: number, rotation: number, scale: number): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Leaf shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(2, 2, 14, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leaf gradient
    const leafGrad = ctx.createRadialGradient(-5, -10, 0, 0, 0, 22);
    leafGrad.addColorStop(0, '#98FB98');
    leafGrad.addColorStop(0.3, '#90EE90');
    leafGrad.addColorStop(0.6, '#3CB371');
    leafGrad.addColorStop(1, '#228B22');

    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.bezierCurveTo(-14, -14, -14, 0, 0, 20);
    ctx.bezierCurveTo(14, 0, 14, -14, 0, -20);
    ctx.closePath();
    ctx.fill();

    // Central vein
    ctx.strokeStyle = 'rgba(34, 139, 34, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 20);
    ctx.stroke();

    // Side veins
    ctx.lineWidth = 1.2;
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const vy = i * 6;
      const vLength = 10 - Math.abs(i) * 1.5;
      
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.lineTo(vLength, vy + 4);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.lineTo(-vLength, vy + 4);
      ctx.stroke();
    }

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-5, -8, 5, 8, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
    private renderSaplingStage(): void {
    const ctx = this.ctx;
    const height = this.tree.trunkHeight;
    const width = this.tree.trunkWidth;

    // Root system
    this.renderRootSystem(width * 0.8, 0.6);

    // Young trunk
    const trunkGrad = ctx.createLinearGradient(-width * 0.5, 0, width * 0.5, 0);
    trunkGrad.addColorStop(0, '#5C4033');
    trunkGrad.addColorStop(0.2, '#6B4423');
    trunkGrad.addColorStop(0.5, '#8B4513');
    trunkGrad.addColorStop(0.8, '#6B4423');
    trunkGrad.addColorStop(1, '#5C4033');

    ctx.fillStyle = trunkGrad;
    ctx.beginPath();
    ctx.moveTo(-width, 0);
    ctx.lineTo(-width * 0.7, -height);
    ctx.lineTo(width * 0.7, -height);
    ctx.lineTo(width, 0);
    ctx.closePath();
    ctx.fill();

    // Bark texture
    this.renderBarkTexture(width, height, 0.4);

    // Small branches
    const branchCount = 4;
    for (let i = 0; i < branchCount; i++) {
      const progress = 0.5 + (i / branchCount) * 0.5;
      const branchY = -height * progress;
      const direction = i % 2 === 0 ? 1 : -1;
      const branchLength = 30 + i * 8;
      const sway = Math.sin(this.time * 2 + i) * 5 * this.wind.strength;

      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 6 - i;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(0, branchY);
      ctx.quadraticCurveTo(
        branchLength * 0.5 * direction,
        branchY - 10,
        (branchLength * direction) + sway,
        branchY - 25
      );
      ctx.stroke();

      // Leaves on branch
      const leafX = (branchLength * direction) + sway;
      const leafY = branchY - 25;
      this.drawDetailedLeaf(leafX, leafY, direction * 45 + sway * 2, 1.2, '#32CD32');
      
      if (i % 2 === 0) {
        this.drawDetailedLeaf(
          leafX * 0.7,
          leafY + 5,
          direction * 30,
          0.9,
          '#3CB371'
        );
      }
    }

    // Top foliage cluster
    this.renderSmallCanopy(0, -height, width * 2);
  }

  private renderYoungTreeStage(): void {
    const ctx = this.ctx;
    const height = this.tree.trunkHeight;
    const width = this.tree.trunkWidth;

    // Roots
    this.renderRootSystem(width, 0.8);

    // Trunk with curve
    const breathScale = 1 + Math.sin(this.tree.breathPhase * 0.5) * 0.01;
    
    const trunkGrad = ctx.createLinearGradient(-width, 0, width, 0);
    trunkGrad.addColorStop(0, '#4A3728');
    trunkGrad.addColorStop(0.2, '#5C4033');
    trunkGrad.addColorStop(0.4, '#6F4E37');
    trunkGrad.addColorStop(0.6, '#8B4513');
    trunkGrad.addColorStop(0.8, '#6F4E37');
    trunkGrad.addColorStop(1, '#4A3728');

    ctx.fillStyle = trunkGrad;
    ctx.beginPath();
    ctx.moveTo(-width * breathScale, 0);
    ctx.bezierCurveTo(
      -width * 0.9, -height * 0.3,
      -width * 0.75, -height * 0.7,
      -width * 0.6, -height
    );
    ctx.lineTo(width * 0.6, -height);
    ctx.bezierCurveTo(
      width * 0.75, -height * 0.7,
      width * 0.9, -height * 0.3,
      width * breathScale, 0
    );
    ctx.closePath();
    ctx.fill();

    // Detailed bark
    this.renderBarkTexture(width, height, 0.7);

    // Branch system
    if (this.branches.length === 0) {
      this.generateBranchStructure();
    }
    this.renderBranchSystem();

    // Canopy
    const canopyRadius = this.tree.canopyRadius;
    this.renderCanopy(0, -height - 20, canopyRadius);
  }

  private renderMatureTreeStage(): void {
    const ctx = this.ctx;
    const height = this.tree.trunkHeight;
    const width = this.tree.trunkWidth;

    // Shadow
    if (this.lighting.shadows) {
      this.renderTreeShadow(width);
    }

    // Extensive roots
    this.renderRootSystem(width * 1.2, 1);

    // Thick trunk
    const breathScale = 1 + Math.sin(this.tree.breathPhase * 0.5) * 0.008;
    
    const trunkGrad = ctx.createLinearGradient(-width, 0, width, 0);
    trunkGrad.addColorStop(0, '#3D2817');
    trunkGrad.addColorStop(0.15, '#4A3728');
    trunkGrad.addColorStop(0.3, '#5C4033');
    trunkGrad.addColorStop(0.5, '#8B4513');
    trunkGrad.addColorStop(0.7, '#5C4033');
    trunkGrad.addColorStop(0.85, '#4A3728');
    trunkGrad.addColorStop(1, '#3D2817');

    ctx.fillStyle = trunkGrad;
    
    // Organic trunk shape
    ctx.beginPath();
    ctx.moveTo(-width * breathScale, 0);
    ctx.bezierCurveTo(
      -width * 0.95, -height * 0.2,
      -width * 0.85, -height * 0.5,
      -width * 0.7, -height * 0.8
    );
    ctx.bezierCurveTo(
      -width * 0.65, -height * 0.9,
      -width * 0.6, -height * 0.95,
      -width * 0.5, -height
    );
    ctx.lineTo(width * 0.5, -height);
    ctx.bezierCurveTo(
      width * 0.6, -height * 0.95,
      width * 0.65, -height * 0.9,
      width * 0.7, -height * 0.8
    );
    ctx.bezierCurveTo(
      width * 0.85, -height * 0.5,
      width * 0.95, -height * 0.2,
      width * breathScale, 0
    );
    ctx.closePath();
    ctx.fill();

    // Realistic bark texture
    this.renderBarkTexture(width, height, 1);

    // Moss patches
    this.renderMoss(width, height);

    // Full branch system
    if (this.branches.length === 0) {
      this.generateBranchStructure();
    }
    this.renderBranchSystem();

    // Large canopy
    const canopyRadius = this.tree.canopyRadius;
    this.renderCanopy(0, -height - 30, canopyRadius);

    // Flowers occasionally
    if (this.growth > 0.8 && Math.random() < 0.03) {
      this.renderFlowers();
    }
  }

  private renderAncientTreeStage(): void {
    const ctx = this.ctx;
    const height = this.tree.trunkHeight;
    const width = this.tree.trunkWidth;

    // Dramatic shadow
    if (this.lighting.shadows) {
      this.renderTreeShadow(width * 1.5);
    }

    // Massive root system
    this.renderRootSystem(width * 1.5, 1.2);

    // Gnarled, ancient trunk
    const breathScale = 1 + Math.sin(this.tree.breathPhase * 0.3) * 0.006;
    
    const trunkGrad = ctx.createLinearGradient(-width, 0, width, 0);
    trunkGrad.addColorStop(0, '#2B1810');
    trunkGrad.addColorStop(0.1, '#3D2817');
    trunkGrad.addColorStop(0.25, '#4A3728');
    trunkGrad.addColorStop(0.5, '#654321');
    trunkGrad.addColorStop(0.75, '#4A3728');
    trunkGrad.addColorStop(0.9, '#3D2817');
    trunkGrad.addColorStop(1, '#2B1810');

    ctx.fillStyle = trunkGrad;

    // Twisted trunk with character
    ctx.beginPath();
    ctx.moveTo(-width * breathScale, 0);
    
    // Left side with curves and bumps
    ctx.bezierCurveTo(
      -width * 1.1, -height * 0.15,
      -width * 0.9, -height * 0.3,
      -width * 0.95, -height * 0.45
    );
    ctx.bezierCurveTo(
      -width * 0.85, -height * 0.6,
      -width * 0.75, -height * 0.75,
      -width * 0.65, -height * 0.88
    );
    ctx.bezierCurveTo(
      -width * 0.6, -height * 0.94,
      -width * 0.55, -height * 0.98,
      -width * 0.45, -height
    );
    
    ctx.lineTo(width * 0.45, -height);
    
    // Right side
    ctx.bezierCurveTo(
      width * 0.55, -height * 0.98,
      width * 0.6, -height * 0.94,
      width * 0.65, -height * 0.88
    );
    ctx.bezierCurveTo(
      width * 0.75, -height * 0.75,
      width * 0.85, -height * 0.6,
      width * 0.95, -height * 0.45
    );
    ctx.bezierCurveTo(
      width * 0.9, -height * 0.3,
      width * 1.1, -height * 0.15,
      width * breathScale, 0
    );
    ctx.closePath();
    ctx.fill();

    // Ancient bark with deep crevices
    this.renderAncientBark(width, height);

    // Moss and lichen
    this.renderMoss(width, height);
    this.renderLichen(width, height);

    // Hollow/knothole
    this.renderTreeHollow(-width * 0.3, -height * 0.4);

    // Complex branch network
    if (this.branches.length === 0) {
      this.generateBranchStructure();
    }
    this.renderBranchSystem();

    // Massive canopy
    const canopyRadius = this.tree.canopyRadius;
    this.renderCanopy(0, -height - 40, canopyRadius);

    // Flowers and fruits
    this.renderFlowers();
  }

  private renderMysticTreeStage(): void {
    const ctx = this.ctx;
    const height = this.tree.trunkHeight;
    const width = this.tree.trunkWidth;

    // Magical aura pulses
    const pulseSize = 250 + Math.sin(this.time * 2) * 50;
    const auraGrad = ctx.createRadialGradient(0, -height * 0.5, 0, 0, -height * 0.5, pulseSize);
    auraGrad.addColorStop(0, 'rgba(147, 51, 234, 0.4)');
    auraGrad.addColorStop(0.3, 'rgba(139, 92, 246, 0.25)');
    auraGrad.addColorStop(0.6, 'rgba(167, 139, 250, 0.15)');
    auraGrad.addColorStop(1, 'rgba(196, 181, 253, 0)');

    ctx.fillStyle = auraGrad;
    ctx.fillRect(-pulseSize, -height - pulseSize, pulseSize * 2, pulseSize * 2);

    // Energy rings
    for (let i = 0; i < 4; i++) {
      const ringRadius = 100 + i * 70 + Math.sin(this.time * 2.5 + i * 0.8) * 25;
      const ringAlpha = 0.4 - i * 0.08;
      const ringHue = 270 + i * 15 + Math.sin(this.time + i) * 20;

      ctx.strokeStyle = `hsla(${ringHue}, 80%, 65%, ${ringAlpha})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 15]);
      ctx.lineDashOffset = -this.time * 20;
      ctx.beginPath();
      ctx.arc(0, -height * 0.6, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Crystalline trunk with golden veins
    const trunkGrad = ctx.createLinearGradient(-width, 0, width, 0);
    trunkGrad.addColorStop(0, '#6B4423');
    trunkGrad.addColorStop(0.2, '#8B6914');
    trunkGrad.addColorStop(0.4, '#B8860B');
    trunkGrad.addColorStop(0.5, '#DAA520');
    trunkGrad.addColorStop(0.6, '#B8860B');
    trunkGrad.addColorStop(0.8, '#8B6914');
    trunkGrad.addColorStop(1, '#6B4423');

    ctx.fillStyle = trunkGrad;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(218, 165, 32, 0.5)';

    ctx.beginPath();
    ctx.moveTo(-width, 0);
    ctx.bezierCurveTo(-width * 0.9, -height * 0.3, -width * 0.7, -height * 0.7, -width * 0.5, -height);
    ctx.lineTo(width * 0.5, -height);
    ctx.bezierCurveTo(width * 0.7, -height * 0.7, width * 0.9, -height * 0.3, width, 0);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Bioluminescent veins
    this.renderMysticVeins(width, height);

    // Sacred geometry at crown
    this.renderSacredMandala(0, -height - 20);

    // Ethereal branches
    if (this.branches.length === 0) {
      this.generateBranchStructure();
    }
    this.renderMysticBranches();

    // Mystical canopy
    this.renderMysticCanopy(0, -height - 50, this.tree.canopyRadius);

    // Floating runes
    this.renderFloatingRunes();

    // Sacred flame at base
    this.renderSacredFlame();

    // Floating orbs
    this.renderFloatingOrbs();
  }

  // ==================== ROOT SYSTEM ====================

  private renderRootSystem(baseWidth: number, complexity: number): void {
    const ctx = this.ctx;
    const rootCount = Math.floor(5 * complexity);

    ctx.strokeStyle = 'rgba(101, 67, 33, 0.7)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < rootCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const angle = (Math.PI * 0.3 * (i / rootCount)) + (side === 1 ? 0 : Math.PI * 0.7);
      const rootLength = 40 + Math.random() * 60 * complexity;
      const rootWidth = 6 - (i * 0.3);

      ctx.lineWidth = rootWidth;

      const startX = Math.cos(angle * 0.8) * baseWidth * 0.8;
      const controlX = Math.cos(angle) * rootLength * 0.6;
      const controlY = Math.sin(angle) * rootLength * 0.3 + 20;
      const endX = Math.cos(angle) * rootLength;
      const endY = Math.sin(angle) * rootLength * 0.4 + 30;

      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();

      // Sub-roots
      if (complexity > 0.7 && i % 2 === 0) {
        const subLength = rootLength * 0.4;
        const subAngle = angle + (Math.random() - 0.5) * 0.5;
        
        ctx.lineWidth = rootWidth * 0.5;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX + Math.cos(subAngle) * subLength,
          endY + Math.sin(subAngle) * subLength * 0.3 + 10
        );
        ctx.stroke();
      }
    }
  }

  // ==================== BARK TEXTURES ====================

  private renderBarkTexture(width: number, height: number, detail: number): void {
    const ctx = this.ctx;
    const lineCount = Math.floor(12 * detail);

    // Vertical bark lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < lineCount; i++) {
      const x = -width * 0.9 + (i / lineCount) * width * 1.8;
      const offsetY = Math.sin(i * 0.7) * 15;
      const warp = Math.sin(i * 1.3) * 10;

      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.quadraticCurveTo(
        x + warp, -height * 0.5,
        x * 0.8, -height + offsetY
      );
      ctx.stroke();
    }

    // Horizontal bark texture
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;

    for (let i = 0; i < height / 20; i++) {
      const y = -i * 20;
      const waveOffset = Math.sin(y * 0.1) * 8;

      ctx.beginPath();
      ctx.moveTo(-width + waveOffset, y);
      ctx.lineTo(width + waveOffset, y);
      ctx.stroke();
    }

    // Knots and imperfections
    const knotCount = Math.floor(5 * detail);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';

    for (let i = 0; i < knotCount; i++) {
      const knotX = (Math.sin(i * 2.4) * width * 0.6);
      const knotY = -(height * 0.2) - (i / knotCount) * height * 0.6;
      const knotSize = 4 + Math.random() * 6;

      ctx.beginPath();
      ctx.ellipse(knotX, knotY, knotSize, knotSize * 1.3, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();

      // Knot ring
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  private renderAncientBark(width: number, height: number): void {
    const ctx = this.ctx;

    // Deep crevices
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 3;

    for (let i = 0; i < 8; i++) {
      const x = -width * 0.7 + (i / 8) * width * 1.4;
      const depth = Math.sin(i * 0.9) * 6;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(
        x + depth, -height * 0.5,
        x * 0.7, -height
      );
      ctx.stroke();

      // Highlight on edge
      ctx.strokeStyle = 'rgba(139, 90, 60, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 2, 0);
      ctx.quadraticCurveTo(
        x + depth + 2, -height * 0.5,
        x * 0.7 + 2, -height
      );
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 3;
    }

    // Weathered texture
    for (let i = 0; i < 30; i++) {
      const px = (Math.sin(i * 3.7) * width * 0.8);
      const py = -(Math.random() * height);
      const size = 2 + Math.random() * 4;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Large knot holes
    this.renderBarkTexture(width, height, 1.5);
  }

  private renderMoss(width: number, height: number): void {
    const ctx = this.ctx;
    const mossPatches = 8;

    for (let i = 0; i < mossPatches; i++) {
      const x = (Math.sin(i * 2.1) * width * 0.7);
      const y = -(height * 0.3) - (Math.random() * height * 0.5);
      const size = 8 + Math.random() * 12;

      const mossGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
      mossGrad.addColorStop(0, 'rgba(107, 142, 35, 0.6)');
      mossGrad.addColorStop(0.6, 'rgba(85, 107, 47, 0.4)');
      mossGrad.addColorStop(1, 'rgba(85, 107, 47, 0)');

      ctx.fillStyle = mossGrad;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Moss texture
      for (let j = 0; j < 5; j++) {
        const mx = x + (Math.random() - 0.5) * size;
        const my = y + (Math.random() - 0.5) * size;
        ctx.fillStyle = 'rgba(107, 142, 35, 0.3)';
        ctx.beginPath();
        ctx.arc(mx, my, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderLichen(width: number, height: number): void {
    const ctx = this.ctx;
    const lichenCount = 6;

    for (let i = 0; i < lichenCount; i++) {
      const x = (Math.cos(i * 1.7) * width * 0.8);
      const y = -(height * 0.2) - (Math.random() * height * 0.6);
      const hue = 40 + Math.random() * 30;

      ctx.fillStyle = `hsla(${hue}, 60%, 70%, 0.4)`;
      
      // Irregular lichen shape
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        const radius = 6 + Math.random() * 6;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  private renderTreeHollow(x: number, y: number): void {
    const ctx = this.ctx;
    const width = 25;
    const height = 35;

    // Hollow shadow
    const hollowGrad = ctx.createRadialGradient(x, y, 0, x, y, width);
    hollowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    hollowGrad.addColorStop(0.7, 'rgba(20, 10, 5, 0.6)');
    hollowGrad.addColorStop(1, 'rgba(40, 20, 10, 0)');

    ctx.fillStyle = hollowGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hollow rim
    ctx.strokeStyle = 'rgba(101, 67, 33, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Interior texture
    ctx.fillStyle = 'rgba(60, 40, 20, 0.5)';
    for (let i = 0; i < 5; i++) {
      const px = x + (Math.random() - 0.5) * width * 0.8;
      const py = y + (Math.random() - 0.5) * height * 0.8;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderTreeShadow(width: number): void {
    const ctx = this.ctx;
    const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 1.5);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    shadowGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(0, 5, width * 1.5, width * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==================== BRANCH SYSTEM ====================

  private generateBranchStructure(): void {
    this.branches = [];
    const mainBranchCount = this.stage === 'mystic' ? 8 :
                           this.stage === 'ancient' ? 7 :
                           this.stage === 'mature' ? 6 : 5;

    const startY = -this.tree.trunkHeight * 0.6;

    for (let i = 0; i < mainBranchCount; i++) {
      const angle = -Math.PI / 2 + (i % 2 === 0 ? -0.5 : 0.5) + (Math.random() - 0.5) * 0.3;
      const length = 60 + Math.random() * 40;
      const thickness = 8 - i * 0.5;

      const branch: Branch = {
        startX: 0,
        startY: startY - (i * 30),
        endX: 0,
        endY: 0,
        angle: angle,
        length: length,
        thickness: thickness,
        swayPhase: Math.random() * Math.PI * 2,
        generation: 0,
        children: [],
        leaves: []
      };

      branch.endX = branch.startX + Math.cos(angle) * length;
      branch.endY = branch.startY + Math.sin(angle) * length;

      // Generate sub-branches
      this.generateSubBranches(branch, 3);

      this.branches.push(branch);
    }
  }

  private generateSubBranches(parent: Branch, depth: number): void {
    if (depth <= 0) return;

    const childCount = depth > 1 ? 2 : 3;

    for (let i = 0; i < childCount; i++) {
      const angleOffset = (i % 2 === 0 ? -0.4 : 0.4) + (Math.random() - 0.5) * 0.2;
      const childAngle = parent.angle + angleOffset;
      const childLength = parent.length * (0.6 + Math.random() * 0.2);
      const childThickness = parent.thickness * 0.7;

      const child: Branch = {
        startX: parent.endX,
        startY: parent.endY,
        endX: 0,
        endY: 0,
        angle: childAngle,
        length: childLength,
        thickness: childThickness,
        swayPhase: Math.random() * Math.PI * 2,
        generation: parent.generation + 1,
        children: [],
        leaves: []
      };

      child.endX = child.startX + Math.cos(childAngle) * childLength;
      child.endY = child.startY + Math.sin(childAngle) * childLength;

      // Add leaves to terminal branches
      if (depth === 1) {
        this.generateBranchLeaves(child);
      }

      // Recurse
      this.generateSubBranches(child, depth - 1);

      parent.children.push(child);
    }
  }

  private generateBranchLeaves(branch: Branch): void {
    const leafCount = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < leafCount; i++) {
      const progress = i / leafCount;
      const x = branch.startX + (branch.endX - branch.startX) * progress;
      const y = branch.startY + (branch.endY - branch.startY) * progress;

      const leaf: Leaf = {
        x: x,
        y: y,
        angle: branch.angle + (Math.random() - 0.5) * Math.PI,
        distance: 5 + Math.random() * 10,
        size: 0.8 + Math.random() * 0.4,
        rotation: (Math.random() - 0.5) * 90,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.8 + Math.random() * 0.6,
        color: this.getLeafColor(),
        health: 1,
        type: this.getLeafType()
      };

      branch.leaves.push(leaf);
    }
  }

  private getLeafColor(): string {
    const season = Math.floor(this.time / 30) % 4; // Cycle through seasons
    
    if (this.stage === 'mystic') {
      return `hsl(${270 + Math.random() * 40}, 70%, 60%)`;
    }

    switch (season) {
      case 0: // Spring
        return `hsl(${100 + Math.random() * 30}, 65%, 45%)`;
      case 1: // Summer
        return `hsl(${110 + Math.random() * 20}, 60%, 35%)`;
      case 2: // Autumn
        return `hsl(${20 + Math.random() * 40}, 75%, 50%)`;
      case 3: // Winter (evergreen)
        return `hsl(${120 + Math.random() * 20}, 50%, 30%)`;
      default:
        return '#228B22';
    }
  }

  private getLeafType(): 'oak' | 'maple' | 'willow' | 'birch' {
    const types: ('oak' | 'maple' | 'willow' | 'birch')[] = ['oak', 'maple', 'willow', 'birch'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private renderBranchSystem(): void {
    const ctx = this.ctx;

    const renderBranch = (branch: Branch) => {
      // Branch gradient
      const branchGrad = ctx.createLinearGradient(
        branch.startX, branch.startY,
        branch.endX, branch.endY
      );
      branchGrad.addColorStop(0, '#654321');
      branchGrad.addColorStop(0.5, '#8B4513');
      branchGrad.addColorStop(1, '#6B4423');

      ctx.strokeStyle = branchGrad;
      ctx.lineWidth = branch.thickness;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(branch.startX, branch.startY);
      ctx.lineTo(branch.endX, branch.endY);
      ctx.stroke();

      // Branch shadow
      if (this.lighting.shadows && branch.generation < 2) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = branch.thickness + 1;
        ctx.beginPath();
        ctx.moveTo(branch.startX + 2, branch.startY + 2);
        ctx.lineTo(branch.endX + 2, branch.endY + 2);
        ctx.stroke();
      }

      // Render leaves on this branch
      branch.leaves.forEach(leaf => {
        const lx = leaf.x + Math.cos(leaf.angle) * leaf.distance;
        const ly = leaf.y + Math.sin(leaf.angle) * leaf.distance;
        const rotation = leaf.rotation + Math.sin(leaf.swayPhase) * 15 * this.wind.strength;

        this.drawDetailedLeaf(lx, ly, rotation, leaf.size, leaf.color);
      });

      // Render child branches
      branch.children.forEach(child => renderBranch(child));
    };

    this.branches.forEach(branch => renderBranch(branch));
  }

  private renderMysticBranches(): void {
    const ctx = this.ctx;

    const renderMysticBranch = (branch: Branch) => {
      // Glowing branch
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(218, 165, 32, 0.6)';

      const branchGrad = ctx.createLinearGradient(
        branch.startX, branch.startY,
        branch.endX, branch.endY
      );
      branchGrad.addColorStop(0, '#8B6914');
      branchGrad.addColorStop(0.5, '#DAA520');
      branchGrad.addColorStop(1, '#FFD700');

      ctx.strokeStyle = branchGrad;
      ctx.lineWidth = branch.thickness;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(branch.startX, branch.startY);
      ctx.lineTo(branch.endX, branch.endY);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Energy nodes
      if (branch.generation < 2) {
        const nodeX = (branch.startX + branch.endX) / 2;
        const nodeY = (branch.startY + branch.endY) / 2;
        const pulse = (Math.sin(this.time * 3 + branch.swayPhase) + 1) / 2;

        const nodeGrad = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, 8);
        nodeGrad.addColorStop(0, `rgba(255, 215, 0, ${0.8 * pulse})`);
        nodeGrad.addColorStop(0.7, `rgba(218, 165, 32, ${0.4 * pulse})`);
        nodeGrad.addColorStop(1, 'rgba(184, 134, 11, 0)');

        ctx.fillStyle = nodeGrad;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ethereal leaves
      branch.leaves.forEach(leaf => {
        const lx = leaf.x + Math.cos(leaf.angle) * leaf.distance;
        const ly = leaf.y + Math.sin(leaf.angle) * leaf.distance;
        const rotation = leaf.rotation + Math.sin(leaf.swayPhase) * 20 * this.wind.strength;

        this.drawMysticLeaf(lx, ly, rotation, leaf.size);
      });

      branch.children.forEach(child => renderMysticBranch(child));
    };

    this.branches.forEach(branch => renderMysticBranch(branch));
  }
    // ==================== CANOPY RENDERING ====================

  private renderSmallCanopy(x: number, y: number, radius: number): void {
    const ctx = this.ctx;
    const layers = 2;

    for (let layer = layers - 1; layer >= 0; layer--) {
      const layerRadius = radius * (1 - layer * 0.2);
      const layerY = y - layer * 8;
      const alpha = 0.7 - layer * 0.1;

      const canopyGrad = ctx.createRadialGradient(x, layerY, 0, x, layerY, layerRadius);
      canopyGrad.addColorStop(0, `hsla(115, 55%, 45%, ${alpha})`);
      canopyGrad.addColorStop(0.6, `hsla(110, 50%, 38%, ${alpha * 0.9})`);
      canopyGrad.addColorStop(1, `hsla(105, 45%, 25%, ${alpha * 0.5})`);

      ctx.fillStyle = canopyGrad;
      ctx.beginPath();

      const segments = 12;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const noise = Math.sin(angle * 2 + this.time + layer) * 8;
        const r = layerRadius + noise;
        const px = x + Math.cos(angle) * r;
        const py = layerY + Math.sin(angle) * r * 0.8;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.closePath();
      ctx.fill();
    }
  }

  private renderCanopy(x: number, y: number, radius: number): void {
    const ctx = this.ctx;
    const layers = this.lowPerformanceMode ? 2 : 4;

    // Shadow under canopy
    if (this.lighting.shadows) {
      const shadowGrad = ctx.createRadialGradient(x, y + 20, 0, x, y + 20, radius * 1.2);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.15)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(x, y + 20, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Multi-layered canopy for depth
    for (let layer = layers - 1; layer >= 0; layer--) {
      const layerRadius = radius * (1 - layer * 0.1);
      const layerY = y - layer * 18;
      const alpha = 0.85 - layer * 0.12;
      const darken = layer * 8;

      const canopyGrad = ctx.createRadialGradient(x, layerY, 0, x, layerY, layerRadius);
      canopyGrad.addColorStop(0, `hsla(120, 55%, ${42 - darken}%, ${alpha})`);
      canopyGrad.addColorStop(0.5, `hsla(115, 52%, ${36 - darken}%, ${alpha})`);
      canopyGrad.addColorStop(0.8, `hsla(110, 48%, ${28 - darken}%, ${alpha * 0.8})`);
      canopyGrad.addColorStop(1, `hsla(105, 45%, ${20 - darken}%, ${alpha * 0.3})`);

      ctx.fillStyle = canopyGrad;
      ctx.beginPath();

      const segments = 20;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const timeOffset = this.time * 0.4 + layer * 0.5;
        const noise = Math.sin(angle * 3 + timeOffset) * 12 + Math.cos(angle * 5 + timeOffset * 0.7) * 8;
        const windSway = Math.sin(angle + this.time * 2) * this.wind.strength * 10;
        const r = layerRadius + noise + windSway;
        const px = x + Math.cos(angle) * r;
        const py = layerY + Math.sin(angle) * r * 0.75; // Elliptical shape

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.closePath();
      ctx.fill();

      // Inner texture highlights
      if (layer === 0 && !this.lowPerformanceMode) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 15; i++) {
          const angle = (i / 15) * Math.PI * 2;
          const r = layerRadius * 0.6;
          const px = x + Math.cos(angle) * r;
          const py = layerY + Math.sin(angle) * r * 0.75;
          const size = 8 + Math.sin(this.time + i) * 3;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Individual leaf clusters for realism
    if (!this.lowPerformanceMode) {
      this.renderCanopyLeafClusters(x, y, radius);
    }
  }

  private renderCanopyLeafClusters(x: number, y: number, radius: number): void {
    const ctx = this.ctx;
    const clusterCount = this.isMobile ? 25 : 50;

    for (let i = 0; i < clusterCount; i++) {
      const angle = (i / clusterCount) * Math.PI * 2 + Math.sin(this.time * 0.5 + i) * 0.3;
      const distance = 0.5 + (Math.cos(i * 2.7) * 0.5 + 0.5) * 0.5;
      const r = radius * distance;

      const lx = x + Math.cos(angle) * r;
      const ly = y + Math.sin(angle) * r * 0.75;

      const swayPhase = this.time * 2 + i * 0.3;
      const rotation = Math.sin(swayPhase) * 25 * this.wind.strength + (i * 30);
      const size = 0.6 + (Math.sin(i * 1.3) * 0.5 + 0.5) * 0.5;

      this.drawCanopyLeafCluster(lx, ly, rotation, size);
    }
  }

  private drawCanopyLeafCluster(x: number, y: number, rotation: number, scale: number): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Multiple leaves in cluster
    const leafPositions = [
      { x: 0, y: 0, r: 0 },
      { x: -6, y: -4, r: -20 },
      { x: 6, y: -4, r: 20 },
      { x: -4, y: 5, r: -30 },
      { x: 4, y: 5, r: 30 },
    ];

    leafPositions.forEach((pos, index) => {
      const leafAlpha = 1 - index * 0.12;
      ctx.globalAlpha = leafAlpha;

      const hue = 110 + Math.sin(this.time * 0.5 + index) * 15;
      const lightness = 38 + Math.cos(this.time * 0.3 + index) * 8;

      ctx.fillStyle = `hsl(${hue}, 58%, ${lightness}%)`;

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate((pos.r * Math.PI) / 180);

      // Leaf shape
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vein
      ctx.strokeStyle = `hsla(${hue - 10}, 50%, 25%, 0.4)`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 10);
      ctx.stroke();

      ctx.restore();
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private renderMysticCanopy(x: number, y: number, radius: number): void {
    const ctx = this.ctx;

    // Ethereal outer glow
    for (let i = 0; i < 3; i++) {
      const glowRadius = radius * (1.5 - i * 0.2);
      const glowAlpha = 0.15 - i * 0.04;
      const hue = 270 + i * 15 + Math.sin(this.time + i) * 20;

      const glowGrad = ctx.createRadialGradient(x, y, radius * 0.8, x, y, glowRadius);
      glowGrad.addColorStop(0, `hsla(${hue}, 75%, 60%, 0)`);
      glowGrad.addColorStop(0.5, `hsla(${hue}, 70%, 55%, ${glowAlpha})`);
      glowGrad.addColorStop(1, `hsla(${hue}, 65%, 45%, 0)`);

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Crystalline canopy layers
    for (let layer = 3; layer >= 0; layer--) {
      const layerRadius = radius * (1 - layer * 0.08);
      const layerY = y - layer * 20;
      const alpha = 0.7 - layer * 0.1;
      const hue = 275 + layer * 10 + Math.sin(this.time * 0.5 + layer) * 15;

      ctx.save();
      ctx.globalAlpha = alpha;

      const canopyGrad = ctx.createRadialGradient(x, layerY, 0, x, layerY, layerRadius);
      canopyGrad.addColorStop(0, `hsl(${hue}, 70%, 55%)`);
      canopyGrad.addColorStop(0.4, `hsl(${hue - 10}, 65%, 45%)`);
      canopyGrad.addColorStop(0.7, `hsl(${hue - 20}, 60%, 35%)`);
      canopyGrad.addColorStop(1, `hsl(${hue - 30}, 55%, 20%)`);

      ctx.fillStyle = canopyGrad;
      ctx.beginPath();

      const segments = 24;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const noise = Math.sin(angle * 4 + this.time * 0.8 + layer) * 15;
        const pulse = Math.sin(this.time * 2 + angle * 2) * 8;
        const r = layerRadius + noise + pulse;
        const px = x + Math.cos(angle) * r;
        const py = layerY + Math.sin(angle) * r * 0.7;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.closePath();
      ctx.fill();

      // Sparkle effect on edges
      if (layer === 0) {
        ctx.strokeStyle = `hsla(${hue + 40}, 80%, 70%, 0.6)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }

    // Floating ethereal leaves
    this.renderMysticLeaves(x, y, radius);
  }

  private renderMysticLeaves(x: number, y: number, radius: number): void {
    const leafCount = 15;

    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2 + this.time * 0.3;
      const distance = 0.6 + Math.sin(this.time * 2 + i) * 0.3;
      const r = radius * distance;

      const lx = x + Math.cos(angle) * r;
      const ly = y + Math.sin(angle) * r * 0.7;

      const float = Math.sin(this.time * 3 + i * 0.7) * 15;
      const rotation = this.time * 50 + i * 24;

      this.drawMysticLeaf(lx, ly + float, rotation, 1);
    }
  }

  // ==================== LEAF RENDERING ====================

  private drawDetailedLeaf(x: number, y: number, rotation: number, scale: number, color: string): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Leaf shadow
    if (this.lighting.shadows) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.beginPath();
      ctx.ellipse(2, 2, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Leaf gradient
    const leafGrad = ctx.createRadialGradient(-4, -6, 0, 0, 0, 14);
    leafGrad.addColorStop(0, this.lightenColor(color, 20));
    leafGrad.addColorStop(0.4, color);
    leafGrad.addColorStop(0.8, this.darkenColor(color, 20));
    leafGrad.addColorStop(1, this.darkenColor(color, 35));

    ctx.fillStyle = leafGrad;

    // Leaf outline
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.bezierCurveTo(-10, -10, -10, -2, -8, 4);
    ctx.bezierCurveTo(-6, 10, -2, 14, 0, 14);
    ctx.bezierCurveTo(2, 14, 6, 10, 8, 4);
    ctx.bezierCurveTo(10, -2, 10, -10, 0, -14);
    ctx.closePath();
    ctx.fill();

    // Central vein
    ctx.strokeStyle = this.darkenColor(color, 40);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 14);
    ctx.stroke();

    // Side veins
    ctx.lineWidth = 0.8;
    const veinCount = 5;
    for (let i = -veinCount; i <= veinCount; i++) {
      if (i === 0) continue;
      const vy = (i / veinCount) * 12;
      const vLength = 8 - Math.abs(i) * 1;
      const vAngle = 0.5;

      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.lineTo(vLength * Math.cos(vAngle), vy + vLength * Math.sin(vAngle));
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.lineTo(-vLength * Math.cos(vAngle), vy + vLength * Math.sin(vAngle));
      ctx.stroke();
    }

    // Highlight
    const highlightGrad = ctx.createRadialGradient(-4, -6, 0, -4, -6, 8);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.ellipse(-4, -6, 5, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Serrated edges (optional detail)
    if (scale > 0.8 && !this.lowPerformanceMode) {
      ctx.strokeStyle = this.darkenColor(color, 15);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const r = 9 + (i % 2) * 1;
        const px = Math.cos(angle) * r * 0.7;
        const py = Math.sin(angle) * r + 0;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawMysticLeaf(x: number, y: number, rotation: number, scale: number): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Glowing aura
    const hue = 280 + Math.sin(this.time * 2 + x * 0.1) * 30;
    const pulse = (Math.sin(this.time * 4 + rotation) + 1) / 2;

    const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    auraGrad.addColorStop(0, `hsla(${hue}, 80%, 70%, ${0.4 * pulse})`);
    auraGrad.addColorStop(0.6, `hsla(${hue}, 75%, 60%, ${0.2 * pulse})`);
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    // Ethereal leaf body
    const leafGrad = ctx.createRadialGradient(-3, -5, 0, 0, 0, 12);
    leafGrad.addColorStop(0, `hsl(${hue}, 85%, 75%)`);
    leafGrad.addColorStop(0.5, `hsl(${hue - 10}, 80%, 65%)`);
    leafGrad.addColorStop(1, `hsl(${hue - 20}, 75%, 50%)`);

    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Energy vein
    ctx.strokeStyle = `hsla(${hue + 30}, 90%, 85%, 0.8)`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 12);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Sparkle at tip
    if (pulse > 0.7) {
      ctx.fillStyle = `hsla(${hue + 40}, 95%, 90%, ${pulse})`;
      ctx.beginPath();
      ctx.arc(0, -12, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ==================== MYSTICAL EFFECTS ====================

  private renderMysticVeins(width: number, height: number): void {
    const ctx = this.ctx;

    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(147, 51, 234, 0.8)';

    const veinCount = 8;
    for (let i = 0; i < veinCount; i++) {
      const startY = -(height / (veinCount + 1)) * (i + 1);
      const direction = i % 2 === 0 ? 1 : -1;
      const pulse = Math.sin(this.time * 3 + i * 0.7) * 6;
      const hue = 270 + Math.sin(this.time + i) * 20;

      ctx.strokeStyle = `hsla(${hue}, 85%, 65%, 0.8)`;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(0, startY);
      ctx.quadraticCurveTo(
        direction * (18 + pulse),
        startY - 25,
        direction * (30 + pulse),
        startY - 50
      );
      ctx.stroke();

      // Energy nodes
      const nodeX = direction * (30 + pulse);
      const nodeY = startY - 50;
      const nodeSize = 3 + Math.sin(this.time * 5 + i) * 2;

      const nodeGrad = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, 8);
      nodeGrad.addColorStop(0, `hsl(${hue + 20}, 90%, 75%)`);
      nodeGrad.addColorStop(0.5, `hsl(${hue}, 85%, 65%)`);
      nodeGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');

      ctx.fillStyle = nodeGrad;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `hsl(${hue + 30}, 95%, 85%)`;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  private renderSacredMandala(x: number, y: number): void {
    const ctx = this.ctx;
    const rotation = this.time * 0.4;
    const pulseScale = 1 + Math.sin(this.time * 2.5) * 0.12;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(pulseScale, pulseScale);

    // Outer ring
    const outerPetals = 16;
    for (let i = 0; i < outerPetals; i++) {
      const angle = (Math.PI * 2 / outerPetals) * i;
      const hue = 265 + (i / outerPetals) * 50;
      const petalPulse = Math.sin(this.time * 3 + i * 0.4);

      ctx.save();
      ctx.rotate(angle);

      const petalGrad = ctx.createRadialGradient(0, -40, 0, 0, -40, 20);
      petalGrad.addColorStop(0, `hsla(${hue}, 85%, 75%, 0.9)`);
      petalGrad.addColorStop(0.6, `hsla(${hue - 10}, 80%, 60%, 0.7)`);
      petalGrad.addColorStop(1, `hsla(${hue - 20}, 75%, 45%, 0.3)`);

      ctx.fillStyle = petalGrad;
      ctx.beginPath();
      ctx.ellipse(0, -40, 10 + petalPulse * 2, 22 + petalPulse * 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Middle ring
    const middlePetals = 12;
    ctx.rotate(Math.PI / middlePetals);
    for (let i = 0; i < middlePetals; i++) {
      const angle = (Math.PI * 2 / middlePetals) * i;
      const hue = 275 + (i / middlePetals) * 40;

      ctx.save();
      ctx.rotate(angle);

      const petalGrad = ctx.createRadialGradient(0, -28, 0, 0, -28, 16);
      petalGrad.addColorStop(0, `hsla(${hue}, 90%, 70%, 0.95)`);
      petalGrad.addColorStop(0.7, `hsla(${hue - 10}, 85%, 55%, 0.8)`);
      petalGrad.addColorStop(1, `hsla(${hue - 20}, 80%, 40%, 0.4)`);

      ctx.fillStyle = petalGrad;
      ctx.beginPath();
      ctx.ellipse(0, -28, 8, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Inner circle
    const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
    centerGrad.addColorStop(0, '#FFD700');
    centerGrad.addColorStop(0.5, '#FFA500');
    centerGrad.addColorStop(0.8, '#FF8C00');
    centerGrad.addColorStop(1, 'rgba(255, 140, 0, 0.5)');

    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Sacred symbols
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
    ctx.lineWidth = 2.5;

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 12);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.stroke();

    // Diagonal lines
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(8, 8);
    ctx.moveTo(8, -8);
    ctx.lineTo(-8, 8);
    ctx.stroke();

    // Inner circle outline
    ctx.strokeStyle = 'rgba(184, 134, 11, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private renderSacredFlame(): void {
    const ctx = this.ctx;
    const x = 0;
    const y = 0;

    ctx.save();

    for (let i = 0; i < 5; i++) {
      const height = 50 - i * 9;
      const width = 22 - i * 4;
      const flicker = Math.sin(this.time * 8 + i * 0.8) * 5;
      const pulse = Math.sin(this.time * 4 + i * 0.5) * 0.15 + 1;

      const flameGrad = ctx.createLinearGradient(0, y, 0, y - height);

      if (i === 0) {
        flameGrad.addColorStop(0, 'rgba(255, 140, 0, 0.95)');
        flameGrad.addColorStop(0.3, 'rgba(255, 100, 0, 0.9)');
        flameGrad.addColorStop(0.6, 'rgba(255, 200, 0, 0.7)');
        flameGrad.addColorStop(1, 'rgba(255, 255, 100, 0)');
      } else {
        const alpha = 0.8 - i * 0.14;
        flameGrad.addColorStop(0, `rgba(255, 165, 0, ${alpha})`);
        flameGrad.addColorStop(0.4, `rgba(255, 120, 0, ${alpha * 0.9})`);
        flameGrad.addColorStop(0.7, `rgba(255, 220, 0, ${alpha * 0.6})`);
        flameGrad.addColorStop(1, `rgba(255, 255, 200, 0)`);
      }

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.ellipse(
        x + flicker,
        y - height / 2,
        (width + flicker * 0.3) * pulse,
        height * pulse,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // Intense glow
    ctx.shadowBlur = 35;
    ctx.shadowColor = 'rgba(255, 140, 0, 0.9)';
    ctx.fillStyle = 'rgba(255, 220, 100, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y - 25, 28, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Embers
    if (Math.random() < 0.3) {
      this.spawnParticle(x + (Math.random() - 0.5) * 30, y - 50, 'sparkle');
    }

    ctx.restore();
  }

  private renderFloatingOrbs(): void {
    const ctx = this.ctx;
    const orbCount = 6;

    for (let i = 0; i < orbCount; i++) {
      const angle = (i / orbCount) * Math.PI * 2 + this.time * 0.5;
      const radius = 160 + Math.sin(this.time * 1.5 + i) * 40;
      const x = this.tree.x + Math.cos(angle) * radius;
      const y = this.tree.y - this.tree.trunkHeight * 0.7 + Math.sin(angle + this.time) * radius * 0.4;

      const size = 7 + Math.sin(this.time * 3 + i * 1.2) * 3;
      const hue = 270 + (i / orbCount) * 90;
      const pulse = (Math.sin(this.time * 4 + i) + 1) / 2;

      // Orb trail
      const trailGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      trailGrad.addColorStop(0, `hsla(${hue}, 85%, 70%, ${0.3 * pulse})`);
      trailGrad.addColorStop(0.5, `hsla(${hue}, 80%, 60%, ${0.15 * pulse})`);
      trailGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = trailGrad;
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      const orbGrad = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
      orbGrad.addColorStop(0, `hsl(${hue + 20}, 95%, 85%)`);
      orbGrad.addColorStop(0.5, `hsl(${hue}, 90%, 70%)`);
      orbGrad.addColorStop(1, `hsl(${hue - 20}, 85%, 55%)`);

      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderFloatingRunes(): void {
    const ctx = this.ctx;
    const runeCount = 8;

    for (let i = 0; i < runeCount; i++) {
      const angle = (i / runeCount) * Math.PI * 2 + this.time * 0.3;
      const radius = 130 + Math.sin(this.time + i) * 20;
      const x = Math.cos(angle) * radius;
      const y = -this.tree.trunkHeight * 0.5 + Math.sin(angle) * radius * 0.5;

      const rotation = this.time * 30 + i * 45;
      const float = Math.sin(this.time * 2 + i) * 8;
      const pulse = (Math.sin(this.time * 4 + i * 0.6) + 1) / 2;

      ctx.save();
      ctx.translate(x, y + float);
      ctx.rotate((rotation * Math.PI) / 180);

      const hue = 280 + i * 10;
      ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${0.6 + pulse * 0.4})`;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsl(${hue}, 90%, 60%)`;

      // Simple rune shapes
      const runeType = i % 4;
      ctx.beginPath();

      switch (runeType) {
        case 0: // Vertical with crosses
          ctx.moveTo(0, -12);
          ctx.lineTo(0, 12);
          ctx.moveTo(-6, -6);
          ctx.lineTo(6, -6);
          ctx.moveTo(-6, 6);
          ctx.lineTo(6, 6);
          break;
        case 1: // Triangle
          ctx.moveTo(0, -12);
          ctx.lineTo(-10, 12);
          ctx.lineTo(10, 12);
          ctx.closePath();
          break;
        case 2: // Circle with center
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.moveTo(0, -10);
          ctx.lineTo(0, 10);
          ctx.moveTo(-10, 0);
          ctx.lineTo(10, 0);
          break;
        case 3: // Diamond
          ctx.moveTo(0, -12);
          ctx.lineTo(8, 0);
          ctx.lineTo(0, 12);
          ctx.lineTo(-8, 0);
          ctx.closePath();
          break;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // ==================== FLOWERS ====================

  private renderFlowers(): void {
    const ctx = this.ctx;

    if (this.flowers.length === 0 && this.stage !== 'seed' && this.stage !== 'sprout') {
      // Generate flower positions
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 0.7 + Math.random() * 0.2;
        const r = this.tree.canopyRadius * distance;

        this.flowers.push({
          angle: angle,
          distance: r,
          size: 0.8 + Math.random() * 0.4,
          hue: Math.random() * 360,
          bloomPhase: Math.random() * Math.PI * 2,
          petalCount: 5 + Math.floor(Math.random() * 3)
        });
      }
    }

    this.flowers.forEach((flower, index) => {
      flower.bloomPhase += 0.02;
      const bloom = (Math.sin(flower.bloomPhase) + 1) / 2;

      const x = Math.cos(flower.angle) * flower.distance;
      const y = -this.tree.trunkHeight - 30 + Math.sin(flower.angle) * flower.distance * 0.7;

      this.drawFlower(x, y, flower.size, flower.hue, flower.petalCount, bloom);
    });
  }

  private drawFlower(x: number, y: number, scale: number, hue: number, petalCount: number, bloom: number): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalSize = 5 + bloom * 3;

      ctx.save();
      ctx.rotate(angle);

      const petalGrad = ctx.createRadialGradient(0, -petalSize, 0, 0, -petalSize, petalSize);
      petalGrad.addColorStop(0, `hsl(${hue}, 85%, 75%)`);
      petalGrad.addColorStop(0.7, `hsl(${hue}, 80%, 60%)`);
      petalGrad.addColorStop(1, `hsl(${hue}, 75%, 45%)`);

      ctx.fillStyle = petalGrad;
      ctx.beginPath();
      ctx.ellipse(0, -petalSize, petalSize * 0.6, petalSize, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Center
    const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 3);
    centerGrad.addColorStop(0, '#FFD700');
    centerGrad.addColorStop(0.6, '#FFA500');
    centerGrad.addColorStop(1, '#FF8C00');

    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 3 * bloom, 0, Math.PI * 2);
    ctx.fill();

    // Pollen dots
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = Math.cos(angle) * 1.5 * bloom;
      const py = Math.sin(angle) * 1.5 * bloom;

      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.arc(px, py, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
    // ==================== PARTICLE SYSTEM ====================

  private spawnParticle(x: number, y: number, type: Particle['type'], customOptions?: Partial<Particle>): void {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }

    const defaults: Record<Particle['type'], Partial<Particle>> = {
      water: {
        vx: (Math.random() - 0.5) * 40,
        vy: -Math.random() * 120 - 40,
        gravity: 350,
        size: 8 + Math.random() * 6,
        life: 1.2,
        maxLife: 1.2,
        wind: 1.2,
        rotationSpeed: (Math.random() - 0.5) * 180,
        opacity: 1
      },
      shimmer: {
        vx: (Math.random() - 0.5) * 50,
        vy: -Math.random() * 100 - 30,
        gravity: -40,
        size: 4 + Math.random() * 3,
        life: 1.5,
        maxLife: 1.5,
        wind: 0.5,
        rotationSpeed: (Math.random() - 0.5) * 360,
        opacity: 1
      },
      dew: {
        vx: (Math.random() - 0.5) * 15,
        vy: Math.random() * 40 + 10,
        gravity: 120,
        size: 5 + Math.random() * 4,
        life: 1.8,
        maxLife: 1.8,
        wind: 0.8,
        rotationSpeed: (Math.random() - 0.5) * 90,
        opacity: 0.9
      },
      leaf: {
        vx: (Math.random() - 0.5) * 50,
        vy: Math.random() * 30 + 15,
        gravity: 40,
        size: 10 + Math.random() * 6,
        life: 3,
        maxLife: 3,
        wind: 1.5,
        rotationSpeed: (Math.random() - 0.5) * 180,
        opacity: 1,
        color: this.getLeafColor()
      },
      sparkle: {
        vx: (Math.random() - 0.5) * 80,
        vy: -Math.random() * 120 - 60,
        gravity: -20,
        size: 5 + Math.random() * 4,
        life: 1.2,
        maxLife: 1.2,
        wind: 0.3,
        rotationSpeed: (Math.random() - 0.5) * 720,
        opacity: 1
      },
      pollen: {
        vx: (Math.random() - 0.5) * 30,
        vy: -Math.random() * 40 - 10,
        gravity: -15,
        size: 2 + Math.random() * 2,
        life: 2,
        maxLife: 2,
        wind: 2,
        rotationSpeed: (Math.random() - 0.5) * 90,
        opacity: 0.8
      },
      firefly: {
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        gravity: 0,
        size: 3,
        life: 3,
        maxLife: 3,
        wind: 0.5,
        rotationSpeed: 0,
        opacity: 1
      }
    };

    const config = { ...defaults[type], ...customOptions };

    this.particles.push({
      x,
      y,
      type,
      vx: config.vx || 0,
      vy: config.vy || 0,
      gravity: config.gravity || 0,
      size: config.size || 5,
      life: config.life || 1,
      maxLife: config.maxLife || 1,
      rotation: Math.random() * 360,
      rotationSpeed: config.rotationSpeed || 0,
      color: config.color,
      opacity: config.opacity || 1,
      wind: config.wind || 1,
      scale: 1
    });
  }

  private renderParticles(): void {
    this.particles.forEach(p => {
      this.drawParticle(p);
    });
  }

  private drawParticle(p: Particle): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.globalAlpha = p.opacity * Math.min(1, p.life / (p.maxLife * 0.3));
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.scale(p.scale, p.scale);

    switch (p.type) {
      case 'water':
        this.drawWaterDrop(p.size);
        break;
      case 'shimmer':
        this.drawShimmer(p.size);
        break;
      case 'dew':
        this.drawDewDrop(p.size);
        break;
      case 'leaf':
        this.drawFallingLeaf(p.size, p.color || '#228B22');
        break;
      case 'sparkle':
        this.drawSparkle(p.size);
        break;
      case 'pollen':
        this.drawPollen(p.size);
        break;
      case 'firefly':
        this.drawFirefly(p.size, p.life, p.maxLife);
        break;
    }

    ctx.restore();
  }

  private drawWaterDrop(size: number): void {
    const ctx = this.ctx;

    // Water gradient
    const waterGrad = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 0, 0, 0, size);
    waterGrad.addColorStop(0, '#E0F7FF');
    waterGrad.addColorStop(0.3, '#B3E5FC');
    waterGrad.addColorStop(0.6, '#4FC3F7');
    waterGrad.addColorStop(1, '#0288D1');

    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    const highlightGrad = ctx.createRadialGradient(-size * 0.4, -size * 0.5, 0, -size * 0.3, -size * 0.4, size * 0.5);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.4, size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = 'rgba(0, 100, 150, 0.3)';
    ctx.beginPath();
    ctx.ellipse(size * 0.2, size * 0.3, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawShimmer(size: number): void {
    const ctx = this.ctx;

    // Glow
    const shimmerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
    shimmerGrad.addColorStop(0, '#FFF9C4');
    shimmerGrad.addColorStop(0.4, '#FFD700');
    shimmerGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');

    ctx.fillStyle = shimmerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Star shape
    ctx.fillStyle = '#FFEB3B';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#FFD700';

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  private drawDewDrop(size: number): void {
    const ctx = this.ctx;

    // Dew gradient
    const dewGrad = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 0, 0, 0, size);
    dewGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    dewGrad.addColorStop(0.4, 'rgba(200, 230, 255, 0.85)');
    dewGrad.addColorStop(0.7, 'rgba(173, 216, 230, 0.7)');
    dewGrad.addColorStop(1, 'rgba(135, 206, 235, 0.5)');

    ctx.fillStyle = dewGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();

    // Bright highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(-size * 0.35, -size * 0.35, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Refraction edge
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawFallingLeaf(size: number, color: string): void {
    const ctx = this.ctx;

    const leafGrad = ctx.createRadialGradient(-size * 0.2, -size * 0.3, 0, 0, 0, size);
    leafGrad.addColorStop(0, this.lightenColor(color, 15));
    leafGrad.addColorStop(0.5, color);
    leafGrad.addColorStop(1, this.darkenColor(color, 25));

    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.6, size, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vein
    ctx.strokeStyle = this.darkenColor(color, 35);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
  }

  private drawSparkle(size: number): void {
    const ctx = this.ctx;

    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#FFEB3B';

    // 8-point star
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const radius = i % 2 === 0 ? size : size * 0.4;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Bright center
    ctx.fillStyle = '#FFFACD';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPollen(size: number): void {
    const ctx = this.ctx;

    const pollenGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    pollenGrad.addColorStop(0, '#FFEB3B');
    pollenGrad.addColorStop(0.7, '#FFC107');
    pollenGrad.addColorStop(1, 'rgba(255, 193, 7, 0)');

    ctx.fillStyle = pollenGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawFirefly(size: number, life: number, maxLife: number): void {
    const ctx = this.ctx;

    const pulse = Math.sin((1 - life / maxLife) * Math.PI * 8);
    const glowSize = size * (3 + pulse * 2);
    const alpha = 0.5 + pulse * 0.5;

    // Glow
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
    glowGrad.addColorStop(0, `rgba(255, 255, 150, ${alpha})`);
    glowGrad.addColorStop(0.5, `rgba(255, 255, 100, ${alpha * 0.5})`);
    glowGrad.addColorStop(1, 'rgba(255, 255, 0, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==================== WEATHER EFFECTS ====================

  private renderWeatherEffects(): void {
    if (this.weather.type === 'rain' && this.weather.intensity > 0) {
      this.renderRain();
    } else if (this.weather.type === 'snow' && this.weather.intensity > 0) {
      this.renderSnow();
    }
  }

  private renderRain(): void {
    const dropCount = Math.floor(30 * this.weather.intensity);

    for (let i = 0; i < dropCount; i++) {
      if (Math.random() < 0.3) {
        const x = Math.random() * this.width;
        const y = -10;
        this.spawnParticle(x, y, 'water', {
          vy: 300 + Math.random() * 200,
          gravity: 400
        });
      }
    }
  }

  private renderSnow(): void {
    const flakeCount = Math.floor(20 * this.weather.intensity);

    for (let i = 0; i < flakeCount; i++) {
      if (Math.random() < 0.2) {
        const x = Math.random() * this.width;
        const y = -10;
        this.spawnParticle(x, y, 'shimmer', {
          vy: 30 + Math.random() * 30,
          gravity: 10,
          wind: 2,
          color: '#FFFFFF'
        });
      }
    }
  }

  // ==================== CREATURE RENDERING ====================

  private renderCreatures(): void {
    this.birds.forEach(bird => this.drawBird(bird));
    this.butterflies.forEach(butterfly => this.drawButterfly(butterfly));
  }

  private drawBird(bird: Bird): void {
    const ctx = this.ctx;
    const wingAngle = Math.sin(bird.wingPhase) * (bird.perched ? 12 : 50);

    ctx.save();
    ctx.translate(bird.x, bird.y + (bird.perched ? bird.bobOffset : 0));

    // Flip if facing left
    if (bird.direction === -1) {
      ctx.scale(-1, 1);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 10 * bird.size, 4 * bird.size, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bodyGrad = ctx.createRadialGradient(-3, -4, 0, 0, 0, 10 * bird.size);
    bodyGrad.addColorStop(0, this.lightenColor(bird.color, 20));
    bodyGrad.addColorStop(0.5, bird.color);
    bodyGrad.addColorStop(1, this.darkenColor(bird.color, 20));

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7 * bird.size, 10 * bird.size, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left Wing
    ctx.save();
    ctx.translate(-5 * bird.size, -3 * bird.size);
    ctx.rotate((wingAngle * Math.PI) / 180);

    const wingGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 12 * bird.size);
    wingGrad.addColorStop(0, bird.color);
    wingGrad.addColorStop(0.7, this.darkenColor(bird.color, 15));
    wingGrad.addColorStop(1, this.darkenColor(bird.color, 30));

    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12 * bird.size, 5 * bird.size, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Wing feathers
    ctx.strokeStyle = this.darkenColor(bird.color, 25);
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-i * 3, 0);
      ctx.lineTo(-i * 3 - 5, 2);
      ctx.stroke();
    }

    ctx.restore();

    // Right Wing
    ctx.save();
    ctx.translate(5 * bird.size, -3 * bird.size);
    ctx.rotate((-wingAngle * Math.PI) / 180);

    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12 * bird.size, 5 * bird.size, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Wing feathers
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 3, 0);
      ctx.lineTo(i * 3 + 5, 2);
      ctx.stroke();
    }

    ctx.restore();

    // Head
    ctx.fillStyle = this.lightenColor(bird.color, 10);
    ctx.beginPath();
    ctx.arc(0, -10 * bird.size, 5 * bird.size, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(2 * bird.size, -10 * bird.size, 1.5 * bird.size, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(2.5 * bird.size, -10.5 * bird.size, 0.6 * bird.size, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(4 * bird.size, -10 * bird.size);
    ctx.lineTo(7 * bird.size, -9.5 * bird.size);
    ctx.lineTo(4 * bird.size, -9 * bird.size);
    ctx.closePath();
    ctx.fill();

    // Tail
    ctx.fillStyle = this.darkenColor(bird.color, 10);
    ctx.beginPath();
    ctx.ellipse(-8 * bird.size, 2 * bird.size, 6 * bird.size, 3 * bird.size, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Tail feathers
    ctx.strokeStyle = this.darkenColor(bird.color, 25);
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-8 * bird.size, 2 * bird.size);
      ctx.lineTo(-12 * bird.size - i * 2, 0 + i * 2);
      ctx.stroke();
    }

    // Legs (if perched)
    if (bird.perched) {
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 1.5 * bird.size;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(-2 * bird.size, 8 * bird.size);
      ctx.lineTo(-2 * bird.size, 12 * bird.size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(2 * bird.size, 8 * bird.size);
      ctx.lineTo(2 * bird.size, 12 * bird.size);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawButterfly(butterfly: Butterfly): void {
    const ctx = this.ctx;
    const wingAngle = Math.sin(butterfly.wingPhase) * 60;

    ctx.save();
    ctx.translate(butterfly.x, butterfly.y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 8 * butterfly.size, 3 * butterfly.size, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left wings (back)
    ctx.save();
    ctx.rotate((wingAngle * Math.PI) / 180);

    // Back left wing
    const wingGrad1 = ctx.createRadialGradient(-10 * butterfly.size, 0, 0, -10 * butterfly.size, 0, 18 * butterfly.size);
    wingGrad1.addColorStop(0, butterfly.color);
    wingGrad1.addColorStop(0.6, butterfly.secondaryColor);
    wingGrad1.addColorStop(1, this.darkenColor(butterfly.color, 30));

    ctx.fillStyle = wingGrad1;
    ctx.beginPath();
    ctx.ellipse(-10 * butterfly.size, -5 * butterfly.size, 12 * butterfly.size, 18 * butterfly.size, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Wing pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-12 * butterfly.size, -8 * butterfly.size, 4 * butterfly.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.darkenColor(butterfly.color, 40);
    ctx.beginPath();
    ctx.arc(-8 * butterfly.size, 2 * butterfly.size, 3 * butterfly.size, 0, Math.PI * 2);
    ctx.fill();

    // Front left wing
    ctx.fillStyle = wingGrad1;
    ctx.beginPath();
    ctx.ellipse(-8 * butterfly.size, 8 * butterfly.size, 10 * butterfly.size, 14 * butterfly.size, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(-10 * butterfly.size, 12 * butterfly.size, 3 * butterfly.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Right wings (front)
    ctx.save();
    ctx.rotate((-wingAngle * Math.PI) / 180);

    const wingGrad2 = ctx.createRadialGradient(10 * butterfly.size, 0, 0, 10 * butterfly.size, 0, 18 * butterfly.size);
    wingGrad2.addColorStop(0, this.lightenColor(butterfly.color, 10));
    wingGrad2.addColorStop(0.6, butterfly.secondaryColor);
    wingGrad2.addColorStop(1, this.darkenColor(butterfly.color, 30));

    // Back right wing
    ctx.fillStyle = wingGrad2;
    ctx.beginPath();
    ctx.ellipse(10 * butterfly.size, -5 * butterfly.size, 12 * butterfly.size, 18 * butterfly.size, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(12 * butterfly.size, -8 * butterfly.size, 4 * butterfly.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.darkenColor(butterfly.color, 40);
    ctx.beginPath();
    ctx.arc(8 * butterfly.size, 2 * butterfly.size, 3 * butterfly.size, 0, Math.PI * 2);
    ctx.fill();

    // Front right wing
    ctx.fillStyle = wingGrad2;
    ctx.beginPath();
    ctx.ellipse(8 * butterfly.size, 8 * butterfly.size, 10 * butterfly.size, 14 * butterfly.size, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(10 * butterfly.size, 12 * butterfly.size, 3 * butterfly.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Body
    const bodyGrad = ctx.createLinearGradient(0, -12 * butterfly.size, 0, 12 * butterfly.size);
    bodyGrad.addColorStop(0, '#2C2416');
    bodyGrad.addColorStop(0.5, '#1A1410');
    bodyGrad.addColorStop(1, '#0D0A08');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 2 * butterfly.size, 12 * butterfly.size, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body segments
    ctx.strokeStyle = 'rgba(100, 80, 60, 0.5)';
    ctx.lineWidth = 0.8;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(-1.5 * butterfly.size, i * 3 * butterfly.size);
      ctx.lineTo(1.5 * butterfly.size, i * 3 * butterfly.size);
      ctx.stroke();
    }

    // Head
    ctx.fillStyle = '#2C2416';
    ctx.beginPath();
    ctx.arc(0, -13 * butterfly.size, 2.5 * butterfly.size, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
    ctx.strokeStyle = '#3D2817';
    ctx.lineWidth = 1 * butterfly.size;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(0, -13 * butterfly.size);
    ctx.quadraticCurveTo(-3 * butterfly.size, -17 * butterfly.size, -4 * butterfly.size, -19 * butterfly.size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -13 * butterfly.size);
    ctx.quadraticCurveTo(3 * butterfly.size, -17 * butterfly.size, 4 * butterfly.size, -19 * butterfly.size);
    ctx.stroke();

    // Antennae tips
    ctx.fillStyle = '#2C2416';
    ctx.beginPath();
    ctx.arc(-4 * butterfly.size, -19 * butterfly.size, 1 * butterfly.size, 0, Math.PI * 2);
    ctx.arc(4 * butterfly.size, -19 * butterfly.size, 1 * butterfly.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==================== UI & OVERLAYS ====================

  private renderUI(): void {
    // Optional: Day counter, stage indicator, etc.
    if (process.env.NODE_ENV === 'development') {
      this.renderDebugInfo();
    }
  }

  private renderDebugInfo(): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 120);

    ctx.fillStyle = '#00FF00';
    ctx.font = '12px monospace';
    ctx.fillText(`Day: ${this.day}`, 20, 30);
    ctx.fillText(`Stage: ${this.stage}`, 20, 50);
    ctx.fillText(`Growth: ${(this.growth * 100).toFixed(1)}%`, 20, 70);
    ctx.fillText(`Particles: ${this.particles.length}`, 20, 90);
    ctx.fillText(`Birds: ${this.birds.length}`, 20, 110);

    ctx.restore();
  }

  private renderVignette(): void {
    if (this.lowPerformanceMode) return;

    const ctx = this.ctx;
    const vignetteGrad = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.height * 0.3,
      this.width / 2, this.height / 2, this.height * 0.8
    );

    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  // ==================== STAGE PROGRESSION ====================

  private updateStageProgression(): void {
    const oldStage = this.stage;

    if (this.day >= 365) this.stage = 'mystic';
    else if (this.day >= 180) this.stage = 'ancient';
    else if (this.day >= 90) this.stage = 'mature';
    else if (this.day >= 45) this.stage = 'young';
    else if (this.day >= 15) this.stage = 'sapling';
    else if (this.day >= 5) this.stage = 'sprout';
    else this.stage = 'seed';

    this.targetGrowth = this.getGrowthForStage();

    if (oldStage !== this.stage) {
      this.onStageChange(oldStage, this.stage);
    }
  }

  private getGrowthForStage(): number {
    const progressInStage = this.getProgressInCurrentStage();

    const baseGrowth: Record<TreeStage, number> = {
      seed: 0.1,
      sprout: 0.25,
      sapling: 0.45,
      young: 0.65,
      mature: 0.85,
      ancient: 1.0,
      mystic: 1.15
    };

    return baseGrowth[this.stage] + progressInStage * 0.1;
  }

  private getProgressInCurrentStage(): number {
    const stageRanges: Record<TreeStage, [number, number]> = {
      seed: [1, 5],
      sprout: [5, 15],
      sapling: [15, 45],
      young: [45, 90],
      mature: [90, 180],
      ancient: [180, 365],
      mystic: [365, 1000]
    };

    const [min, max] = stageRanges[this.stage];
    return Math.min(1, (this.day - min) / (max - min));
  }

  private onStageChange(oldStage: TreeStage, newStage: TreeStage): void {
    console.log(`🌳 Tree evolved: ${oldStage} → ${newStage}`);

    // Camera shake
    this.camera.shake = 20;

    // Celebration particles
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const distance = 60 + Math.random() * 40;
      this.spawnParticle(
        this.tree.x + Math.cos(angle) * distance,
        this.tree.y - 100 + Math.sin(angle) * distance,
        'sparkle'
      );
    }

    // Regenerate structures
    if (newStage !== 'seed' && newStage !== 'sprout') {
      this.branches = [];
      this.flowers = [];
    }

    // Add creatures at milestones
    if (newStage === 'young' || newStage === 'mature') {
      this.addBird();
    }

    if (newStage === 'mature' || newStage === 'ancient') {
      this.addButterfly();
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }

  // ==================== CREATURE MANAGEMENT ====================

  public addBird(): void {
    if (this.birds.length >= 15) return;

    const colors = ['#8B4513', '#A0826D', '#CD853F', '#D2691E', '#654321'];

    this.birds.push({
      x: Math.random() * this.width,
      y: 50 + Math.random() * 100,
      vx: 0,
      vy: 0,
      targetX: this.tree.x + (Math.random() - 0.5) * 150,
      targetY: this.tree.y - this.tree.trunkHeight - 80,
      wingPhase: Math.random() * Math.PI * 2,
      perched: false,
      bobPhase: Math.random() * Math.PI * 2,
      bobOffset: 0,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 0.8 + Math.random() * 0.4,
      speed: 120 + Math.random() * 60,
      restTimer: 5 + Math.random() * 10
    });
  }

  public addButterfly(): void {
    if (this.butterflies.length >= 12) return;

    const hue = Math.random() * 360;
    const secondaryHue = (hue + 30 + Math.random() * 60) % 360;

    this.butterflies.push({
      x: this.tree.x + (Math.random() - 0.5) * 200,
      y: this.tree.y - 100 - Math.random() * 100,
      vx: 0,
      vy: 0,
      phase: Math.random() * Math.PI * 2,
      wingPhase: Math.random() * Math.PI * 2,
      targetX: this.tree.x,
      targetY: this.tree.y - 100,
      color: `hsl(${hue}, 75%, 55%)`,
      secondaryColor: `hsl(${secondaryHue}, 70%, 60%)`,
      patternType: Math.floor(Math.random() * 3),
      size: 0.7 + Math.random() * 0.5,
      speed: 1.5 + Math.random() * 1
    });
  }

  // ==================== EVENT HANDLERS ====================

  private bindEvents(): void {
    this.handleTouch = this.handleTouch.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleDeviceMotion = this.handleDeviceMotion.bind(this);

    this.canvas.addEventListener('touchstart', this.handleTouch, { passive: false });
    this.canvas.addEventListener('click', this.handleClick);
    this.canvas.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    window.addEventListener('resize', this.handleResize);

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', this.handleDeviceMotion);
    }
  }

  private handleTouch(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.handleInteraction(x, y);
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.handleInteraction(x, y);
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.width;
    const y = (e.clientY - rect.top) / this.height;

    // Subtle parallax
    this.camera.targetX = (x - 0.5) * 8;
    this.camera.targetY = (y - 0.5) * 8;
  }

  private handleInteraction(x: number, y: number): void {
    // Ripple effect
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      setTimeout(() => {
        this.spawnParticle(
          x + Math.cos(angle) * 40,
          y + Math.sin(angle) * 40,
          'shimmer'
        );
      }, i * 25);
    }

    // Tree shake
    const dx = x - this.tree.x;
    const dy = y - this.tree.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 150) {
      this.tree.shake.x = (Math.random() - 0.5) * 30;
      this.tree.shake.y = (Math.random() - 0.5) * 30;

      // Falling leaves
      for (let i = 0; i < 8; i++) {
        this.spawnParticle(
          this.tree.x + (Math.random() - 0.5) * 120,
          this.tree.y - this.tree.trunkHeight + (Math.random() - 0.5) * 100,
          'leaf'
        );
      }

      // Startle birds
      this.birds.forEach(bird => {
        if (bird.perched && Math.random() < 0.5) {
          bird.perched = false;
          this.setBirdTarget(bird);
        }
      });
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  }

  private handleDeviceMotion(e: DeviceMotionEvent): void {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;

    const threshold = 18;
    const shake = Math.abs(acc.x || 0) + Math.abs(acc.y || 0);

    if (shake > threshold) {
      this.wind.strength = Math.min(1.5, this.wind.strength + 0.3);
      this.tree.shake.x += (acc.x || 0) * 0.5;
      this.tree.shake.y += (acc.y || 0) * 0.5;

      // Shake leaves off
      for (let i = 0; i < 5; i++) {
        this.spawnParticle(
          this.tree.x + (Math.random() - 0.5) * 150,
          this.tree.y - this.tree.trunkHeight + (Math.random() - 0.5) * 150,
          'leaf'
        );
      }
    }
  }

  private handleResize(): void {
    this.setupCanvas();
  }

  // ==================== COLOR UTILITIES ====================

  private lightenColor(color: string, percent: number): string {
    const hsl = this.hexToHSL(color);
    return `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(100, hsl.l + percent)}%)`;
  }

  private darkenColor(color: string, percent: number): string {
    const hsl = this.hexToHSL(color);
    return `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(0, hsl.l - percent)}%)`;
  }

  private hexToHSL(color: string): { h: number; s: number; l: number } {
    // Simple approximation - in production, use a proper color library
    if (color.startsWith('hsl')) {
      const matches = color.match(/\d+/g);
      if (matches) {
        return { h: +matches[0], s: +matches[1], l: +matches[2] };
      }
    }
    return { h: 120, s: 50, l: 40 };
  }

  // ==================== PUBLIC API ====================

  public waterTree(): void {
    this.tree.glow = 1;
    this.tree.energy = Math.min(1, this.tree.energy + 0.3);

    // Water drop animation
    for (let i = 0; i < 25; i++) {
      setTimeout(() => {
        this.spawnParticle(
          this.tree.x + (Math.random() - 0.5) * 80,
          50 + Math.random() * 100,
          'water'
        );
      }, i * 50);
    }

    // Camera zoom
    this.camera.shake = 10;

    // Pollen burst
    if (this.stage === 'mature' || this.stage === 'ancient') {
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          this.spawnParticle(
            this.tree.x + (Math.random() - 0.5) * 100,
            this.tree.y - this.tree.trunkHeight - 50,
            'pollen'
          );
        }, i * 30);
      }
    }

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 100]);
    }
  }

  public setDay(day: number): void {
    this.day = day;
    this.updateStageProgression();
  }

  public setHabitCount(count: number): void {
    this.habitCount = count;
  }

  public getState() {
    return {
      day: this.day,
      stage: this.stage,
      growth: this.growth,
      habitCount: this.habitCount,
      health: this.tree.health,
      birdCount: this.birds.length,
      butterflyCount: this.butterflies.length
    };
  }

  public setWeather(type: 'clear' | 'rain' | 'snow' | 'fog', intensity: number = 0.5): void {
    this.weather.type = type;
    this.weather.intensity = intensity;
    this.weather.transition = 1;
  }

  // ==================== CLEANUP ====================

  public destroy(): void {
    cancelAnimationFrame(this.animationId);

    this.canvas.removeEventListener('touchstart', this.handleTouch);
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('devicemotion', this.handleDeviceMotion);

    this.particles = [];
    this.birds = [];
    this.butterflies = [];
    this.branches = [];
    this.flowers = [];
    this.gradientCache.clear();
    this.pathCache.clear();

    console.log('🌳 Tree of Life destroyed');
  }
}

// ==================== REACT COMPONENT ====================

export default function TreePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const treeRef = useRef<TreeOfLife | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMaxUserStreak().then(max => {
      setStreak(max === 0 ? 1 : max);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (streak !== null && canvasRef.current) {
      const tree = new TreeOfLife(canvasRef.current, streak);
      treeRef.current = tree;

      // Expose to window for debugging
      if (typeof window !== 'undefined') {
        (window as any).tree = tree;
        (window as any).treeAPI = {
          water: () => tree.waterTree(),
          setDay: (day: number) => tree.setDay(day),
          getState: () => tree.getState(),
          setWeather: (type: any, intensity: number) => tree.setWeather(type, intensity),
          addBird: () => tree.addBird(),
          addButterfly: () => tree.addButterfly()
        };
      }

      return () => {
        tree.destroy();
        treeRef.current = null;
      };
    }
  }, [streak]);

  return (
    <div className="relative w-full h-[calc(100dvh-80px)] bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
            <p className="text-white/70 text-lg font-medium">Growing your tree...</p>
          </div>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block touch-none cursor-pointer"
        style={{ imageRendering: 'auto' }}
      />

      {/* Interactive hint */}
      {!isLoading && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 animate-pulse">
            <p className="text-white/80 text-sm font-medium">
              ✨ Tap or click the tree to interact
            </p>
          </div>
        </div>
      )}

      {/* Development Controls */}
      {process.env.NODE_ENV === 'development' && !isLoading && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-black/60 backdrop-blur-lg p-4 rounded-xl border border-white/10 max-h-[80vh] overflow-y-auto">
          <div className="text-xs text-white/70 font-bold mb-2 uppercase tracking-wider border-b border-white/20 pb-2">
            🌳 Developer Tools
          </div>

          <button 
            onClick={() => treeRef.current?.setDay(1)}
            className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            🌰 Seed (Day 1)
          </button>

          <button 
            onClick={() => treeRef.current?.setDay(7)}
            className="px-3 py-2 bg-lime-500/20 hover:bg-lime-500/30 text-lime-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            🌱 Sprout (Day 7)
          </button>

          <button 
            onClick={() => treeRef.current?.setDay(25)}
            className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            🌿 Sapling (Day 25)
          </button>

          <button 
            onClick={() => treeRef.current?.setDay(60)}
            className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            🌳 Young Tree (Day 60)
          </button>

          <button 
            onClick={() => treeRef.current?.setDay(120)}
            className="px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            🌲 Mature Tree (Day 120)
          </button>

          <button 
            onClick={() => treeRef.current?.setDay(250)}
            className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            🎋 Ancient Tree (Day 250)
          </button>

          <button 
            onClick={() => treeRef.current?.setDay(500)}
            className="px-3 py-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/40 hover:to-pink-500/40 text-purple-200 rounded-lg text-xs font-medium transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
          >
            ✨ Mystic Tree (Day 500)
          </button>

          <div className="border-t border-white/20 my-2"></div>

          <button 
            onClick={() => treeRef.current?.waterTree()}
            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            💧 Water Tree
          </button>

          <button 
            onClick={() => treeRef.current?.addBird()}
            className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            🐦 Add Bird
          </button>

          <button 
            onClick={() => treeRef.current?.addButterfly()}
            className="px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            🦋 Add Butterfly
          </button>

          <div className="border-t border-white/20 my-2"></div>

          <button 
            onClick={() => treeRef.current?.setWeather('rain', 0.7)}
            className="px-3 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            🌧️ Rain
          </button>

          <button 
            onClick={() => treeRef.current?.setWeather('clear', 0)}
            className="px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-lg text-xs font-medium transition-all hover:scale-105"
          >
            ☀️ Clear
          </button>
        </div>
      )}
    </div>
  );
}