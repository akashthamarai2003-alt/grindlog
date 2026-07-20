"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getMaxUserStreak } from '@/app/actions/habits';

/**
 * ═══════════════════════════════════════════════════════════
 *  TREE OF LIFE - ULTRA REALISTIC ANIMATION ENGINE v2.0
 *  Performance: 60fps on mobile | Realistic physics | Smooth growth
 * ═══════════════════════════════════════════════════════════
 */

interface TreeConfig {
  performanceMode: 'high' | 'medium' | 'low';
  particleLimit: number;
  enablePhysics: boolean;
  enableWeather: boolean;
}

interface Branch {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
  length: number;
  thickness: number;
  depth: number;
  children: Branch[];
  growthProgress: number;
  swayOffset: number;
  baseAngle: number;
}

interface Leaf {
  x: number;
  y: number;
  size: number;
  rotation: number;
  baseRotation: number;
  swayPhase: number;
  color: string;
  alpha: number;
  branchId: number;
  age: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'sparkle' | 'water' | 'leaf' | 'petal' | 'magic';
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  alpha: number;
}

interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  wingPhase: number;
  size: number;
  color: string;
  perched: boolean;
  restTimer: number;
}

interface Butterfly {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  wingPhase: number;
  size: number;
  colors: [string, string];
  movePhase: number;
  speed: number;
}

export class TreeOfLife {
  // Canvas & Context
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private dpr: number;

  // Performance
  private animationId: number = 0;
  private lastFrameTime: number = 0;
  private fps: number = 60;
  private deltaTime: number = 0;
  private config: TreeConfig;

  // Game State
  public day: number;
  public habitCount: number;
  public stage: 'seed' | 'sprout' | 'sapling' | 'tree' | 'grand' | 'ancient' | 'mythical';

  // Tree Structure
  private tree: {
    x: number;
    y: number;
    rootBranch: Branch | null;
    allBranches: Branch[];
    leaves: Leaf[];
    growth: number;
    targetGrowth: number;
    health: number;
    age: number;
  };

  // Animation Properties
  private time: number = 0;
  private wind: {
    strength: number;
    direction: number;
    turbulence: number;
    phase: number;
  };

  private weather: {
    type: 'clear' | 'rain' | 'snow' | 'storm';
    intensity: number;
    particles: Particle[];
  };

  // Entities
  private particles: Particle[] = [];
  private birds: Bird[] = [];
  private butterflies: Butterfly[] = [];

  // Effects
  private camera: {
    x: number;
    y: number;
    zoom: number;
    targetZoom: number;
    shake: number;
  };

  private lighting: {
    timeOfDay: number;
    sunX: number;
    sunY: number;
    ambient: number;
    shadows: boolean;
  };

  // Touch & Interaction
  private touches: Map<number, { x: number; y: number }> = new Map();
  private isInteracting: boolean = false;

