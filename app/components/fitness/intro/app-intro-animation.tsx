"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ArrowRight,
  Sparkles,
  Zap,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Procedural Web Audio API Sound Synthesizer (Zero External Audio Files)
// ─────────────────────────────────────────────────────────────────────────────
class IntroAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch {
      // safe fallback if audio context blocked
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.initContext();
    }
  }

  // High-velocity whoosh as barbell plummets
  public playWhoosh() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.42);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.linearRampToValueAtTime(150, now + 0.42);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // safe ignore
    }
  }

  // Thunderous metallic impact slam (sub kick + iron resonance)
  public playSlam() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Heavy Sub-Bass Transient
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(150, now);
      subOsc.frequency.exponentialRampToValueAtTime(34, now + 0.35);

      subGain.gain.setValueAtTime(0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.58);

      // 2. Metallic Impact Noise Burst
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(1300, now);
      bandpass.Q.setValueAtTime(7.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      whiteNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.22);

      // 3. Heavy Iron Chime / Anvil Ring
      const iron1 = this.ctx.createOscillator();
      const ironGain = this.ctx.createGain();
      iron1.type = "triangle";
      iron1.frequency.setValueAtTime(720, now);
      iron1.frequency.exponentialRampToValueAtTime(360, now + 0.6);

      ironGain.gain.setValueAtTime(0.42, now);
      ironGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);

      iron1.connect(ironGain);
      ironGain.connect(this.ctx.destination);
      iron1.start(now);
      iron1.stop(now + 0.7);
    } catch {
      // safe ignore
    }
  }

  // Weight plates sliding along steel sleeves + snapping locked
  public playPlatesLock() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // Sliding friction hiss
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.38);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const out = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        out[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1850, now);
      filter.Q.setValueAtTime(4.5, now);

      const slideGain = this.ctx.createGain();
      slideGain.gain.setValueAtTime(0.2, now);
      slideGain.gain.linearRampToValueAtTime(0.35, now + 0.18);
      slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

      noise.connect(filter);
      filter.connect(slideGain);
      slideGain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.38);

      // Mechanical LOCK SNAP at the end of slide
      const snapTime = now + 0.34;
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = "square";
      snapOsc.frequency.setValueAtTime(2500, snapTime);
      snapOsc.frequency.exponentialRampToValueAtTime(450, snapTime + 0.12);

      snapGain.gain.setValueAtTime(0.5, snapTime);
      snapGain.gain.exponentialRampToValueAtTime(0.001, snapTime + 0.14);

      snapOsc.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapOsc.start(snapTime);
      snapOsc.stop(snapTime + 0.15);
    } catch {
      // safe ignore
    }
  }

  // Crystalline sleek light sweep across letter G
  public playLightSweep() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const dur = 1.15;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(780, now);
      osc1.frequency.exponentialRampToValueAtTime(2950, now + dur);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1560, now);
      osc2.frequency.exponentialRampToValueAtTime(4300, now + dur);

      filter.type = "highpass";
      filter.frequency.setValueAtTime(450, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.38, now + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + dur + 0.05);
      osc2.stop(now + dur + 0.05);
    } catch {
      // safe ignore
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Procedural Canvas Texture Generators (Brushed Metal & Knurling)
// ─────────────────────────────────────────────────────────────────────────────
function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  // Base metallic dark charcoal background
  const baseGrad = ctx.createRadialGradient(512, 512, 60, 512, 512, 620);
  baseGrad.addColorStop(0, "#222a23");
  baseGrad.addColorStop(0.45, "#151b16");
  baseGrad.addColorStop(1, "#080c09");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Thousands of fine horizontal anisotropic brushed lines
  ctx.lineWidth = 1;
  for (let i = 0; i < 9500; i++) {
    const y = Math.random() * 1024;
    const x1 = Math.random() * 1024;
    const len = 50 + Math.random() * 240;
    const alpha = 0.02 + Math.random() * 0.08;
    const lightness = 60 + Math.random() * 160;

    ctx.strokeStyle = `rgba(${lightness}, ${lightness + 15}, ${lightness}, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(Math.min(1024, x1 + len), y);
    ctx.stroke();
  }

  // Laser-etched high-tech Olympic platform concentric rings
  ctx.lineWidth = 2.5;
  const rings = [180, 320, 460];
  rings.forEach((r, idx) => {
    ctx.strokeStyle = idx === 1 ? "rgba(173, 255, 0, 0.28)" : "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.arc(512, 512, r, 0, Math.PI * 2);
    ctx.stroke();

    const ticks = idx === 1 ? 24 : 16;
    for (let t = 0; t < ticks; t++) {
      const angle = (t / ticks) * Math.PI * 2;
      const xA = 512 + Math.cos(angle) * (r - 8);
      const yA = 512 + Math.sin(angle) * (r - 8);
      const xB = 512 + Math.cos(angle) * (r + 8);
      const yB = 512 + Math.sin(angle) * (r + 8);
      ctx.beginPath();
      ctx.moveTo(xA, yA);
      ctx.lineTo(xB, yB);
      ctx.stroke();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createKnurlingBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  const step = 8;
  for (let i = -256; i < 512; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 256);
    ctx.lineTo(i + 256, 0);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 2);
  return texture;
}

function createPlateHubTexture(label: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 256);
  grad.addColorStop(0, "#28342b");
  grad.addColorStop(0.7, "#141c16");
  grad.addColorStop(1, "#090f0b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = "#ADFF00";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(256, 256, 220, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(256, 256, 175, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(256, 256);
  ctx.fillStyle = "#ADFF00";
  ctx.font = "900 32px 'Oswald', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GRINDLOG", 0, -120);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 28px 'Oswald', sans-serif";
  ctx.fillText(label, 0, 120);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main 3D App Intro Animation Component
// ─────────────────────────────────────────────────────────────────────────────
interface AppIntroAnimationProps {
  onComplete?: () => void;
  autoPlaySound?: boolean;
  showDismissButton?: boolean;
}

export function AppIntroAnimation({
  onComplete,
  autoPlaySound = false,
  showDismissButton = true,
}: AppIntroAnimationProps) {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<IntroAudioEngine | null>(null);

  // UI state (minimal state setters to maintain 60-120fps without React re-render overhead)
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(!autoPlaySound);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 0.5>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBrandText, setShowBrandText] = useState(false);

  // Animation internal time refs
  const timeRef = useRef(0);
  const animFrameId = useRef<number | null>(null);

  // Init Audio Engine
  useEffect(() => {
    audioRef.current = new IntroAudioEngine();
    audioRef.current.setMuted(!autoPlaySound);
    return () => {
      audioRef.current = null;
    };
  }, [autoPlaySound]);

  // Toggle Mute Handler
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.setMuted(nextMuted);
    setIsMuted(nextMuted);
  }, [isMuted]);

  // Replay Animation Handler
  const restartAnimation = useCallback(() => {
    timeRef.current = 0;
    setShowBrandText(false);
    setIsPlaying(true);
    if (progressBarRef.current) {
      progressBarRef.current.style.width = "0%";
    }
    if (audioRef.current && !isMuted) {
      audioRef.current.playWhoosh();
    }
  }, [isMuted]);

  // Fullscreen Handler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Finish / Enter App Handler
  const handleProceed = useCallback(() => {
    if (onComplete) {
      onComplete();
    } else {
      router.push("/");
    }
  }, [onComplete, router]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Three.js Scene Setup & Loop
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060907);
    scene.fog = new THREE.FogExp2(0x060907, 0.022);

    const getDimensions = () => {
      const w = container.clientWidth || window.innerWidth || 800;
      const h = container.clientHeight || window.innerHeight || 600;
      return { w, h };
    };

    const { w: initialW, h: initialH } = getDimensions();

    const camera = new THREE.PerspectiveCamera(40, initialW / initialH, 0.1, 100);
    camera.position.set(0, 1.4, 13.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      alpha: false,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    renderer.setSize(initialW, initialH);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // Pin canvas firmly inside container
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "0";
    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const keySpot = new THREE.SpotLight(0xffffff, 6.0);
    keySpot.position.set(0, 14, 9);
    keySpot.angle = Math.PI / 3.6;
    keySpot.penumbra = 0.6;
    keySpot.decay = 1.2;
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    keySpot.shadow.bias = -0.0001;
    scene.add(keySpot);

    const frontFillLight = new THREE.DirectionalLight(0xe8f0ea, 2.6);
    frontFillLight.position.set(0, 4, 10);
    scene.add(frontFillLight);

    const neonUpLight = new THREE.DirectionalLight(0xadff00, 2.4);
    neonUpLight.position.set(0, -6, 6);
    scene.add(neonUpLight);

    const neonRimLight = new THREE.PointLight(0xadff00, 4.5, 24);
    neonRimLight.position.set(-6, -0.5, 4);
    scene.add(neonRimLight);

    const neonRightLight = new THREE.PointLight(0x39ff14, 4.5, 24);
    neonRightLight.position.set(6, -0.5, 4);
    scene.add(neonRightLight);

    const impactFlash = new THREE.PointLight(0xadff00, 0, 28);
    impactFlash.position.set(0, 0.5, 3);
    scene.add(impactFlash);

    const sweepPointLight = new THREE.PointLight(0xffffff, 0, 10);
    sweepPointLight.position.set(0, 0, 2);
    scene.add(sweepPointLight);

    const ambientLight = new THREE.AmbientLight(0x202e24, 2.8);
    scene.add(ambientLight);

    // 3. Dark Brushed-Metal Background Floor & Backplate
    const brushedTexture = createBrushedMetalTexture();
    const floorGeo = new THREE.PlaneGeometry(36, 36, 16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x36433a,
      roughness: 0.36,
      metalness: 0.82,
      map: brushedTexture,
      bumpMap: brushedTexture,
      bumpScale: 0.06,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, 0, -1.3);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 4. Kinetic 3D Barbell Assembly
    const barbellGroup = new THREE.Group();
    scene.add(barbellGroup);

    const knurlingTexture = createKnurlingBumpTexture();

    // Chrome barbell bar
    const barGeo = new THREE.CylinderGeometry(0.16, 0.16, 9.4, 32);
    const barMat = new THREE.MeshStandardMaterial({
      color: 0xdde4ec,
      metalness: 0.96,
      roughness: 0.15,
    });
    const barMesh = new THREE.Mesh(barGeo, barMat);
    barMesh.rotation.z = Math.PI / 2;
    barMesh.castShadow = true;
    barbellGroup.add(barMesh);

    // Knurling grip sleeves
    const createKnurlSleeve = (xPos: number, length: number) => {
      const geo = new THREE.CylinderGeometry(0.165, 0.165, length, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xc4cbd4,
        metalness: 0.94,
        roughness: 0.35,
        bumpMap: knurlingTexture,
        bumpScale: 0.08,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.z = Math.PI / 2;
      mesh.position.x = xPos;
      barbellGroup.add(mesh);
    };
    createKnurlSleeve(-1.3, 1.1);
    createKnurlSleeve(1.3, 1.1);
    createKnurlSleeve(-2.25, 0.8);
    createKnurlSleeve(2.25, 0.8);

    // Dual Olympic competition glowing neon lime power rings
    const createPowerRing = (xPos: number) => {
      const ringGeo = new THREE.TorusGeometry(0.175, 0.035, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xadff00,
        emissive: 0xadff00,
        emissiveIntensity: 3.2,
        metalness: 0.3,
        roughness: 0.1,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.y = Math.PI / 2;
      ringMesh.position.x = xPos;
      barbellGroup.add(ringMesh);
    };
    createPowerRing(-1.85);
    createPowerRing(1.85);

    // Inner sleeve collars (flanges)
    const collarFlangeGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.14, 32);
    const collarFlangeMat = new THREE.MeshStandardMaterial({
      color: 0x222a24,
      metalness: 0.92,
      roughness: 0.22,
    });
    const leftCollarFlange = new THREE.Mesh(collarFlangeGeo, collarFlangeMat);
    leftCollarFlange.rotation.z = Math.PI / 2;
    leftCollarFlange.position.x = -2.7;
    leftCollarFlange.castShadow = true;
    barbellGroup.add(leftCollarFlange);

    const rightCollarFlange = new THREE.Mesh(collarFlangeGeo, collarFlangeMat);
    rightCollarFlange.rotation.z = Math.PI / 2;
    rightCollarFlange.position.x = 2.7;
    rightCollarFlange.castShadow = true;
    barbellGroup.add(rightCollarFlange);

    // Rotating outer loading sleeves (chrome)
    const sleeveGeo = new THREE.CylinderGeometry(0.26, 0.26, 2.5, 32);
    const sleeveMat = new THREE.MeshStandardMaterial({
      color: 0xced6df,
      metalness: 0.95,
      roughness: 0.15,
    });
    const leftSleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
    leftSleeve.rotation.z = Math.PI / 2;
    leftSleeve.position.x = -4.0;
    leftSleeve.castShadow = true;
    barbellGroup.add(leftSleeve);

    const rightSleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
    rightSleeve.rotation.z = Math.PI / 2;
    rightSleeve.position.x = 4.0;
    rightSleeve.castShadow = true;
    barbellGroup.add(rightSleeve);

    // 5. Weight Plates (Sliding Apart on Impact)
    const leftPlatesGroup = new THREE.Group();
    barbellGroup.add(leftPlatesGroup);

    const rightPlatesGroup = new THREE.Group();
    barbellGroup.add(rightPlatesGroup);

    const plate25Texture = createPlateHubTexture("25 KG");
    const plate20Texture = createPlateHubTexture("20 KG");
    const plate15Texture = createPlateHubTexture("15 KG");

    const createBumperPlate = (
      radius: number,
      thickness: number,
      hubTexture: THREE.CanvasTexture,
      rimColor: number,
      emissiveIntensity: number = 0.6
    ) => {
      const plateMeshGroup = new THREE.Group();

      const rimGeo = new THREE.CylinderGeometry(radius, radius, thickness, 36);
      const rimMat = new THREE.MeshStandardMaterial({
        color: rimColor,
        emissive: rimColor,
        emissiveIntensity: emissiveIntensity,
        roughness: 0.25,
        metalness: 0.6,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      rim.castShadow = true;
      plateMeshGroup.add(rim);

      const hubGeo = new THREE.CircleGeometry(radius * 0.88, 32);
      const hubMat = new THREE.MeshStandardMaterial({
        map: hubTexture,
        roughness: 0.3,
        metalness: 0.85,
      });

      const hubFront = new THREE.Mesh(hubGeo, hubMat);
      hubFront.rotation.y = Math.PI / 2;
      hubFront.position.x = thickness / 2 + 0.002;
      plateMeshGroup.add(hubFront);

      const hubBack = new THREE.Mesh(hubGeo, hubMat);
      hubBack.rotation.y = -Math.PI / 2;
      hubBack.position.x = -thickness / 2 - 0.002;
      plateMeshGroup.add(hubBack);

      return plateMeshGroup;
    };

    const createLockCollar = () => {
      const collarGroup = new THREE.Group();
      const bodyGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.18, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1c241e,
        metalness: 0.9,
        roughness: 0.25,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.z = Math.PI / 2;
      body.castShadow = true;
      collarGroup.add(body);

      const leverGeo = new THREE.BoxGeometry(0.12, 0.24, 0.08);
      const leverMat = new THREE.MeshStandardMaterial({
        color: 0xadff00,
        emissive: 0xadff00,
        emissiveIntensity: 2.0,
      });
      const lever = new THREE.Mesh(leverGeo, leverMat);
      lever.position.set(0, 0.42, 0);
      collarGroup.add(lever);

      return collarGroup;
    };

    // Left stack
    const leftPlate1 = createBumperPlate(1.9, 0.28, plate25Texture, 0xadff00, 0.9);
    leftPlate1.position.x = 0;
    leftPlatesGroup.add(leftPlate1);

    const leftPlate2 = createBumperPlate(1.68, 0.24, plate20Texture, 0xffffff, 0.4);
    leftPlate2.position.x = -0.32;
    leftPlatesGroup.add(leftPlate2);

    const leftPlate3 = createBumperPlate(1.48, 0.2, plate15Texture, 0xadff00, 0.8);
    leftPlate3.position.x = -0.6;
    leftPlatesGroup.add(leftPlate3);

    const leftLock = createLockCollar();
    leftLock.position.x = -0.82;
    leftPlatesGroup.add(leftLock);

    // Right stack
    const rightPlate1 = createBumperPlate(1.9, 0.28, plate25Texture, 0xadff00, 0.9);
    rightPlate1.position.x = 0;
    rightPlatesGroup.add(rightPlate1);

    const rightPlate2 = createBumperPlate(1.68, 0.24, plate20Texture, 0xffffff, 0.4);
    rightPlate2.position.x = 0.32;
    rightPlatesGroup.add(rightPlate2);

    const rightPlate3 = createBumperPlate(1.48, 0.2, plate15Texture, 0xadff00, 0.8);
    rightPlate3.position.x = 0.6;
    rightPlatesGroup.add(rightPlate3);

    const rightLock = createLockCollar();
    rightLock.position.x = 0.82;
    rightPlatesGroup.add(rightLock);

    const LEFT_REST_X = -3.05;
    const LEFT_LOCKED_X = -4.35;
    const RIGHT_REST_X = 3.05;
    const RIGHT_LOCKED_X = 4.35;

    leftPlatesGroup.position.x = LEFT_REST_X;
    rightPlatesGroup.position.x = RIGHT_REST_X;

    // 6. Monolithic 3D Metallic Letter "G"
    const gShape = new THREE.Shape();
    gShape.moveTo(1.5, 2.35);
    gShape.lineTo(-1.8, 2.35);
    gShape.lineTo(-2.65, 1.55);
    gShape.lineTo(-2.65, -1.55);
    gShape.lineTo(-1.8, -2.35);
    gShape.lineTo(1.8, -2.35);
    gShape.lineTo(2.65, -1.55);
    gShape.lineTo(2.65, 0.32);
    gShape.lineTo(0.38, 0.32);
    gShape.lineTo(0.38, -0.48);
    gShape.lineTo(1.58, -0.48);
    gShape.lineTo(1.58, -1.35);
    gShape.lineTo(1.05, -1.55);
    gShape.lineTo(-1.55, -1.55);
    gShape.lineTo(-1.55, 1.55);
    gShape.lineTo(1.5, 1.55);
    gShape.closePath();

    const gExtrudeSettings = {
      steps: 2,
      depth: 0.65,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.11,
      bevelOffset: 0,
      bevelSegments: 4,
    };

    const gGeometry = new THREE.ExtrudeGeometry(gShape, gExtrudeSettings);
    gGeometry.center();

    const gMaterial = new THREE.MeshStandardMaterial({
      color: 0x7a8e83,
      metalness: 0.95,
      roughness: 0.16,
      transparent: true,
      opacity: 1,
    });

    const gMesh = new THREE.Mesh(gGeometry, gMaterial);
    gMesh.castShadow = true;
    gMesh.receiveShadow = true;
    scene.add(gMesh);

    // Glowing neon lime chamfer edge trim
    const edgesGeo = new THREE.EdgesGeometry(gGeometry, 30);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xadff00,
      transparent: true,
      opacity: 0.35,
    });
    const gEdges = new THREE.LineSegments(edgesGeo, edgesMat);
    gMesh.add(gEdges);

    // 7. Sleek Light Sweep Flare & Glow Orb
    const sweepFlareGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const sweepFlareMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    });
    const sweepFlare = new THREE.Mesh(sweepFlareGeo, sweepFlareMat);
    scene.add(sweepFlare);

    const flareRingGeo = new THREE.RingGeometry(0.15, 0.55, 32);
    const flareRingMat = new THREE.MeshBasicMaterial({
      color: 0xadff00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const flareRing = new THREE.Mesh(flareRingGeo, flareRingMat);
    scene.add(flareRing);

    const sweepPoints = [
      new THREE.Vector3(-1.8, -2.4, 0.45),
      new THREE.Vector3(-2.65, -1.55, 0.45),
      new THREE.Vector3(-2.65, 0.0, 0.45),
      new THREE.Vector3(-2.65, 1.55, 0.45),
      new THREE.Vector3(-1.8, 2.35, 0.45),
      new THREE.Vector3(0.0, 2.35, 0.45),
      new THREE.Vector3(1.5, 2.35, 0.45),
      new THREE.Vector3(1.5, 1.55, 0.45),
      new THREE.Vector3(0.0, 1.55, 0.45),
      new THREE.Vector3(-1.55, 1.55, 0.45),
      new THREE.Vector3(-1.55, -0.2, 0.45),
      new THREE.Vector3(-1.55, -1.55, 0.45),
      new THREE.Vector3(0.0, -1.55, 0.45),
      new THREE.Vector3(1.05, -1.55, 0.45),
      new THREE.Vector3(1.58, -1.35, 0.45),
      new THREE.Vector3(1.58, -0.48, 0.45),
      new THREE.Vector3(0.38, -0.48, 0.45),
      new THREE.Vector3(0.38, 0.32, 0.45),
      new THREE.Vector3(1.8, 0.32, 0.45),
      new THREE.Vector3(2.65, 0.32, 0.45),
    ];
    const sweepCurve = new THREE.CatmullRomCurve3(sweepPoints, false, "centripetal", 0.5);

    // 8. Dynamic Shockwave Rings
    const shockwaveGeo = new THREE.RingGeometry(0.2, 0.6, 64);
    const shockwaveMat1 = new THREE.MeshBasicMaterial({
      color: 0xadff00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const shockwave1 = new THREE.Mesh(shockwaveGeo, shockwaveMat1);
    shockwave1.position.set(0, 0, -1.65);
    scene.add(shockwave1);

    const shockwaveMat2 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const shockwave2 = new THREE.Mesh(shockwaveGeo, shockwaveMat2);
    shockwave2.position.set(0, 0, -1.62);
    scene.add(shockwave2);

    // 9. Radial Spark Embers
    const PARTICLE_COUNT = 180;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6.5;
      particleVelocities.push({
        x: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
        y: Math.sin(angle) * speed * (0.8 + Math.random() * 0.4),
        z: (Math.random() - 0.2) * 4.5,
      });

      const isLime = Math.random() > 0.35;
      if (isLime) {
        particleColors[i * 3] = 0.68;
        particleColors[i * 3 + 1] = 1.0;
        particleColors[i * 3 + 2] = 0.0;
      } else {
        particleColors[i * 3] = 1.0;
        particleColors[i * 3 + 1] = 1.0;
        particleColors[i * 3 + 2] = 1.0;
      }
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    let cameraTrauma = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const { w, h } = getDimensions();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    if (audioRef.current && !isMuted) {
      audioRef.current.playWhoosh();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 60FPS Delta-Time Motion Engine
    // ─────────────────────────────────────────────────────────────────────────
    let lastTimestamp = performance.now();
    let hasPlayedSlamAudio = false;
    let hasPlayedLockAudio = false;
    let hasPlayedSweepAudio = false;

    const animate = (currentTimestamp: number) => {
      animFrameId.current = requestAnimationFrame(animate);

      const delta = Math.min((currentTimestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = currentTimestamp;

      if (isPlaying) {
        timeRef.current += delta * playbackSpeed;
      }

      const t = timeRef.current;
      const TOTAL_DURATION = 3.6;
      const progress = Math.min(t / TOTAL_DURATION, 1);

      // Direct DOM update for zero React render overhead at 60-120fps
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress * 100}%`;
      }

      // ───────────────────────────────────────────────────────────────────────
      // PHASE 0 & 1: Barbell Slam Down (t = 0.0s -> 0.46s)
      // ───────────────────────────────────────────────────────────────────────
      const IMPACT_TIME = 0.46;

      if (t < IMPACT_TIME) {
        const fallProgress = Math.min(t / IMPACT_TIME, 1);
        const fallEase = Math.pow(fallProgress, 3.0);

        // Immediate dynamic entry from y = 8.5 inside camera view
        barbellGroup.position.y = 8.5 * (1 - fallEase);
        barbellGroup.position.z = -1.2 * (1 - fallEase);
        barbellGroup.rotation.z = -0.2 * (1 - fallEase);
        barbellGroup.rotation.x = 0.28 * (1 - fallEase);

        gMesh.scale.setScalar(0.45 + 0.55 * fallProgress);
        gMesh.position.z = -2.8 * (1 - fallProgress);
        gMesh.rotation.z = -0.22 * (1 - fallProgress);
        gMaterial.opacity = 0.4 + 0.6 * fallProgress;

        leftPlatesGroup.position.x = LEFT_REST_X;
        rightPlatesGroup.position.x = RIGHT_REST_X;
      } else {
        const postImpact = t - IMPACT_TIME;

        if (!hasPlayedSlamAudio) {
          hasPlayedSlamAudio = true;
          cameraTrauma = 1.0;
          if (audioRef.current && !isMuted) {
            audioRef.current.playSlam();
          }
        }

        // Barbell settling vibration / elastic bounce
        const bounceFreq = 26;
        const bounceDamp = Math.exp(-postImpact * 8.5);
        const bounceY = Math.sin(postImpact * bounceFreq) * 0.45 * bounceDamp;
        barbellGroup.position.y = bounceY;
        barbellGroup.position.z = 0;
        barbellGroup.rotation.z = Math.sin(postImpact * 30) * 0.04 * bounceDamp;
        barbellGroup.rotation.x = 0;

        impactFlash.intensity = Math.max(0, 18.0 * Math.exp(-postImpact * 9.0));

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 2: Plates Slide Apart & Lock (postImpact 0.04s -> 0.60s)
        // ─────────────────────────────────────────────────────────────────────
        const slideDuration = 0.52;
        const slideProgress = Math.min(Math.max((postImpact - 0.04) / slideDuration, 0), 1);

        let slideEase = 0;
        if (slideProgress < 0.75) {
          slideEase = (slideProgress / 0.75) * 1.04;
        } else {
          const settleT = (slideProgress - 0.75) / 0.25;
          slideEase = 1.04 - 0.04 * Math.sin(settleT * Math.PI * 0.5);
        }

        leftPlatesGroup.position.x = LEFT_REST_X + (LEFT_LOCKED_X - LEFT_REST_X) * Math.min(slideEase, 1);
        rightPlatesGroup.position.x = RIGHT_REST_X + (RIGHT_LOCKED_X - RIGHT_REST_X) * Math.min(slideEase, 1);

        if (postImpact >= 0.48 && !hasPlayedLockAudio) {
          hasPlayedLockAudio = true;
          if (audioRef.current && !isMuted) {
            audioRef.current.playPlatesLock();
          }
        }

        // Letter G locks into perfect center around the barbell
        const gLockProgress = Math.min(postImpact / 0.45, 1);
        const gScale = 0.92 + 0.08 * Math.sin(gLockProgress * Math.PI * 0.5);
        gMesh.scale.setScalar(gScale);
        gMesh.position.z = 0;
        gMesh.rotation.z = 0;
        gMaterial.opacity = 1.0;

        // ─────────────────────────────────────────────────────────────────────
        // Shockwave expansion
        // ─────────────────────────────────────────────────────────────────────
        const shock1T = Math.min(postImpact / 0.65, 1);
        if (shock1T < 1) {
          const s1 = 0.2 + shock1T * 12.0;
          shockwave1.scale.set(s1, s1, 1);
          shockwaveMat1.opacity = Math.max(0, (1 - shock1T) * 0.9);
        } else {
          shockwaveMat1.opacity = 0;
        }

        const shock2T = Math.min(Math.max((postImpact - 0.06) / 0.55, 0), 1);
        if (shock2T > 0 && shock2T < 1) {
          const s2 = 0.2 + shock2T * 8.5;
          shockwave2.scale.set(s2, s2, 1);
          shockwaveMat2.opacity = Math.max(0, (1 - shock2T) * 0.7);
        } else {
          shockwaveMat2.opacity = 0;
        }

        // ─────────────────────────────────────────────────────────────────────
        // Particle sparks physics
        // ─────────────────────────────────────────────────────────────────────
        const pArray = particlesGeo.attributes.position.array as Float32Array;
        const particleLifespan = 0.95;
        const pLife = Math.min(postImpact / particleLifespan, 1);

        if (pLife < 1) {
          particlesMat.opacity = Math.max(0, 1 - pLife);
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const vel = particleVelocities[i];
            pArray[i * 3] += vel.x * delta;
            pArray[i * 3 + 1] += vel.y * delta - 4.5 * delta * delta;
            pArray[i * 3 + 2] += vel.z * delta;
          }
          particlesGeo.attributes.position.needsUpdate = true;
        } else {
          particlesMat.opacity = 0;
        }

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 3: Sleek Light Sweep across the letter "G" (t = 1.05s -> 2.25s)
        // ─────────────────────────────────────────────────────────────────────
        const SWEEP_START = 1.05;
        const SWEEP_DURATION = 1.15;

        if (t >= SWEEP_START && t <= SWEEP_START + SWEEP_DURATION) {
          const sweepProgress = (t - SWEEP_START) / SWEEP_DURATION;

          if (!hasPlayedSweepAudio) {
            hasPlayedSweepAudio = true;
            if (audioRef.current && !isMuted) {
              audioRef.current.playLightSweep();
            }
          }

          const pointOnCurve = sweepCurve.getPointAt(sweepProgress);
          sweepFlare.position.copy(pointOnCurve);
          flareRing.position.copy(pointOnCurve);
          sweepPointLight.position.set(pointOnCurve.x, pointOnCurve.y, pointOnCurve.z + 0.35);

          const intensity = Math.sin(sweepProgress * Math.PI) * 15.0;
          sweepPointLight.intensity = intensity;
          sweepFlareMat.opacity = Math.min(intensity / 4.0, 1.0);
          flareRingMat.opacity = Math.min(intensity / 5.0, 0.85);
          flareRing.scale.setScalar(1 + Math.sin(sweepProgress * Math.PI * 4) * 0.2);

          edgesMat.opacity = 0.5 + 0.5 * Math.sin(sweepProgress * Math.PI);
        } else {
          sweepPointLight.intensity = 0;
          sweepFlareMat.opacity = 0;
          flareRingMat.opacity = 0;
          edgesMat.opacity = 0.5;
        }

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 4: Emblem Lock & Brand Typography Reveal (t >= 2.05s)
        // ─────────────────────────────────────────────────────────────────────
        if (t >= 2.05 && !showBrandText) {
          setShowBrandText(true);
        }
      }

      // Camera trauma decay
      if (cameraTrauma > 0) {
        cameraTrauma = Math.max(0, cameraTrauma - delta * 3.2);
        const shakeX = (Math.random() * 2 - 1) * cameraTrauma * 0.28;
        const shakeY = (Math.random() * 2 - 1) * cameraTrauma * 0.28;
        camera.position.x = shakeX + mouseX * 0.45;
        camera.position.y = 1.4 + shakeY + mouseY * 0.35;
      } else {
        const idleFloat = Math.sin(t * 1.5) * 0.08;
        camera.position.x = mouseX * 0.45;
        camera.position.y = 1.4 + idleFloat + mouseY * 0.35;
      }
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      scene.clear();
      renderer.dispose();
      brushedTexture.dispose();
      knurlingTexture.dispose();
      plate25Texture.dispose();
      plate20Texture.dispose();
      plate15Texture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isPlaying, playbackSpeed, isMuted, showBrandText]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-50 w-screen h-screen min-h-[100dvh] bg-[#060907] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* Top Header Overlay */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ADFF00] via-[#85e600] to-[#559900] text-black flex items-center justify-center font-black text-xl shadow-[0_0_25px_rgba(173,255,0,0.45)] border border-[#c6ff33]">
            G
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight leading-none text-white flex items-center gap-1.5">
              GRINDLOG<span className="text-[#ADFF00]">.AI</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#122212] border border-[#ADFF00]/40 text-[#ADFF00] uppercase font-bold tracking-widest">
                4K 60FPS
              </span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">
              High-Performance Fitness OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <button
            type="button"
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md ${
              isMuted
                ? "bg-[#141a15]/80 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                : "bg-[#162916]/90 border-[#ADFF00]/50 text-[#ADFF00] shadow-[0_0_15px_rgba(173,255,0,0.25)]"
            }`}
            title={isMuted ? "Unmute Procedural Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="animate-pulse" />}
            <span className="hidden sm:inline">{isMuted ? "Sound: Off" : "Sound: FX Active"}</span>
          </button>

          <button
            type="button"
            onClick={() => setPlaybackSpeed((s) => (s === 1 ? 0.5 : 1))}
            className="px-3 py-1.5 rounded-full border border-white/10 bg-[#141a15]/80 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
            title="Toggle Slow Motion"
          >
            <Gauge size={13} className="text-[#ADFF00]" />
            <span>{playbackSpeed === 1 ? "1.0x" : "0.5x Slow-Mo"}</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-full border border-white/10 bg-[#141a15]/80 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* Center Cinematic Brand Typography Reveal (Appears when G forms) */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div
        className={`absolute inset-x-0 bottom-24 sm:bottom-28 z-20 flex flex-col items-center justify-center text-center pointer-events-none transition-all duration-700 ${
          showBrandText ? "opacity-100 translate-y-0 filter-none" : "opacity-0 translate-y-6 blur-sm"
        }`}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d160e]/85 border border-[#ADFF00]/30 shadow-[0_0_20px_rgba(173,255,0,0.18)] mb-2.5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF00] animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ADFF00]">
            AI Precision Strength Engineering
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.03em] uppercase text-white leading-none">
          <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            GRIND
          </span>
          <span className="bg-gradient-to-r from-[#ADFF00] via-[#c6ff33] to-[#80ed00] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(173,255,0,0.4)]">
            LOG
          </span>
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-gray-400 font-semibold tracking-[0.16em] uppercase max-w-md mx-auto">
          The Intelligent Fitness Operating System
        </p>

        <div className="flex items-center gap-2 sm:gap-4 mt-3 text-[10px] sm:text-xs text-gray-300 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1 text-[#ADFF00]">
            <CheckCircle2 size={12} /> Hyper-Personalized
          </span>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1 text-[#ADFF00]">
            <Zap size={12} /> Real-Time Calibration
          </span>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1 text-[#ADFF00]">
            <Sparkles size={12} /> Indian Nutrition Engine
          </span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* Bottom Control Bar & CTA */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <footer className="absolute bottom-0 inset-x-0 z-30 p-4 sm:p-6 flex flex-col gap-3 pointer-events-none">
        <div className="w-full max-w-xl mx-auto flex items-center gap-3">
          <span className="text-[9px] font-mono text-gray-400">00:00</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-[#ADFF00] to-[#c6ff33] shadow-[0_0_10px_#ADFF00] w-0"
            />
          </div>
          <span className="text-[9px] font-mono text-gray-400">03:60</span>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4 pointer-events-auto">
          <button
            type="button"
            onClick={restartAnimation}
            className="px-4 py-3 rounded-2xl bg-[#121c14]/90 border border-white/10 hover:border-[#ADFF00]/40 text-gray-200 hover:text-[#ADFF00] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Replay Motion</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="p-3 rounded-2xl bg-[#121c14]/90 border border-white/10 hover:border-white/30 text-gray-200 text-xs font-bold backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            title={isPlaying ? "Pause Motion" : "Resume Motion"}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="text-[#ADFF00]" />}
          </button>

          {showDismissButton && (
            <button
              type="button"
              onClick={handleProceed}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ADFF00] via-[#c6ff33] to-[#80ed00] hover:from-[#b8ff1a] hover:to-[#8ff000] text-black text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_30px_rgba(173,255,0,0.4)] transition-all active:scale-95 cursor-pointer"
            >
              <span>Enter GrindLog</span>
              <ArrowRight size={16} strokeWidth={2.8} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
