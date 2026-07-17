"use client";
import React, { useEffect, useRef, useState } from 'react';
import { getMaxUserStreak } from '@/app/actions/habits';

/**
 * Tree of Life - Premium Animation Engine
 * Complete standalone implementation with realistic animations
 * Optimized for mobile and desktop performance
 */

export class TreeOfLife {
  constructor(canvas, initialDay = 1) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    
    // Performance settings
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.lastFrame = performance.now();
    this.time = 0;
    this.fps = 60;
    this.frameInterval = 1000 / this.fps;
    
    // Game state
    this.day = initialDay;
    this.habitCount = 0;
    this.stage = 'seed'; // seed, sprout, plant, tree, forest, legend
    
    // Tree properties
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
      rotation: 0
    };
    
    // Animation arrays
    this.particles = [];
    this.birds = [];
    this.butterflies = [];
    this.leaves = [];
    this.branches = [];
    this.flowers = [];
    this.roots = [];
    
    // Visual effects
    this.wind = {
      strength: 0,
      direction: 0,
      phase: 0
    };
    
    this.lighting = {
      timeOfDay: 0,
      sunAngle: 0,
      ambient: 1
    };
    
    // Camera
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1,
      targetZoom: 1,
      shake: 0
    };
    
    // Performance tracking
    this.particlePool = [];
    this.maxParticles = 200;
    
    // Initialize
    this.init();
  }
  
  // ==================== INITIALIZATION ====================
  
  init() {
    this.setupCanvas();
    this.initializeTree();
    this.bindEvents();
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
    this.tree.y = this.height - 100;
  }
  
  initializeTree() {
    this.updateStageProgression();
    this.generateBranches();
    this.generateLeaves();
  }
  
  bindEvents() {
    // Touch events
    this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    
    // Mouse events
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    
    // Resize
    window.addEventListener('resize', () => this.handleResize());
    
    // Device motion
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (e) => this.handleDeviceMotion(e));
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
    const delta = elapsed / 1000;
    
    this.time += delta;
    
    // Update
    this.updateWorld(delta);
    this.updateCamera(delta);
    this.updateParticles(delta);
    this.updateCreatures(delta);
    this.updatePhysics(delta);
    
    // Render
    this.render();
  }
  
  // ==================== UPDATE LOGIC ====================
  
  updateWorld(delta) {
    // Lighting cycle
    this.lighting.timeOfDay = (Math.sin(this.time * 0.05) + 1) / 2;
    this.lighting.sunAngle = this.lighting.timeOfDay * Math.PI;
    
    // Wind simulation
    this.wind.phase += delta;
    this.wind.strength = (Math.sin(this.wind.phase * 0.5) + 1) / 2;
    this.wind.direction = Math.sin(this.wind.phase * 0.3);
    
    // Tree breathing
    this.tree.breathPhase += delta * 1.5;
    
    // Growth interpolation
    this.tree.growth += (this.tree.targetGrowth - this.tree.growth) * delta * 2;
    
    // Decay effects
    this.tree.shakeX *= 0.85;
    this.tree.shakeY *= 0.85;
    this.tree.glowIntensity *= 0.92;
    this.camera.shake *= 0.9;
    
    // Update leaves sway
    this.leaves.forEach(leaf => {
      leaf.swayPhase += delta * (1 + leaf.swaySpeed);
      leaf.currentRotation = leaf.baseRotation + Math.sin(leaf.swayPhase) * 15 * this.wind.strength;
    });
    
    // Update branches
    this.branches.forEach(branch => {
      branch.swayPhase += delta;
      branch.angle = branch.baseAngle + Math.sin(branch.swayPhase) * 0.05 * this.wind.strength;
    });
  }
  
  updateCamera(delta) {
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * delta * 3;
    
    // Camera shake from effects
    if (this.camera.shake > 0.1) {
      this.camera.x = (Math.random() - 0.5) * this.camera.shake;
      this.camera.y = (Math.random() - 0.5) * this.camera.shake;
    } else {
      this.camera.x *= 0.9;
      this.camera.y *= 0.9;
    }
  }
  
  updateParticles(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.life -= delta * p.decay;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vy += p.gravity * delta;
      p.vx *= 0.98; // Air resistance
      p.rotation += p.rotationSpeed * delta;
      p.scale = p.baseScale * (p.life > 0.5 ? 1 : p.life * 2);
      
      // Wind effect
      p.vx += this.wind.direction * this.wind.strength * 10 * delta;
      
      if (p.life <= 0 || p.y > this.height + 100) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  updateCreatures(delta) {
    // Update birds
    this.birds.forEach(bird => {
      if (!bird.perched) {
        const dx = bird.targetX - bird.x;
        const dy = bird.targetY - bird.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 10) {
          bird.perched = true;
          bird.vx = 0;
          bird.vy = 0;
        } else {
          const speed = 150;
          bird.vx = (dx / dist) * speed;
          bird.vy = (dy / dist) * speed;
        }
      } else {
        // Perched animation
        bird.bobPhase += delta * 3;
        bird.bobOffset = Math.sin(bird.bobPhase) * 2;
      }
      
      bird.x += bird.vx * delta;
      bird.y += bird.vy * delta;
      bird.wingPhase += delta * (bird.perched ? 5 : 15);
    });
    
    // Update butterflies
    this.butterflies.forEach(butterfly => {
      butterfly.phase += delta * 2;
      butterfly.x += Math.sin(butterfly.phase) * 60 * delta;
      butterfly.y += Math.cos(butterfly.phase * 1.3) * 40 * delta;
      butterfly.wingPhase += delta * 20;
      
      // Keep in bounds
      if (butterfly.x < 50) butterfly.x = 50;
      if (butterfly.x > this.width - 50) butterfly.x = this.width - 50;
      if (butterfly.y < 50) butterfly.y = 50;
      if (butterfly.y > this.height - 150) butterfly.y = this.height - 150;
    });
  }
  
  updatePhysics(delta) {
    // Advanced physics can be added here
    // Collision detection, spring physics, etc.
  }
  
  // ==================== RENDERING ====================
  
  render() {
    const ctx = this.ctx;
    
    // Clear
    ctx.clearRect(0, 0, this.width, this.height);
    
    // Apply camera
    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    
    // Render layers
    this.renderBackground();
    this.renderEnvironment();
    this.renderTree();
    this.renderCreatures();
    this.renderParticles();
    this.renderEffects();
    
    ctx.restore();
  }
  
  renderBackground() {
    const ctx = this.ctx;
    const tod = this.lighting.timeOfDay;
    
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    
    if (this.stage === 'legend') {
      // Mystical sky
      skyGrad.addColorStop(0, `hsl(${260 + tod * 40}, 60%, ${25 + tod * 15}%)`);
      skyGrad.addColorStop(0.4, `hsl(${240 + tod * 30}, 55%, ${35 + tod * 15}%)`);
      skyGrad.addColorStop(0.7, `hsl(${220 + tod * 20}, 50%, ${45 + tod * 10}%)`);
    } else {
      // Normal sky
      skyGrad.addColorStop(0, `hsl(${200 + tod * 30}, 70%, ${50 + tod * 30}%)`);
      skyGrad.addColorStop(0.5, `hsl(${190 + tod * 20}, 60%, ${70 + tod * 20}%)`);
      skyGrad.addColorStop(0.8, `hsl(${180 + tod * 10}, 50%, ${80 + tod * 10}%)`);
    }
    
    skyGrad.addColorStop(1, '#8B7355');
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Sun/Moon
    this.renderCelestialBody();
    
    // Stars (legend stage)
    if (this.stage === 'legend' && tod < 0.3) {
      this.renderStars();
    }
    
    // Clouds
    this.renderClouds();
  }
  
  renderCelestialBody() {
    const ctx = this.ctx;
    const tod = this.lighting.timeOfDay;
    const x = this.width * 0.8;
    const y = 100 + tod * 50;
    const size = 40;
    
    const celestialGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
    
    if (tod > 0.4) {
      // Sun
      celestialGrad.addColorStop(0, '#FFF9E6');
      celestialGrad.addColorStop(0.5, '#FFE66D');
      celestialGrad.addColorStop(1, 'rgba(255, 230, 109, 0)');
      ctx.fillStyle = celestialGrad;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Moon
      ctx.fillStyle = '#E8E8E8';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      
      // Moon craters
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(x - 10, y - 5, 8, 0, Math.PI * 2);
      ctx.arc(x + 8, y + 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  renderStars() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Deterministic stars
    for (let i = 0; i < 50; i++) {
      const x = (i * 137.508) % this.width;
      const y = (i * 73.331) % (this.height * 0.6);
      const twinkle = Math.sin(this.time * 2 + i) * 0.5 + 0.5;
      const size = 1 + twinkle;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  renderClouds() {
    const ctx = this.ctx;
    const cloudCount = 3;
    
    for (let i = 0; i < cloudCount; i++) {
      const x = ((this.time * 5 + i * 200) % (this.width + 200)) - 100;
      const y = 80 + i * 40;
      const alpha = 0.3 + this.lighting.timeOfDay * 0.4;
      
      this.drawCloud(x, y, 1 + i * 0.2, alpha);
    }
  }
  
  drawCloud(x, y, scale, alpha) {
    const ctx = this.ctx;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 30 * scale, 0, Math.PI * 2);
    ctx.arc(x + 25 * scale, y, 35 * scale, 0, Math.PI * 2);
    ctx.arc(x + 50 * scale, y, 30 * scale, 0, Math.PI * 2);
    ctx.arc(x + 25 * scale, y - 15 * scale, 25 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  
  renderEnvironment() {
    const ctx = this.ctx;
    
    // Ground
    const groundGrad = ctx.createLinearGradient(0, this.height - 100, 0, this.height);
    groundGrad.addColorStop(0, '#654321');
    groundGrad.addColorStop(0.5, '#553311');
    groundGrad.addColorStop(1, '#442200');
    
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, this.height - 100, this.width, 100);
    
    // Ground texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 30; i++) {
      const x = (i * 31.4159) % this.width;
      const y = this.height - 100 + (i * 17.3) % 100;
      const size = 2 + (i % 3);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Grass
    if (this.stage !== 'seed') {
      this.renderGrass();
    }
  }
  
  renderGrass() {
    const ctx = this.ctx;
    const grassCount = 40;
    
    for (let i = 0; i < grassCount; i++) {
      const x = (i / grassCount) * this.width;
      const height = 15 + Math.sin(i * 0.7) * 10;
      const sway = Math.sin(this.time * 2 + i * 0.5) * 3 * this.wind.strength;
      const y = this.height - 100;
      
      ctx.strokeStyle = `hsl(${100 + Math.sin(i) * 20}, 60%, 35%)`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + sway,
        y - height / 2,
        x + sway * 1.5,
        y - height
      );
      ctx.stroke();
    }
  }
  
  renderTree() {
    const ctx = this.ctx;
    const x = this.tree.x + this.tree.shakeX;
    const y = this.tree.y + this.tree.shakeY;
    
    ctx.save();
    ctx.translate(x, y);
    
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
        this.renderMatureTree();
        break;
      case 'forest':
        this.renderForest();
        break;
      case 'legend':
        this.renderLegendTree();
        break;
    }
    
    ctx.restore();
  }
  
  renderSeed() {
    const ctx = this.ctx;
    const breath = Math.sin(this.tree.breathPhase) * 3;
    const glowSize = 50 + breath + this.tree.glowIntensity * 30;
    
    // Glow aura
    const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
    auraGrad.addColorStop(0, 'rgba(255, 200, 100, 0.6)');
    auraGrad.addColorStop(0.5, 'rgba(255, 180, 80, 0.3)');
    auraGrad.addColorStop(1, 'rgba(255, 160, 60, 0)');
    
    ctx.fillStyle = auraGrad;
    ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);
    
    // Seed body
    const seedGrad = ctx.createRadialGradient(-5, -8, 0, 0, 0, 25);
    seedGrad.addColorStop(0, '#A0826D');
    seedGrad.addColorStop(0.7, '#8B4513');
    seedGrad.addColorStop(1, '#654321');
    
    ctx.fillStyle = seedGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18 + breath, 24 + breath, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-6, -8, 6, 9, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Shimmer particles
    if (Math.random() < 0.15) {
      this.createParticle(
        this.tree.x + (Math.random() - 0.5) * 60,
        this.tree.y + (Math.random() - 0.5) * 60,
        'shimmer'
      );
    }
  }
  
  renderSprout() {
    const ctx = this.ctx;
    const growth = this.tree.growth;
    
    // Soil mound
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.ellipse(0, 0, 35, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Soil shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 35, 10, 0, 0, Math.PI);
    ctx.fill();
    
    // Stem
    const stemHeight = 80 * growth;
    const sway = Math.sin(this.time * 2.5) * 6 * this.wind.strength;
    
    const stemGrad = ctx.createLinearGradient(-2, 0, 2, -stemHeight);
    stemGrad.addColorStop(0, '#90EE90');
    stemGrad.addColorStop(0.5, '#7FCD7F');
    stemGrad.addColorStop(1, '#6FBD6F');
    
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      sway * 0.5,
      -stemHeight * 0.5,
      sway,
      -stemHeight
    );
    ctx.stroke();
    
    // First leaves
    if (growth > 0.3) {
      this.drawSproutLeaf(sway - 20, -stemHeight + 10, -45 + sway * 2, 0.9);
      this.drawSproutLeaf(sway + 20, -stemHeight + 10, 45 + sway * 2, 0.9);
    }
    
    // Dew drops
    if (Math.random() < 0.03 && growth > 0.5) {
      this.createParticle(sway + (Math.random() - 0.5) * 40, -stemHeight, 'dew');
    }
  }
  
  drawSproutLeaf(x, y, rotation, scale) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    const leafGrad = ctx.createLinearGradient(-12, 0, 12, 0);
    leafGrad.addColorStop(0, '#228B22');
    leafGrad.addColorStop(0.3, '#32CD32');
    leafGrad.addColorStop(0.7, '#3CB371');
    leafGrad.addColorStop(1, '#228B22');
    
    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.bezierCurveTo(-12, -12, -12, 0, 0, 18);
    ctx.bezierCurveTo(12, 0, 12, -12, 0, -18);
    ctx.fill();
    
    // Vein
    ctx.strokeStyle = 'rgba(0, 100, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 18);
    ctx.stroke();
    
    // Side veins
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      const vy = i * 7;
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.lineTo(8, vy + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.lineTo(-8, vy + 4);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  renderPlant() {
    const ctx = this.ctx;
    const growth = this.tree.growth;
    const height = 150 * growth;
    const sway = Math.sin(this.time * 1.8) * 10 * this.wind.strength;
    
    // Main stem
    const stemGrad = ctx.createLinearGradient(-4, 0, 4, -height);
    stemGrad.addColorStop(0, '#654321');
    stemGrad.addColorStop(0.3, '#7FCD7F');
    stemGrad.addColorStop(1, '#6FBD6F');
    
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway * 0.5, -height * 0.5, sway, -height);
    ctx.stroke();
    
    // Branches
    const branchCount = Math.floor(growth * 6);
    for (let i = 0; i < branchCount; i++) {
      const progress = (i + 1) / (branchCount + 1);
      const branchY = -height * progress;
      const direction = i % 2 === 0 ? 1 : -1;
      const branchLength = 50 - i * 4;
      const branchSway = Math.sin(this.time * 1.8 + i * 0.5) * 6 * this.wind.strength;
      
      ctx.strokeStyle = `hsl(120, 50%, ${30 + progress * 10}%)`;
      ctx.lineWidth = 5 - i * 0.3;
      
      ctx.beginPath();
      ctx.moveTo(sway, branchY);
      ctx.quadraticCurveTo(
        sway + (branchLength * 0.5 * direction),
        branchY - 10,
        sway + (branchLength * direction) + branchSway,
        branchY - 25
      );
      ctx.stroke();
      
      // Leaves on branch
      const leafX = sway + (branchLength * direction) + branchSway;
      const leafY = branchY - 25;
      const leafRotation = direction * 45 + branchSway * 2;
      
      this.drawDetailedLeaf(leafX, leafY, leafRotation, 1);
      
      // Additional small leaves
      if (i % 2 === 0) {
        this.drawDetailedLeaf(
          sway + (branchLength * 0.6 * direction),
          branchY - 15,
          direction * 30,
          0.7
        );
      }
    }
  }
  
  drawDetailedLeaf(x, y, rotation, scale) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    // Leaf shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(2, 2, 14, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Leaf gradient
    const leafGrad = ctx.createRadialGradient(-5, -8, 0, 0, 0, 20);
    leafGrad.addColorStop(0, '#90EE90');
    leafGrad.addColorStop(0.3, '#32CD32');
    leafGrad.addColorStop(0.7, '#228B22');
    leafGrad.addColorStop(1, '#1F7A1F');
    
    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Central vein
    ctx.strokeStyle = 'rgba(0, 80, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 18);
    ctx.stroke();
    
    // Side veins
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const vy = i * 5;
      const vLength = 10 - Math.abs(i) * 2;
      
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.lineTo(vLength, vy + 3);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.lineTo(-vLength, vy + 3);
      ctx.stroke();
    }
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-4, -6, 4, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  renderMatureTree() {
    const ctx = this.ctx;
    const growth = this.tree.growth;
    const trunkHeight = 250 * growth;
    const trunkWidth = 25;
    
    // Root system (subtle)
    this.renderRoots(trunkWidth, growth);
    
    // Trunk shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(5, 0, trunkWidth + 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Trunk gradient
    const trunkGrad = ctx.createLinearGradient(-trunkWidth, 0, trunkWidth, 0);
    trunkGrad.addColorStop(0, '#4A3728');
    trunkGrad.addColorStop(0.2, '#654321');
    trunkGrad.addColorStop(0.5, '#8B4513');
    trunkGrad.addColorStop(0.8, '#654321');
    trunkGrad.addColorStop(1, '#4A3728');
    
    ctx.fillStyle = trunkGrad;
    
    // Trunk shape with breathing
    const breath = Math.sin(this.tree.breathPhase * 0.5) * 0.5;
    ctx.beginPath();
    ctx.moveTo(-trunkWidth - breath, 0);
    ctx.bezierCurveTo(
      -trunkWidth * 0.9, -trunkHeight * 0.3,
      -trunkWidth * 0.7, -trunkHeight * 0.7,
      -trunkWidth * 0.6, -trunkHeight
    );
    ctx.lineTo(trunkWidth * 0.6, -trunkHeight);
    ctx.bezierCurveTo(
      trunkWidth * 0.7, -trunkHeight * 0.7,
      trunkWidth * 0.9, -trunkHeight * 0.3,
      trunkWidth + breath, 0
    );
    ctx.closePath();
    ctx.fill();
    
    // Bark texture
    this.renderBarkTexture(trunkWidth, trunkHeight);
    
    // Canopy
    this.renderCanopy(0, -trunkHeight, 120 * growth);
    
    // Spawn creatures based on habits
    if (this.birds.length < Math.floor(this.habitCount / 15) && Math.random() < 0.02) {
      this.addBird(this.tree.x, this.tree.y - trunkHeight - 50);
    }
  }
  
  renderRoots(trunkWidth, growth) {
    const ctx = this.ctx;
    const rootCount = 5;
    
    ctx.strokeStyle = 'rgba(101, 67, 33, 0.6)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    for (let i = 0; i < rootCount; i++) {
      const angle = (i / rootCount) * Math.PI - Math.PI / 2;
      const rootLength = 40 * growth;
      const endX = Math.cos(angle) * rootLength;
      const endY = Math.sin(angle) * rootLength * 0.5;
      
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * trunkWidth, 0);
      ctx.quadraticCurveTo(
        endX * 0.5,
        endY * 0.5 + 10,
        endX,
        endY + 15
      );
      ctx.stroke();
    }
  }
  
  renderBarkTexture(width, height) {
    const ctx = this.ctx;
    
    // Vertical lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 8; i++) {
      const x = -width * 0.8 + (i / 8) * width * 1.6;
      const offsetY = Math.sin(i) * 10;
      
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x * 0.7, -height + offsetY);
      ctx.stroke();
    }
    
    // Knots
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    const knotPositions = [
      { x: -width * 0.3, y: -height * 0.3 },
      { x: width * 0.2, y: -height * 0.6 },
      { x: -width * 0.1, y: -height * 0.8 }
    ];
    
    knotPositions.forEach(knot => {
      ctx.beginPath();
      ctx.ellipse(knot.x, knot.y, 6, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  renderCanopy(x, y, radius) {
    const ctx = this.ctx;
    
    // Multiple layers for depth
    for (let layer = 2; layer >= 0; layer--) {
      const layerRadius = radius * (1 - layer * 0.12);
      const layerY = y - layer * 15;
      const alpha = 0.85 - layer * 0.15;
      
      const canopyGrad = ctx.createRadialGradient(x, layerY, 0, x, layerY, layerRadius);
      canopyGrad.addColorStop(0, `hsla(120, 60%, ${40 - layer * 5}%, ${alpha})`);
      canopyGrad.addColorStop(0.7, `hsla(115, 55%, ${35 - layer * 5}%, ${alpha})`);
      canopyGrad.addColorStop(1, `hsla(110, 50%, ${25 - layer * 5}%, ${alpha * 0.3})`);
      
      ctx.fillStyle = canopyGrad;
      ctx.beginPath();
      
      // Organic shape
      const segments = 16;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const noise = Math.sin(angle * 3 + this.time * 0.5 + layer) * (15 + layer * 5);
        const windOffset = Math.sin(angle + this.time * 2) * this.wind.strength * 8;
        const r = layerRadius + noise + windOffset;
        const px = x + Math.cos(angle) * r;
        const py = layerY + Math.sin(angle) * r * 0.75;
        
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      
      ctx.closePath();
      ctx.fill();
    }
    
    // Individual leaves for detail
    this.renderCanopyLeaves(x, y, radius);
  }
  
  renderCanopyLeaves(x, y, radius) {
    // Initialize leaves if needed
    if (this.leaves.length === 0 || this.leaves.length < 40) {
      this.generateLeaves();
    }
    
    this.leaves.forEach(leaf => {
      const angle = leaf.angle;
      const dist = leaf.distance * radius;
      const lx = x + Math.cos(angle) * dist;
      const ly = y + Math.sin(angle) * dist * 0.75;
      
      this.drawCanopyLeaf(lx, ly, leaf.currentRotation, leaf.size);
    });
  }
  
  drawCanopyLeaf(x, y, rotation, scale) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    ctx.fillStyle = `hsla(${110 + Math.random() * 20}, 60%, 40%, 0.9)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  renderForest() {
    const ctx = this.ctx;
    
    // Background trees (parallax effect)
    const bgTrees = [
      { x: this.width * 0.15, y: this.tree.y + 20, scale: 0.5, alpha: 0.4, hue: 130 },
      { x: this.width * 0.75, y: this.tree.y + 30, scale: 0.55, alpha: 0.5, hue: 115 },
      { x: this.width * 0.9, y: this.tree.y + 10, scale: 0.45, alpha: 0.35, hue: 125 }
    ];
    
    bgTrees.forEach(tree => {
      ctx.save();
      ctx.globalAlpha = tree.alpha;
      ctx.translate(tree.x, tree.y);
      ctx.scale(tree.scale, tree.scale);
      
      this.drawBackgroundTree(tree.hue);
      
      ctx.restore();
    });
    
    // Main tree (hero tree)
    this.renderMatureTree();
    
    // Foreground vegetation
    this.renderForegroundPlants();
  }
  
  drawBackgroundTree(hue) {
    const ctx = this.ctx;
    const height = 200;
    const width = 20;
    
    // Simple trunk
    ctx.fillStyle = `hsl(${hue - 90}, 30%, 30%)`;
    ctx.fillRect(-width / 2, -height, width, height);
    
    // Simple canopy
    const canopyGrad = ctx.createRadialGradient(0, -height, 0, 0, -height, 80);
    canopyGrad.addColorStop(0, `hsl(${hue}, 50%, 40%)`);
    canopyGrad.addColorStop(1, `hsl(${hue}, 45%, 25%)`);
    
    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.arc(0, -height, 70, 0, Math.PI * 2);
    ctx.fill();
  }
  
  renderForegroundPlants() {
    const ctx = this.ctx;
    const plantCount = 15;
    
    for (let i = 0; i < plantCount; i++) {
      const x = (i / plantCount) * this.width;
      const y = this.height - 100;
      const type = i % 3;
      
      ctx.save();
      ctx.translate(x, y);
      
      if (type === 0) {
        // Fern
        this.drawFern();
      } else if (type === 1) {
        // Flower
        this.drawWildflower(i);
      } else {
        // Bush
        this.drawBush(i);
      }
      
      ctx.restore();
    }
  }
  
  drawFern() {
    const ctx = this.ctx;
    const sway = Math.sin(this.time * 3) * 2;
    
    ctx.strokeStyle = '#2F4F2F';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway, -15, sway * 1.5, -30);
    ctx.stroke();
    
    // Fronds
    for (let i = 0; i < 5; i++) {
      const y = -6 * i;
      const length = 10 - i;
      
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sway * (i / 5), y);
      ctx.lineTo(sway * (i / 5) - length, y - 3);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(sway * (i / 5), y);
      ctx.lineTo(sway * (i / 5) + length, y - 3);
      ctx.stroke();
    }
  }
  
  drawWildflower(seed) {
    const ctx = this.ctx;
    const sway = Math.sin(this.time * 2 + seed) * 3;
    
    // Stem
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway, -15, sway * 1.2, -25);
    ctx.stroke();
    
    // Flower
    const flowerX = sway * 1.2;
    const flowerY = -25;
    const petalCount = 5;
    const hue = (seed * 73) % 360;
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const px = flowerX + Math.cos(angle) * 4;
      const py = flowerY + Math.sin(angle) * 4;
      
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Center
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(flowerX, flowerY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawBush(seed) {
    const ctx = this.ctx;
    
    ctx.fillStyle = `hsl(${100 + seed * 5}, 50%, 30%)`;
    
    for (let i = 0; i < 3; i++) {
      const x = (Math.sin(seed + i) * 10);
      const y = -5 - i * 3;
      const size = 8 - i;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  renderLegendTree() {
    const ctx = this.ctx;
    const growth = this.tree.growth;
    
    ctx.save();
    ctx.scale(1.3, 1.3);
    
    // Epic aura with pulse
    const pulseSize = 300 + Math.sin(this.time * 2) * 40;
    const auraGrad = ctx.createRadialGradient(0, -150, 0, 0, -150, pulseSize);
    auraGrad.addColorStop(0, 'rgba(138, 43, 226, 0.5)');
    auraGrad.addColorStop(0.3, 'rgba(75, 0, 130, 0.3)');
    auraGrad.addColorStop(0.6, 'rgba(138, 43, 226, 0.15)');
    auraGrad.addColorStop(1, 'rgba(75, 0, 130, 0)');
    
    ctx.fillStyle = auraGrad;
    ctx.fillRect(-pulseSize, -400, pulseSize * 2, pulseSize * 2);
    
    // Energy rings
    for (let i = 0; i < 3; i++) {
      const ringRadius = 100 + i * 60 + Math.sin(this.time * 2 + i) * 20;
      const ringAlpha = 0.3 - i * 0.08;
      
      ctx.strokeStyle = `rgba(138, 43, 226, ${ringAlpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -150, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Golden trunk
    const trunkHeight = 300;
    const trunkWidth = 35;
    
    const goldGrad = ctx.createLinearGradient(-trunkWidth, 0, trunkWidth, 0);
    goldGrad.addColorStop(0, '#8B6914');
    goldGrad.addColorStop(0.2, '#DAA520');
    goldGrad.addColorStop(0.5, '#FFD700');
    goldGrad.addColorStop(0.8, '#DAA520');
    goldGrad.addColorStop(1, '#8B6914');
    
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.moveTo(-trunkWidth, 0);
    ctx.bezierCurveTo(
      -trunkWidth * 0.8, -trunkHeight * 0.4,
      -trunkWidth * 0.6, -trunkHeight * 0.8,
      -trunkWidth * 0.5, -trunkHeight
    );
    ctx.lineTo(trunkWidth * 0.5, -trunkHeight);
    ctx.bezierCurveTo(
      trunkWidth * 0.6, -trunkHeight * 0.8,
      trunkWidth * 0.8, -trunkHeight * 0.4,
      trunkWidth, 0
    );
    ctx.closePath();
    ctx.fill();
    
    // Bioluminescent veins
    this.renderMysticVeins(trunkWidth, trunkHeight);
    
    // Crown mandala
    this.renderSacredMandala(0, -trunkHeight);
    
    // Mystical canopy
    const canopyGrad = ctx.createRadialGradient(0, -trunkHeight, 0, 0, -trunkHeight, 140);
    canopyGrad.addColorStop(0, 'rgba(138, 43, 226, 0.6)');
    canopyGrad.addColorStop(0.5, 'rgba(75, 0, 130, 0.4)');
    canopyGrad.addColorStop(1, 'rgba(138, 43, 226, 0.1)');
    
    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.arc(0, -trunkHeight, 140, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Sacred flame at base
    this.renderSacredFlame(0, 0);
    
    // Floating orbs
    this.renderFloatingOrbs();
  }
  
  renderMysticVeins(width, height) {
    const ctx = this.ctx;
    
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.8)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#8A2BE2';
    
    const veinCount = 6;
    for (let i = 0; i < veinCount; i++) {
      const startY = -(height / veinCount) * i;
      const direction = i % 2 === 0 ? 1 : -1;
      const pulse = Math.sin(this.time * 3 + i) * 5;
      
      ctx.beginPath();
      ctx.moveTo(0, startY);
      ctx.quadraticCurveTo(
        direction * (15 + pulse),
        startY - 30,
        direction * (25 + pulse),
        startY - 60
      );
      ctx.stroke();
      
      // Glow points
      ctx.fillStyle = 'rgba(200, 100, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(direction * (25 + pulse), startY - 60, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
  }
  
  renderSacredMandala(x, y) {
    const ctx = this.ctx;
    const rotation = this.time * 0.3;
    const pulseScale = 1 + Math.sin(this.time * 2) * 0.1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(pulseScale, pulseScale);
    
    const petalCount = 12;
    const petalSize = 35;
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (Math.PI * 2 / petalCount) * i;
      const hue = 280 + (i / petalCount) * 60;
      
      ctx.save();
      ctx.rotate(angle);
      
      // Petal gradient
      const petalGrad = ctx.createRadialGradient(0, -petalSize, 0, 0, -petalSize, petalSize);
      petalGrad.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.9)`);
      petalGrad.addColorStop(0.7, `hsla(${hue}, 70%, 50%, 0.6)`);
      petalGrad.addColorStop(1, `hsla(${hue}, 60%, 30%, 0.2)`);
      
      ctx.fillStyle = petalGrad;
      ctx.beginPath();
      ctx.ellipse(0, -petalSize, 12, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
    
    // Inner circle
    const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    centerGrad.addColorStop(0, '#FFD700');
    centerGrad.addColorStop(0.7, '#FFA500');
    centerGrad.addColorStop(1, 'rgba(255, 165, 0, 0.3)');
    
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Center symbol
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 8);
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.stroke();
    
    ctx.restore();
  }
  
  renderSacredFlame(x, y) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(x, y);
    
    for (let i = 0; i < 4; i++) {
      const height = 40 - i * 8;
      const width = 18 - i * 4;
      const flicker = Math.sin(this.time * 6 + i * 0.5) * 4;
      const pulse = Math.sin(this.time * 3 + i) * 0.2 + 1;
      
      const flameGrad = ctx.createLinearGradient(0, 0, 0, -height);
      
      if (i === 0) {
        flameGrad.addColorStop(0, 'rgba(255, 140, 0, 0.9)');
        flameGrad.addColorStop(0.4, 'rgba(255, 69, 0, 0.8)');
        flameGrad.addColorStop(0.8, 'rgba(255, 215, 0, 0.6)');
        flameGrad.addColorStop(1, 'rgba(255, 255, 0, 0)');
      } else {
        const alpha = 0.7 - i * 0.15;
        flameGrad.addColorStop(0, `rgba(255, 165, 0, ${alpha})`);
        flameGrad.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.8})`);
        flameGrad.addColorStop(1, `rgba(255, 200, 0, 0)`);
      }
      
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.ellipse(
        flicker,
        -height / 2,
        (width + flicker * 0.5) * pulse,
        height * pulse,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
    // Glow
    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(255, 140, 0, 0.8)';
    ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, -20, 25, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.restore();
  }
  
  renderFloatingOrbs() {
    const orbCount = 5;
    const ctx = this.ctx;
    
    for (let i = 0; i < orbCount; i++) {
      const angle = (i / orbCount) * Math.PI * 2 + this.time * 0.5;
      const radius = 150 + Math.sin(this.time + i) * 30;
      const x = this.tree.x + Math.cos(angle) * radius;
      const y = this.tree.y - 200 + Math.sin(angle) * radius * 0.5;
      const size = 6 + Math.sin(this.time * 2 + i) * 2;
      const hue = 280 + (i / orbCount) * 80;
      
      const orbGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      orbGrad.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.8)`);
      orbGrad.addColorStop(0.5, `hsla(${hue}, 70%, 50%, 0.4)`);
      orbGrad.addColorStop(1, `hsla(${hue}, 60%, 30%, 0)`);
      
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = `hsl(${hue}, 90%, 80%)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  renderCreatures() {
    const ctx = this.ctx;
    
    // Draw birds
    this.birds.forEach(bird => {
      this.drawBird(bird);
    });
    
    // Draw butterflies
    this.butterflies.forEach(butterfly => {
      this.drawButterfly(butterfly);
    });
  }
  
  drawBird(bird) {
    const ctx = this.ctx;
    const wingAngle = Math.sin(bird.wingPhase) * (bird.perched ? 15 : 45);
    const yOffset = bird.perched ? bird.bobOffset : 0;
    
    ctx.save();
    ctx.translate(bird.x, bird.y + yOffset);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    const bodyGrad = ctx.createRadialGradient(-2, -3, 0, 0, 0, 8);
    bodyGrad.addColorStop(0, '#A0826D');
    bodyGrad.addColorStop(0.7, '#8B4513');
    bodyGrad.addColorStop(1, '#654321');
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    ctx.fillStyle = '#654321';
    
    ctx.save();
    ctx.rotate((wingAngle * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(-7, -2, 10, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.rotate((-wingAngle * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(7, -2, 10, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Head
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(0, -9, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(1.5, -9, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(3, -9);
    ctx.lineTo(6, -9);
    ctx.lineTo(4, -8);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
  
  drawButterfly(butterfly) {
    const ctx = this.ctx;
    const wingAngle = Math.sin(butterfly.wingPhase) * 50;
    
    ctx.save();
    ctx.translate(butterfly.x, butterfly.y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings back
    ctx.save();
    ctx.rotate((wingAngle * Math.PI) / 180);
    
    const wingGrad = ctx.createRadialGradient(-8, 0, 0, -8, 0, 15);
    wingGrad.addColorStop(0, butterfly.color);
    wingGrad.addColorStop(0.7, butterfly.color);
    wingGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(-8, -3, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-10, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Wings front
    ctx.save();
    ctx.rotate((-wingAngle * Math.PI) / 180);
    
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(8, -3, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(10, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Body
    ctx.fillStyle = '#000';
    ctx.fillRect(-1.5, -10, 3, 20);
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -11, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Antennae
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(-2, -15);
    ctx.moveTo(0, -11);
    ctx.lineTo(2, -15);
    ctx.stroke();
    
    ctx.restore();
  }
  
  renderParticles() {
    this.particles.forEach(p => {
      this.drawParticle(p);
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
        this.drawWaterParticle();
        break;
      case 'shimmer':
        this.drawShimmerParticle();
        break;
      case 'dew':
        this.drawDewParticle();
        break;
      case 'leaf':
        this.drawLeafParticle(p);
        break;
      case 'sparkle':
        this.drawSparkleParticle();
        break;
    }
    
    ctx.restore();
  }
  
  drawWaterParticle() {
    const ctx = this.ctx;
    
    const waterGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
    waterGrad.addColorStop(0, '#E0F7FF');
    waterGrad.addColorStop(0.4, '#4FACFE');
    waterGrad.addColorStop(1, '#00A8E8');
    
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(-3, -3, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawShimmerParticle() {
    const ctx = this.ctx;
    
    const shimmerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
    shimmerGrad.addColorStop(0, '#FFF9C4');
    shimmerGrad.addColorStop(0.5, '#FFD700');
    shimmerGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.fillStyle = shimmerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Twinkle star shape
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * 4;
      const y = Math.sin(angle) * 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
  
  drawDewParticle() {
    const ctx = this.ctx;
    
    const dewGrad = ctx.createRadialGradient(-2, -2, 0, 0, 0, 6);
    dewGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    dewGrad.addColorStop(0.5, 'rgba(173, 216, 230, 0.7)');
    dewGrad.addColorStop(1, 'rgba(135, 206, 235, 0.3)');
    
    ctx.fillStyle = dewGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(-2, -2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawLeafParticle(p) {
    const ctx = this.ctx;
    
    ctx.fillStyle = p.color || '#228B22';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0, 100, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.stroke();
  }
  
  drawSparkleParticle() {
    const ctx = this.ctx;
    
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFD700';
    
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-1, -1);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-1, 1);
    ctx.lineTo(0, 6);
    ctx.lineTo(1, 1);
    ctx.lineTo(6, 0);
    ctx.lineTo(1, -1);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 0;
  }
  
  renderEffects() {
    // Additional effects like rain, snow, fireflies, etc.
    if (this.stage === 'legend') {
      this.renderAuroraEffect();
    }
  }
  
  renderAuroraEffect() {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.globalAlpha = 0.3;
    
    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(this.time * 0.5 + i) * 100;
      const auroraGrad = ctx.createLinearGradient(
        0, 100 + offset,
        this.width, 200 + offset
      );
      
      auroraGrad.addColorStop(0, 'rgba(0, 255, 200, 0)');
      auroraGrad.addColorStop(0.3, `rgba(0, 255, 200, ${0.2 - i * 0.05})`);
      auroraGrad.addColorStop(0.7, `rgba(138, 43, 226, ${0.2 - i * 0.05})`);
      auroraGrad.addColorStop(1, 'rgba(138, 43, 226, 0)');
      
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 100 + offset - 50, this.width, 100);
    }
    
    ctx.restore();
  }
  
  // ==================== PARTICLE SYSTEM ====================
  
  createParticle(x, y, type, options = {}) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    
    const defaults = {
      water: {
        vx: (Math.random() - 0.5) * 30,
        vy: Math.random() * 50 - 100,
        gravity: 300,
        decay: 0.6,
        baseScale: 1
      },
      shimmer: {
        vx: (Math.random() - 0.5) * 40,
        vy: -Math.random() * 80 - 20,
        gravity: -50,
        decay: 1.5,
        baseScale: 1
      },
      dew: {
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 30,
        gravity: 100,
        decay: 0.8,
        baseScale: 1
      },
      leaf: {
        vx: (Math.random() - 0.5) * 40,
        vy: Math.random() * 20 + 10,
        gravity: 30,
        decay: 0.3,
        baseScale: 1,
        color: `hsl(${100 + Math.random() * 40}, 60%, 40%)`
      },
      sparkle: {
        vx: (Math.random() - 0.5) * 60,
        vy: -Math.random() * 100 - 50,
        gravity: 0,
        decay: 2,
        baseScale: 1
      }
    };
    
    const config = { ...defaults[type], ...options };
    
    this.particles.push({
      x,
      y,
      type,
      life: 1,
      vx: config.vx,
      vy: config.vy,
      gravity: config.gravity,
      decay: config.decay,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 360,
      scale: config.baseScale,
      baseScale: config.baseScale,
      color: config.color
    });
  }
  
  // ==================== CREATURE MANAGEMENT ====================
  
  addBird(x, y) {
    if (this.birds.length >= 10) return;
    
    this.birds.push({
      x: x + (Math.random() - 0.5) * 200,
      y: y - 100 - Math.random() * 100,
      vx: 0,
      vy: 0,
      targetX: x + (Math.random() - 0.5) * 100,
      targetY: y - 50 - Math.random() * 50,
      wingPhase: Math.random() * Math.PI * 2,
      perched: false,
      bobPhase: Math.random() * Math.PI * 2,
      bobOffset: 0
    });
  }
  
  addButterfly(x, y) {
    if (this.butterflies.length >= 8) return;
    
    const hue = Math.random() * 360;
    
    this.butterflies.push({
      x,
      y,
      phase: Math.random() * Math.PI * 2,
      wingPhase: Math.random() * Math.PI * 2,
      color: `hsl(${hue}, 80%, 60%)`
    });
  }
  
  // ==================== BRANCH & LEAF GENERATION ====================
  
  generateBranches() {
    this.branches = [];
    const count = 8;
    
    for (let i = 0; i < count; i++) {
      this.branches.push({
        angle: (i / count) * Math.PI * 2,
        baseAngle: (i / count) * Math.PI * 2,
        length: 60 + Math.random() * 40,
        swayPhase: Math.random() * Math.PI * 2,
        thickness: 8 - i * 0.5
      });
    }
  }
  
  generateLeaves() {
    this.leaves = [];
    const count = 40;
    
    for (let i = 0; i < count; i++) {
      this.leaves.push({
        angle: (Math.random() * Math.PI * 2),
        distance: 0.3 + Math.random() * 0.7,
        size: 0.6 + Math.random() * 0.4,
        baseRotation: Math.random() * 360,
        currentRotation: 0,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.8 + Math.random() * 0.4
      });
    }
  }
  
  // ==================== STAGE PROGRESSION ====================
  
  updateStageProgression() {
    const oldStage = this.stage;
    
    if (this.day >= 365) this.stage = 'legend';
    else if (this.day >= 91) this.stage = 'forest';
    else if (this.day >= 31) this.stage = 'tree';
    else if (this.day >= 11) this.stage = 'plant';
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
      sprout: 0.3,
      plant: 0.5,
      tree: 0.8,
      forest: 1.0,
      legend: 1.3
    };
    return growthMap[this.stage] || 0;
  }
  
  onStageChange(oldStage, newStage) {
    // Celebration effect
    this.camera.shake = 15;
    
    // Burst particles
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      this.createParticle(
        this.tree.x + Math.cos(angle) * 50,
        this.tree.y - 100 + Math.sin(angle) * 50,
        'sparkle'
      );
    }
    
    // Regenerate structures
    if (newStage === 'tree' || newStage === 'forest' || newStage === 'legend') {
      this.generateBranches();
      this.generateLeaves();
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }
  
  // ==================== PUBLIC METHODS ====================
  
  completeHabit() {
    this.habitCount++;
    
    // Water drop effect
    const dropCount = 20;
    for (let i = 0; i < dropCount; i++) {
      setTimeout(() => {
        this.createParticle(
          this.tree.x + (Math.random() - 0.5) * 60,
          0,
          'water'
        );
      }, i * 40);
    }
    
    // Glow effect
    this.tree.glowIntensity = 1;
    
    // Camera effect
    this.camera.shake = 8;
    
    // Check for creature unlocks
    if (this.habitCount % 15 === 0) {
      this.addBird(this.tree.x, this.tree.y - 150);
    }
    
    if (this.habitCount % 30 === 0) {
      this.addButterfly(this.tree.x, this.tree.y - 100);
    }
    
    // Haptic
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 100]);
    }
    
    return {
      day: this.day,
      habitCount: this.habitCount,
      stage: this.stage
    };
  }
  
  skipDay() {
    this.day++;
    this.updateStageProgression();
    
    return {
      day: this.day,
      habitCount: this.habitCount,
      stage: this.stage
    };
  }
  
  setDay(day) {
    this.day = day;
    this.updateStageProgression();
  }
  
  setHabitCount(count) {
    this.habitCount = count;
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
  }
  
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.handleInteraction(x, y);
  }
  
  handleMouseMove(e) {
    // Subtle parallax effect based on mouse
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.width;
    const y = (e.clientY - rect.top) / this.height;
    
    this.camera.x += ((x - 0.5) * 10 - this.camera.x) * 0.05;
    this.camera.y += ((y - 0.5) * 10 - this.camera.y) * 0.05;
  }
  
  handleInteraction(x, y) {
    // Ripple effect
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      setTimeout(() => {
        this.createParticle(
          x + Math.cos(angle) * 30,
          y + Math.sin(angle) * 30,
          'shimmer'
        );
      }, i * 30);
    }
    
    // Shake tree
    this.tree.shakeX = (Math.random() - 0.5) * 25;
    this.tree.shakeY = (Math.random() - 0.5) * 25;
    
    // Startle birds
    this.birds.forEach(bird => {
      if (bird.perched && Math.random() < 0.4) {
        bird.vx = (Math.random() - 0.5) * 300;
        bird.vy = -Math.random() * 150 - 50;
        bird.perched = false;
        bird.targetX = this.tree.x + (Math.random() - 0.5) * 300;
        bird.targetY = this.tree.y - 150 - Math.random() * 100;
      }
    });
    
    // Leaves fall
    if (this.stage === 'tree' || this.stage === 'forest') {
      for (let i = 0; i < 5; i++) {
        this.createParticle(
          this.tree.x + (Math.random() - 0.5) * 100,
          this.tree.y - 150 + (Math.random() - 0.5) * 100,
          'leaf'
        );
      }
    }
    
    // Haptic
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  }
  
  handleDeviceMotion(e) {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    
    const threshold = 15;
    if (Math.abs(acc.x) > threshold || Math.abs(acc.y) > threshold) {
      // Wind gust from shake
      this.wind.strength = Math.min(this.wind.strength + 0.5, 2);
      this.tree.shakeX = acc.x * 0.8;
      this.tree.shakeY = acc.y * 0.8;
      
      // Leaves fall
      for (let i = 0; i < 8; i++) {
        this.createParticle(
          this.tree.x + (Math.random() - 0.5) * 150,
          this.tree.y - 100 - Math.random() * 150,
          'leaf'
        );
      }
    }
  }
  
  handleResize() {
    this.setupCanvas();
    this.tree.x = this.width / 2;
    this.tree.y = this.height - 100;
  }
  
  // ==================== CLEANUP ====================
  
  destroy() {
    cancelAnimationFrame(this.animationId);
    this.canvas.removeEventListener('touchstart', this.handleTouch);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('devicemotion', this.handleDeviceMotion);
  }
}

export default function TreePage() {
  const canvasRef = useRef(null);
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    getMaxUserStreak().then(max => {
      setStreak(max === 0 ? 1 : max);
    });
  }, []);

  useEffect(() => {
    if (streak !== null && canvasRef.current) {
      const tree = new TreeOfLife(canvasRef.current, streak);
      // Expose to window for console tweaking
      (window as any).tree = tree;
      return () => tree.destroy();
    }
  }, [streak]);

  return (
    <div className="w-full h-[calc(100dvh-80px)] bg-[#0f172a] overflow-hidden relative">
      {streak === null && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 z-10">
          Loading your tree...
        </div>
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block touch-none" />
      
      {/* Developer Testing Tools - Only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-black/50 p-4 rounded-xl border border-white/10 backdrop-blur-md">
          <p className="text-xs text-white/60 font-bold mb-1 uppercase tracking-wider">Dev Tools</p>
          <button 
            onClick={() => {
              if ((window as any).tree) (window as any).tree.setDay(5);
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
          >
            🌱 Sprout (Day 5)
          </button>
          <button 
            onClick={() => {
              if ((window as any).tree) (window as any).tree.setDay(15);
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
          >
            🌿 Plant (Day 15)
          </button>
          <button 
            onClick={() => {
              if ((window as any).tree) (window as any).tree.setDay(40);
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
          >
            🌳 Tree (Day 40)
          </button>
          <button 
            onClick={() => {
              if ((window as any).tree) (window as any).tree.setDay(100);
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
          >
            🌲 Forest (Day 100)
          </button>
          <button 
            onClick={() => {
              if ((window as any).tree) (window as any).tree.setDay(400);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500/50 to-pink-500/50 hover:from-purple-500/70 hover:to-pink-500/70 text-white rounded-lg text-sm transition-colors"
          >
            ✨ Legend (Day 400+)
          </button>
        </div>
      )}
    </div>
  );
}