  constructor(canvas: HTMLCanvasElement, initialDay: number = 1) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    });
    
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    // Performance config based on device
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.config = this.detectPerformanceLevel();

    this.day = initialDay;
    this.habitCount = 0;
    this.stage = this.calculateStage(initialDay);

    // Initialize tree
    this.tree = {
      x: 0,
      y: 0,
      rootBranch: null,
      allBranches: [],
      leaves: [],
      growth: 0,
      targetGrowth: this.getTargetGrowth(),
      health: 1,
      age: 0
    };

    // Initialize wind
    this.wind = {
      strength: 0.3,
      direction: 0,
      turbulence: 0,
      phase: 0
    };

    // Initialize weather
    this.weather = {
      type: 'clear',
      intensity: 0,
      particles: []
    };

    // Initialize camera
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1,
      targetZoom: 1,
      shake: 0
    };

    // Initialize lighting
    this.lighting = {
      timeOfDay: 0.5,
      sunX: 0,
      sunY: 0,
      ambient: 1,
      shadows: true
    };

    this.init();
  }

  // ═══════════════════════════════════════════════════════════
  //  INITIALIZATION
  // ═══════════════════════════════════════════════════════════

  private init(): void {
    this.setupCanvas();
    this.setupEventListeners();
    this.generateTree();
    this.startAnimation();
  }

  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    
    this.ctx.scale(this.dpr, this.dpr);
    
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    // Tree position
    this.tree.x = this.width / 2;
    this.tree.y = this.height - 80;
  }

  private detectPerformanceLevel(): TreeConfig {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasGoodGPU = this.dpr >= 2;
    
    if (isMobile) {
      return {
        performanceMode: 'medium',
        particleLimit: 100,
        enablePhysics: true,
        enableWeather: false
      };
    }

    return {
      performanceMode: 'high',
      particleLimit: 300,
      enablePhysics: true,
      enableWeather: true
    };
  }

  private calculateStage(day: number): typeof this.stage {
    if (day >= 500) return 'mythical';
    if (day >= 365) return 'ancient';
    if (day >= 180) return 'grand';
    if (day >= 60) return 'tree';
    if (day >= 20) return 'sapling';
    if (day >= 5) return 'sprout';
    return 'seed';
  }

  private getTargetGrowth(): number {
    const stageGrowth = {
      seed: 0.05,
      sprout: 0.25,
      sapling: 0.5,
      tree: 0.75,
      grand: 0.9,
      ancient: 1.0,
      mythical: 1.2
    };
    return stageGrowth[this.stage];
  }

  // ═══════════════════════════════════════════════════════════
  //  TREE GENERATION (RECURSIVE FRACTAL)
  // ═══════════════════════════════════════════════════════════

  private generateTree(): void {
    this.tree.allBranches = [];
    this.tree.leaves = [];

    const trunkHeight = this.getTreeHeight();
    const trunkThickness = this.getTreeThickness();

    // Create root branch
    this.tree.rootBranch = this.createBranch(
      this.tree.x,
      this.tree.y,
      -Math.PI / 2,
      trunkHeight,
      trunkThickness,
      0
    );

    this.tree.allBranches.push(this.tree.rootBranch);
    this.generateBranches(this.tree.rootBranch);
    this.generateLeaves();
  }

  private createBranch(
    x: number,
    y: number,
    angle: number,
    length: number,
    thickness: number,
    depth: number
  ): Branch {
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    return {
      startX: x,
      startY: y,
      endX,
      endY,
      angle,
      length,
      thickness,
      depth,
      children: [],
      growthProgress: 0,
      swayOffset: 0,
      baseAngle: angle
    };
  }

  private generateBranches(parent: Branch): void {
    const maxDepth = this.getBranchDepth();
    if (parent.depth >= maxDepth) return;

    const branchCount = parent.depth === 0 ? 3 : 2;
    const angleVariation = 0.4 + Math.random() * 0.3;

    for (let i = 0; i < branchCount; i++) {
      const angleOffset = (i - (branchCount - 1) / 2) * angleVariation;
      const newAngle = parent.angle + angleOffset;
      const lengthRatio = 0.65 + Math.random() * 0.15;
      const newLength = parent.length * lengthRatio;
      const newThickness = parent.thickness * 0.7;

      if (newLength < 5) continue;

      const childBranch = this.createBranch(
        parent.endX,
        parent.endY,
        newAngle,
        newLength,
        newThickness,
        parent.depth + 1
      );

      parent.children.push(childBranch);
      this.tree.allBranches.push(childBranch);
      this.generateBranches(childBranch);
    }
  }

  private generateLeaves(): void {
    this.tree.leaves = [];
    
    const leafDensity = this.getLeafDensity();
    
    this.tree.allBranches.forEach((branch, branchId) => {
      if (branch.depth < this.getBranchDepth() - 2) return;

      const leafCount = Math.floor(leafDensity * (1 + Math.random()));
      
      for (let i = 0; i < leafCount; i++) {
        const t = 0.3 + Math.random() * 0.7;
        const x = branch.startX + (branch.endX - branch.startX) * t;
        const y = branch.startY + (branch.endY - branch.startY) * t;
        
        const offset = (Math.random() - 0.5) * 20;
        
        this.tree.leaves.push({
          x: x + offset,
          y: y + offset,
          size: 8 + Math.random() * 8,
          rotation: Math.random() * 360,
          baseRotation: Math.random() * 360,
          swayPhase: Math.random() * Math.PI * 2,
          color: this.getLeafColor(),
          alpha: 0.8 + Math.random() * 0.2,
          branchId,
          age: 0
        });
      }
    });
  }

  private getTreeHeight(): number {
    const heights = {
      seed: 0,
      sprout: 30,
      sapling: 60,
      tree: 90,
      grand: 130,
      ancient: 170,
      mythical: 220
    };
    return heights[this.stage];
  }

  private getTreeThickness(): number {
    const thickness = {
      seed: 0,
      sprout: 3,
      sapling: 5,
      tree: 10,
      grand: 14,
      ancient: 18,
      mythical: 22
    };
    return thickness[this.stage];
  }

  private getBranchDepth(): number {
    const depths = {
      seed: 0,
      sprout: 1,
      sapling: 2,
      tree: 3,
      grand: 4,
      ancient: 5,
      mythical: 6
    };
    return depths[this.stage];
  }

  private getLeafDensity(): number {
    const density = {
      seed: 0,
      sprout: 1,
      sapling: 2,
      tree: 4,
      grand: 5,
      ancient: 7,
      mythical: 9
    };
    return density[this.stage];
  }

  private getLeafColor(): string {
    const colors = [
      'hsl(120, 60%, 40%)',
      'hsl(115, 65%, 38%)',
      'hsl(125, 58%, 42%)',
      'hsl(110, 62%, 35%)',
      'hsl(130, 55%, 45%)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ═══════════════════════════════════════════════════════════
  //  ANIMATION LOOP
  // ═══════════════════════════════════════════════════════════

  private startAnimation(): void {
    this.lastFrameTime = performance.now();
    this.animate();
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    const currentTime = performance.now();
    this.deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = currentTime;
    this.time += this.deltaTime;

    this.update();
    this.render();
  };

  private update(): void {
    this.updateGrowth();
    this.updateWind();
    this.updateBranches();
    this.updateLeaves();
    this.updateParticles();
    this.updateBirds();
    this.updateButterflies();
    this.updateCamera();
    this.updateLighting();
  }

  private updateGrowth(): void {
    const growthSpeed = 0.5;
    this.tree.growth += (this.tree.targetGrowth - this.tree.growth) * this.deltaTime * growthSpeed;

    // Update branch growth
    this.tree.allBranches.forEach(branch => {
      branch.growthProgress += (1 - branch.growthProgress) * this.deltaTime * growthSpeed;
    });
  }

  private updateWind(): void {
    this.wind.phase += this.deltaTime;
    this.wind.strength = 0.2 + Math.sin(this.wind.phase * 0.5) * 0.3;
    this.wind.direction = Math.sin(this.wind.phase * 0.3) * 0.5;
    this.wind.turbulence = Math.sin(this.wind.phase * 2) * 0.1;
  }

  private updateBranches(): void {
    this.tree.allBranches.forEach((branch, index) => {
      const swayAmount = this.wind.strength * (0.02 + branch.depth * 0.005);
      const swaySpeed = 1 + branch.depth * 0.2;
      
      branch.swayOffset = Math.sin(this.time * swaySpeed + index * 0.5) * swayAmount;
      branch.angle = branch.baseAngle + branch.swayOffset;
      
      // Recalculate end position
      branch.endX = branch.startX + Math.cos(branch.angle) * branch.length * branch.growthProgress;
      branch.endY = branch.startY + Math.sin(branch.angle) * branch.length * branch.growthProgress;
    });
  }

  private updateLeaves(): void {
    this.tree.leaves.forEach((leaf, index) => {
      leaf.swayPhase += this.deltaTime * (2 + index * 0.1);
      leaf.rotation = leaf.baseRotation + 
        Math.sin(leaf.swayPhase) * 15 * this.wind.strength +
        this.wind.direction * 10;
      
      leaf.age += this.deltaTime;
    });
  }

  private updateParticles(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.life -= this.deltaTime;
      p.x += p.vx * this.deltaTime;
      p.y += p.vy * this.deltaTime;
      p.vy += p.gravity * this.deltaTime;
      p.rotation += p.rotationSpeed * this.deltaTime;
      p.alpha = Math.min(p.life / p.maxLife, 1);

      // Wind effect
      p.vx += this.wind.direction * this.wind.strength * 50 * this.deltaTime;

      if (p.life <= 0 || p.y > this.height + 100) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateBirds(): void {
    this.birds.forEach(bird => {
      if (!bird.perched) {
        const dx = bird.targetX - bird.x;
        const dy = bird.targetY - bird.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 20) {
          bird.perched = true;
          bird.vx = 0;
          bird.vy = 0;
          bird.restTimer = 3 + Math.random() * 4;
        } else {
          bird.vx = (dx / dist) * 100;
          bird.vy = (dy / dist) * 100;
        }
      } else {
        bird.restTimer -= this.deltaTime;
        if (bird.restTimer <= 0) {
          bird.perched = false;
          bird.targetX = this.tree.x + (Math.random() - 0.5) * 200;
          bird.targetY = this.tree.y - 100 - Math.random() * 150;
        }
      }

      bird.x += bird.vx * this.deltaTime;
      bird.y += bird.vy * this.deltaTime;
      bird.wingPhase += this.deltaTime * (bird.perched ? 2 : 15);
    });
  }

  private updateButterflies(): void {
    this.butterflies.forEach(butterfly => {
      butterfly.movePhase += this.deltaTime * butterfly.speed;
      
      const dx = butterfly.targetX - butterfly.x;
      const dy = butterfly.targetY - butterfly.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 30 || Math.random() < 0.01) {
        butterfly.targetX = this.tree.x + (Math.random() - 0.5) * 300;
        butterfly.targetY = this.tree.y - 50 - Math.random() * 200;
      }

      butterfly.x += Math.sin(butterfly.movePhase) * 30 * this.deltaTime + (dx / dist) * 20 * this.deltaTime;
      butterfly.y += Math.cos(butterfly.movePhase * 1.3) * 20 * this.deltaTime + (dy / dist) * 20 * this.deltaTime;
      butterfly.wingPhase += this.deltaTime * 25;
    });
  }

  private updateCamera(): void {
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * this.deltaTime * 2;
    this.camera.shake *= Math.pow(0.9, this.deltaTime * 60);
    
    if (this.camera.shake > 0.1) {
      this.camera.x = (Math.random() - 0.5) * this.camera.shake;
      this.camera.y = (Math.random() - 0.5) * this.camera.shake;
    } else {
      this.camera.x *= Math.pow(0.95, this.deltaTime * 60);
      this.camera.y *= Math.pow(0.95, this.deltaTime * 60);
    }
  }

  private updateLighting(): void {
    this.lighting.timeOfDay = (Math.sin(this.time * 0.1) + 1) / 2;
    this.lighting.sunX = this.width * (0.2 + this.lighting.timeOfDay * 0.6);
    this.lighting.sunY = 100 + Math.sin(this.lighting.timeOfDay * Math.PI) * 50;
    this.lighting.ambient = 0.6 + this.lighting.timeOfDay * 0.4;
  }
    // ═══════════════════════════════════════════════════════════
  //  RENDERING SYSTEM
  // ═══════════════════════════════════════════════════════════

  private render(): void {
    const ctx = this.ctx;
    
    // Clear canvas
    ctx.clearRect(0, 0, this.width, this.height);
    
    // Apply camera transform
    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    
    // Render layers (back to front)
    this.renderSky();
    this.renderClouds();
    this.renderMountains();
    this.renderGround();
    this.renderShadows();
    this.renderTree();
    this.renderParticles();
    this.renderCreatures();
    this.renderWeatherEffects();
    this.renderMagicalEffects();
    
    ctx.restore();
    
    // UI layer (no camera transform)
    this.renderUI();
  }

  // ═══════════════════════════════════════════════════════════
  //  BACKGROUND RENDERING
  // ═══════════════════════════════════════════════════════════

  private renderSky(): void {
    const ctx = this.ctx;
    const tod = this.lighting.timeOfDay;
    
    // Dynamic sky gradient based on time of day
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    
    if (this.stage === 'mythical') {
      // Magical aurora sky
      const hue1 = 250 + Math.sin(this.time * 0.3) * 30;
      const hue2 = 280 + Math.cos(this.time * 0.2) * 30;
      gradient.addColorStop(0, `hsl(${hue1}, 70%, ${20 + tod * 15}%)`);
      gradient.addColorStop(0.3, `hsl(${hue2}, 65%, ${30 + tod * 15}%)`);
      gradient.addColorStop(0.6, `hsl(${hue1 + 20}, 60%, ${40 + tod * 10}%)`);
      gradient.addColorStop(1, `hsl(30, 40%, 25%)`);
    } else {
      // Natural sky
      const isDay = tod > 0.3;
      if (isDay) {
        // Day sky
        gradient.addColorStop(0, `hsl(210, ${60 + tod * 20}%, ${60 + tod * 25}%)`);
        gradient.addColorStop(0.4, `hsl(200, ${50 + tod * 15}%, ${70 + tod * 20}%)`);
        gradient.addColorStop(0.7, `hsl(190, 45%, 80%)`);
        gradient.addColorStop(1, `hsl(35, 35%, 55%)`);
      } else {
        // Night sky
        const nightIntensity = 1 - tod * 3;
        gradient.addColorStop(0, `hsl(230, 50%, ${10 + tod * 15}%)`);
        gradient.addColorStop(0.5, `hsl(240, 45%, ${15 + tod * 10}%)`);
        gradient.addColorStop(1, `hsl(30, 30%, 20%)`);
      }
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Stars at night
    if (tod < 0.3) {
      this.renderStars();
    }
    
    // Sun or Moon
    this.renderCelestialBody();
  }

  private renderStars(): void {
    const ctx = this.ctx;
    const starCount = this.stage === 'mythical' ? 80 : 50;
    const twinkleSpeed = 3;
    
    for (let i = 0; i < starCount; i++) {
      // Deterministic positioning
      const x = (i * 137.508) % this.width;
      const y = (i * 73.331) % (this.height * 0.5);
      const twinkle = (Math.sin(this.time * twinkleSpeed + i * 0.5) + 1) / 2;
      const brightness = 0.3 + twinkle * 0.7;
      const size = 1 + twinkle * 1.5;
      
      // Star glow
      const starGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      starGlow.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
      starGlow.addColorStop(0.5, `rgba(200, 220, 255, ${brightness * 0.5})`);
      starGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = starGlow;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Star core
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderCelestialBody(): void {
    const ctx = this.ctx;
    const x = this.lighting.sunX;
    const y = this.lighting.sunY;
    const isDay = this.lighting.timeOfDay > 0.3;
    
    if (isDay) {
      // Sun
      const sunSize = 45;
      const pulseSize = sunSize + Math.sin(this.time * 2) * 3;
      
      // Sun rays
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(this.time * 0.1);
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const rayLength = pulseSize + 15;
        
        ctx.fillStyle = 'rgba(255, 230, 150, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angle) * rayLength,
          Math.sin(angle) * rayLength
        );
        ctx.lineTo(
          Math.cos(angle + 0.2) * (rayLength * 0.7),
          Math.sin(angle + 0.2) * (rayLength * 0.7)
        );
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      
      // Sun glow
      const sunGlow = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 2);
      sunGlow.addColorStop(0, 'rgba(255, 255, 220, 0.8)');
      sunGlow.addColorStop(0.3, 'rgba(255, 230, 150, 0.5)');
      sunGlow.addColorStop(0.6, 'rgba(255, 200, 100, 0.2)');
      sunGlow.addColorStop(1, 'rgba(255, 180, 80, 0)');
      
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun body
      const sunGrad = ctx.createRadialGradient(x - 10, y - 10, 0, x, y, pulseSize);
      sunGrad.addColorStop(0, '#FFFFEE');
      sunGrad.addColorStop(0.5, '#FFE66D');
      sunGrad.addColorStop(1, '#FFA500');
      
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Moon
      const moonSize = 35;
      
      // Moon glow
      const moonGlow = ctx.createRadialGradient(x, y, 0, x, y, moonSize * 2);
      moonGlow.addColorStop(0, 'rgba(240, 240, 255, 0.6)');
      moonGlow.addColorStop(0.5, 'rgba(200, 210, 230, 0.3)');
      moonGlow.addColorStop(1, 'rgba(180, 190, 210, 0)');
      
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(x, y, moonSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Moon body
      const moonGrad = ctx.createRadialGradient(x - 8, y - 8, 0, x, y, moonSize);
      moonGrad.addColorStop(0, '#F5F5FF');
      moonGrad.addColorStop(0.7, '#E0E0F0');
      moonGrad.addColorStop(1, '#C0C0D0');
      
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(x, y, moonSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Moon craters
      ctx.fillStyle = 'rgba(100, 100, 120, 0.2)';
      ctx.beginPath();
      ctx.arc(x - 10, y - 8, 6, 0, Math.PI * 2);
      ctx.arc(x + 8, y + 5, 4, 0, Math.PI * 2);
      ctx.arc(x + 2, y - 12, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Moon shadow (crescent effect)
      if (this.lighting.timeOfDay < 0.15) {
        ctx.fillStyle = 'rgba(20, 20, 40, 0.3)';
        ctx.beginPath();
        ctx.arc(x + 12, y, moonSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderClouds(): void {
    const ctx = this.ctx;
    const cloudCount = 5;
    const baseSpeed = 8;
    
    for (let i = 0; i < cloudCount; i++) {
      const speed = baseSpeed * (0.8 + i * 0.1);
      const x = ((this.time * speed + i * 180) % (this.width + 400)) - 200;
      const y = 60 + i * 35 + Math.sin(this.time * 0.5 + i) * 15;
      const scale = 0.8 + i * 0.15;
      const alpha = 0.4 + this.lighting.timeOfDay * 0.5 - i * 0.05;
      
      this.drawCloud(x, y, scale, alpha);
    }
  }

  private drawCloud(x: number, y: number, scale: number, alpha: number): void {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    
    // Cloud color based on time of day
    const cloudColor = this.lighting.timeOfDay > 0.3 
      ? `rgba(255, 255, 255, ${alpha})`
      : `rgba(150, 160, 180, ${alpha * 0.6})`;
    
    // Multiple overlapping circles for fluffy cloud
    const circles = [
      { x: 0, y: 0, r: 35 },
      { x: 30, y: -5, r: 40 },
      { x: 60, y: 0, r: 35 },
      { x: 20, y: -20, r: 30 },
      { x: 40, y: -18, r: 28 }
    ];
    
    circles.forEach(circle => {
      const gradient = ctx.createRadialGradient(
        x + circle.x * scale, 
        y + circle.y * scale, 
        0,
        x + circle.x * scale, 
        y + circle.y * scale, 
        circle.r * scale
      );
      
      gradient.addColorStop(0, cloudColor);
      gradient.addColorStop(0.7, cloudColor);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        x + circle.x * scale,
        y + circle.y * scale,
        circle.r * scale,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    ctx.restore();
  }

  private renderMountains(): void {
    if (this.stage === 'seed' || this.stage === 'sprout') return;
    
    const ctx = this.ctx;
    
    // Distant mountains (parallax)
    for (let layer = 0; layer < 3; layer++) {
      const peaks = 5;
      const baseY = this.height - 200 + layer * 30;
      const alpha = 0.15 - layer * 0.04;
      const hue = 210 - layer * 20;
      
      ctx.fillStyle = `hsla(${hue}, 30%, ${40 - layer * 10}%, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, this.height);
      
      for (let i = 0; i <= peaks; i++) {
        const x = (i / peaks) * this.width;
        const peakHeight = 60 + Math.sin(i * 1.5 + layer) * 40;
        const y = baseY - peakHeight;
        
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = ((i - 1) / peaks) * this.width;
          const controlX = (prevX + x) / 2;
          const controlY = y - 20;
          ctx.quadraticCurveTo(controlX, controlY, x, y);
        }
      }
      
      ctx.lineTo(this.width, this.height);
      ctx.closePath();
      ctx.fill();
    }
  }

  private renderGround(): void {
    const ctx = this.ctx;
    const groundY = this.height - 120;
    
    // Ground gradient
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, this.height);
    groundGrad.addColorStop(0, '#4A3828');
    groundGrad.addColorStop(0.3, '#5C4A35');
    groundGrad.addColorStop(0.6, '#3E2F20');
    groundGrad.addColorStop(1, '#2D1F15');
    
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, this.width, this.height - groundY);
    
    // Grass layer
    this.renderGrass(groundY);
    
    // Ground texture (small stones and details)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 0; i < 60; i++) {
      const x = (i * 47.1234) % this.width;
      const y = groundY + 20 + (i * 23.456) % 80;
      const size = 1 + (i % 4);
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Flowers and mushrooms for advanced stages
    if (this.stage === 'grand' || this.stage === 'ancient' || this.stage === 'mythical') {
      this.renderGroundFlora(groundY);
    }
  }

  private renderGrass(groundY: number): void {
    const ctx = this.ctx;
    const grassCount = 80;
    
    for (let i = 0; i < grassCount; i++) {
      const x = (i / grassCount) * this.width;
      const baseHeight = 12 + Math.sin(i * 0.5) * 8;
      const sway = Math.sin(this.time * 2 + i * 0.3) * 4 * this.wind.strength;
      const y = groundY;
      
      // Grass blade with gradient
      const grassGrad = ctx.createLinearGradient(x, y, x + sway, y - baseHeight);
      grassGrad.addColorStop(0, `hsl(${90 + Math.sin(i) * 15}, 45%, 30%)`);
      grassGrad.addColorStop(0.5, `hsl(${100 + Math.sin(i) * 15}, 55%, 40%)`);
      grassGrad.addColorStop(1, `hsl(${110 + Math.sin(i) * 15}, 60%, 45%)`);
      
      ctx.strokeStyle = grassGrad;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + sway * 0.5,
        y - baseHeight * 0.6,
        x + sway,
        y - baseHeight
      );
      ctx.stroke();
      
      // Second blade (slightly offset)
      if (i % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(x + 2, y);
        ctx.quadraticCurveTo(
          x + 2 + sway * 0.4,
          y - baseHeight * 0.5,
          x + 2 + sway * 0.8,
          y - baseHeight * 0.8
        );
        ctx.stroke();
      }
    }
  }

  private renderGroundFlora(groundY: number): void {
    const ctx = this.ctx;
    const floraCount = 25;
    
    for (let i = 0; i < floraCount; i++) {
      const x = (i * 73.5) % this.width;
      const y = groundY + (i * 13.7) % 40 - 20;
      const type = i % 4;
      
      ctx.save();
      ctx.translate(x, y);
      
      switch(type) {
        case 0:
          this.drawWildflower(i);
          break;
        case 1:
          this.drawMushroom(i);
          break;
        case 2:
          this.drawFern(i);
          break;
        case 3:
          this.drawSmallBush(i);
          break;
      }
      
      ctx.restore();
    }
  }

  private drawWildflower(seed: number): void {
    const ctx = this.ctx;
    const sway = Math.sin(this.time * 2 + seed) * 2;
    const hue = (seed * 47) % 360;
    
    // Stem
    ctx.strokeStyle = `hsl(110, 50%, 35%)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway, -10, sway * 1.2, -18);
    ctx.stroke();
    
    // Petals
    const petalCount = 5;
    const centerX = sway * 1.2;
    const centerY = -18;
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + this.time * 0.5;
      const px = centerX + Math.cos(angle) * 4;
      const py = centerY + Math.sin(angle) * 4;
      
      const petalGrad = ctx.createRadialGradient(px, py, 0, px, py, 3);
      petalGrad.addColorStop(0, `hsl(${hue}, 80%, 70%)`);
      petalGrad.addColorStop(1, `hsl(${hue}, 70%, 50%)`);
      
      ctx.fillStyle = petalGrad;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Center
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawMushroom(seed: number): void {
    const ctx = this.ctx;
    const hue = seed % 2 === 0 ? 0 : 120;
    
    // Stem
    const stemGrad = ctx.createLinearGradient(-2, 0, 2, -8);
    stemGrad.addColorStop(0, '#F5F5DC');
    stemGrad.addColorStop(1, '#E8E8D0');
    
    ctx.fillStyle = stemGrad;
    ctx.fillRect(-2, -8, 4, 8);
    
    // Cap
    const capGrad = ctx.createRadialGradient(0, -10, 0, 0, -10, 7);
    capGrad.addColorStop(0, `hsl(${hue}, 60%, 50%)`);
    capGrad.addColorStop(0.7, `hsl(${hue}, 65%, 45%)`);
    capGrad.addColorStop(1, `hsl(${hue}, 50%, 35%)`);
    
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.ellipse(0, -10, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Spots (if red mushroom)
    if (hue === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(-3, -11, 1.5, 0, Math.PI * 2);
      ctx.arc(2, -9, 1, 0, Math.PI * 2);
      ctx.arc(0, -12, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawFern(seed: number): void {
    const ctx = this.ctx;
    const sway = Math.sin(this.time * 1.5 + seed) * 1.5;
    
    ctx.strokeStyle = '#2F5233';
    ctx.lineWidth = 1.5;
    
    // Main stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway, -12, sway * 1.3, -22);
    ctx.stroke();
    
    // Fronds
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 6; i++) {
      const y = -4 * i;
      const length = 8 - i;
      const swayOffset = sway * (i / 6);
      
      // Left frond
      ctx.beginPath();
      ctx.moveTo(swayOffset, y);
      ctx.lineTo(swayOffset - length, y - 2);
      ctx.stroke();
      
      // Right frond
      ctx.beginPath();
      ctx.moveTo(swayOffset, y);
      ctx.lineTo(swayOffset + length, y - 2);
      ctx.stroke();
    }
  }

  private drawSmallBush(seed: number): void {
    const ctx = this.ctx;
    const hue = 100 + seed * 10;
    
    // Multiple overlapping circles for bush effect
    for (let i = 0; i < 4; i++) {
      const x = (Math.sin(seed + i) * 6);
      const y = -4 - i * 2;
      const size = 5 - i * 0.5;
      
      const bushGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
      bushGrad.addColorStop(0, `hsl(${hue}, 50%, 35%)`);
      bushGrad.addColorStop(1, `hsl(${hue}, 45%, 25%)`);
      
      ctx.fillStyle = bushGrad;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderShadows(): void {
    if (!this.lighting.shadows) return;
    
    const ctx = this.ctx;
    const shadowLength = 40 * (1 - this.lighting.timeOfDay);
    const shadowAngle = (this.lighting.sunX - this.tree.x) / this.width;
    
    // Tree shadow
    ctx.save();
    ctx.globalAlpha = 0.3 * (1 - this.lighting.timeOfDay);
    ctx.fillStyle = '#000000';
    
    ctx.translate(this.tree.x, this.tree.y);
    ctx.scale(1 + shadowLength / 50, 0.3);
    ctx.translate(shadowAngle * shadowLength, 0);
    
    // Simplified shadow shape
    ctx.beginPath();
    ctx.ellipse(0, 0, 30 * this.tree.growth, 20 * this.tree.growth, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════
  //  TREE RENDERING
  // ═══════════════════════════════════════════════════════════

  private renderTree(): void {
    if (this.stage === 'seed') {
      this.renderSeed();
    } else {
      this.renderTrunk();
      this.renderBranches();
      this.renderLeaves();
      
      if (this.stage === 'mythical') {
        this.renderMythicalEffects();
      }
    }
  }

  private renderSeed(): void {
    const ctx = this.ctx;
    const x = this.tree.x;
    const y = this.tree.y;
    const pulse = Math.sin(this.time * 3) * 2;
    const glowSize = 40 + pulse;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Magical glow
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
    glowGrad.addColorStop(0, 'rgba(255, 220, 150, 0.6)');
    glowGrad.addColorStop(0.5, 'rgba(255, 180, 100, 0.3)');
    glowGrad.addColorStop(1, 'rgba(255, 150, 80, 0)');
    
    ctx.fillStyle = glowGrad;
    ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);
    
    // Seed shell gradient
    const seedGrad = ctx.createRadialGradient(-8, -10, 0, 0, 0, 22);
    seedGrad.addColorStop(0, '#B8956A');
    seedGrad.addColorStop(0.6, '#8B6F47');
    seedGrad.addColorStop(1, '#654321');
    
    ctx.fillStyle = seedGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 + pulse * 0.3, 22 + pulse * 0.3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-7, -9, 5, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Shell texture lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 10 + i * 5, 0.5, 2.5);
      ctx.stroke();
    }
    
    // Sparkle particles
    if (Math.random() < 0.1) {
      this.createMagicParticle(x, y, 'sparkle');
    }
    
    ctx.restore();
  }

  private renderTrunk(): void {
    if (this.tree.rootBranch && this.tree.rootBranch.depth === 0) {
      this.drawBranch(this.tree.rootBranch, true);
    }
  }

  private renderBranches(): void {
    const ctx = this.ctx;
    
    // Draw branches depth-first for proper layering
    this.tree.allBranches.forEach(branch => {
      if (branch.depth > 0) {
        this.drawBranch(branch, false);
      }
    });
  }

  private drawBranch(branch: Branch, isTrunk: boolean): void {
    const ctx = this.ctx;
    
    if (branch.growthProgress < 0.01) return;
    
    const startX = branch.startX;
    const startY = branch.startY;
    const endX = branch.endX;
    const endY = branch.endY;
    const progress = branch.growthProgress;
    
    const currentEndX = startX + (endX - startX) * progress;
    const currentEndY = startY + (endY - startY) * progress;
    
    ctx.save();
    
    // Branch gradient (bark texture)
    if (this.config.performanceMode === 'medium') {
      ctx.strokeStyle = isTrunk ? '#6F4E37' : `hsl(25, 40%, ${35 - branch.depth * 2}%)`;
    } else {
      const gradient = ctx.createLinearGradient(startX, startY, currentEndX, currentEndY);
      
      if (isTrunk) {
        gradient.addColorStop(0, '#5C4033');
        gradient.addColorStop(0.3, '#6F4E37');
        gradient.addColorStop(0.7, '#8B6F47');
        gradient.addColorStop(1, '#7A5C42');
      } else {
        const lightness = 35 - branch.depth * 2;
        gradient.addColorStop(0, `hsl(25, 40%, ${lightness}%)`);
        gradient.addColorStop(0.5, `hsl(30, 45%, ${lightness + 5}%)`);
        gradient.addColorStop(1, `hsl(25, 40%, ${lightness}%)`);
      }
      
      ctx.strokeStyle = gradient;
    }
    ctx.lineWidth = branch.thickness * progress;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw branch
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(currentEndX, currentEndY);
    ctx.stroke();
    
    // Add bark texture for thicker branches
    if (branch.thickness > 8 && isTrunk && this.config.performanceMode !== 'medium') {
      this.addBarkTexture(startX, startY, currentEndX, currentEndY, branch.thickness);
    }
    
    ctx.restore();
  }

  private addBarkTexture(startX: number, startY: number, endX: number, endY: number, thickness: number): void {
    const ctx = this.ctx;
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);
    
    // Bark lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 0.5;
    
    const lineCount = Math.floor(length / 15);
    for (let i = 0; i < lineCount; i++) {
      const x = (i / lineCount) * length;
      const offset = Math.sin(i * 0.7) * (thickness * 0.2);
      
      ctx.beginPath();
      ctx.moveTo(x, -thickness / 2 + offset);
      ctx.lineTo(x, thickness / 2 + offset);
      ctx.stroke();
    }
    
    // Bark knots
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    const knotCount = Math.floor(length / 40);
    for (let i = 0; i < knotCount; i++) {
      const x = (Math.random() * length);
      const y = (Math.random() - 0.5) * thickness * 0.6;
      const size = 2 + Math.random() * 3;
      
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 1.3, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
    private renderLeaves(): void {
    const ctx = this.ctx;
    
    this.tree.leaves.forEach(leaf => {
      this.drawLeaf(leaf);
    });
  }

  private drawLeaf(leaf: Leaf): void {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate((leaf.rotation * Math.PI) / 180);
    ctx.globalAlpha = leaf.alpha;
    
    const baseHue = 115;
    const hueVariation = (leaf.branchId * 5) % 20 - 10;

    if (this.config.performanceMode !== 'medium') {
      // Leaf shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(1, 1, leaf.size * 0.6, leaf.size, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Leaf gradient for depth
      const leafGrad = ctx.createRadialGradient(
        -leaf.size * 0.3, -leaf.size * 0.4, 0,
        0, 0, leaf.size
      );
      
      leafGrad.addColorStop(0, `hsl(${baseHue + hueVariation + 15}, 65%, 50%)`);
      leafGrad.addColorStop(0.4, `hsl(${baseHue + hueVariation}, 60%, 42%)`);
      leafGrad.addColorStop(0.8, `hsl(${baseHue + hueVariation - 10}, 55%, 35%)`);
      leafGrad.addColorStop(1, `hsl(${baseHue + hueVariation - 15}, 50%, 28%)`);
      
      ctx.fillStyle = leafGrad;
    } else {
      ctx.fillStyle = `hsl(${baseHue + hueVariation}, 60%, 42%)`;
    }
    
    // Leaf shape (realistic)
    ctx.beginPath();
    ctx.moveTo(0, -leaf.size);
    ctx.bezierCurveTo(
      leaf.size * 0.7, -leaf.size * 0.7,
      leaf.size * 0.7, leaf.size * 0.3,
      0, leaf.size
    );
    ctx.bezierCurveTo(
      -leaf.size * 0.7, leaf.size * 0.3,
      -leaf.size * 0.7, -leaf.size * 0.7,
      0, -leaf.size
    );
    ctx.closePath();
    ctx.fill();
    
    if (this.config.performanceMode !== 'medium') {
      // Leaf veins
      ctx.strokeStyle = 'rgba(0, 100, 0, 0.3)';
      ctx.lineWidth = 0.5;
      
      // Central vein
      ctx.beginPath();
      ctx.moveTo(0, -leaf.size);
      ctx.lineTo(0, leaf.size);
      ctx.stroke();
      
      // Side veins
      const veinCount = 4;
      for (let i = 1; i <= veinCount; i++) {
        const t = i / (veinCount + 1);
        const y = -leaf.size + t * leaf.size * 2;
        const veinLength = leaf.size * 0.5 * (1 - Math.abs(t - 0.5) * 2);
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(veinLength, y + veinLength * 0.3);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(-veinLength, y + veinLength * 0.3);
        ctx.stroke();
      }
      
      // Leaf highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(-leaf.size * 0.3, -leaf.size * 0.5, leaf.size * 0.25, leaf.size * 0.4, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════
  //  PARTICLE SYSTEM
  // ═══════════════════════════════════════════════════════════

  private renderParticles(): void {
    this.particles.forEach(particle => {
      this.drawParticle(particle);
    });
  }

  private drawParticle(p: Particle): void {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    
    switch(p.type) {
      case 'sparkle':
        this.drawSparkleParticle(p);
        break;
      case 'water':
        this.drawWaterParticle(p);
        break;
      case 'leaf':
        this.drawLeafParticle(p);
        break;
      case 'petal':
        this.drawPetalParticle(p);
        break;
      case 'magic':
        this.drawMagicParticle(p);
        break;
    }
    
    ctx.restore();
  }

  private drawSparkleParticle(p: Particle): void {
    const ctx = this.ctx;
    const size = p.size;
    
    // Glow
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 4);
    glowGrad.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    glowGrad.addColorStop(0.5, 'rgba(255, 220, 100, 0.4)');
    glowGrad.addColorStop(1, 'rgba(255, 200, 0, 0)');
    
    ctx.fillStyle = glowGrad;
    ctx.fillRect(-size * 4, -size * 4, size * 8, size * 8);
    
    // Star shape
    ctx.fillStyle = '#FFE66D';
    // ctx.shadowBlur = 10;
    // ctx.shadowColor = '#FFD700';
    
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = i % 2 === 0 ? size * 2 : size * 0.8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    // ctx.shadowBlur = 0;
  }

  private drawWaterParticle(p: Particle): void {
    const ctx = this.ctx;
    const size = p.size;
    
    // Water droplet gradient
    const waterGrad = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 0, 0, 0, size);
    waterGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    waterGrad.addColorStop(0.3, 'rgba(200, 230, 255, 0.8)');
    waterGrad.addColorStop(0.7, 'rgba(100, 180, 255, 0.7)');
    waterGrad.addColorStop(1, 'rgba(50, 150, 255, 0.5)');
    
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(-size * 0.4, -size * 0.4, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.3, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawLeafParticle(p: Particle): void {
    const ctx = this.ctx;
    const size = p.size;
    
    // Simple leaf shape for particle
    const leafGrad = ctx.createLinearGradient(-size, 0, size, 0);
    leafGrad.addColorStop(0, '#228B22');
    leafGrad.addColorStop(0.5, '#32CD32');
    leafGrad.addColorStop(1, '#228B22');
    
    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Vein
    ctx.strokeStyle = 'rgba(0, 100, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.5);
    ctx.lineTo(0, size * 1.5);
    ctx.stroke();
  }

  private drawPetalParticle(p: Particle): void {
    const ctx = this.ctx;
    const size = p.size;
    
    // Petal gradient
    const petalGrad = ctx.createRadialGradient(0, -size * 0.5, 0, 0, 0, size);
    petalGrad.addColorStop(0, 'rgba(255, 200, 220, 0.9)');
    petalGrad.addColorStop(0.6, 'rgba(255, 150, 180, 0.8)');
    petalGrad.addColorStop(1, 'rgba(255, 100, 150, 0.6)');
    
    ctx.fillStyle = petalGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.7, size * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawMagicParticle(p: Particle): void {
    const ctx = this.ctx;
    const size = p.size;
    const hue = (this.time * 100 + p.x + p.y) % 360;
    
    // Magical glow
    const magicGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 3);
    magicGrad.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.8)`);
    magicGrad.addColorStop(0.5, `hsla(${hue + 30}, 90%, 60%, 0.5)`);
    magicGrad.addColorStop(1, `hsla(${hue + 60}, 80%, 50%, 0)`);
    
    ctx.fillStyle = magicGrad;
    ctx.fillRect(-size * 3, -size * 3, size * 6, size * 6);
    
    // Core
    ctx.fillStyle = `hsl(${hue}, 100%, 90%)`;
    // ctx.shadowBlur = 15;
    // ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    // ctx.shadowBlur = 0;
  }

  private createMagicParticle(x: number, y: number, type: Particle['type']): void {
    if (this.particles.length >= this.config.particleLimit) {
      this.particles.shift();
    }
    
    const configs = {
      sparkle: {
        vx: (Math.random() - 0.5) * 100,
        vy: -Math.random() * 120 - 30,
        gravity: -20,
        maxLife: 1.5,
        size: 3 + Math.random() * 3
      },
      water: {
        vx: (Math.random() - 0.5) * 60,
        vy: Math.random() * 80 - 150,
        gravity: 400,
        maxLife: 2,
        size: 6 + Math.random() * 6
      },
      leaf: {
        vx: (Math.random() - 0.5) * 80,
        vy: Math.random() * 30 + 20,
        gravity: 50,
        maxLife: 3,
        size: 5 + Math.random() * 5
      },
      petal: {
        vx: (Math.random() - 0.5) * 60,
        vy: -Math.random() * 40 - 20,
        gravity: 30,
        maxLife: 2.5,
        size: 4 + Math.random() * 4
      },
      magic: {
        vx: (Math.random() - 0.5) * 80,
        vy: -Math.random() * 100 - 50,
        gravity: -30,
        maxLife: 2,
        size: 4 + Math.random() * 5
      }
    };
    
    const config = configs[type];
    
    this.particles.push({
      x,
      y,
      vx: config.vx,
      vy: config.vy,
      life: config.maxLife,
      maxLife: config.maxLife,
      size: config.size,
      color: '#FFFFFF',
      type,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 360,
      gravity: config.gravity,
      alpha: 1
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  CREATURES - BIRDS & BUTTERFLIES
  // ═══════════════════════════════════════════════════════════

  private renderCreatures(): void {
    this.birds.forEach(bird => this.drawBird(bird));
    this.butterflies.forEach(butterfly => this.drawButterfly(butterfly));
  }

  private drawBird(bird: Bird): void {
    const ctx = this.ctx;
    const wingAngle = Math.sin(bird.wingPhase) * (bird.perched ? 10 : 50);
    
    ctx.save();
    ctx.translate(bird.x, bird.y);
    
    // Flip bird based on direction
    if (bird.vx < 0) {
      ctx.scale(-1, 1);
    }
    
    // Shadow
    if (bird.perched) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 15, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Body gradient
    const bodyGrad = ctx.createRadialGradient(-3, -2, 0, 0, 0, bird.size);
    bodyGrad.addColorStop(0, '#8B7355');
    bodyGrad.addColorStop(0.6, '#654321');
    bodyGrad.addColorStop(1, '#4A3520');
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.size * 0.7, bird.size, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    ctx.save();
    ctx.translate(-bird.size * 0.5, -bird.size * 0.3);
    ctx.rotate((wingAngle * Math.PI) / 180);
    
    const wingGrad = ctx.createLinearGradient(0, 0, -bird.size * 1.5, 0);
    wingGrad.addColorStop(0, '#654321');
    wingGrad.addColorStop(0.6, '#8B7355');
    wingGrad.addColorStop(1, 'rgba(101, 67, 33, 0.5)');
    
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(-bird.size * 0.8, 0, bird.size * 1.2, bird.size * 0.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.translate(bird.size * 0.5, -bird.size * 0.3);
    ctx.rotate((-wingAngle * Math.PI) / 180);
    
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(bird.size * 0.8, 0, bird.size * 1.2, bird.size * 0.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Head
    const headGrad = ctx.createRadialGradient(-1, -bird.size * 1.2, 0, 0, -bird.size * 1.1, bird.size * 0.5);
    headGrad.addColorStop(0, '#A0826D');
    headGrad.addColorStop(1, '#8B7355');
    
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, -bird.size * 1.1, bird.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(bird.size * 0.2, -bird.size * 1.1, bird.size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(bird.size * 0.23, -bird.size * 1.13, bird.size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(bird.size * 0.4, -bird.size * 1.1);
    ctx.lineTo(bird.size * 0.8, -bird.size * 1.15);
    ctx.lineTo(bird.size * 0.6, -bird.size * 1.0);
    ctx.closePath();
    ctx.fill();
    
    // Tail (if not perched)
    if (!bird.perched) {
      ctx.fillStyle = '#654321';
      ctx.beginPath();
      ctx.moveTo(-bird.size * 0.7, bird.size * 0.5);
      ctx.lineTo(-bird.size * 1.5, bird.size * 0.3);
      ctx.lineTo(-bird.size * 1.3, bird.size * 0.8);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }

  private drawButterfly(butterfly: Butterfly): void {
    const ctx = this.ctx;
    const wingAngle = Math.sin(butterfly.wingPhase) * 60;
    
    ctx.save();
    ctx.translate(butterfly.x, butterfly.y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Left wings
    ctx.save();
    ctx.rotate((wingAngle * Math.PI) / 180);
    
    // Top left wing
    const topWingGrad = ctx.createRadialGradient(-butterfly.size, -butterfly.size * 0.5, 0, -butterfly.size, -butterfly.size * 0.5, butterfly.size * 1.5);
    topWingGrad.addColorStop(0, butterfly.colors[0]);
    topWingGrad.addColorStop(0.7, butterfly.colors[1]);
    topWingGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    ctx.fillStyle = topWingGrad;
    ctx.beginPath();
    ctx.ellipse(-butterfly.size * 0.8, -butterfly.size * 0.8, butterfly.size, butterfly.size * 1.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Bottom left wing
    ctx.beginPath();
    ctx.ellipse(-butterfly.size * 0.7, butterfly.size * 0.5, butterfly.size * 0.8, butterfly.size * 1.1, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing patterns
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(-butterfly.size * 1.2, -butterfly.size * 0.9, butterfly.size * 0.3, 0, Math.PI * 2);
    ctx.arc(-butterfly.size * 0.6, -butterfly.size * 0.5, butterfly.size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(-butterfly.size * 0.8, butterfly.size * 0.7, butterfly.size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Right wings
    ctx.save();
    ctx.rotate((-wingAngle * Math.PI) / 180);
    
    ctx.fillStyle = topWingGrad;
    ctx.beginPath();
    ctx.ellipse(butterfly.size * 0.8, -butterfly.size * 0.8, butterfly.size, butterfly.size * 1.4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(butterfly.size * 0.7, butterfly.size * 0.5, butterfly.size * 0.8, butterfly.size * 1.1, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing patterns
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(butterfly.size * 1.2, -butterfly.size * 0.9, butterfly.size * 0.3, 0, Math.PI * 2);
    ctx.arc(butterfly.size * 0.6, -butterfly.size * 0.5, butterfly.size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(butterfly.size * 0.8, butterfly.size * 0.7, butterfly.size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Body
    const bodyGrad = ctx.createLinearGradient(0, -butterfly.size, 0, butterfly.size);
    bodyGrad.addColorStop(0, '#2C1810');
    bodyGrad.addColorStop(0.5, '#3E2723');
    bodyGrad.addColorStop(1, '#2C1810');
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, butterfly.size * 0.15, butterfly.size * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(0, -butterfly.size * 1.3, butterfly.size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Antennae
    ctx.strokeStyle = '#2C1810';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, -butterfly.size * 1.3);
    ctx.quadraticCurveTo(-butterfly.size * 0.3, -butterfly.size * 1.8, -butterfly.size * 0.4, -butterfly.size * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, -butterfly.size * 1.3);
    ctx.quadraticCurveTo(butterfly.size * 0.3, -butterfly.size * 1.8, butterfly.size * 0.4, -butterfly.size * 2);
    ctx.stroke();
    
    // Antennae tips
    ctx.fillStyle = '#2C1810';
    ctx.beginPath();
    ctx.arc(-butterfly.size * 0.4, -butterfly.size * 2, 2, 0, Math.PI * 2);
    ctx.arc(butterfly.size * 0.4, -butterfly.size * 2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  private addBird(): void {
    if (this.birds.length >= 10) return;
    
    const startX = Math.random() < 0.5 ? -50 : this.width + 50;
    const startY = 50 + Math.random() * 150;
    
    this.birds.push({
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      targetX: this.tree.x + (Math.random() - 0.5) * 150,
      targetY: this.tree.y - 100 - Math.random() * 100,
      wingPhase: Math.random() * Math.PI * 2,
      size: 8 + Math.random() * 4,
      color: '#654321',
      perched: false,
      restTimer: 0
    });
  }

  private addButterfly(): void {
    if (this.butterflies.length >= 8) return;
    
    const colors: [string, string][] = [
      ['#FF6B9D', '#C44569'],
      ['#FFA502', '#FF6348'],
      ['#26de81', '#20bf6b'],
      ['#4b7bec', '#3867d6'],
      ['#a55eea', '#8854d0'],
      ['#fed330', '#f7b731']
    ];
    
    const colorPair = colors[Math.floor(Math.random() * colors.length)];
    
    this.butterflies.push({
      x: this.tree.x + (Math.random() - 0.5) * 200,
      y: this.tree.y - 100 - Math.random() * 150,
      targetX: this.tree.x,
      targetY: this.tree.y - 100,
      wingPhase: Math.random() * Math.PI * 2,
      size: 10 + Math.random() * 5,
      colors: colorPair,
      movePhase: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 0.5
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  WEATHER EFFECTS
  // ═══════════════════════════════════════════════════════════

  private renderWeatherEffects(): void {
    if (!this.config.enableWeather) return;
    
    // Occasional rain/particle effects based on stage
    if (Math.random() < 0.005 && this.stage !== 'seed') {
      this.createMagicParticle(
        this.tree.x + (Math.random() - 0.5) * 200,
        0,
        'water'
      );
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  MYTHICAL STAGE EFFECTS
  // ═══════════════════════════════════════════════════════════

  private renderMythicalEffects(): void {
    const ctx = this.ctx;
    
    // Floating magic orbs
    this.renderMagicOrbs();
    
    // Sacred runes
    this.renderSacredRunes();
    
    // Energy waves
    this.renderEnergyWaves();
    
    // Bioluminescent glow
    this.renderBioluminescentGlow();
  }

  private renderMagicOrbs(): void {
    const ctx = this.ctx;
    const orbCount = 6;
    
    for (let i = 0; i < orbCount; i++) {
      const angle = (i / orbCount) * Math.PI * 2 + this.time * 0.4;
      const radius = 180 + Math.sin(this.time * 2 + i) * 40;
      const x = this.tree.x + Math.cos(angle) * radius;
      const y = this.tree.y - 200 + Math.sin(angle) * radius * 0.6;
      const size = 6 + Math.sin(this.time * 3 + i) * 3;
      const hue = (i / orbCount) * 360 + this.time * 50;
      
      // Orb trail
      ctx.save();
      ctx.globalAlpha = 0.3;
      for (let t = 0; t < 5; t++) {
        const trailAngle = angle - t * 0.1;
        const trailX = this.tree.x + Math.cos(trailAngle) * radius;
        const trailY = this.tree.y - 200 + Math.sin(trailAngle) * radius * 0.6;
        const trailSize = size * (1 - t * 0.15);
        
        const trailGrad = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, trailSize * 2);
        trailGrad.addColorStop(0, `hsla(${hue}, 100%, 70%, ${0.5 - t * 0.1})`);
        trailGrad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        
        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.arc(trailX, trailY, trailSize * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // Orb glow
      const orbGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      orbGlow.addColorStop(0, `hsla(${hue}, 100%, 80%, 0.8)`);
      orbGlow.addColorStop(0.5, `hsla(${hue}, 90%, 60%, 0.4)`);
      orbGlow.addColorStop(1, `hsla(${hue}, 80%, 50%, 0)`);
      
      ctx.fillStyle = orbGlow;
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Orb core
      ctx.fillStyle = `hsl(${hue}, 100%, 90%)`;
      // ctx.shadowBlur = 20;
      // ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      // ctx.shadowBlur = 0;
    }
  }

  private renderSacredRunes(): void {
    const ctx = this.ctx;
    const runeCount = 8;
    const runeRadius = 250;
    
    ctx.save();
    ctx.translate(this.tree.x, this.tree.y - 200);
    ctx.rotate(this.time * 0.1);
    
    for (let i = 0; i < runeCount; i++) {
      const angle = (i / runeCount) * Math.PI * 2;
      const x = Math.cos(angle) * runeRadius;
      const y = Math.sin(angle) * runeRadius;
      const runeAlpha = 0.3 + Math.sin(this.time * 2 + i) * 0.2;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-this.time * 0.1 + angle);
      ctx.globalAlpha = runeAlpha;
      
      // Rune symbol (mystical)
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      // ctx.shadowBlur = 10;
      // ctx.shadowColor = '#FFD700';
      
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.moveTo(0, -12);
      ctx.lineTo(0, 12);
      ctx.moveTo(-12, 0);
      ctx.lineTo(12, 0);
      ctx.moveTo(-8, -8);
      ctx.lineTo(8, 8);
      ctx.moveTo(8, -8);
      ctx.lineTo(-8, 8);
      ctx.stroke();
      
      // ctx.shadowBlur = 0;
      ctx.restore();
    }
    
    ctx.restore();
  }

  private renderEnergyWaves(): void {
    const ctx = this.ctx;
    
    for (let i = 0; i < 3; i++) {
      const waveRadius = 100 + i * 80 + (this.time * 40) % 240;
      const waveAlpha = Math.max(0, 0.4 - (waveRadius - 100) / 300);
      
      ctx.strokeStyle = `rgba(138, 43, 226, ${waveAlpha})`;
      ctx.lineWidth = 3;
      // ctx.shadowBlur = 15;
      // ctx.shadowColor = 'rgba(138, 43, 226, 0.5)';
      
      ctx.beginPath();
      ctx.arc(this.tree.x, this.tree.y - 150, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // ctx.shadowBlur = 0;
    }
  }

  private renderBioluminescentGlow(): void {
    const ctx = this.ctx;
    
    // Glow along branches
    this.tree.allBranches.forEach((branch, index) => {
      if (branch.depth < 2) return;
      
      const glowIntensity = 0.3 + Math.sin(this.time * 2 + index * 0.5) * 0.2;
      const hue = 180 + Math.sin(this.time + index) * 30;
      
      const gradient = ctx.createLinearGradient(
        branch.startX, branch.startY,
        branch.endX, branch.endY
      );
      gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0)`);
      gradient.addColorStop(0.5, `hsla(${hue}, 90%, 70%, ${glowIntensity})`);
      gradient.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = branch.thickness + 4;
      ctx.lineCap = 'round';
      // ctx.shadowBlur = 20;
      // ctx.shadowColor = `hsl(${hue}, 90%, 70%)`;
      
      ctx.beginPath();
      ctx.moveTo(branch.startX, branch.startY);
      ctx.lineTo(branch.endX, branch.endY);
      ctx.stroke();
      
      // ctx.shadowBlur = 0;
    });
  }

  private renderMagicalEffects(): void {
    if (this.stage === 'ancient' || this.stage === 'mythical') {
      // Ambient sparkles
      if (Math.random() < 0.08) {
        this.createMagicParticle(
          this.tree.x + (Math.random() - 0.5) * 300,
          this.tree.y - 50 - Math.random() * 300,
          this.stage === 'mythical' ? 'magic' : 'sparkle'
        );
      }
    }
  }
    // ═══════════════════════════════════════════════════════════
  //  UI RENDERING
  // ═══════════════════════════════════════════════════════════

  private renderUI(): void {
    const ctx = this.ctx;
    
    // Stage indicator (top-left)
    this.renderStageIndicator();
    
    // Day counter (top-right)
    this.renderDayCounter();
    
    // Growth progress bar
    this.renderGrowthBar();
    
    // Tooltip hints
    if (this.stage === 'seed' || this.stage === 'sprout') {
      this.renderHint();
    }
  }

  private renderStageIndicator(): void {
    const ctx = this.ctx;
    
    const stageInfo = {
      seed: { emoji: '🌰', name: 'Seed', color: '#8B6F47' },
      sprout: { emoji: '🌱', name: 'Sprout', color: '#90EE90' },
      sapling: { emoji: '🌿', name: 'Sapling', color: '#32CD32' },
      tree: { emoji: '🌳', name: 'Tree', color: '#228B22' },
      grand: { emoji: '🌲', name: 'Grand Tree', color: '#006400' },
      ancient: { emoji: '🎄', name: 'Ancient Tree', color: '#2E8B57' },
      mythical: { emoji: '✨', name: 'Mythical Tree', color: '#8A2BE2' }
    };
    
    const info = stageInfo[this.stage];
    
    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    // ctx.shadowBlur = 10;
    // ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(15, 15, 180, 50, 10);
    ctx.fill();
    // ctx.shadowBlur = 0;
    
    // Emoji
    ctx.font = 'bold 28px Arial';
    ctx.fillText(info.emoji, 25, 48);
    
    // Stage name
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(info.name, 65, 35);
    
    // Progress text
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`Growth: ${Math.floor(this.tree.growth * 100)}%`, 65, 52);
    
    ctx.restore();
  }

  private renderDayCounter(): void {
    const ctx = this.ctx;
    
    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    // ctx.shadowBlur = 10;
    // ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(this.width - 145, 15, 130, 50, 10);
    ctx.fill();
    // ctx.shadowBlur = 0;
    
    // Icon
    ctx.font = 'bold 24px Arial';
    ctx.fillText('📅', this.width - 135, 48);
    
    // Day text
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`Day ${this.day}`, this.width - 100, 38);
    
    // Habits count
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`${this.habitCount} habits`, this.width - 100, 53);
    
    ctx.restore();
  }

  private renderGrowthBar(): void {
    const ctx = this.ctx;
    const barWidth = 200;
    const barHeight = 8;
    const x = (this.width - barWidth) / 2;
    const y = this.height - 30;
    
    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 4);
    ctx.fill();
    
    // Progress fill
    const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.5, '#8BC34A');
    gradient.addColorStop(1, '#CDDC39');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth * this.tree.growth, barHeight, 4);
    ctx.fill();
    
    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth * this.tree.growth, barHeight / 2, 4);
    ctx.fill();
    
    ctx.restore();
  }

  private renderHint(): void {
    const ctx = this.ctx;
    const hint = this.stage === 'seed' 
      ? '💧 Tap to water your seed!'
      : '🌱 Keep watering to grow!';
    
    const alpha = 0.5 + Math.sin(this.time * 2) * 0.3;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    // ctx.shadowBlur = 15;
    // ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    
    const textWidth = ctx.measureText(hint).width;
    ctx.beginPath();
    ctx.roundRect(
      (this.width - textWidth) / 2 - 20,
      this.height / 2 - 40,
      textWidth + 40,
      40,
      20
    );
    ctx.fill();
    // ctx.shadowBlur = 0;
    
    // Text
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(hint, this.width / 2, this.height / 2 - 15);
    
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════
  //  EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════

  private setupEventListeners(): void {
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    
    // Window events
    window.addEventListener('resize', this.handleResize);
    
    // Device motion (for mobile tilt effects)
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', this.handleDeviceMotion);
    }
    
    // Visibility change (pause when tab is hidden)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    
    Array.from(e.changedTouches).forEach(touch => {
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      this.touches.set(touch.identifier, { x, y });
      this.handleInteraction(x, y);
    });
    
    this.isInteracting = true;
  };

  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    
    Array.from(e.changedTouches).forEach(touch => {
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      this.touches.set(touch.identifier, { x, y });
    });
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    
    Array.from(e.changedTouches).forEach(touch => {
      this.touches.delete(touch.identifier);
    });
    
    if (this.touches.size === 0) {
      this.isInteracting = false;
    }
  };

  private handleMouseDown = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.handleInteraction(x, y);
    this.isInteracting = true;
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Subtle parallax effect
    const moveX = (x / this.width - 0.5) * 5;
    const moveY = (y / this.height - 0.5) * 5;
    
    this.camera.x += (moveX - this.camera.x) * 0.05;
    this.camera.y += (moveY - this.camera.y) * 0.05;
  };

  private handleMouseUp = (): void => {
    this.isInteracting = false;
  };

  private handleMouseLeave = (): void => {
    this.isInteracting = false;
  };

  private handleInteraction(x: number, y: number): void {
    // Ripple effect at touch point
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const distance = 20 + Math.random() * 30;
      
      setTimeout(() => {
        this.createMagicParticle(
          x + Math.cos(angle) * distance,
          y + Math.sin(angle) * distance,
          'sparkle'
        );
      }, i * 30);
    }
    
    // Shake tree if near it
    const dx = x - this.tree.x;
    const dy = y - this.tree.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 200) {
      this.shakeTree(5);
      
      // Drop leaves
      if (this.stage !== 'seed' && this.stage !== 'sprout') {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            this.createMagicParticle(
              this.tree.x + (Math.random() - 0.5) * 150,
              this.tree.y - 100 - Math.random() * 150,
              'leaf'
            );
          }, i * 100);
        }
      }
      
      // Startle birds
      this.birds.forEach(bird => {
        if (bird.perched && Math.random() < 0.5) {
          bird.perched = false;
          bird.targetX = this.tree.x + (Math.random() - 0.5) * 400;
          bird.targetY = this.tree.y - 150 - Math.random() * 100;
        }
      });
    }
    
    // Haptic feedback
    this.vibrate(20);
  }

  private handleResize = (): void => {
    this.setupCanvas();
    this.regenerateTree();
  };

  private handleDeviceMotion = (e: DeviceMotionEvent): void => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    
    const threshold = 15;
    const shakeIntensity = Math.max(
      Math.abs(acc.x || 0),
      Math.abs(acc.y || 0),
      Math.abs(acc.z || 0)
    );
    
    if (shakeIntensity > threshold) {
      // Wind gust from device shake
      this.wind.strength = Math.min(this.wind.strength + 0.3, 1.5);
      this.shakeTree(shakeIntensity * 0.3);
      
      // Leaves fall
      for (let i = 0; i < Math.floor(shakeIntensity / 5); i++) {
        this.createMagicParticle(
          this.tree.x + (Math.random() - 0.5) * 200,
          this.tree.y - 100 - Math.random() * 200,
          'leaf'
        );
      }
      
      this.vibrate(30);
    }
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      // Pause animation when tab is hidden
      cancelAnimationFrame(this.animationId);
    } else {
      // Resume animation
      this.lastFrameTime = performance.now();
      this.animate();
    }
  };

  // ═══════════════════════════════════════════════════════════
  //  PUBLIC API METHODS
  // ═══════════════════════════════════════════════════════════

  public completeHabit(): void {
    this.habitCount++;
    
    // Celebration effect
    this.celebrateHabit();
    
    // Check for creature spawns
    this.checkCreatureSpawns();
    
    // Haptic feedback
    this.vibrate([50, 30, 50, 30, 100]);
  }

  public setDay(day: number): void {
    const oldStage = this.stage;
    this.day = day;
    this.stage = this.calculateStage(day);
    this.tree.targetGrowth = this.getTargetGrowth();
    
    if (oldStage !== this.stage) {
      this.onStageChanged(oldStage, this.stage);
    }
  }

  public setHabitCount(count: number): void {
    this.habitCount = count;
  }

  public getState() {
    return {
      day: this.day,
      habitCount: this.habitCount,
      stage: this.stage,
      growth: this.tree.growth,
      health: this.tree.health
    };
  }

  public waterTree(): void {
    // Water drop animation
    const dropCount = 25;
    for (let i = 0; i < dropCount; i++) {
      setTimeout(() => {
        this.createMagicParticle(
          this.tree.x + (Math.random() - 0.5) * 80,
          50 + Math.random() * 50,
          'water'
        );
      }, i * 50);
    }
    
    // Boost growth slightly
    this.tree.health = Math.min(this.tree.health + 0.05, 1);
    
    // Visual feedback
    this.shakeTree(3);
    this.camera.shake = 5;
    
    this.vibrate([30, 20, 30]);
  }

  public reset(): void {
    this.day = 1;
    this.habitCount = 0;
    this.stage = 'seed';
    this.tree.growth = 0;
    this.tree.targetGrowth = this.getTargetGrowth();
    this.particles = [];
    this.birds = [];
    this.butterflies = [];
    this.regenerateTree();
  }

  // ═══════════════════════════════════════════════════════════
  //  HELPER METHODS
  // ═══════════════════════════════════════════════════════════

  private celebrateHabit(): void {
    // Burst of sparkles
    const burstCount = 40;
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2;
      const distance = 50 + Math.random() * 80;
      
      setTimeout(() => {
        this.createMagicParticle(
          this.tree.x + Math.cos(angle) * distance,
          this.tree.y - 100 + Math.sin(angle) * distance,
          this.stage === 'mythical' ? 'magic' : 'sparkle'
        );
      }, i * 20);
    }
    
    // Camera zoom effect
    this.camera.targetZoom = 1.05;
    setTimeout(() => {
      this.camera.targetZoom = 1;
    }, 300);
    
    // Shake effect
    this.shakeTree(8);
    this.camera.shake = 10;
  }

  private checkCreatureSpawns(): void {
    // Birds spawn every 15 habits
    if (this.habitCount % 15 === 0 && this.stage !== 'seed') {
      this.addBird();
    }
    
    // Butterflies spawn every 30 habits
    if (this.habitCount % 30 === 0 && this.stage !== 'seed' && this.stage !== 'sprout') {
      this.addButterfly();
    }
  }

  private onStageChanged(oldStage: string, newStage: string): void {
    console.log(`🌳 Tree evolved: ${oldStage} → ${newStage}`);
    
    // Epic celebration
    this.camera.shake = 20;
    
    // Massive particle burst
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2;
      const distance = 100 + Math.random() * 150;
      
      setTimeout(() => {
        this.createMagicParticle(
          this.tree.x + Math.cos(angle) * distance,
          this.tree.y - 100 + Math.sin(angle) * distance,
          newStage === 'mythical' ? 'magic' : 'sparkle'
        );
      }, i * 15);
    }
    
    // Regenerate tree structure
    this.regenerateTree();
    
    // Haptic feedback
    this.vibrate([100, 50, 100, 50, 200]);
    
    // Add creatures
    if (newStage === 'tree' || newStage === 'grand' || newStage === 'ancient' || newStage === 'mythical') {
      this.addBird();
      this.addBird();
      this.addButterfly();
    }
  }

  private regenerateTree(): void {
    // Smooth transition
    const oldGrowth = this.tree.growth;
    this.generateTree();
    this.tree.growth = oldGrowth; // Preserve current visual growth
  }

  private shakeTree(intensity: number): void {
    this.tree.allBranches.forEach((branch, index) => {
      const delay = index * 20;
      setTimeout(() => {
        branch.swayOffset += (Math.random() - 0.5) * intensity * 0.01;
      }, delay);
    });
  }

  private vibrate(pattern: number | number[]): void {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  CLEANUP
  // ═══════════════════════════════════════════════════════════

  public destroy(): void {
    // Cancel animation
    cancelAnimationFrame(this.animationId);
    
    // Remove event listeners
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('devicemotion', this.handleDeviceMotion);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Clear data
    this.particles = [];
    this.birds = [];
    this.butterflies = [];
    this.tree.allBranches = [];
    this.tree.leaves = [];
    this.touches.clear();
    
    console.log('🌳 Tree of Life destroyed');
  }
}

// ═══════════════════════════════════════════════════════════
//  REACT COMPONENT
// ═══════════════════════════════════════════════════════════

export default function TreePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const treeRef = useRef<TreeOfLife | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load streak data
  useEffect(() => {
    getMaxUserStreak()
      .then(max => {
        setStreak(max === 0 ? 1 : max);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load streak:', err);
        setStreak(1);
        setLoading(false);
      });
  }, []);

  // Initialize tree
  useEffect(() => {
    if (streak !== null && canvasRef.current && !treeRef.current) {
      const tree = new TreeOfLife(canvasRef.current, streak);
      treeRef.current = tree;
      
      // Expose to window for debugging
      if (typeof window !== 'undefined') {
        (window as any).tree = tree;
      }
      
      return () => {
        tree.destroy();
        treeRef.current = null;
      };
    }
  }, [streak]);

  // Public methods for parent component
  const waterTree = useCallback(() => {
    treeRef.current?.waterTree();
  }, []);

  const completeHabit = useCallback(() => {
    treeRef.current?.completeHabit();
  }, []);

  return (
    <div className="relative w-full h-[calc(100dvh-80px)] bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-white/70 text-lg">Growing your tree...</p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none cursor-pointer"
        style={{ touchAction: 'none' }}
      />

      {/* Developer Testing Panel */}
      {!loading && (
        <DevPanel treeRef={treeRef} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  DEVELOPER TESTING PANEL
// ═══════════════════════════════════════════════════════════

function DevPanel({ treeRef }: { treeRef: React.RefObject<TreeOfLife | null> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (treeRef.current) {
        setInfo(treeRef.current.getState());
      }
    }, 100);

    return () => clearInterval(interval);
  }, [treeRef]);

  const setStage = (day: number) => {
    treeRef.current?.setDay(day);
  };

  const addCreature = (type: 'bird' | 'butterfly') => {
    if (type === 'bird') {
      (treeRef.current as any)?.addBird();
    } else {
      (treeRef.current as any)?.addButterfly();
    }
  };

  return (
    <div className="absolute top-20 right-4 z-30">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-all"
      >
        {isOpen ? '❌ Close' : '🛠️ Dev Tools'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="bg-black/90 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl max-h-[70vh] overflow-y-auto">
          <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b border-white/20">
            🌳 Tree Control Panel
          </h3>

          {/* Current state */}
          {info && (
            <div className="mb-4 p-3 bg-white/10 rounded-lg text-xs text-white/80 font-mono">
              <div>Stage: <span className="text-green-400">{info.stage}</span></div>
              <div>Day: <span className="text-blue-400">{info.day}</span></div>
              <div>Habits: <span className="text-yellow-400">{info.habitCount}</span></div>
              <div>Growth: <span className="text-purple-400">{(info.growth * 100).toFixed(1)}%</span></div>
              <div>Health: <span className="text-red-400">{(info.health * 100).toFixed(1)}%</span></div>
            </div>
          )}

          {/* Stage controls */}
          <div className="space-y-2 mb-4">
            <p className="text-white/60 text-xs font-bold mb-2">QUICK STAGES:</p>
            
            <button
              onClick={() => setStage(1)}
              className="w-full px-3 py-2 bg-amber-700/50 hover:bg-amber-700/70 text-white rounded text-sm transition-all"
            >
              🌰 Seed (Day 1)
            </button>
            
            <button
              onClick={() => setStage(7)}
              className="w-full px-3 py-2 bg-green-700/50 hover:bg-green-700/70 text-white rounded text-sm transition-all"
            >
              🌱 Sprout (Day 7)
            </button>
            
            <button
              onClick={() => setStage(25)}
              className="w-full px-3 py-2 bg-green-600/50 hover:bg-green-600/70 text-white rounded text-sm transition-all"
            >
              🌿 Sapling (Day 25)
            </button>
            
            <button
              onClick={() => setStage(70)}
              className="w-full px-3 py-2 bg-green-500/50 hover:bg-green-500/70 text-white rounded text-sm transition-all"
            >
              🌳 Tree (Day 70)
            </button>
            
            <button
              onClick={() => setStage(200)}
              className="w-full px-3 py-2 bg-emerald-600/50 hover:bg-emerald-600/70 text-white rounded text-sm transition-all"
            >
              🌲 Grand Tree (Day 200)
            </button>
            
            <button
              onClick={() => setStage(400)}
              className="w-full px-3 py-2 bg-teal-600/50 hover:bg-teal-600/70 text-white rounded text-sm transition-all"
            >
              🎄 Ancient (Day 400)
            </button>
            
            <button
              onClick={() => setStage(550)}
              className="w-full px-3 py-2 bg-gradient-to-r from-purple-600/50 to-pink-600/50 hover:from-purple-600/70 hover:to-pink-600/70 text-white rounded text-sm transition-all"
            >
              ✨ Mythical (Day 550)
            </button>
          </div>

          {/* Creature controls */}
          <div className="space-y-2 mb-4">
            <p className="text-white/60 text-xs font-bold mb-2">CREATURES:</p>
            
            <button
              onClick={() => addCreature('bird')}
              className="w-full px-3 py-2 bg-sky-600/50 hover:bg-sky-600/70 text-white rounded text-sm transition-all"
            >
              🐦 Add Bird
            </button>
            
            <button
              onClick={() => addCreature('butterfly')}
              className="w-full px-3 py-2 bg-pink-600/50 hover:bg-pink-600/70 text-white rounded text-sm transition-all"
            >
              🦋 Add Butterfly
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <p className="text-white/60 text-xs font-bold mb-2">ACTIONS:</p>
            
            <button
              onClick={() => treeRef.current?.waterTree()}
              className="w-full px-3 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white rounded text-sm transition-all"
            >
              💧 Water
            </button>
            
            <button
              onClick={() => treeRef.current?.completeHabit()}
              className="w-full px-3 py-2 bg-green-600/50 hover:bg-green-600/70 text-white rounded text-sm transition-all"
            >
              ✅ Complete Habit
            </button>
            
            <button
              onClick={() => {
                if (confirm('Reset tree to seed?')) {
                  treeRef.current?.reset();
                }
              }}
              className="w-full px-3 py-2 bg-red-600/50 hover:bg-red-600/70 text-white rounded text-sm transition-all"
            >
              🔄 Reset Tree
            </button>
          </div>

          {/* Tips */}
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-xs font-bold mb-1">💡 Tips:</p>
            <ul className="text-blue-200/80 text-xs space-y-1">
              <li>• Tap anywhere to interact</li>
              <li>• Shake device for wind effect</li>
              <li>• Access tree via: <code className="bg-black/30 px-1 rounded">window.tree</code></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}