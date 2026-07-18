"use client";
import React, { useEffect, useRef, useState } from 'react';
import { getMaxUserStreak } from '@/app/actions/habits';

/**
 * 🌳 TREE OF LIFE - ULTRA PREMIUM EDITION
 * Hyper-realistic tree animation with:
 * - Photorealistic leaves with proper venation
 * - Realistic birds with natural flight patterns
 * - Beautiful butterflies with intricate wing patterns
 * - Advanced physics and wind simulation
 * - Optimized for 60fps on mobile devices
 * - Touch interactions and haptic feedback
 */

export class TreeOfLife {
  constructor(canvas, initialDay = 1) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true, // Better performance
      willReadFrequently: false
    });
    
    // Performance settings
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.dpr = this.isMobile ? Math.min(window.devicePixelRatio || 1, 2) : Math.min(window.devicePixelRatio || 1, 2);
    this.lastFrame = performance.now();
    this.time = 0;
    this.fps = 60;
    this.frameInterval = 1000 / this.fps;
    this.deltaAccumulator = 0;
    
    // Game state
    this.day = initialDay;
    this.habitCount = 0;
    this.stage = 'seed';
    
    // Tree properties with smooth interpolation
    this.tree = {
      x: 0,
      y: 0,
      growth: 0,
      targetGrowth: 0,
      health: 1,
      glowIntensity: 0,
      shakeX: 0,
      shakeY: 0,
      breathPhase: 0,
      scale: 1,
      rotation: 0,
      energy: 1
    };
    
    // Enhanced animation systems
    this.particles = [];
    this.birds = [];
    this.butterflies = [];
    this.leaves = [];
    this.branches = [];
    this.flowers = [];
    this.roots = [];
    this.fireflies = [];
    
    // Advanced wind simulation
    this.wind = {
      strength: 0.3,
      direction: 0,
      phase: 0,
      gustStrength: 0,
      gustPhase: 0,
      turbulence: 0
    };
    
    // Advanced lighting system
    this.lighting = {
      timeOfDay: 0.5,
      sunAngle: 0,
      ambient: 1,
      sunIntensity: 1,
      shadowLength: 1,
      sunColor: { r: 255, g: 230, h: 150 },
      skyColor: { r: 135, g: 206, b: 235 }
    };
    
    // Camera system
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1,
      targetZoom: 1,
      shake: 0,
      offsetX: 0,
      offsetY: 0
    };
    
    // Performance management
    this.particlePool = [];
    this.maxParticles = this.isMobile ? 100 : 200;
    this.maxLeaves = this.isMobile ? 50 : 100;
    this.maxBirds = this.isMobile ? 3 : 6;
    this.maxButterflies = this.isMobile ? 4 : 8;
    
    // Texture cache
    this.textureCache = {};
    
    // Initialize
    this.init();
  }
  
  // ==================== INITIALIZATION ====================
  
  init() {
    this.setupCanvas();
    this.initializeTree();
    this.bindEvents();
    this.preloadTextures();
    this.startAnimationLoop();
  }
  
  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.width = rect.width;
    this.height = rect.height;
    
    this.tree.x = this.width / 2;
    this.tree.y = this.height - 80;
  }
  
  initializeTree() {
    this.updateStageProgression();
    this.generateBranches();
    this.generateLeaves();
    this.spawnInitialCreatures();
  }
  
  preloadTextures() {
    // Pre-render leaf textures for better performance
    this.createLeafTexture();
    this.createButterflyWingTexture();
  }
  
  createLeafTexture() {
    const size = 40;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Draw realistic leaf
    ctx.translate(size / 2, size / 2);
    
    // Leaf shape with gradient
    const leafGrad = ctx.createLinearGradient(-10, -15, 10, 15);
    leafGrad.addColorStop(0, '#4CAF50');
    leafGrad.addColorStop(0.3, '#66BB6A');
    leafGrad.addColorStop(0.5, '#81C784');
    leafGrad.addColorStop(0.7, '#66BB6A');
    leafGrad.addColorStop(1, '#2E7D32');
    
    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.bezierCurveTo(8, -12, 10, -5, 10, 0);
    ctx.bezierCurveTo(10, 8, 5, 15, 0, 18);
    ctx.bezierCurveTo(-5, 15, -10, 8, -10, 0);
    ctx.bezierCurveTo(-10, -5, -8, -12, 0, -15);
    ctx.fill();
    
    // Veins
    ctx.strokeStyle = 'rgba(0, 100, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(0, 18);
    ctx.stroke();
    
    // Side veins
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const y = i * 4;
      const length = 8 - Math.abs(i) * 1.5;
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(length, y + 2);
      ctx.moveTo(0, y);
      ctx.lineTo(-length, y + 2);
      ctx.stroke();
    }
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-3, -5, 4, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    this.textureCache.leaf = canvas;
  }
  
  createButterflyWingTexture() {
    const size = 60;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    ctx.translate(size / 2, size / 2);
    
    // Wing gradient
    const wingGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    wingGrad.addColorStop(0, '#FF6B9D');
    wingGrad.addColorStop(0.4, '#FE8DC6');
    wingGrad.addColorStop(0.7, '#C44569');
    wingGrad.addColorStop(1, '#A12347');
    
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing patterns
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(-8, -5, 4, 0, Math.PI * 2);
    ctx.arc(5, 3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Dark spots
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(-12, 0, 3, 0, Math.PI * 2);
    ctx.arc(8, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Edge detail
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    this.textureCache.butterflyWing = canvas;
  }
  
  bindEvents() {
    this.boundHandlers = {
      touchstart: (e) => this.handleTouch(e),
      touchmove: (e) => this.handleTouchMove(e),
      click: (e) => this.handleClick(e),
      mousemove: (e) => this.handleMouseMove(e),
      resize: () => this.handleResize(),
      devicemotion: (e) => this.handleDeviceMotion(e)
    };
    
    this.canvas.addEventListener('touchstart', this.boundHandlers.touchstart, { passive: false });
    this.canvas.addEventListener('touchmove', this.boundHandlers.touchmove, { passive: false });
    this.canvas.addEventListener('click', this.boundHandlers.click);
    this.canvas.addEventListener('mousemove', this.boundHandlers.mousemove);
    window.addEventListener('resize', this.boundHandlers.resize);
    
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', this.boundHandlers.devicemotion);
    }
  }
  
  spawnInitialCreatures() {
    // Add initial butterflies based on stage
    if (this.stage !== 'seed' && this.stage !== 'sprout') {
      const butterflyCount = Math.min(2, this.maxButterflies);
      for (let i = 0; i < butterflyCount; i++) {
        setTimeout(() => {
          this.addButterfly(
            this.width * (0.3 + Math.random() * 0.4),
            this.height * (0.2 + Math.random() * 0.4)
          );
        }, i * 1000);
      }
    }
  }
  
  // ==================== ANIMATION LOOP ====================
  
  startAnimationLoop() {
    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }
  
  animate(currentTime) {
    this.animationId = requestAnimationFrame((time) => this.animate(time));
    
    const elapsed = currentTime - this.lastFrame;
    
    if (elapsed < this.frameInterval) return;
    
    this.lastFrame = currentTime - (elapsed % this.frameInterval);
    const delta = Math.min(elapsed / 1000, 0.1); // Cap delta to prevent spiral of death
    
    this.time += delta;
    
    // Update all systems
    this.updateWorld(delta);
    this.updateCamera(delta);
    this.updateParticles(delta);
    this.updateCreatures(delta);
    this.updatePhysics(delta);
    
    // Render
    this.render();
  }
  
  // ==================== UPDATE SYSTEMS ====================
  
  updateWorld(delta) {
    // Dynamic lighting cycle
    this.lighting.timeOfDay = (Math.sin(this.time * 0.03) + 1) / 2;
    this.lighting.sunAngle = this.lighting.timeOfDay * Math.PI;
    this.lighting.sunIntensity = Math.max(0.4, this.lighting.timeOfDay);
    
    // Sun color changes
    const tod = this.lighting.timeOfDay;
    if (tod < 0.3) {
      // Night to dawn
      this.lighting.sunColor = { r: 255, g: 200, b: 150 };
    } else if (tod < 0.5) {
      // Dawn to day
      this.lighting.sunColor = { r: 255, g: 240, b: 200 };
    } else if (tod < 0.7) {
      // Day
      this.lighting.sunColor = { r: 255, g: 250, b: 220 };
    } else {
      // Dusk
      this.lighting.sunColor = { r: 255, g: 150, b: 100 };
    }
    
    // Advanced wind simulation with gusts
    this.wind.phase += delta;
    this.wind.gustPhase += delta * 0.5;
    
    this.wind.strength = 0.2 + (Math.sin(this.wind.phase * 0.5) + 1) / 2 * 0.3;
    this.wind.gustStrength = Math.max(0, Math.sin(this.wind.gustPhase) - 0.7) * 3;
    this.wind.direction = Math.sin(this.wind.phase * 0.3) * 0.5;
    this.wind.turbulence = Math.sin(this.wind.phase * 3) * 0.1;
    
    const totalWind = this.wind.strength + this.wind.gustStrength;
    
    // Tree breathing and swaying
    this.tree.breathPhase += delta * 1.2;
    const breath = Math.sin(this.tree.breathPhase);
    
    // Smooth growth interpolation
    this.tree.growth += (this.tree.targetGrowth - this.tree.growth) * delta * 1.5;
    
    // Natural decay
    this.tree.shakeX *= 0.88;
    this.tree.shakeY *= 0.88;
    this.tree.glowIntensity *= 0.93;
    this.camera.shake *= 0.92;
    
    // Update leaves with realistic physics
    this.leaves.forEach(leaf => {
      leaf.swayPhase += delta * (0.8 + leaf.swaySpeed * 0.5);
      
      const windEffect = totalWind * (0.5 + leaf.flexibility);
      const breathEffect = breath * 0.1;
      const turbulence = Math.sin(leaf.swayPhase * 5 + this.wind.phase * 10) * this.wind.turbulence;
      
      leaf.currentRotation = leaf.baseRotation + 
        (Math.sin(leaf.swayPhase) * 12 + 
         Math.cos(leaf.swayPhase * 0.7) * 8) * windEffect +
        breathEffect * 5 +
        turbulence * 20;
      
      leaf.currentX = leaf.baseX + Math.sin(leaf.swayPhase * 0.8) * windEffect * 3;
      leaf.currentY = leaf.baseY + Math.cos(leaf.swayPhase * 0.6) * windEffect * 2;
      
      // Occasional leaf fall in strong wind
      if (totalWind > 1.2 && Math.random() < 0.001 && this.particles.length < this.maxParticles) {
        const worldX = this.tree.x + leaf.currentX;
        const worldY = this.tree.y - 200 + leaf.currentY;
        this.createParticle(worldX, worldY, 'leaf', {
          color: leaf.color,
          vx: this.wind.direction * totalWind * 30
        });
      }
    });
    
    // Update branches sway
    this.branches.forEach(branch => {
      branch.swayPhase += delta * 0.6;
      branch.angle = branch.baseAngle + 
        Math.sin(branch.swayPhase) * 0.08 * totalWind +
        Math.cos(branch.swayPhase * 0.5) * 0.04 * totalWind;
    });
  }
  
  updateCamera(delta) {
    // Smooth zoom
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * delta * 4;
    
    // Camera shake
    if (this.camera.shake > 0.1) {
      this.camera.x = (Math.random() - 0.5) * this.camera.shake;
      this.camera.y = (Math.random() - 0.5) * this.camera.shake;
    } else {
      this.camera.x *= 0.92;
      this.camera.y *= 0.92;
    }
    
    // Parallax offset
    this.camera.offsetX += (this.camera.targetOffsetX - this.camera.offsetX) * delta * 2;
    this.camera.offsetY += (this.camera.targetOffsetY - this.camera.offsetY) * delta * 2;
  }
  
  updateParticles(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.life -= delta * p.decay;
      
      // Physics
      p.vx += p.ax * delta;
      p.vy += p.ay * delta;
      p.vy += p.gravity * delta;
      
      // Wind influence
      const windForce = (this.wind.strength + this.wind.gustStrength) * p.windInfluence;
      p.vx += this.wind.direction * windForce * 50 * delta;
      
      // Air resistance
      p.vx *= (1 - p.drag * delta);
      p.vy *= (1 - p.drag * delta);
      
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      
      p.rotation += p.rotationSpeed * delta;
      
      // Scale based on life
      if (p.life > 0.7) {
        p.scale = p.baseScale * ((1 - p.life) / 0.3);
      } else if (p.life < 0.3) {
        p.scale = p.baseScale * (p.life / 0.3);
      } else {
        p.scale = p.baseScale;
      }
      
      // Remove dead particles
      if (p.life <= 0 || p.y > this.height + 100 || p.x < -100 || p.x > this.width + 100) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  updateCreatures(delta) {
    // Update birds with realistic flight
    this.birds.forEach((bird, index) => {
      if (!bird.perched) {
        const dx = bird.targetX - bird.x;
        const dy = bird.targetY - bird.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 15) {
          bird.perched = true;
          bird.vx = 0;
          bird.vy = 0;
          bird.perchTime = this.time;
        } else {
          const speed = 120 + bird.speed * 30;
          const targetVx = (dx / dist) * speed;
          const targetVy = (dy / dist) * speed;
          
          // Smooth acceleration
          bird.vx += (targetVx - bird.vx) * delta * 5;
          bird.vy += (targetVy - bird.vy) * delta * 5;
          
          // Wing flap based on speed
          bird.wingSpeed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy) / 10;
        }
      } else {
        // Perched behavior
        bird.bobPhase += delta * 2;
        bird.bobOffset = Math.sin(bird.bobPhase) * 1.5;
        bird.wingSpeed = 0.3; // Gentle breathing
        
        // Random takeoff
        if (this.time - bird.perchTime > 3 + Math.random() * 5) {
          this.setBirdTarget(bird);
          bird.perched = false;
        }
      }
      
      bird.x += bird.vx * delta;
      bird.y += bird.vy * delta;
      bird.wingPhase += delta * (5 + bird.wingSpeed * 2);
      
      // Direction based on velocity
      if (Math.abs(bird.vx) > 1) {
        bird.direction = bird.vx > 0 ? 1 : -1;
      }
      
      // Keep in bounds
      if (bird.x < -50) bird.x = this.width + 50;
      if (bird.x > this.width + 50) bird.x = -50;
      if (bird.y < -50) bird.y = this.height + 50;
      if (bird.y > this.height + 50) bird.y = -50;
    });
    
    // Update butterflies with figure-8 pattern
    this.butterflies.forEach((butterfly, index) => {
      butterfly.phase += delta * butterfly.speed;
      butterfly.lifeTime += delta;
      
      // Figure-8 flight pattern
      const figure8X = Math.sin(butterfly.phase) * butterfly.radius;
      const figure8Y = Math.sin(butterfly.phase * 2) * butterfly.radius * 0.5;
      
      // Drift
      butterfly.centerX += Math.sin(butterfly.phase * 0.3) * 20 * delta;
      butterfly.centerY += Math.cos(butterfly.phase * 0.25) * 15 * delta;
      
      // Wind influence
      const windInfluence = (this.wind.strength + this.wind.gustStrength) * 0.3;
      butterfly.centerX += this.wind.direction * windInfluence * 30 * delta;
      
      butterfly.x = butterfly.centerX + figure8X;
      butterfly.y = butterfly.centerY + figure8Y;
      
      butterfly.wingPhase += delta * (15 + Math.sin(butterfly.phase) * 5);
      
      // Direction based on movement
      const prevX = butterfly.centerX + Math.sin(butterfly.phase - delta) * butterfly.radius;
      butterfly.direction = butterfly.x > prevX ? 1 : -1;
      
      // Boundary wrapping
      if (butterfly.centerX < -50) butterfly.centerX = this.width + 50;
      if (butterfly.centerX > this.width + 50) butterfly.centerX = -50;
      if (butterfly.centerY < -50) butterfly.centerY = this.height - 100;
      if (butterfly.centerY > this.height - 50) butterfly.centerY = 50;
      
      // Land on flowers occasionally
      if (butterfly.lifeTime > 10 && Math.random() < 0.01) {
        butterfly.phase = 0;
        butterfly.lifeTime = 0;
      }
    });
    
    // Spawn fireflies at night
    if (this.lighting.timeOfDay < 0.3 && this.stage !== 'seed') {
      if (this.fireflies.length < 10 && Math.random() < 0.02) {
        this.addFirefly();
      }
    } else {
      // Remove fireflies during day
      this.fireflies = [];
    }
    
    // Update fireflies
    this.fireflies.forEach(firefly => {
      firefly.phase += delta * firefly.speed;
      firefly.x += Math.sin(firefly.phase) * 30 * delta;
      firefly.y += Math.cos(firefly.phase * 1.3) * 25 * delta;
      firefly.brightness = 0.5 + Math.sin(firefly.phase * 3) * 0.5;
      
      if (firefly.x < 0) firefly.x = this.width;
      if (firefly.x > this.width) firefly.x = 0;
      if (firefly.y < 0) firefly.y = this.height - 100;
      if (firefly.y > this.height - 100) firefly.y = 0;
    });
  }
  
  updatePhysics(delta) {
    // Future: Add advanced physics like spring dynamics, collision detection
  }
  
  // ==================== RENDERING ====================
  
  render() {
    const ctx = this.ctx;
    
    // Clear with background color
    ctx.fillStyle = '#0A0E27';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Save context
    ctx.save();
    
    // Apply camera transform
    ctx.translate(
      this.camera.x + this.camera.offsetX,
      this.camera.y + this.camera.offsetY
    );
    ctx.scale(this.camera.zoom, this.camera.zoom);
    
    // Render in layers (painter's algorithm)
    this.renderBackground();
    this.renderEnvironment();
    this.renderParticles('background');
    this.renderTree();
    this.renderCreatures();
    this.renderParticles('foreground');
    this.renderEffects();
    this.renderFireflies();
    
    // Restore context
    ctx.restore();
    
    // UI overlay (not affected by camera)
    this.renderUI();
  }
  
  renderBackground() {
    const ctx = this.ctx;
    const tod = this.lighting.timeOfDay;
    
    // Dynamic sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    
    if (this.stage === 'legend') {
      // Mystical gradient
      const h1 = 260 + Math.sin(this.time * 0.1) * 20;
      const h2 = 240 + Math.sin(this.time * 0.15) * 15;
      skyGrad.addColorStop(0, `hsl(${h1}, 70%, ${20 + tod * 10}%)`);
      skyGrad.addColorStop(0.5, `hsl(${h2}, 60%, ${30 + tod * 10}%)`);
      skyGrad.addColorStop(1, `hsl(${h2 - 20}, 50%, ${40 + tod * 5}%)`);
    } else {
      // Natural sky
      if (tod < 0.3) {
        // Night
        skyGrad.addColorStop(0, '#0A0E27');
        skyGrad.addColorStop(0.5, '#1A1F3A');
        skyGrad.addColorStop(1, '#2A3F5F');
      } else if (tod < 0.5) {
        // Dawn
        skyGrad.addColorStop(0, '#FF6B9D');
        skyGrad.addColorStop(0.3, '#FEA47F');
        skyGrad.addColorStop(0.6, '#25CCF7');
        skyGrad.addColorStop(1, '#EAB543');
      } else if (tod < 0.7) {
        // Day
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(0.5, '#B0E0E6');
        skyGrad.addColorStop(1, '#F0E68C');
      } else {
        // Dusk
        skyGrad.addColorStop(0, '#FF6B9D');
        skyGrad.addColorStop(0.4, '#C44569');
        skyGrad.addColorStop(0.7, '#F8B500');
        skyGrad.addColorStop(1, '#EA8D8D');
      }
    }
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Celestial bodies
    this.renderCelestialBodies();
    
    // Stars at night
    if (tod < 0.4) {
      this.renderStars(1 - tod * 2.5);
    }
    
    // Clouds
    this.renderClouds();
    
    // Aurora for legend stage
    if (this.stage === 'legend') {
      this.renderAurora();
    }
  }
  
  renderCelestialBodies() {
    const ctx = this.ctx;
    const tod = this.lighting.timeOfDay;
    
    // Sun/Moon position
    const celestialX = this.width * 0.75;
    const celestialY = 80 + Math.sin(tod * Math.PI) * 30;
    
    if (tod > 0.3 && tod < 0.8) {
      // Sun
      const sunSize = 35;
      const glowSize = sunSize * 3;
      
      // Glow
      const sunGlow = ctx.createRadialGradient(celestialX, celestialY, 0, celestialX, celestialY, glowSize);
      sunGlow.addColorStop(0, 'rgba(255, 230, 150, 0.8)');
      sunGlow.addColorStop(0.3, 'rgba(255, 200, 100, 0.4)');
      sunGlow.addColorStop(0.6, 'rgba(255, 180, 80, 0.1)');
      sunGlow.addColorStop(1, 'rgba(255, 160, 60, 0)');
      
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(celestialX, celestialY, glowSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun body
      const sunGrad = ctx.createRadialGradient(
        celestialX - 8, celestialY - 8, 0,
        celestialX, celestialY, sunSize
      );
      sunGrad.addColorStop(0, '#FFFEF0');
      sunGrad.addColorStop(0.6, '#FFE66D');
      sunGrad.addColorStop(1, '#FFB84D');
      
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(celestialX, celestialY, sunSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun rays
      ctx.save();
      ctx.translate(celestialX, celestialY);
      ctx.rotate(this.time * 0.1);
      
      ctx.strokeStyle = 'rgba(255, 230, 150, 0.4)';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const innerR = sunSize + 5;
        const outerR = sunSize + 15 + Math.sin(this.time * 2 + i) * 3;
        
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        ctx.stroke();
      }
      
      ctx.restore();
      
    } else {
      // Moon
      const moonSize = 30;
      
      // Moon glow
      const moonGlow = ctx.createRadialGradient(celestialX, celestialY, 0, celestialX, celestialY, moonSize * 2);
      moonGlow.addColorStop(0, 'rgba(200, 220, 255, 0.5)');
      moonGlow.addColorStop(0.5, 'rgba(180, 200, 255, 0.2)');
      moonGlow.addColorStop(1, 'rgba(160, 180, 255, 0)');
      
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(celestialX, celestialY, moonSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Moon body
      const moonGrad = ctx.createRadialGradient(
        celestialX - 8, celestialY - 8, 0,
        celestialX, celestialY, moonSize
      );
      moonGrad.addColorStop(0, '#F8F8FF');
      moonGrad.addColorStop(0.7, '#E8E8F0');
      moonGrad.addColorStop(1, '#D8D8E0');
      
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(celestialX, celestialY, moonSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Craters
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(celestialX - 8, celestialY - 5, 6, 0, Math.PI * 2);
      ctx.arc(celestialX + 6, celestialY + 4, 4, 0, Math.PI * 2);
      ctx.arc(celestialX - 3, celestialY + 8, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Crater highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(celestialX - 10, celestialY - 7, 2, 0, Math.PI * 2);
      ctx.arc(celestialX + 8, celestialY + 6, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  renderStars(intensity = 1) {
    const ctx = this.ctx;
    
    // Use deterministic positions based on index
    for (let i = 0; i < 100; i++) {
      const x = (i * 137.508) % this.width;
      const y = (i * 73.331) % (this.height * 0.7);
      const twinkle = Math.sin(this.time * (2 + i * 0.01)) * 0.5 + 0.5;
      const size = (0.5 + (i % 3) * 0.5) * intensity;
      const alpha = (0.4 + twinkle * 0.6) * intensity;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Occasional bright star
      if (i % 17 === 0) {
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  renderClouds() {
    const ctx = this.ctx;
    const cloudCount = this.isMobile ? 3 : 5;
    const tod = this.lighting.timeOfDay;
    
    for (let i = 0; i < cloudCount; i++) {
      const speed = 8 + i * 2;
      const x = ((this.time * speed + i * 250) % (this.width + 400)) - 200;
      const y = 60 + i * 35 + Math.sin(this.time * 0.5 + i) * 10;
      const scale = 0.8 + i * 0.15;
      
      // Cloud color based on time of day
      let cloudColor;
      if (tod < 0.3) {
        cloudColor = `rgba(100, 120, 150, ${0.2 + i * 0.05})`;
      } else if (tod < 0.5) {
        cloudColor = `rgba(255, 180, 200, ${0.5 + i * 0.1})`;
      } else if (tod < 0.7) {
        cloudColor = `rgba(255, 255, 255, ${0.7 + i * 0.1})`;
      } else {
        cloudColor = `rgba(255, 150, 150, ${0.6 + i * 0.1})`;
      }
      
      this.drawCloud(x, y, scale, cloudColor);
    }
  }
  
  drawCloud(x, y, scale, color) {
    const ctx = this.ctx;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    
    // Multiple overlapping circles for realistic cloud
    const circles = [
      { x: 0, y: 0, r: 30 },
      { x: 25, y: -5, r: 35 },
      { x: 50, y: 0, r: 30 },
      { x: 70, y: 5, r: 25 },
      { x: 25, y: -20, r: 28 },
      { x: 45, y: -15, r: 25 }
    ];
    
    circles.forEach(circle => {
      ctx.moveTo(x + circle.x * scale + circle.r * scale, y + circle.y * scale);
      ctx.arc(
        x + circle.x * scale,
        y + circle.y * scale,
        circle.r * scale,
        0,
        Math.PI * 2
      );
    });
    
    ctx.fill();
    
    // Soft edge glow
    const glowGrad = ctx.createRadialGradient(
      x + 35 * scale, y, 0,
      x + 35 * scale, y, 80 * scale
    );
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x + 35 * scale, y, 80 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  
  renderAurora() {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.globalAlpha = 0.4;
    
    for (let i = 0; i < 4; i++) {
      const offset = Math.sin(this.time * 0.3 + i * 0.5) * 120;
      const curve = Math.sin(this.time * 0.2 + i * 0.3) * 60;
      
      const auroraGrad = ctx.createLinearGradient(
        0, 100 + offset,
        this.width, 150 + offset + curve
      );
      
      const hue1 = 160 + i * 15;
      const hue2 = 260 + i * 10;
      
      auroraGrad.addColorStop(0, `hsla(${hue1}, 80%, 60%, 0)`);
      auroraGrad.addColorStop(0.2, `hsla(${hue1}, 80%, 60%, 0.3)`);
      auroraGrad.addColorStop(0.5, `hsla(${hue2}, 70%, 50%, 0.4)`);
      auroraGrad.addColorStop(0.8, `hsla(${hue2}, 70%, 50%, 0.3)`);
      auroraGrad.addColorStop(1, `hsla(${hue2}, 70%, 50%, 0)`);
      
      ctx.fillStyle = auroraGrad;
      
      ctx.beginPath();
      ctx.moveTo(0, 100 + offset);
      
      for (let x = 0; x <= this.width; x += 20) {
        const wave = Math.sin(x * 0.01 + this.time * 0.5 + i) * 30;
        ctx.lineTo(x, 150 + offset + curve + wave);
      }
      
      ctx.lineTo(this.width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  renderEnvironment() {
    const ctx = this.ctx;
    
    // Ground with texture
    const groundY = this.height - 100;
    
    // Ground gradient
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, this.height);
    groundGrad.addColorStop(0, '#3D2817');
    groundGrad.addColorStop(0.3, '#4A3520');
    groundGrad.addColorStop(0.7, '#5C4527');
    groundGrad.addColorStop(1, '#2C1810');
    
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, this.width, 100);
    
    // Ground texture with noise
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 0; i < 60; i++) {
      const x = (i * 37.5) % this.width;
      const y = groundY + (i * 23.7) % 100;
      const size = 1 + (i % 4);
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Grass and vegetation
    if (this.stage !== 'seed') {
      this.renderGrass();
    }
    
    if (this.stage === 'forest' || this.stage === 'legend') {
      this.renderForegroundPlants();
    }
  }
  
  renderGrass() {
    const ctx = this.ctx;
    const grassCount = this.isMobile ? 30 : 50;
    const groundY = this.height - 100;
    const windEffect = this.wind.strength + this.wind.gustStrength;
    
    for (let i = 0; i < grassCount; i++) {
      const x = (i / grassCount) * this.width;
      const height = 12 + Math.sin(i * 0.5) * 8;
      const sway = Math.sin(this.time * 2.5 + i * 0.3) * 4 * windEffect +
                    Math.sin(this.time * 5 + i) * 2 * this.wind.turbulence;
      
      const hue = 90 + Math.sin(i * 0.7) * 30;
      const lightness = 35 + Math.sin(i * 0.3) * 10;
      
      ctx.strokeStyle = `hsl(${hue}, 60%, ${lightness}%)`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.quadraticCurveTo(
        x + sway * 0.5,
        groundY - height * 0.5,
        x + sway,
        groundY - height
      );
      ctx.stroke();
      
      // Grass blade tip
      ctx.fillStyle = `hsl(${hue + 10}, 70%, ${lightness + 10}%)`;
      ctx.beginPath();
      ctx.arc(x + sway, groundY - height, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  renderForegroundPlants() {
    const ctx = this.ctx;
    const plantCount = this.isMobile ? 10 : 20;
    const groundY = this.height - 100;
    
    for (let i = 0; i < plantCount; i++) {
      const x = (i / plantCount) * this.width;
      const type = i % 4;
      
      ctx.save();
      ctx.translate(x, groundY);
      
      switch(type) {
        case 0:
          this.drawFern(i);
          break;
        case 1:
          this.drawWildflower(i);
          break;
        case 2:
          this.drawBush(i);
          break;
        case 3:
          this.drawMushroom(i);
          break;
      }
      
      ctx.restore();
    }
  }
  
  drawFern(seed) {
    const ctx = this.ctx;
    const windEffect = this.wind.strength + this.wind.gustStrength;
    const sway = Math.sin(this.time * 2 + seed * 0.5) * 3 * windEffect;
    
    // Stem
    ctx.strokeStyle = '#2F4F2F';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway * 0.5, -15, sway, -28);
    ctx.stroke();
    
    // Fronds with realistic shape
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y = -5 - i * 4;
      const length = 12 - i * 1.5;
      const frondSway = sway * (i / 6);
      
      // Left frond
      ctx.strokeStyle = `hsl(${120 + i * 5}, 50%, 30%)`;
      ctx.beginPath();
      ctx.moveTo(frondSway, y);
      ctx.quadraticCurveTo(
        frondSway - length * 0.6, y - 2,
        frondSway - length, y - 4
      );
      ctx.stroke();
      
      // Right frond
      ctx.beginPath();
      ctx.moveTo(frondSway, y);
      ctx.quadraticCurveTo(
        frondSway + length * 0.6, y - 2,
        frondSway + length, y - 4
      );
      ctx.stroke();
      
      // Mini leaflets
      for (let j = 0; j < 3; j++) {
        const miniY = y - j * 1.3;
        const miniX = frondSway + (j - 1) * (length / 3);
        
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(frondSway, miniY);
        ctx.lineTo(miniX - 2, miniY - 1);
        ctx.stroke();
      }
    }
  }
  
  drawWildflower(seed) {
    const ctx = this.ctx;
    const windEffect = this.wind.strength + this.wind.gustStrength;
    const sway = Math.sin(this.time * 2.5 + seed) * 4 * windEffect;
    
    // Stem
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway * 0.6, -12, sway, -22);
    ctx.stroke();
    
    // Leaves on stem
    const leafY = -10;
    ctx.fillStyle = '#66BB6A';
    
    ctx.save();
    ctx.translate(sway * 0.6, leafY);
    ctx.rotate(-0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.translate(sway * 0.6, leafY);
    ctx.rotate(0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Flower head
    const flowerX = sway;
    const flowerY = -22;
    const hue = (seed * 47) % 360;
    const petalCount = 5;
    
    // Petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + this.time * 0.1;
      const px = flowerX + Math.cos(angle) * 4.5;
      const py = flowerY + Math.sin(angle) * 4.5;
      
      const petalGrad = ctx.createRadialGradient(px, py, 0, px, py, 4);
      petalGrad.addColorStop(0, `hsl(${hue}, 80%, 70%)`);
      petalGrad.addColorStop(0.7, `hsl(${hue}, 70%, 50%)`);
      petalGrad.addColorStop(1, `hsl(${hue}, 60%, 40%)`);
      
      ctx.fillStyle = petalGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, 3.5, 3.5, angle, 0, Math.PI * 2);
      ctx.fill();
      
      // Petal highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(px - 1, py - 1, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Center
    const centerGrad = ctx.createRadialGradient(flowerX, flowerY, 0, flowerX, flowerY, 2.5);
    centerGrad.addColorStop(0, '#FFD700');
    centerGrad.addColorStop(0.7, '#FFA500');
    centerGrad.addColorStop(1, '#FF8C00');
    
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(flowerX, flowerY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Pollen dots
    ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = flowerX + Math.cos(angle) * 1;
      const py = flowerY + Math.sin(angle) * 1;
      ctx.beginPath();
      ctx.arc(px, py, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  drawBush(seed) {
    const ctx = this.ctx;
    const windEffect = this.wind.strength + this.wind.gustStrength;
    
    // Multiple leaf clusters
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + this.time * 0.2;
      const x = Math.cos(angle) * (8 + i * 2) + Math.sin(this.time + seed + i) * 2 * windEffect;
      const y = -8 - i * 3 + Math.cos(angle) * 3;
      const size = 9 - i * 1.5;
      
      const leafGrad = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, size);
      leafGrad.addColorStop(0, `hsl(${100 + seed * 7}, 60%, 45%)`);
      leafGrad.addColorStop(0.6, `hsl(${95 + seed * 7}, 55%, 35%)`);
      leafGrad.addColorStop(1, `hsl(${90 + seed * 7}, 50%, 25%)`);
      
      ctx.fillStyle = leafGrad;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  drawMushroom(seed) {
    const ctx = this.ctx;
    
    // Stem
    const stemGrad = ctx.createLinearGradient(-2, -8, 2, 0);
    stemGrad.addColorStop(0, '#F5F5DC');
    stemGrad.addColorStop(0.5, '#E8E8D0');
    stemGrad.addColorStop(1, '#D8D8C0');
    
    ctx.fillStyle = stemGrad;
    ctx.fillRect(-2, -8, 4, 8);
    
    // Stem texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-2, -7 + i * 2.5, 4, 0.5);
    }
    
    // Cap
    const capHue = (seed * 53) % 60 + 0; // Red to orange range
    const capGrad = ctx.createRadialGradient(0, -10, 0, 0, -8, 8);
    capGrad.addColorStop(0, `hsl(${capHue}, 70%, 60%)`);
    capGrad.addColorStop(0.7, `hsl(${capHue}, 65%, 50%)`);
    capGrad.addColorStop(1, `hsl(${capHue}, 60%, 40%)`);
    
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.ellipse(0, -8, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Spots on cap
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const spots = [
      { x: -3, y: -9, r: 1.5 },
      { x: 2, y: -10, r: 1 },
      { x: -1, y: -7, r: 1.2 },
      { x: 4, y: -8, r: 0.8 }
    ];
    
    spots.forEach(spot => {
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Cap underside
    ctx.fillStyle = 'rgba(240, 230, 200, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, -8, 6, 3, 0, 0, Math.PI);
    ctx.fill();
    
    // Gills
    ctx.strokeStyle = 'rgba(200, 180, 150, 0.6)';
    ctx.lineWidth = 0.5;
    for (let i = -5; i <= 5; i += 1.5) {
      ctx.beginPath();
      ctx.moveTo(i, -8);
      ctx.lineTo(i * 0.7, -6);
      ctx.stroke();
    }
  }
  
  renderTree() {
    const ctx = this.ctx;
    const x = this.tree.x + this.tree.shakeX;
    const y = this.tree.y + this.tree.shakeY;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Add breathing scale
    const breathScale = 1 + Math.sin(this.tree.breathPhase) * 0.02;
    ctx.scale(breathScale, breathScale);
    
    // Render based on stage
    switch(this.stage) {
      case 'seed':
        this.renderSeed();
        break;
      case 'sprout':
        this.renderSprout();
        break;
      case 'plant':
        this.renderPlant();
        break;
      case 'tree':
      case 'forest':
        this.renderMatureTree();
        break;
      case 'legend':
        this.renderLegendTree();
        break;
    }
    
    ctx.restore();
  }
  
  renderSeed() {
    const ctx = this.ctx;
    const breath = Math.sin(this.tree.breathPhase) * 2;
    const glowSize = 40 + breath + this.tree.glowIntensity * 25;
    
    // Mystical glow aura
    const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
    auraGrad.addColorStop(0, `rgba(255, 215, 100, ${0.6 + this.tree.glowIntensity * 0.4})`);
    auraGrad.addColorStop(0.4, 'rgba(255, 190, 80, 0.4)');
    auraGrad.addColorStop(0.7, 'rgba(255, 165, 60, 0.2)');
    auraGrad.addColorStop(1, 'rgba(255, 140, 40, 0)');
    
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Pulsing rings
    for (let i = 0; i < 3; i++) {
      const ringPhase = this.time * 2 + i * 2;
      const ringRadius = 30 + i * 15 + Math.sin(ringPhase) * 8;
      const ringAlpha = (0.3 - i * 0.08) * (0.5 + Math.sin(ringPhase) * 0.5);
      
      ctx.strokeStyle = `rgba(255, 200, 100, ${ringAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Seed body with detailed gradient
    const seedGrad = ctx.createRadialGradient(-6, -8, 0, 0, 0, 22);
    seedGrad.addColorStop(0, '#C4A574');
    seedGrad.addColorStop(0.3, '#A0826D');
    seedGrad.addColorStop(0.6, '#8B6B47');
    seedGrad.addColorStop(0.85, '#6B4E30');
    seedGrad.addColorStop(1, '#4A3520');
    
    ctx.fillStyle = seedGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 + breath, 21 + breath, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Seed texture lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI;
      ctx.beginPath();
      ctx.arc(0, 0, 12 + i * 2, angle, angle + Math.PI * 0.4);
      ctx.stroke();
    }
    
    // Highlight
    const highlightGrad = ctx.createRadialGradient(-7, -10, 0, -5, -8, 8);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    highlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.ellipse(-5, -8, 7, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Magical shimmer particles
    if (Math.random() < 0.12) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 20;
      this.createParticle(
        this.tree.x + Math.cos(angle) * dist,
        this.tree.y + Math.sin(angle) * dist,
        'shimmer'
      );
    }
  }
  
  renderSprout() {
    const ctx = this.ctx;
    const growth = this.tree.growth;
    const windEffect = this.wind.strength + this.wind.gustStrength;
    
    // Soil mound with gradient
    const soilGrad = ctx.createRadialGradient(0, -5, 0, 0, 0, 35);
    soilGrad.addColorStop(0, '#6B4E30');
    soilGrad.addColorStop(0.6, '#5C3D20');
    soilGrad.addColorStop(1, '#4A2C10');
    
    ctx.fillStyle = soilGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Soil texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * (15 + Math.random() * 10);
      const y = Math.sin(angle) * (8 + Math.random() * 5);
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Soil shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 32, 8, 0, 0, Math.PI);
    ctx.fill();
    
    // Stem with sway
    const stemHeight = 75 * growth;
    const sway = Math.sin(this.time * 2.3) * 7 * windEffect +
                  Math.sin(this.time * 5) * 3 * this.wind.turbulence;
    
    // Stem gradient
    const stemGrad = ctx.createLinearGradient(-3, 0, 3, -stemHeight);
    stemGrad.addColorStop(0, '#7CB342');
    stemGrad.addColorStop(0.3, '#8BC34A');
    stemGrad.addColorStop(0.6, '#9CCC65');
    stemGrad.addColorStop(1, '#AED581');
    
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw curved stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      sway * 0.3, -stemHeight * 0.3,
      sway * 0.6, -stemHeight * 0.6,
      sway, -stemHeight
    );
    ctx.stroke();
    
    // Stem highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-1, -5);
    ctx.bezierCurveTo(
      sway * 0.3 - 1, -stemHeight * 0.3,
      sway * 0.6 - 1, -stemHeight * 0.7,
      sway - 1, -stemHeight + 5
    );
    ctx.stroke();
    
    // First leaves
    if (growth > 0.3) {
      const leafScale = Math.min(1, (growth - 0.3) / 0.3);
      this.drawSproutLeaf(
        sway - 18, -stemHeight + 15,
        -45 + sway * 2.5,
        0.8 * leafScale
      );
      this.drawSproutLeaf(
        sway + 18, -stemHeight + 15,
        45 + sway * 2.5,
        0.8 * leafScale
      );
    }
    
    if (growth > 0.6) {
      const leafScale = Math.min(1, (growth - 0.6) / 0.4);
      this.drawSproutLeaf(
        sway - 14, -stemHeight * 0.6,
        -35 + sway * 2,
        0.6 * leafScale
      );
      this.drawSproutLeaf(
        sway + 14, -stemHeight * 0.6,
        35 + sway * 2,
        0.6 * leafScale
      );
    }
    
    // Dew drops with probability
    if (this.lighting.timeOfDay < 0.4 && Math.random() < 0.04 && growth > 0.5) {
      this.createParticle(
        this.tree.x + sway + (Math.random() - 0.5) * 30,
        this.tree.y - stemHeight + 10,
        'dew'
      );
    }
    
    // Growth sparkles
    if (Math.random() < 0.05 * growth) {
      this.createParticle(
        this.tree.x + sway + (Math.random() - 0.5) * 20,
        this.tree.y - stemHeight * Math.random(),
        'shimmer'
      );
    }
  }
  
  drawSproutLeaf(x, y, rotation, scale) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    // Leaf shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(2, 2, 13, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Leaf gradient
    const leafGrad = ctx.createRadialGradient(-5, -10, 0, 0, 0, 20);
    leafGrad.addColorStop(0, '#AED581');
    leafGrad.addColorStop(0.3, '#9CCC65');
    leafGrad.addColorStop(0.6, '#8BC34A');
    leafGrad.addColorStop(0.85, '#7CB342');
    leafGrad.addColorStop(1, '#689F38');
    
    ctx.fillStyle = leafGrad;
    
    // Organic leaf shape
    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.bezierCurveTo(-10, -14, -12, -7, -12, 0);
    ctx.bezierCurveTo(-12, 10, -6, 16, 0, 18);
    ctx.bezierCurveTo(6, 16, 12, 10, 12, 0);
    ctx.bezierCurveTo(12, -7, 10, -14, 0, -17);
    ctx.closePath();
    ctx.fill();
    
    // Central vein
    ctx.strokeStyle = 'rgba(100, 140, 50, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.lineTo(0, 18);
    ctx.stroke();
    
    // Side veins with branches
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(100, 140, 50, 0.4)';
    
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const vy = i * 5;
      const vLength = 10 - Math.abs(i) * 1.5;
      
      // Main vein
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(vLength * 0.6, vy + 2, vLength, vy + 4);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(-vLength * 0.6, vy + 2, -vLength, vy + 4);
      ctx.stroke();
      
      // Sub-veins
      if (Math.abs(i) <= 2) {
        ctx.strokeStyle = 'rgba(100, 140, 50, 0.25)';
        ctx.lineWidth = 0.5;
        
        for (let j = 0; j < 2; j++) {
          const subLength = vLength * 0.4;
          const subY = vy + j * 2;
          
          ctx.beginPath();
          ctx.moveTo(vLength * 0.5, vy + 2);
          ctx.lineTo(vLength * 0.7, subY + 3);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(-vLength * 0.5, vy + 2);
          ctx.lineTo(-vLength * 0.7, subY + 3);
          ctx.stroke();
        }
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(100, 140, 50, 0.4)';
      }
    }
    
    // Highlight
    const highlightGrad = ctx.createRadialGradient(-6, -10, 0, -4, -8, 8);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    highlightGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.ellipse(-4, -8, 5, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Leaf edge detail
    ctx.strokeStyle = 'rgba(100, 140, 50, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.bezierCurveTo(-10, -14, -12, -7, -12, 0);
    ctx.bezierCurveTo(-12, 10, -6, 16, 0, 18);
    ctx.bezierCurveTo(6, 16, 12, 10, 12, 0);
    ctx.bezierCurveTo(12, -7, 10, -14, 0, -17);
    ctx.stroke();
    
    ctx.restore();
  }
  
  renderPlant() {
    const ctx = this.ctx;
    const growth = this.tree.growth;
    const stemHeight = 140 * growth;
    const windEffect = this.wind.strength + this.wind.gustStrength;
    const sway = Math.sin(this.time * 1.7) * 12 * windEffect +
                  Math.sin(this.time * 4) * 5 * this.wind.turbulence;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(sway * 0.2, 5, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Main stem with gradient
    const stemGrad = ctx.createLinearGradient(-5, 0, 5, -stemHeight);
    stemGrad.addColorStop(0, '#6B4E30');
    stemGrad.addColorStop(0.2, '#7CB342');
    stemGrad.addColorStop(0.5, '#8BC34A');
    stemGrad.addColorStop(0.8, '#9CCC65');
    stemGrad.addColorStop(1, '#AED581');
    
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      sway * 0.3, -stemHeight * 0.3,
      sway * 0.6, -stemHeight * 0.6,
      sway, -stemHeight
    );
    ctx.stroke();
    
    // Stem highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-2, -10);
    ctx.bezierCurveTo(
      sway * 0.3 - 2, -stemHeight * 0.4,
      sway * 0.6 - 2, -stemHeight * 0.7,
      sway - 2, -stemHeight + 10
    );
    ctx.stroke();
    
    // Branches with leaves
    const branchCount = Math.floor(growth * 8);
    
    for (let i = 0; i < branchCount; i++) {
      const progress = (i + 1) / (branchCount + 1);
      const branchY = -stemHeight * progress;
      const branchX = sway * progress;
      const direction = i % 2 === 0 ? 1 : -1;
      const branchLength = 45 - i * 3;
      const branchSway = Math.sin(this.time * 1.8 + i * 0.5) * 7 * windEffect;
      
      // Branch gradient
      const branchGrad = ctx.createLinearGradient(
        branchX, branchY,
        branchX + branchLength * direction, branchY - 20
      );
      branchGrad.addColorStop(0, `hsl(${110 + i * 3}, 50%, ${35 + progress * 10}%)`);
      branchGrad.addColorStop(0.6, `hsl(${115 + i * 3}, 55%, ${40 + progress * 10}%)`);
      branchGrad.addColorStop(1, `hsl(${120 + i * 3}, 60%, ${45 + progress * 10}%)`);
      
      ctx.strokeStyle = branchGrad;
      ctx.lineWidth = 5 - i * 0.4;
      
      ctx.beginPath();
      ctx.moveTo(branchX, branchY);
      ctx.bezierCurveTo(
        branchX + (branchLength * 0.4 * direction), branchY - 8,
        branchX + (branchLength * 0.7 * direction), branchY - 15,
        branchX + (branchLength * direction) + branchSway, branchY - 22
      );
      ctx.stroke();
      
      // Leaves on branch
      const leafPositions = [
        { dist: 1.0, scale: 1.0 },
        { dist: 0.7, scale: 0.8 },
        { dist: 0.4, scale: 0.6 }
      ];
      
      leafPositions.forEach((pos, idx) => {
        const leafX = branchX + (branchLength * pos.dist * direction) + branchSway * pos.dist;
        const leafY = branchY - 22 * pos.dist;
        const leafRotation = direction * (35 + idx * 10) + branchSway * 1.5;
        
        this.drawDetailedLeaf(leafX, leafY, leafRotation, pos.scale, i);
      });
    }
    
    // Top leaves cluster
    if (growth > 0.6) {
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + this.time * 0.3;
        const dist = 15 + i * 3;
        const leafX = sway + Math.cos(angle) * dist;
        const leafY = -stemHeight + Math.sin(angle) * dist * 0.6;
        const leafRotation = (angle * 180 / Math.PI) + Math.sin(this.time * 2 + i) * 15 * windEffect;
        
        this.drawDetailedLeaf(leafX, leafY, leafRotation, 1.1, i);
      }
    }
  }
  
  drawDetailedLeaf(x, y, rotation, scale, seed = 0) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    // Leaf shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(1.5, 1.5, 11, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Leaf gradient with variation
    const hue = 110 + (seed % 5) * 5;
    const leafGrad = ctx.createRadialGradient(-4, -8, 0, 0, 0, 18);
    leafGrad.addColorStop(0, `hsl(${hue + 10}, 65%, 55%)`);
    leafGrad.addColorStop(0.3, `hsl(${hue}, 60%, 50%)`);
    leafGrad.addColorStop(0.6, `hsl(${hue - 5}, 55%, 42%)`);
    leafGrad.addColorStop(0.85, `hsl(${hue - 10}, 50%, 35%)`);
    leafGrad.addColorStop(1, `hsl(${hue - 15}, 45%, 28%)`);
    
    ctx.fillStyle = leafGrad;
    
    // Organic leaf shape
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.bezierCurveTo(-9, -13, -11, -6, -11, 0);
    ctx.bezierCurveTo(-11, 9, -5, 15, 0, 17);
    ctx.bezierCurveTo(5, 15, 11, 9, 11, 0);
    ctx.bezierCurveTo(11, -6, 9, -13, 0, -16);
    ctx.closePath();
    ctx.fill();
    
    // Central vein
    ctx.strokeStyle = `rgba(${80 + seed * 5}, 120, 60, 0.7)`;
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(-0.5, 0, 0, 17);
    ctx.stroke();
    
    // Side veins with realistic branching
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${80 + seed * 5}, 120, 60, 0.5)`;
    
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const vy = i * 4.5;
      const vLength = 9 - Math.abs(i) * 1.5;
      const curve = i * 0.5;
      
      // Right vein
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(vLength * 0.5, vy + curve + 2, vLength, vy + curve + 4);
      ctx.stroke();
      
      // Left vein
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(-vLength * 0.5, vy + curve + 2, -vLength, vy + curve + 4);
      ctx.stroke();
      
      // Tertiary veins
      if (Math.abs(i) <= 2) {
        ctx.strokeStyle = `rgba(${80 + seed * 5}, 120, 60, 0.3)`;
        ctx.lineWidth = 0.6;
        
        for (let j = 0; j < 2; j++) {
          const subLength = vLength * 0.5;
          const subAngle = j * 0.3;
          
          ctx.beginPath();
          ctx.moveTo(vLength * 0.6, vy + curve + 3);
          ctx.lineTo(vLength * 0.8, vy + curve + 5 + j * 2);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(-vLength * 0.6, vy + curve + 3);
          ctx.lineTo(-vLength * 0.8, vy + curve + 5 + j * 2);
          ctx.stroke();
        }
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${80 + seed * 5}, 120, 60, 0.5)`;
      }
    }
    
    // Highlight
    const highlightGrad = ctx.createRadialGradient(-5, -9, 0, -3, -7, 10);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    highlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.ellipse(-3, -7, 6, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Subtle edge detail
    ctx.strokeStyle = `rgba(${60 + seed * 3}, 100, 50, 0.4)`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.bezierCurveTo(-9, -13, -11, -6, -11, 0);
    ctx.bezierCurveTo(-11, 9, -5, 15, 0, 17);
    ctx.bezierCurveTo(5, 15, 11, 9, 11, 0);
    ctx.bezierCurveTo(11, -6, 9, -13, 0, -16);
    ctx.stroke();
    
    // Occasional damage or spots for realism
    if (seed % 7 === 0) {
      ctx.fillStyle = 'rgba(139, 69, 19, 0.2)';
      ctx.beginPath();
      ctx.arc(4, 5, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  renderMatureTree() {
    const ctx = this.ctx;
    const growth = this.tree.growth;
    const trunkHeight = 240 * growth;
    const trunkWidth = 22;
    const windEffect = this.wind.strength + this.wind.gustStrength;
    
    // Root system
    this.renderRoots(trunkWidth, growth);
    
    // Trunk shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(4, 0, trunkWidth + 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Trunk with realistic gradient
    const trunkGrad = ctx.createLinearGradient(-trunkWidth, 0, trunkWidth, 0);
    trunkGrad.addColorStop(0, '#3D2817');
    trunkGrad.addColorStop(0.15, '#4A3520');
    trunkGrad.addColorStop(0.3, '#6B4E30');
    trunkGrad.addColorStop(0.5, '#8B6B47');
    trunkGrad.addColorStop(0.7, '#6B4E30');
    trunkGrad.addColorStop(0.85, '#4A3520');
    trunkGrad.addColorStop(1, '#3D2817');
    
    ctx.fillStyle = trunkGrad;
    
    // Organic trunk shape
    const breath = Math.sin(this.tree.breathPhase * 0.4) * 1;
    
    ctx.beginPath();
    ctx.moveTo(-trunkWidth - breath, 0);
    ctx.bezierCurveTo(
      -trunkWidth * 0.85, -trunkHeight * 0.25,
      -trunkWidth * 0.75, -trunkHeight * 0.5,
      -trunkWidth * 0.68, -trunkHeight * 0.75
    );
    ctx.bezierCurveTo(
      -trunkWidth * 0.65, -trunkHeight * 0.85,
      -trunkWidth * 0.6, -trunkHeight * 0.95,
      -trunkWidth * 0.55, -trunkHeight
    );
    ctx.lineTo(trunkWidth * 0.55, -trunkHeight);
    ctx.bezierCurveTo(
      trunkWidth * 0.6, -trunkHeight * 0.95,
      trunkWidth * 0.65, -trunkHeight * 0.85,
      trunkWidth * 0.68, -trunkHeight * 0.75
    );
    ctx.bezierCurveTo(
      trunkWidth * 0.75, -trunkHeight * 0.5,
      trunkWidth * 0.85, -trunkHeight * 0.25,
      trunkWidth + breath, 0
    );
    ctx.closePath();
    ctx.fill();
    
    // Bark texture
    this.renderDetailedBark(trunkWidth, trunkHeight);
    
    // Trunk highlight
    const highlightGrad = ctx.createLinearGradient(-trunkWidth, -trunkHeight, -trunkWidth + 8, -trunkHeight + 50);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    highlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.moveTo(-trunkWidth * 0.7, -trunkHeight * 0.9);
    ctx.bezierCurveTo(
      -trunkWidth * 0.6, -trunkHeight * 0.6,
      -trunkWidth * 0.7, -trunkHeight * 0.3,
      -trunkWidth * 0.8, 0
    );
    ctx.lineTo(-trunkWidth * 0.85, 0);
    ctx.bezierCurveTo(
      -trunkWidth * 0.75, -trunkHeight * 0.3,
      -trunkWidth * 0.65, -trunkHeight * 0.6,
      -trunkWidth * 0.55, -trunkHeight
    );
    ctx.closePath();
    ctx.fill();
    
    // Canopy
    this.renderRealisticCanopy(0, -trunkHeight, 110 * growth, windEffect);
    
    // Spawn creatures based on progress
    if (this.birds.length < Math.min(this.maxBirds, Math.floor(this.habitCount / 20)) && Math.random() < 0.015) {
      this.addBird(this.tree.x, this.tree.y - trunkHeight - 60);
    }
    
    if (this.butterflies.length < Math.min(this.maxButterflies, 2 + Math.floor(this.habitCount / 30)) && Math.random() < 0.02) {
      this.addButterfly(
        this.tree.x + (Math.random() - 0.5) * 150,
        this.tree.y - trunkHeight + (Math.random() - 0.5) * 100
      );
    }
  }
  
  renderRoots(trunkWidth, growth) {
    const ctx = this.ctx;
    const rootCount = 6;
    const rootDepth = 35 * growth;
    
    for (let i = 0; i < rootCount; i++) {
      const angle = ((i / rootCount) * Math.PI) - Math.PI / 2 + (i % 2 === 0 ? 0.1 : -0.1);
      const rootLength = rootDepth + Math.sin(i) * 10;
      const thickness = 6 - i * 0.8;
      
      const startX = Math.cos(angle + Math.PI / 2) * trunkWidth * 0.8;
      const startY = 0;
      
      const controlX = startX + Math.cos(angle) * rootLength * 0.6;
      const controlY = startY + Math.sin(angle) * rootLength * 0.4 + 15;
      
      const endX = startX + Math.cos(angle) * rootLength;
      const endY = startY + Math.sin(angle) * rootLength * 0.3 + 20;
      
      // Root gradient
      const rootGrad = ctx.createLinearGradient(startX, startY, endX, endY);
      rootGrad.addColorStop(0, '#6B4E30');
      rootGrad.addColorStop(0.5, '#5C3D20');
      rootGrad.addColorStop(1, '#4A2C10');
      
      ctx.strokeStyle = rootGrad;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();
      
      // Root sub-branches
      if (i % 2 === 0) {
        const subStartX = startX + Math.cos(angle) * rootLength * 0.5;
        const subStartY = startY + Math.sin(angle) * rootLength * 0.25 + 12;
        const subAngle = angle + (i % 3 === 0 ? 0.4 : -0.4);
        const subLength = rootLength * 0.4;
        
        ctx.lineWidth = thickness * 0.6;
        ctx.beginPath();
        ctx.moveTo(subStartX, subStartY);
        ctx.lineTo(
          subStartX + Math.cos(subAngle) * subLength,
          subStartY + Math.sin(subAngle) * subLength * 0.3 + 8
        );
        ctx.stroke();
      }
      
      // Root highlight
      ctx.strokeStyle = 'rgba(139, 107, 71, 0.4)';
      ctx.lineWidth = thickness * 0.3;
      ctx.beginPath();
      ctx.moveTo(startX - 1, startY);
      ctx.quadraticCurveTo(controlX - 1, controlY, endX - 2, endY);
      ctx.stroke();
    }
  }
  
  renderDetailedBark(width, height) {
    const ctx = this.ctx;
    
    // Vertical bark lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    for (let i = 0; i < 12; i++) {
      const x = -width * 0.75 + (i / 12) * width * 1.5;
      const offsetY = Math.sin(i * 0.7) * 15;
      const segments = 8;
      
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      
      for (let seg = 0; seg <= segments; seg++) {
        const progress = seg / segments;
        const y = -height * progress + offsetY;
        const xOffset = x * (1 - progress * 0.35) + Math.sin(seg * 0.5 + i) * 2;
        
        if (seg === 0) {
          ctx.moveTo(xOffset, y);
        } else {
          ctx.lineTo(xOffset, y);
        }
      }
      
      ctx.stroke();
    }
    
    // Horizontal bark texture
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 15; i++) {
      const y = -height * (i / 15);
      const progress = i / 15;
      const currentWidth = width * (1 - progress * 0.4);
      
      ctx.beginPath();
      ctx.moveTo(-currentWidth * 0.7, y);
      ctx.quadraticCurveTo(
        Math.sin(i) * 3, y + Math.cos(i) * 2,
        currentWidth * 0.7, y
      );
      ctx.stroke();
    }
    
    // Knots and burls
    const knots = [
      { x: -width * 0.35, y: -height * 0.25, size: 8, rotation: 0.3 },
      { x: width * 0.25, y: -height * 0.55, size: 6, rotation: -0.2 },
      { x: -width * 0.15, y: -height * 0.75, size: 7, rotation: 0.1 },
      { x: width * 0.1, y: -height * 0.35, size: 5, rotation: -0.4 }
    ];
    
    knots.forEach(knot => {
      ctx.save();
      ctx.translate(knot.x, knot.y);
      ctx.rotate(knot.rotation);
      
      // Knot shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 0, knot.size, knot.size * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Knot body
      const knotGrad = ctx.createRadialGradient(-knot.size * 0.3, -knot.size * 0.3, 0, 0, 0, knot.size);
      knotGrad.addColorStop(0, '#5C3D20');
      knotGrad.addColorStop(0.6, '#4A2C10');
      knotGrad.addColorStop(1, '#3D2817');
      
      ctx.fillStyle = knotGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, knot.size * 0.9, knot.size * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Knot rings
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 0.8;
      for (let ring = 1; ring <= 3; ring++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, knot.size * 0.3 * ring, knot.size * 0.35 * ring, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.restore();
    });
    
    // Bark cracks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 1.2;
    
    const cracks = [
      { startY: -height * 0.4, length: 25, angle: -0.2 },
      { startY: -height * 0.65, length: 18, angle: 0.3 },
      { startY: -height * 0.15, length: 15, angle: -0.15 }
    ];
    
    cracks.forEach(crack => {
      const startX = (Math.random() - 0.5) * width * 0.8;
      
      ctx.beginPath();
      ctx.moveTo(startX, crack.startY);
      
      let currentX = startX;
      let currentY = crack.startY;
      const segments = 5;
      
      for (let i = 1; i <= segments; i++) {
        const segmentLength = crack.length / segments;
        currentX += Math.cos(crack.angle) * segmentLength + (Math.random() - 0.5) * 2;
        currentY -= segmentLength + (Math.random() - 0.5) * 2;
        ctx.lineTo(currentX, currentY);
      }
      
      ctx.stroke();
    });
  }
  
  renderRealisticCanopy(x, y, radius, windEffect) {
    const ctx = this.ctx;
    
    // Multiple depth layers for volume
    const layers = [
      { offset: 20, scale: 1.1, alpha: 0.3, darkness: 15 },
      { offset: 10, scale: 1.05, alpha: 0.5, darkness: 10 },
      { offset: 0, scale: 1, alpha: 0.7, darkness: 5 },
      { offset: -8, scale: 0.95, alpha: 0.85, darkness: 0 }
    ];
    
    layers.forEach((layer, layerIndex) => {
      const layerY = y + layer.offset;
      const layerRadius = radius * layer.scale;
      
      // Canopy gradient
      const canopyGrad = ctx.createRadialGradient(x, layerY, 0, x, layerY, layerRadius);
      const baseHue = 115;
      const baseSat = 60;
      const baseLight = 42 - layer.darkness;
      
      canopyGrad.addColorStop(0, `hsla(${baseHue + 5}, ${baseSat + 10}%, ${baseLight + 8}%, ${layer.alpha})`);
      canopyGrad.addColorStop(0.4, `hsla(${baseHue}, ${baseSat}%, ${baseLight}%, ${layer.alpha})`);
      canopyGrad.addColorStop(0.7, `hsla(${baseHue - 5}, ${baseSat - 5}%, ${baseLight - 8}%, ${layer.alpha * 0.8})`);
      canopyGrad.addColorStop(1, `hsla(${baseHue - 10}, ${baseSat - 10}%, ${baseLight - 15}%, ${layer.alpha * 0.3})`);
      
      ctx.fillStyle = canopyGrad;
      
      // Organic, wind-affected shape
      ctx.beginPath();
      const segments = 24;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const noise1 = Math.sin(angle * 3 + this.time * 0.4 + layerIndex) * (12 + layerIndex * 4);
        const noise2 = Math.sin(angle * 5 + this.time * 0.6) * (6 + layerIndex * 2);
        const windOffset = Math.sin(angle + this.time * 1.8) * windEffect * (8 + layerIndex * 3);
        const breathOffset = Math.sin(this.tree.breathPhase + angle) * 5;
        
        const r = layerRadius + noise1 + noise2 + windOffset + breathOffset;
        const px = x + Math.cos(angle) * r;
        const py = layerY + Math.sin(angle) * r * 0.8; // Slightly elliptical
        
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Add leaf clusters for detail (only on front layers)
      if (layerIndex >= 2) {
        this.renderLeafClusters(x, layerY, layerRadius, layer.alpha);
      }
    });
    
    // Individual leaves on the edges for extra detail
    if (this.leaves.length > 0) {
      this.renderIndividualLeaves(x, y, radius);
    }
  }
  
  renderLeafClusters(cx, cy, radius, alpha) {
    const ctx = this.ctx;
    const clusterCount = this.isMobile ? 12 : 20;
    
    for (let i = 0; i < clusterCount; i++) {
      const angle = (i / clusterCount) * Math.PI * 2 + this.time * 0.1;
      const dist = radius * (0.6 + Math.random() * 0.3);
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist * 0.8;
      
      const clusterSize = 15 + Math.random() * 10;
      const hue = 110 + Math.random() * 20;
      
      const clusterGrad = ctx.createRadialGradient(x, y, 0, x, y, clusterSize);
      clusterGrad.addColorStop(0, `hsla(${hue}, 70%, 50%, ${alpha * 0.8})`);
      clusterGrad.addColorStop(0.6, `hsla(${hue - 5}, 65%, 42%, ${alpha * 0.6})`);
      clusterGrad.addColorStop(1, `hsla(${hue - 10}, 60%, 35%, 0)`);
      
      ctx.fillStyle = clusterGrad;
      ctx.beginPath();
      ctx.arc(x, y, clusterSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Tiny leaf shapes
      for (let j = 0; j < 3; j++) {
        const leafAngle = angle + (j - 1) * 0.5;
        const leafX = x + Math.cos(leafAngle) * (clusterSize * 0.6);
        const leafY = y + Math.sin(leafAngle) * (clusterSize * 0.6);
        
        ctx.save();
        ctx.translate(leafX, leafY);
        ctx.rotate(leafAngle);
        ctx.scale(0.4, 0.4);
        
        ctx.fillStyle = `hsla(${hue + j * 5}, 65%, 45%, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }
  }
  
  renderIndividualLeaves(cx, cy, radius) {
    const ctx = this.ctx;
    
    // Render cached leaves
    this.leaves.forEach((leaf, index) => {
      const angle = leaf.angle + this.time * 0.05;
      const dist = leaf.distance * radius;
      const x = cx + (leaf.currentX || Math.cos(angle) * dist);
      const y = cy + (leaf.currentY || Math.sin(angle) * dist * 0.8);
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((leaf.currentRotation * Math.PI) / 180);
      ctx.scale(leaf.size * 0.5, leaf.size * 0.5);
      
      // Use pre-rendered texture if available
      if (this.textureCache.leaf && !this.isMobile) {
        ctx.globalAlpha = 0.8;
        ctx.drawImage(
          this.textureCache.leaf,
          -this.textureCache.leaf.width / 2,
          -this.textureCache.leaf.height / 2
        );
        ctx.globalAlpha = 1;
      } else {
        // Fallback simple leaf
        ctx.fillStyle = leaf.color || '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0, 100, 0, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(0, 12);
        ctx.stroke();
      }
      
      ctx.restore();
    });
  }
  
  renderLegendTree() {
    const ctx = this.ctx;
    const growth = this.tree.growth;
    
    // Increase scale for legendary status
    ctx.save();
    ctx.scale(1.2, 1.2);
    
    // Epic pulsing aura
    const pulsePhase = Math.sin(this.time * 1.5) * 0.5 + 0.5;
    const auraSize = 280 + pulsePhase * 60;
    
    const auraGrad = ctx.createRadialGradient(0, -180, 0, 0, -180, auraSize);
    auraGrad.addColorStop(0, `rgba(147, 51, 234, ${0.7 * pulsePhase})`); // Purple
    auraGrad.addColorStop(0.3, `rgba(79, 70, 229, ${0.5 * pulsePhase})`); // Indigo
    auraGrad.addColorStop(0.6, `rgba(139, 92, 246, ${0.3 * pulsePhase})`); // Violet
    auraGrad.addColorStop(1, 'rgba(124, 58, 237, 0)');
    
    ctx.fillStyle = auraGrad;
    ctx.fillRect(-auraSize, -400, auraSize * 2, auraSize * 2);
    
    // Rotating energy rings
    ctx.save();
    ctx.translate(0, -180);
    
    for (let i = 0; i < 5; i++) {
      const ringPhase = this.time + i * Math.PI / 2.5;
      const ringRadius = 90 + i * 50 + Math.sin(ringPhase * 2) * 15;
      const ringAlpha = (0.4 - i * 0.06) * (0.5 + Math.sin(ringPhase * 3) * 0.5);
      
      ctx.save();
      ctx.rotate(ringPhase * (i % 2 === 0 ? 0.1 : -0.1));
      
      // Ring gradient
      const ringGrad = ctx.createRadialGradient(0, 0, ringRadius - 3, 0, 0, ringRadius + 3);
      ringGrad.addColorStop(0, `rgba(167, 139, 250, 0)`);
      ringGrad.addColorStop(0.5, `rgba(139, 92, 246, ${ringAlpha})`);
      ringGrad.addColorStop(1, `rgba(124, 58, 237, 0)`);
      
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Particles on ring
      for (let j = 0; j < 12; j++) {
        const particleAngle = (j / 12) * Math.PI * 2 + ringPhase;
        const px = Math.cos(particleAngle) * ringRadius;
        const py = Math.sin(particleAngle) * ringRadius;
        
        ctx.fillStyle = `rgba(196, 181, 253, ${ringAlpha * 1.5})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    ctx.restore();
    
    // Crystalline trunk
    const trunkHeight = 290;
    const trunkWidth = 32;
    
    // Trunk gradient with mystical colors
    const trunkGrad = ctx.createLinearGradient(-trunkWidth, 0, trunkWidth, 0);
    trunkGrad.addColorStop(0, '#8B6914');
    trunkGrad.addColorStop(0.15, '#B8860B');
    trunkGrad.addColorStop(0.3, '#DAA520');
    trunkGrad.addColorStop(0.5, '#FFD700');
    trunkGrad.addColorStop(0.7, '#DAA520');
    trunkGrad.addColorStop(0.85, '#B8860B');
    trunkGrad.addColorStop(1, '#8B6914');
    
    ctx.fillStyle = trunkGrad;
    
    // Trunk shape
    ctx.beginPath();
    ctx.moveTo(-trunkWidth, 0);
    ctx.bezierCurveTo(
      -trunkWidth * 0.85, -trunkHeight * 0.3,
      -trunkWidth * 0.7, -trunkHeight * 0.6,
      -trunkWidth * 0.6, -trunkHeight * 0.85
    );
    ctx.bezierCurveTo(
      -trunkWidth * 0.55, -trunkHeight * 0.95,
      -trunkWidth * 0.5, -trunkHeight,
      -trunkWidth * 0.45, -trunkHeight
    );
    ctx.lineTo(trunkWidth * 0.45, -trunkHeight);
    ctx.bezierCurveTo(
      trunkWidth * 0.5, -trunkHeight,
      trunkWidth * 0.55, -trunkHeight * 0.95,
      trunkWidth * 0.6, -trunkHeight * 0.85
    );
    ctx.bezierCurveTo(
      trunkWidth * 0.7, -trunkHeight * 0.6,
      trunkWidth * 0.85, -trunkHeight * 0.3,
      trunkWidth, 0
    );
    ctx.closePath();
    ctx.fill();
    
    // Glowing veins on trunk
    this.renderMysticVeins(trunkWidth, trunkHeight);
    
    // Sacred geometry at crown
    this.renderSacredGeometry(0, -trunkHeight);
    
    // Ethereal canopy
    this.renderEtherealCanopy(0, -trunkHeight, 150);
    
    ctx.restore();
    
    // Floating runes
    this.renderFloatingRunes();
    
    // Elemental effects
    this.renderElementalEffects();
  }
  
  renderMysticVeins(width, height) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#A78BFA';
    
    const veinCount = 8;
    
    for (let i = 0; i < veinCount; i++) {
      const startY = -(height / veinCount) * i;
      const direction = i % 2 === 0 ? 1 : -1;
      const pulse = Math.sin(this.time * 4 + i * 0.5) * 4;
      const glowPulse = (Math.sin(this.time * 3 + i) + 1) / 2;
      
      const veinGrad = ctx.createLinearGradient(
        0, startY,
        direction * (22 + pulse), startY - 50
      );
      veinGrad.addColorStop(0, `rgba(167, 139, 250, ${0.3 + glowPulse * 0.5})`);
      veinGrad.addColorStop(0.5, `rgba(139, 92, 246, ${0.5 + glowPulse * 0.3})`);
      veinGrad.addColorStop(1, `rgba(124, 58, 237, ${0.7 + glowPulse * 0.3})`);
      
      ctx.strokeStyle = veinGrad;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(0, startY);
      ctx.bezierCurveTo(
        direction * 12, startY - 20,
        direction * 18, startY - 35,
        direction * (22 + pulse), startY - 50
      );
      ctx.stroke();
      
      // Glow nodes
      const nodePositions = [
        { x: 0, y: startY },
        { x: direction * 12, y: startY - 20 },
        { x: direction * (22 + pulse), y: startY - 50 }
      ];
      
      nodePositions.forEach((pos, idx) => {
        const nodeSize = 3 + glowPulse * 2 - idx * 0.5;
        
        const nodeGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, nodeSize * 3);
        nodeGrad.addColorStop(0, `rgba(196, 181, 253, ${0.9 + glowPulse * 0.1})`);
        nodeGrad.addColorStop(0.5, `rgba(167, 139, 250, ${0.6})`);
        nodeGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.fillStyle = nodeGrad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeSize * 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#F5F3FF';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Sub-veins
      if (i % 2 === 0) {
        ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 + glowPulse * 0.2})`;
        ctx.lineWidth = 1.5;
        
        for (let j = 0; j < 2; j++) {
          const subY = startY - 15 - j * 12;
          const subX = direction * (8 + j * 4);
          
          ctx.beginPath();
          ctx.moveTo(direction * 12, startY - 20);
          ctx.lineTo(subX, subY);
          ctx.stroke();
        }
      }
    }
    
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  
  renderSacredGeometry(x, y) {
    const ctx = this.ctx;
    const rotation = this.time * 0.2;
    const pulse = (Math.sin(this.time * 2) + 1) / 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // Outer ring
    const outerRing = ctx.createRadialGradient(0, 0, 35, 0, 0, 50);
    outerRing.addColorStop(0, 'rgba(251, 191, 36, 0)');
    outerRing.addColorStop(0.8, `rgba(251, 191, 36, ${0.6 + pulse * 0.4})`);
    outerRing.addColorStop(1, 'rgba(251, 191, 36, 0)');
    
    ctx.strokeStyle = outerRing;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();
    
    // Flower of life pattern
    const petalCount = 12;
    const petalRadius = 35;
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const hue = 280 + (i / petalCount) * 80;
      
      ctx.save();
      ctx.rotate(angle);
      
      // Petal gradient
      const petalGrad = ctx.createRadialGradient(0, -petalRadius * 0.8, 0, 0, -petalRadius, petalRadius * 0.8);
      petalGrad.addColorStop(0, `hsla(${hue}, 80%, 75%, ${0.85 + pulse * 0.15})`);
      petalGrad.addColorStop(0.5, `hsla(${hue}, 75%, 65%, ${0.7 + pulse * 0.2})`);
      petalGrad.addColorStop(0.8, `hsla(${hue}, 70%, 55%, ${0.5 + pulse * 0.3})`);
      petalGrad.addColorStop(1, `hsla(${hue}, 65%, 45%, 0.1)`);
      
      ctx.fillStyle = petalGrad;
      ctx.beginPath();
      ctx.ellipse(0, -petalRadius, 14, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + pulse * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(-3, -petalRadius - 5, 4, 8, -0.2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
    
    // Center mandala
    const centerSize = 18;
    const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, centerSize);
    centerGrad.addColorStop(0, '#FFFEF7');
    centerGrad.addColorStop(0.3, '#FEF3C7');
    centerGrad.addColorStop(0.6, '#FDE68A');
    centerGrad.addColorStop(0.85, '#FCD34D');
    centerGrad.addColorStop(1, '#FBBF24');
    
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, centerSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Sacred symbols
    ctx.save();
    ctx.rotate(-rotation * 2); // Counter-rotate for stationary effect
    
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 2.5;
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(0, -centerSize * 0.6);
    ctx.lineTo(0, centerSize * 0.6);
    ctx.stroke();
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(-centerSize * 0.6, 0);
    ctx.lineTo(centerSize * 0.6, 0);
    ctx.stroke();
    
    // Diagonal lines
    const diag = centerSize * 0.42;
    ctx.beginPath();
    ctx.moveTo(-diag, -diag);
    ctx.lineTo(diag, diag);
    ctx.moveTo(-diag, diag);
    ctx.lineTo(diag, -diag);
    ctx.stroke();
    
    // Center dot
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Orbiting particles
    for (let i = 0; i < 8; i++) {
      const orbitAngle = rotation * 3 + (i / 8) * Math.PI * 2;
      const orbitRadius = 55 + Math.sin(this.time * 2 + i) * 5;
      const px = Math.cos(orbitAngle) * orbitRadius;
      const py = Math.sin(orbitAngle) * orbitRadius;
      const particleSize = 2 + pulse * 1.5;
      
      const particleGrad = ctx.createRadialGradient(px, py, 0, px, py, particleSize * 4);
      particleGrad.addColorStop(0, 'rgba(251, 191, 36, 1)');
      particleGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.7)');
      particleGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      
      ctx.fillStyle = particleGrad;
      ctx.beginPath();
      ctx.arc(px, py, particleSize * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  renderEtherealCanopy(x, y, radius) {
    const ctx = this.ctx;
    const pulsePhase = (Math.sin(this.time * 1.5) + 1) / 2;
    
    // Multiple ethereal layers
    for (let layer = 0; layer < 5; layer++) {
      const layerRadius = radius * (1.1 - layer * 0.05);
      const layerY = y - layer * 12;
      const layerPhase = this.time * 0.3 + layer * 0.5;
      
      const etherealGrad = ctx.createRadialGradient(x, layerY, 0, x, layerY, layerRadius);
      
      const hue1 = 270 + Math.sin(layerPhase) * 20;
      const hue2 = 290 + Math.cos(layerPhase * 1.3) * 25;
      
      etherealGrad.addColorStop(0, `hsla(${hue1}, 75%, 65%, ${0.4 - layer * 0.05})`);
      etherealGrad.addColorStop(0.4, `hsla(${hue2}, 70%, 55%, ${0.35 - layer * 0.05})`);
      etherealGrad.addColorStop(0.7, `hsla(${hue2 - 10}, 65%, 45%, ${0.25 - layer * 0.04})`);
      etherealGrad.addColorStop(1, `hsla(${hue2 - 20}, 60%, 35%, 0)`);
      
      ctx.fillStyle = etherealGrad;
      
      ctx.beginPath();
      const segments = 32;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const noise1 = Math.sin(angle * 4 + layerPhase) * 15;
        const noise2 = Math.cos(angle * 6 + layerPhase * 0.7) * 8;
        const pulse = Math.sin(angle * 2 + this.time * 2) * pulsePhase * 10;
        
        const r = layerRadius + noise1 + noise2 + pulse;
        const px = x + Math.cos(angle) * r;
        const py = layerY + Math.sin(angle) * r * 0.75;
        
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      
      ctx.closePath();
      ctx.fill();
    }
    
    // Glowing leaves
    const leafCount = 30;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2 + this.time * 0.2;
      const dist = radius * (0.5 + Math.random() * 0.4);
      const lx = x + Math.cos(angle) * dist;
      const ly = y + Math.sin(angle) * dist * 0.75;
      const leafSize = 8 + Math.random() * 6;
      const hue = 260 + Math.random() * 60;
      
      const leafGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, leafSize);
      leafGrad.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.9)`);
      leafGrad.addColorStop(0.6, `hsla(${hue}, 70%, 60%, 0.6)`);
      leafGrad.addColorStop(1, `hsla(${hue}, 60%, 50%, 0)`);
      
      ctx.fillStyle = leafGrad;
      ctx.beginPath();
      ctx.arc(lx, ly, leafSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  renderFloatingRunes() {
    const ctx = this.ctx;
    const runeCount = 6;
    
    for (let i = 0; i < runeCount; i++) {
      const angle = (i / runeCount) * Math.PI * 2 + this.time * 0.15;
      const orbitRadius = 180 + Math.sin(this.time + i) * 30;
      const x = this.tree.x + Math.cos(angle) * orbitRadius;
      const y = this.tree.y - 200 + Math.sin(angle) * orbitRadius * 0.6 + Math.sin(this.time * 2 + i) * 20;
      const rotation = this.time + i;
      const pulse = (Math.sin(this.time * 3 + i * 0.7) + 1) / 2;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * 0.3);
      
      // Rune glow
      const runeGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
      runeGlow.addColorStop(0, `rgba(167, 139, 250, ${0.6 * pulse})`);
      runeGlow.addColorStop(0.5, `rgba(139, 92, 246, ${0.4 * pulse})`);
      runeGlow.addColorStop(1, 'rgba(124, 58, 237, 0)');
      
      ctx.fillStyle = runeGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Rune symbol (simple geometric)
      ctx.strokeStyle = `rgba(233, 213, 255, ${0.8 + pulse * 0.2})`;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const runeType = i % 4;
      
      switch(runeType) {
        case 0: // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(-8, 8);
          ctx.lineTo(8, 8);
          ctx.closePath();
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, -5);
          ctx.lineTo(0, 5);
          ctx.stroke();
          break;
          
        case 1: // Circle with cross
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(-8, 0);
          ctx.lineTo(8, 0);
          ctx.moveTo(0, -8);
          ctx.lineTo(0, 8);
          ctx.stroke();
          break;
          
        case 2: // Diamond
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(7, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(-7, 0);
          ctx.closePath();
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(-4, -5);
          ctx.lineTo(4, 5);
          ctx.moveTo(-4, 5);
          ctx.lineTo(4, -5);
          ctx.stroke();
          break;
          
        case 3: // Star
          ctx.beginPath();
          for (let j = 0; j < 6; j++) {
            const starAngle = (j / 6) * Math.PI * 2 - Math.PI / 2;
            const starR = j % 2 === 0 ? 10 : 5;
            const sx = Math.cos(starAngle) * starR;
            const sy = Math.sin(starAngle) * starR;
            
            if (j === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.stroke();
          break;
      }
      
      ctx.restore();
    }
  }
  
  renderElementalEffects() {
    const ctx = this.ctx;
    
    // Floating embers/sparkles
    const emberCount = 15;
    for (let i = 0; i < emberCount; i++) {
      const phase = this.time * 0.5 + i * 0.4;
      const x = this.tree.x + Math.sin(phase) * 180 + Math.cos(this.time + i) * 40;
      const y = this.tree.y - 150 + Math.cos(phase * 1.3) * 120 - (phase % 100);
      const size = 2 + Math.sin(this.time * 4 + i) * 1.5;
      const brightness = (Math.sin(this.time * 3 + i * 0.7) + 1) / 2;
      
      if (y < this.tree.y - 350) continue; // Reset position handled by modulo
      
      const emberGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
      emberGrad.addColorStop(0, `rgba(251, 191, 36, ${brightness})`);
      emberGrad.addColorStop(0.4, `rgba(245, 158, 11, ${brightness * 0.7})`);
      emberGrad.addColorStop(0.7, `rgba(217, 119, 6, ${brightness * 0.4})`);
      emberGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
      
      ctx.fillStyle = emberGrad;
      ctx.beginPath();
      ctx.arc(x, y, size * 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Core
      ctx.fillStyle = `rgba(255, 255, 200, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  renderCreatures() {
    const ctx = this.ctx;
    
    // Render birds
    this.birds.forEach(bird => {
      this.drawRealisticBird(bird);
    });
    
    // Render butterflies
    this.butterflies.forEach(butterfly => {
      this.drawRealisticButterfly(butterfly);
    });
  }
  
  drawRealisticBird(bird) {
    const ctx = this.ctx;
    const wingAngle = Math.sin(bird.wingPhase) * (bird.perched ? 12 : 50);
    const yOffset = bird.perched ? bird.bobOffset : Math.sin(bird.wingPhase) * 2;
    
    ctx.save();
    ctx.translate(bird.x, bird.y + yOffset);
    
    // Flip based on direction
    if (bird.direction < 0) {
      ctx.scale(-1, 1);
    }
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(2, 14, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail feathers
    ctx.fillStyle = '#6B4E30';
    ctx.save();
    ctx.translate(-8, 2);
    ctx.rotate(-0.2);
    
    for (let i = 0; i < 5; i++) {
      const featherAngle = -0.3 + i * 0.15;
      ctx.save();
      ctx.rotate(featherAngle);
      
      const featherGrad = ctx.createLinearGradient(0, 0, -12, 0);
      featherGrad.addColorStop(0, '#6B4E30');
      featherGrad.addColorStop(0.7, '#5C3D20');
      featherGrad.addColorStop(1, '#4A2C10');
      
      ctx.fillStyle = featherGrad;
      ctx.beginPath();
      ctx.ellipse(-6, 0, 12, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
    
    ctx.restore();
    
    // Body gradient
    const bodyGrad = ctx.createRadialGradient(-1, -2, 0, 0, 0, 9);
    bodyGrad.addColorStop(0, '#B8956A');
    bodyGrad.addColorStop(0.5, '#A0826D');
    bodyGrad.addColorStop(0.8, '#8B6B47');
    bodyGrad.addColorStop(1, '#6B4E30');
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 10, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Body highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(-2, -3, 3, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    ctx.save();
    ctx.translate(-2, -2);
    ctx.rotate((wingAngle * Math.PI) / 180);
    
    // Wing gradient
    const wingGrad = ctx.createRadialGradient(-5, 0, 0, -10, 0, 12);
    wingGrad.addColorStop(0, '#8B6B47');
    wingGrad.addColorStop(0.5, '#6B4E30');
    wingGrad.addColorStop(1, '#5C3D20');
    
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(-9, -1, 11, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing feather details
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-4 - i * 2, -1);
      ctx.lineTo(-6 - i * 3, 2);
      ctx.stroke();
    }
    
    ctx.restore();
    
    ctx.save();
    ctx.translate(-2, -2);
    ctx.rotate((-wingAngle * Math.PI) / 180);
    
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(9, -1, 11, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(4 + i * 2, -1);
      ctx.lineTo(6 + i * 3, 2);
      ctx.stroke();
    }
    
    ctx.restore();
    
    // Head
    const headGrad = ctx.createRadialGradient(-1, -10, 0, 0, -10, 5);
    headGrad.addColorStop(0, '#B8956A');
    headGrad.addColorStop(0.6, '#A0826D');
    headGrad.addColorStop(1, '#8B6B47');
    
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, -10, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Head highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(-1.5, -11.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(2, -10, 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(2.4, -10.4, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    const beakGrad = ctx.createLinearGradient(3, -10, 7, -9);
    beakGrad.addColorStop(0, '#FFA500');
    beakGrad.addColorStop(0.6, '#FF8C00');
    beakGrad.addColorStop(1, '#FF6500');
    
    ctx.fillStyle = beakGrad;
    ctx.beginPath();
    ctx.moveTo(3.5, -10);
    ctx.lineTo(7, -10);
    ctx.lineTo(5, -9);
    ctx.closePath();
    ctx.fill();
    
    // Beak highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(4, -10);
    ctx.lineTo(6, -10);
    ctx.lineTo(5, -9.5);
    ctx.closePath();
    ctx.fill();
    
    // Feet (if perched)
    if (bird.perched) {
      ctx.strokeStyle = '#FF8C00';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      
      // Left foot
      ctx.beginPath();
      ctx.moveTo(-3, 10);
      ctx.lineTo(-3, 13);
      ctx.moveTo(-3, 13);
      ctx.lineTo(-5, 14);
      ctx.moveTo(-3, 13);
      ctx.lineTo(-1, 14);
      ctx.stroke();
      
      // Right foot
      ctx.beginPath();
      ctx.moveTo(3, 10);
      ctx.lineTo(3, 13);
      ctx.moveTo(3, 13);
      ctx.lineTo(1, 14);
      ctx.moveTo(3, 13);
      ctx.lineTo(5, 14);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  drawRealisticButterfly(butterfly) {
    const ctx = this.ctx;
    const wingAngle = Math.sin(butterfly.wingPhase) * 55;
    const bodyTilt = Math.sin(butterfly.wingPhase * 0.5) * 5;
    
    ctx.save();
    ctx.translate(butterfly.x, butterfly.y);
    
    // Flip based on direction
    if (butterfly.direction < 0) {
      ctx.scale(-1, 1);
    }
    
    ctx.rotate((bodyTilt * Math.PI) / 180);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Back wings
    ctx.save();
    ctx.translate(-2, 0);
    ctx.rotate((wingAngle * Math.PI) / 180);
    
    this.drawButterflyWing(ctx, butterfly.color, 'back', 'left');
    
    ctx.restore();
    
    ctx.save();
    ctx.translate(2, 0);
    ctx.rotate((-wingAngle * Math.PI) / 180);
    
    this.drawButterflyWing(ctx, butterfly.color, 'back', 'right');
    
    ctx.restore();
    
    // Body
    const bodyGrad = ctx.createLinearGradient(0, -12, 0, 12);
    bodyGrad.addColorStop(0, '#2C2416');
    bodyGrad.addColorStop(0.3, '#1A1410');
    bodyGrad.addColorStop(0.7, '#0F0A08');
    bodyGrad.addColorStop(1, '#000000');
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, -3, 2.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body segments
    ctx.strokeStyle = 'rgba(80, 60, 40, 0.5)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 6; i++) {
      const segY = -10 + i * 3.5;
      ctx.beginPath();
      ctx.moveTo(-2, segY);
      ctx.lineTo(2, segY);
      ctx.stroke();
    }
    
    // Body highlight
    ctx.fillStyle = 'rgba(100, 80, 60, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-0.8, -8, 0.8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    const headGrad = ctx.createRadialGradient(-0.5, -12, 0, 0, -12, 3);
    headGrad.addColorStop(0, '#3A2F1F');
    headGrad.addColorStop(0.7, '#2C2416');
    headGrad.addColorStop(1, '#1A1410');
    
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, -12, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (compound)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-1.5, -12, 1, 0, Math.PI * 2);
    ctx.arc(1.5, -12, 1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(-1.3, -12.3, 0.4, 0, Math.PI * 2);
    ctx.arc(1.7, -12.3, 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Antennae
    ctx.strokeStyle = '#2C2416';
    ctx.lineWidth = 0.8;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(-1, -14);
    ctx.bezierCurveTo(-3, -17, -4, -19, -3.5, -20);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(1, -14);
    ctx.bezierCurveTo(3, -17, 4, -19, 3.5, -20);
    ctx.stroke();
    
    // Antennae tips
    ctx.fillStyle = '#4A3520';
    ctx.beginPath();
    ctx.arc(-3.5, -20, 1, 0, Math.PI * 2);
    ctx.arc(3.5, -20, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Front wings
    ctx.save();
    ctx.translate(-2, 0);
    ctx.rotate((wingAngle * Math.PI) / 180);
    
    this.drawButterflyWing(ctx, butterfly.color, 'front', 'left');
    
    ctx.restore();
    
    ctx.save();
    ctx.translate(2, 0);
    ctx.rotate((-wingAngle * Math.PI) / 180);
    
    this.drawButterflyWing(ctx, butterfly.color, 'front', 'right');
    
    ctx.restore();
    
    ctx.restore();
  }
  
  drawButterflyWing(ctx, baseColor, layer, side) {
    const isBack = layer === 'back';
    const isLeft = side === 'left';
    const direction = isLeft ? -1 : 1;
    const wingWidth = isBack ? 12 : 14;
    const wingHeight = isBack ? 18 : 22;
    const wingX = direction * (isBack ? 8 : 10);
    const wingY = isBack ? 2 : -3;
    
    // Parse base color or generate
    const hue = parseInt(baseColor?.match(/\d+/)?.[0] || Math.random() * 360);
    
    // Wing shadow (back layer only)
    if (isBack) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(wingX + direction * 2, wingY + 2, wingWidth, wingHeight, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Main wing gradient
    const wingGrad = ctx.createRadialGradient(
      wingX - direction * 4, wingY - 6, 0,
      wingX, wingY, wingWidth * 1.5
    );
    wingGrad.addColorStop(0, `hsl(${hue}, 85%, 70%)`);
    wingGrad.addColorStop(0.3, `hsl(${hue + 10}, 80%, 60%)`);
    wingGrad.addColorStop(0.6, `hsl(${hue - 10}, 75%, 50%)`);
    wingGrad.addColorStop(0.85, `hsl(${hue - 20}, 70%, 40%)`);
    wingGrad.addColorStop(1, `hsl(${hue - 30}, 65%, 30%)`);
    
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(wingX, wingY, wingWidth, wingHeight, isLeft ? -0.2 : 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing patterns
    // Spots
    const spotPositions = isBack ? [
      { x: wingX - direction * 6, y: wingY - 8, r: 3 },
      { x: wingX - direction * 4, y: wingY + 3, r: 2.5 }
    ] : [
      { x: wingX - direction * 8, y: wingY - 10, r: 4 },
      { x: wingX - direction * 5, y: wingY, r: 3 },
      { x: wingX - direction * 3, y: wingY + 8, r: 2.5 }
    ];
    
    spotPositions.forEach(spot => {
      // White spots
      const spotGrad = ctx.createRadialGradient(
        spot.x - direction, spot.y - 1, 0,
        spot.x, spot.y, spot.r
      );
      spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      spotGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.6)');
      spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Dark eye spots
    if (!isBack) {
      const eyeSpot = { x: wingX + direction * 2, y: wingY - 6, r: 5 };
      
      // Outer ring
      const eyeGrad1 = ctx.createRadialGradient(
        eyeSpot.x, eyeSpot.y, 0,
        eyeSpot.x, eyeSpot.y, eyeSpot.r
      );
      eyeGrad1.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      eyeGrad1.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
      eyeGrad1.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      
      ctx.fillStyle = eyeGrad1;
      ctx.beginPath();
      ctx.arc(eyeSpot.x, eyeSpot.y, eyeSpot.r, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner color ring
      const eyeGrad2 = ctx.createRadialGradient(
        eyeSpot.x, eyeSpot.y, 0,
        eyeSpot.x, eyeSpot.y, eyeSpot.r * 0.7
      );
      eyeGrad2.addColorStop(0, `hsl(${hue + 40}, 80%, 50%)`);
      eyeGrad2.addColorStop(0.6, `hsl(${hue + 30}, 75%, 45%)`);
      eyeGrad2.addColorStop(1, `hsl(${hue + 20}, 70%, 40%)`);
      
      ctx.fillStyle = eyeGrad2;
      ctx.beginPath();
      ctx.arc(eyeSpot.x, eyeSpot.y, eyeSpot.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      // Center dot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(eyeSpot.x - direction, eyeSpot.y - 1, eyeSpot.r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Wing veins
    ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
    ctx.lineWidth = 0.5;
    ctx.lineCap = 'round';
    
    const veinCount = isBack ? 4 : 5;
    for (let i = 0; i < veinCount; i++) {
      const veinAngle = (isLeft ? -0.8 : 0.8) + (i - veinCount / 2) * 0.3;
      const veinLength = (isBack ? 14 : 18) - Math.abs(i - veinCount / 2) * 2;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(veinAngle) * veinLength,
        wingY + Math.sin(veinAngle) * veinLength
      );
      ctx.stroke();
    }
    
    // Wing edge detail
    ctx.strokeStyle = `hsl(${hue - 30}, 60%, 35%)`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(wingX, wingY, wingWidth, wingHeight, isLeft ? -0.2 : 0.2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Highlight
    const highlightGrad = ctx.createRadialGradient(
      wingX - direction * 6, wingY - 10, 0,
      wingX - direction * 4, wingY - 8, wingWidth * 0.5
    );
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    highlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.ellipse(
      wingX - direction * 5, wingY - 9,
      wingWidth * 0.4, wingHeight * 0.4,
      isLeft ? -0.3 : 0.3,
      0, Math.PI * 2
    );
    ctx.fill();
  }
  
  renderFireflies() {
    if (this.fireflies.length === 0) return;
    
    const ctx = this.ctx;
    
    this.fireflies.forEach(firefly => {
      const glowSize = 8 + firefly.brightness * 6;
      
      const glowGrad = ctx.createRadialGradient(
        firefly.x, firefly.y, 0,
        firefly.x, firefly.y, glowSize
      );
      glowGrad.addColorStop(0, `rgba(255, 255, 150, ${firefly.brightness * 0.9})`);
      glowGrad.addColorStop(0.3, `rgba(255, 255, 100, ${firefly.brightness * 0.6})`);
      glowGrad.addColorStop(0.6, `rgba(255, 200, 50, ${firefly.brightness * 0.3})`);
      glowGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(firefly.x, firefly.y, glowSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Core
      ctx.fillStyle = `rgba(255, 255, 200, ${firefly.brightness})`;
      ctx.beginPath();
      ctx.arc(firefly.x, firefly.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  renderParticles(layer) {
    const ctx = this.ctx;
    
    this.particles.forEach(p => {
      // Simple layer separation
      const isBackground = p.type === 'sparkle' || p.type === 'shimmer';
      
      if ((layer === 'background' && isBackground) || (layer === 'foreground' && !isBackground)) {
        this.drawParticle(p);
      }
    });
  }
  
  drawParticle(p) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.globalAlpha = Math.min(p.life, 1);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.scale(p.scale, p.scale);
    
    switch(p.type) {
      case 'water':
        this.drawWaterDrop();
        break;
      case 'shimmer':
        this.drawShimmer();
        break;
      case 'dew':
        this.drawDew();
        break;
      case 'leaf':
        this.drawFallingLeaf(p.color);
        break;
      case 'sparkle':
        this.drawSparkle();
        break;
      default:
        this.drawGenericParticle(p);
        break;
    }
    
    ctx.restore();
  }
  
  drawWaterDrop() {
    const ctx = this.ctx;
    
    // Water gradient
    const waterGrad = ctx.createRadialGradient(-3, -4, 0, 0, 0, 10);
    waterGrad.addColorStop(0, '#E8F4F8');
    waterGrad.addColorStop(0.3, '#B8E6F0');
    waterGrad.addColorStop(0.6, '#4FACFE');
    waterGrad.addColorStop(1, '#00A8E8');
    
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    const highlightGrad = ctx.createRadialGradient(-4, -5, 0, -3, -4, 4);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    highlightGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.5)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.arc(-3, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Secondary highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(3, 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawShimmer() {
    const ctx = this.ctx;
    
    // Glow
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
    glowGrad.addColorStop(0, 'rgba(255, 250, 205, 0.9)');
    glowGrad.addColorStop(0.4, 'rgba(255, 215, 0, 0.7)');
    glowGrad.addColorStop(0.7, 'rgba(255, 200, 0, 0.4)');
    glowGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
    
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Star shape
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const innerR = 2;
      const outerR = 5;
      
      const outerX = Math.cos(angle) * outerR;
      const outerY = Math.sin(angle) * outerR;
      const innerX = Math.cos(angle + Math.PI / 4) * innerR;
      const innerY = Math.sin(angle + Math.PI / 4) * innerR;
      
      if (i === 0) ctx.moveTo(outerX, outerY);
      else ctx.lineTo(outerX, outerY);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    
    // Center
    ctx.fillStyle = '#FFF9C4';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawDew() {
    const ctx = this.ctx;
    
    // Dew drop with refraction
    const dewGrad = ctx.createRadialGradient(-2, -3, 0, 0, 0, 7);
    dewGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    dewGrad.addColorStop(0.4, 'rgba(230, 245, 255, 0.85)');
    dewGrad.addColorStop(0.7, 'rgba(173, 216, 230, 0.7)');
    dewGrad.addColorStop(1, 'rgba(135, 206, 235, 0.4)');
    
    ctx.fillStyle = dewGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Main highlight
    const highlightGrad = ctx.createRadialGradient(-2.5, -3, 0, -2, -2.5, 2.5);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    highlightGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.6)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.arc(-2, -2.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Secondary shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(2, 2, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Subtle edge
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  drawFallingLeaf(color) {
    const ctx = this.ctx;
    
    // Use cached texture if available and it's desktop
    if (this.textureCache.leaf && !this.isMobile) {
      ctx.drawImage(
        this.textureCache.leaf,
        -this.textureCache.leaf.width / 2,
        -this.textureCache.leaf.height / 2
      );
      return;
    }
    
    // Fallback leaf rendering
    const leafColor = color || '#4CAF50';
    
    // Leaf shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(1, 1, 7, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Leaf gradient
    const leafGrad = ctx.createRadialGradient(-3, -5, 0, 0, 0, 12);
    leafGrad.addColorStop(0, leafColor);
    leafGrad.addColorStop(0.5, leafColor);
    leafGrad.addColorStop(1, '#2E7D32');
    
    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Vein
    ctx.strokeStyle = 'rgba(0, 100, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.stroke();
    
    // Side veins
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      const y = i * 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(4, y + 2);
      ctx.moveTo(0, y);
      ctx.lineTo(-4, y + 2);
      ctx.stroke();
    }
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-2, -4, 2, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawSparkle() {
    const ctx = this.ctx;
    
    // Outer glow
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
    glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    glowGrad.addColorStop(0.5, 'rgba(255, 200, 0, 0.4)');
    glowGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
    
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Star
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#FFD700';
    
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-1.5, -2);
    ctx.lineTo(-8, -1);
    ctx.lineTo(-1.5, 1);
    ctx.lineTo(0, 8);
    ctx.lineTo(1.5, 1);
    ctx.lineTo(8, -1);
    ctx.lineTo(1.5, -2);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    // Center
    ctx.fillStyle = '#FFF9E6';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawGenericParticle(p) {
    const ctx = this.ctx;
    
    ctx.fillStyle = p.color || '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  renderEffects() {
    // Additional post-processing effects
    if (this.stage === 'legend') {
      this.renderLegendEffects();
    }
  }
  
  renderLegendEffects() {
    // Already rendered in renderLegendTree and renderFloatingRunes
  }
  
  renderUI() {
    // Optional: Render UI elements that shouldn't be affected by camera
    // Can show day count, stage name, etc.
  }
  
  // ==================== PARTICLE SYSTEM ====================
  
  createParticle(x, y, type, options = {}) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift(); // Remove oldest
    }
    
    const configs = {
      water: {
        vx: (Math.random() - 0.5) * 40,
        vy: -Math.random() * 80 - 40,
        ax: 0,
        ay: 0,
        gravity: 350,
        drag: 0.5,
        decay: 0.7,
        baseScale: 1,
        windInfluence: 0.3
      },
      shimmer: {
        vx: (Math.random() - 0.5) * 50,
        vy: -Math.random() * 90 - 30,
        ax: 0,
        ay: 0,
        gravity: -60,
        drag: 1.2,
        decay: 1.8,
        baseScale: 1,
        windInfluence: 0.8
      },
      dew: {
        vx: (Math.random() - 0.5) * 15,
        vy: Math.random() * 25 + 10,
        ax: 0,
        ay: 0,
        gravity: 120,
        drag: 0.8,
        decay: 0.9,
        baseScale: 1,
        windInfluence: 0.4
      },
      leaf: {
        vx: (Math.random() - 0.5) * 50,
        vy: Math.random() * 20 + 10,
        ax: 0,
        ay: 0,
        gravity: 40,
        drag: 2,
        decay: 0.4,
        baseScale: 1,
        windInfluence: 1,
        color: options.color || `hsl(${100 + Math.random() * 40}, 60%, 40%)`
      },
      sparkle: {
        vx: (Math.random() - 0.5) * 70,
        vy: -Math.random() * 110 - 60,
        ax: 0,
        ay: 0,
        gravity: 0,
        drag: 0.3,
        decay: 2.2,
        baseScale: 1,
        windInfluence: 0.2
      }
    };
    
    const config = { ...configs[type], ...options };
    
    this.particles.push({
      x,
      y,
      type,
      life: 1,
      vx: config.vx,
      vy: config.vy,
      ax: config.ax,
      ay: config.ay,
      gravity: config.gravity,
      drag: config.drag,
      decay: config.decay,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 360,
      scale: config.baseScale,
      baseScale: config.baseScale,
      windInfluence: config.windInfluence,
      color: config.color
    });
  }
  
  // ==================== CREATURE MANAGEMENT ====================
  
  addBird(x, y) {
    if (this.birds.length >= this.maxBirds) return;
    
    const bird = {
      x: x + (Math.random() - 0.5) * 250,
      y: y - 120 - Math.random() * 100,
      vx: 0,
      vy: 0,
      targetX: x + (Math.random() - 0.5) * 120,
      targetY: y - 80 - Math.random() * 60,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 1,
      perched: false,
      perchTime: 0,
      bobPhase: Math.random() * Math.PI * 2,
      bobOffset: 0,
      direction: 1,
      speed: Math.random()
    };
    
    this.birds.push(bird);
  }
  
  setBirdTarget(bird) {
    bird.targetX = this.tree.x + (Math.random() - 0.5) * 200;
    bird.targetY = this.tree.y - 100 - Math.random() * 150;
  }
  
  addButterfly(x, y) {
    if (this.butterflies.length >= this.maxButterflies) return;
    
    const hue = Math.random() * 360;
    const colorSchemes = [
      `hsl(${hue}, 85%, 60%)`,
      `hsl(${(hue + 30) % 360}, 80%, 65%)`,
      `hsl(${(hue + 60) % 360}, 90%, 55%)`,
      `hsl(${(hue + 90) % 360}, 75%, 70%)`
    ];
    
    this.butterflies.push({
      x,
      y,
      centerX: x,
      centerY: y,
      phase: Math.random() * Math.PI * 2,
      wingPhase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 0.6,
      radius: 40 + Math.random() * 30,
      color: colorSchemes[Math.floor(Math.random() * colorSchemes.length)],
      direction: 1,
      lifeTime: 0
    });
  }
  
  addFirefly() {
    this.fireflies.push({
      x: Math.random() * this.width,
      y: Math.random() * (this.height - 100),
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      brightness: Math.random()
    });
  }
  
  // ==================== BRANCH & LEAF GENERATION ====================
  
  generateBranches() {
    this.branches = [];
    const count = 10;
    
    for (let i = 0; i < count; i++) {
      this.branches.push({
        angle: (i / count) * Math.PI * 2,
        baseAngle: (i / count) * Math.PI * 2,
        length: 55 + Math.random() * 45,
        swayPhase: Math.random() * Math.PI * 2,
        thickness: 9 - i * 0.6
      });
    }
  }
  
  generateLeaves() {
    this.leaves = [];
    const count = Math.min(this.maxLeaves, 80);
    
    for (let i = 0; i < count; i++) {
      const hue = 110 + (i % 10) * 3;
      
      this.leaves.push({
        angle: Math.random() * Math.PI * 2,
        distance: 0.4 + Math.random() * 0.6,
        size: 0.7 + Math.random() * 0.5,
        baseRotation: Math.random() * 360,
        currentRotation: 0,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.7 + Math.random() * 0.6,
        flexibility: Math.random(),
        color: `hsl(${hue}, 65%, ${38 + Math.random() * 10}%)`,
        baseX: 0,
        baseY: 0,
        currentX: 0,
        currentY: 0
      });
    }
  }
  
  // ==================== STAGE PROGRESSION ====================
  
  updateStageProgression() {
    const oldStage = this.stage;
    
    // Stage thresholds
    if (this.day >= 365) this.stage = 'legend';
    else if (this.day >= 100) this.stage = 'forest';
    else if (this.day >= 35) this.stage = 'tree';
    else if (this.day >= 12) this.stage = 'plant';
    else if (this.day >= 4) this.stage = 'sprout';
    else this.stage = 'seed';
    
    this.tree.targetGrowth = this.getGrowthForStage();
    
    if (oldStage !== this.stage) {
      this.onStageChange(oldStage, this.stage);
    }
  }
  
  getGrowthForStage() {
    const growthMap = {
      seed: 0.05,
      sprout: 0.35,
      plant: 0.55,
      tree: 0.85,
      forest: 1.0,
      legend: 1.2
    };
    return growthMap[this.stage] || 0;
  }
  
  onStageChange(oldStage, newStage) {
    console.log(`🌳 Stage change: ${oldStage} → ${newStage}`);
    
    // Celebration effect
    this.camera.shake = 18;
    this.tree.glowIntensity = 1.5;
    
    // Massive particle burst
    const burstCount = this.isMobile ? 40 : 80;
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2;
      const dist = 60 + Math.random() * 40;
      this.createParticle(
        this.tree.x + Math.cos(angle) * dist,
        this.tree.y - 120 + Math.sin(angle) * dist,
        Math.random() < 0.5 ? 'sparkle' : 'shimmer'
      );
    }
    
    // Regenerate structures
    if (newStage === 'tree' || newStage === 'forest' || newStage === 'legend') {
      this.generateBranches();
      this.generateLeaves();
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
    }
    
    // Screen flash effect (subtle)
    if (newStage === 'legend') {
      // Could add a canvas overlay flash here
    }
  }
  
  // ==================== PUBLIC API ====================
  
  completeHabit() {
    this.habitCount++;
    
    console.log(`💧 Habit completed! Total: ${this.habitCount}`);
    
    // Water drop cascade
    const dropCount = this.isMobile ? 15 : 25;
    for (let i = 0; i < dropCount; i++) {
      setTimeout(() => {
        this.createParticle(
          this.tree.x + (Math.random() - 0.5) * 80,
          -20,
          'water',
          {
            vx: (Math.random() - 0.5) * 60,
            vy: -Math.random() * 100 - 50
          }
        );
      }, i * 50);
    }
    
    // Glow effect
    this.tree.glowIntensity = 1.2;
    
    // Camera effect
    this.camera.shake = 10;
    
    // Shimmer particles
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createParticle(
          this.tree.x + (Math.random() - 0.5) * 60,
          this.tree.y - 100 + (Math.random() - 0.5) * 100,
          'shimmer'
        );
      }, i * 100);
    }
    
    // Creature spawning
    if (this.habitCount % 20 === 0 && this.stage !== 'seed' && this.stage !== 'sprout') {
      this.addBird(this.tree.x, this.tree.y - 180);
    }
    
    if (this.habitCount % 35 === 0 && this.stage !== 'seed') {
      this.addButterfly(
        this.tree.x + (Math.random() - 0.5) * 150,
        this.tree.y - 120 + (Math.random() - 0.5) * 100
      );
    }
    
    // Haptic
    if (navigator.vibrate) {
      navigator.vibrate([40, 20, 60, 20, 80]);
    }
    
    return {
      day: this.day,
      habitCount: this.habitCount,
      stage: this.stage,
      growth: this.tree.growth
    };
  }
  
  skipDay() {
    this.day++;
    this.updateStageProgression();
    
    console.log(`📅 Day ${this.day} - Stage: ${this.stage}`);
    
    return {
      day: this.day,
      habitCount: this.habitCount,
      stage: this.stage,
      growth: this.tree.growth
    };
  }
  
  setDay(day) {
    this.day = day;
    this.updateStageProgression();
    
    // Force growth update
    this.tree.growth = this.tree.targetGrowth;
    
    console.log(`🔧 Day set to ${day} - Stage: ${this.stage}`);
  }
  
  setHabitCount(count) {
    this.habitCount = count;
    console.log(`🔧 Habit count set to ${count}`);
  }
  
  // ==================== EVENT HANDLERS ====================
  
  handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.handleInteraction(x, y);
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    // Could add drag interactions here
  }
  
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.handleInteraction(x, y);
  }
  
  handleMouseMove(e) {
    if (this.isMobile) return; // Skip on mobile for performance
    
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.width;
    const y = (e.clientY - rect.top) / this.height;
    
    // Subtle parallax
    this.camera.targetOffsetX = (x - 0.5) * 8;
    this.camera.targetOffsetY = (y - 0.5) * 8;
  }
  
  handleInteraction(x, y) {
    console.log(`👆 Interaction at (${Math.round(x)}, ${Math.round(y)})`);
    
    // Ripple effect
    const rippleCount = this.isMobile ? 8 : 15;
    for (let i = 0; i < rippleCount; i++) {
      const angle = (i / rippleCount) * Math.PI * 2;
      setTimeout(() => {
        this.createParticle(
          x + Math.cos(angle) * 25,
          y + Math.sin(angle) * 25,
          'shimmer',
          {
            vx: Math.cos(angle) * 40,
            vy: Math.sin(angle) * 40
          }
        );
      }, i * 35);
    }
    
    // Shake tree
    this.tree.shakeX = (Math.random() - 0.5) * 30;
    this.tree.shakeY = (Math.random() - 0.5) * 30;
    this.tree.glowIntensity = 0.8;
    
    // Startle birds
    this.birds.forEach(bird => {
      if (bird.perched) {
        const dist = Math.sqrt((bird.x - x) ** 2 + (bird.y - y) ** 2);
        if (dist < 100 || Math.random() < 0.3) {
          this.setBirdTarget(bird);
          bird.perched = false;
          bird.vx = (Math.random() - 0.5) * 200;
          bird.vy = -Math.random() * 100 - 50;
        }
      }
    });
    
    // Disturb butterflies
    this.butterflies.forEach(butterfly => {
      const dist = Math.sqrt((butterfly.x - x) ** 2 + (butterfly.y - y) ** 2);
      if (dist < 80) {
        butterfly.phase += Math.PI / 4;
        butterfly.centerX += (butterfly.x - x) * 0.5;
        butterfly.centerY += (butterfly.y - y) * 0.5;
      }
    });
    
    // Leaves fall
    if (this.stage === 'tree' || this.stage === 'forest' || this.stage === 'legend') {
      const leafCount = this.isMobile ? 4 : 8;
      for (let i = 0; i < leafCount; i++) {
        this.createParticle(
          this.tree.x + (Math.random() - 0.5) * 120,
          this.tree.y - 180 + (Math.random() - 0.5) * 120,
          'leaf'
        );
      }
    }
    
    // Haptic
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  }
  
  handleDeviceMotion(e) {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    
    const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + 