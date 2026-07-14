// @ts-nocheck
import React, { useRef, useEffect, useState, useCallback } from 'react';

/* ============================================================
   TREE OF LIFE — Real, working canvas-based growth animation
   Tier-1 MVP: pure Canvas2D + React, zero external deps/assets.
   ============================================================ */

const MAX_POINTS = 120;

const STAGES = [
  { name: 'Seed',        min: 0,   desc: 'Just planted. Water it to begin.' },
  { name: 'Sprout',      min: 5,   desc: 'First signs of life.' },
  { name: 'Sapling',     min: 15,  desc: 'Branches are forming.' },
  { name: 'Young Tree',  min: 35,  desc: 'A real canopy is taking shape.' },
  { name: 'Mature Tree', min: 70,  desc: 'Deep roots, full crown.' },
  { name: 'Legend Tree', min: 120, desc: 'Ancient. Radiant. Eternal.' },
];

const PALETTES = {
  natural: { leaf: ['#4c9a4c', '#6ab04c', '#8fce4c'], trunkDark: '#4a2f1d', trunkLight: '#7a5233', flower: '#ff6fa5' },
  warm:    { leaf: ['#e08a3c', '#e2b23c', '#c96b3c'], trunkDark: '#4a2f1d', trunkLight: '#8a5a33', flower: '#ff5c5c' },
  cool:    { leaf: ['#3ca7e0', '#3ce0c9', '#3c6be0'], trunkDark: '#2f3a4a', trunkLight: '#516a7a', flower: '#c3e0ff' },
  mystic:  { leaf: ['#9c6bff', '#6bffe0', '#ff6bd6'], trunkDark: '#2a1f3a', trunkLight: '#5a4a7a', flower: '#ffe066' },
};

const GOLD_PALETTE = { leaf: ['#ffd700', '#ffcf40', '#ffe680'], trunkDark: '#7a5a1f', trunkLight: '#d4af37', flower: '#fff2b2' };

/* ---------- small deterministic RNG (no external lib) ---------- */
function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}
function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

function getPalette(name, night, golden) {
  const base = golden ? GOLD_PALETTE : (PALETTES[name] || PALETTES.natural);
  if (!night) return base;
  return { ...base, leaf: base.leaf.map((c) => lerpColor(c, '#1b2747', 0.45)) };
}

const MAX_DEPTH = 7; // perf-safe recursion depth (tune up for desktop, down for low-end mobile)

export default function TreeOfLife() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const particlesRef = useRef([]);
  const textParticlesRef = useRef([]);
  const dropsRef = useRef([]);

  const pointsRef = useRef(0);
  const displayedPointsRef = useRef(0);
  const healthRef = useRef(1);
  const displayedHealthRef = useRef(1);

  const paletteRef = useRef('natural');
  const nightRef = useRef(false);
  const windRef = useRef(true);

  const [points, setPoints] = useState(0);
  const [health, setHealth] = useState(1);
  const [isNight, setIsNight] = useState(false);
  const [windOn, setWindOn] = useState(true);
  const [palette, setPalette] = useState('natural');
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => { paletteRef.current = palette; }, [palette]);
  useEffect(() => { nightRef.current = isNight; }, [isNight]);
  useEffect(() => { windRef.current = windOn; }, [windOn]);
  useEffect(() => { pointsRef.current = points; }, [points]);
  useEffect(() => { healthRef.current = health; }, [health]);

  // stage transition detection + celebration burst
  useEffect(() => {
    let idx = 0;
    for (let i = 0; i < STAGES.length; i++) if (points >= STAGES[i].min) idx = i;
    if (idx !== stageIndex) {
      setStageIndex(idx);
      celebrate(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  function celebrate(idx) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr, h = canvas.height / dpr;
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        type: 'sparkle',
        x: w / 2 + (Math.random() - 0.5) * 220,
        y: h * 0.35 + (Math.random() - 0.5) * 150,
        vx: (Math.random() - 0.5) * 1.4,
        vy: -Math.random() * 1.5 - 0.4,
        life: 90 + Math.random() * 40, maxLife: 130,
        color: idx >= 5 ? '#ffe066' : '#bff2a0',
        size: 2 + Math.random() * 3,
      });
    }
  }

  const waterHabit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    dropsRef.current.push({ x: w / 2 + (Math.random() - 0.5) * 70, y: -10, vy: 4 });
    setHealth((h) => Math.min(1, h + 0.15));
  }, []);

  const missHabit = useCallback(() => {
    setHealth((h) => Math.max(0, h - 0.25));
  }, []);

  const reset = useCallback(() => {
    setPoints(0);
    setHealth(1);
    setStageIndex(0);
    particlesRef.current = [];
    textParticlesRef.current = [];
    dropsRef.current = [];
    displayedPointsRef.current = 0;
    displayedHealthRef.current = 1;
  }, []);

  /* ---------------------- main render loop ---------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height, dpr;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      width = parent.clientWidth;
      height = 520;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function drawBackground(time, w, h, night) {
      const groundY = h * 0.8;
      const grad = ctx.createLinearGradient(0, 0, 0, groundY);
      if (night) { grad.addColorStop(0, '#0b1026'); grad.addColorStop(1, '#1b2747'); }
      else { grad.addColorStop(0, '#bfe9ff'); grad.addColorStop(1, '#eaf7ff'); }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, groundY);

      // sun / moon
      const cx = w * 0.85, cy = h * 0.14, r = 26;
      ctx.beginPath();
      ctx.fillStyle = night ? '#dfe6ff' : '#fff3b0';
      ctx.shadowColor = night ? '#9fb4ff' : '#ffe27a';
      ctx.shadowBlur = 28;
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (night) {
        const rand = mulberry32(42);
        for (let i = 0; i < 55; i++) {
          const sx = rand() * w, sy = rand() * groundY * 0.8;
          const tw = 0.5 + 0.5 * Math.sin(time * 0.002 + i);
          ctx.globalAlpha = 0.25 + 0.5 * tw;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
      groundGrad.addColorStop(0, '#5b3d24');
      groundGrad.addColorStop(1, '#2e1e13');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, w, h - groundY);

      return groundY;
    }

    function drawSeed(w, groundY, time) {
      const pulse = 1 + 0.08 * Math.sin(time * 0.003);
      ctx.save();
      ctx.translate(w / 2, groundY - 6);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = '#caa15a';
      ctx.shadowColor = '#ffdca0';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawFlower(x, y, r, color) {
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.ellipse(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.5, r * 0.3, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.fillStyle = '#ffe066';
      ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawFlame(x, y, time) {
      const flick = 0.8 + 0.3 * Math.sin(time * 0.02) + 0.1 * Math.sin(time * 0.07);
      const grad = ctx.createLinearGradient(x, y, x, y - 18 * flick);
      grad.addColorStop(0, '#ff9d2e');
      grad.addColorStop(1, '#fff3b0');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.quadraticCurveTo(x - 6, y - 10 * flick, x, y - 18 * flick);
      ctx.quadraticCurveTo(x + 6, y - 10 * flick, x + 4, y);
      ctx.closePath();
      ctx.fill();
    }

    function drawRoots(x, y, maturity) {
      if (maturity < 0.04) return;
      const n = 3 + Math.floor(maturity * 4);
      ctx.strokeStyle = 'rgba(80,50,30,0.5)';
      for (let i = 0; i < n; i++) {
        const dir = (i - n / 2) / n;
        const len = 20 + maturity * 45;
        ctx.lineWidth = 2 + maturity * 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const cx1 = x + dir * 40, cy1 = y + len * 0.4;
        const ex = x + dir * 75, ey = y + len;
        ctx.quadraticCurveTo(cx1, cy1, ex, ey);
        ctx.stroke();
      }
    }

    function drawTree(time, w, h, groundY, maturity, health, windOnFlag, pal) {
      const baseX = w / 2, baseY = groundY;
      const trunkLen = 30 + maturity * 100;
      const windStrength = windOnFlag ? 0.05 + maturity * 0.02 : 0;

      function branch(x, y, len, angle, depth, pathSeed) {
        const growThreshold = (depth / (MAX_DEPTH + 1)) * 0.85;
        const growWindow = 0.18;
        let localT = (maturity - growThreshold) / growWindow;
        localT = Math.max(0, Math.min(1, localT));
        if (localT <= 0) return;

        const localRand = mulberry32(pathSeed);
        const wind = Math.sin(time * 0.0012 + depth * 0.7 + x * 0.01) * windStrength * (depth / MAX_DEPTH);
        const droop = depth === 0 ? 0 : (1 - health) * 0.55 * (depth / MAX_DEPTH) * (angle >= 0 ? 1 : -1);
        const effAngle = angle + wind + droop;

        const actualLen = len * localT;
        const dx = Math.sin(effAngle) * actualLen;
        const dy = -Math.cos(effAngle) * actualLen;
        const ex = x + dx, ey = y + dy;

        const widthPx = Math.max(0.8, (MAX_DEPTH - depth + 1) * (1.6 + maturity * 1.1));
        const colorT = depth / MAX_DEPTH;
        ctx.strokeStyle = lerpColor(pal.trunkDark, pal.trunkLight, colorT);
        ctx.lineWidth = widthPx;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        if (depth < MAX_DEPTH) {
          const nBranches = depth === 0 ? 2 : (localRand() < 0.25 ? 3 : 2);
          for (let i = 0; i < nBranches; i++) {
            const spread = 0.35 + localRand() * 0.5;
            const dir = i % 2 === 0 ? -1 : 1;
            const childAngle = effAngle + dir * spread + (localRand() - 0.5) * 0.15;
            const childLen = len * (0.68 + localRand() * 0.15);
            const childSeed = (pathSeed * 1000003 + i * 97 + depth * 131) | 0;
            branch(ex, ey, childLen, childAngle, depth + 1, childSeed);
          }
        } else if (localT > 0.35) {
          drawLeafCluster(ex, ey, localT, time, pal, health);
        }
      }

      function drawLeafCluster(x, y, t, time, pal, health) {
        const n = 3 + Math.floor(t * 3);
        for (let i = 0; i < n; i++) {
          const seedPhase = x * 13.1 + y * 7.7 + i * 3.3;
          const sway = Math.sin(time * 0.003 + seedPhase) * 4 * t;
          const lx = x + Math.cos(seedPhase) * 6 * t + sway;
          const ly = y + Math.sin(seedPhase) * 6 * t + (1 - health) * 6;
          const size = (3 + 2 * t) * (0.8 + 0.4 * Math.sin(seedPhase * 2));
          const baseColor = pal.leaf[Math.floor(Math.abs(Math.sin(seedPhase)) * pal.leaf.length) % pal.leaf.length];
          const color = health < 1 ? lerpColor(baseColor, '#8a8a7a', 1 - health) : baseColor;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.ellipse(lx, ly, size, size * 0.7, seedPhase, 0, Math.PI * 2);
          ctx.fill();

          // occasional falling leaf when unhealthy
          if (health < 0.6 && Math.random() < 0.0025) {
            particlesRef.current.push({
              type: 'leafFall', x: lx, y: ly, vx: 0, vy: 0.4,
              phase: Math.random() * 10, life: 200, maxLife: 200, color,
            });
          }
        }
      }

      branch(baseX, baseY, trunkLen, 0, 0, 1337);
      drawRoots(baseX, baseY, maturity);

      if (maturity > 0.4) {
        const n = Math.floor((maturity - 0.4) * 12);
        const frand = mulberry32(555);
        for (let i = 0; i < n; i++) {
          const seedPhase = i * 17.3;
          const fx = baseX + Math.cos(seedPhase) * 34 * (frand() + 0.3);
          const fy = baseY - Math.abs(Math.sin(seedPhase)) * 10 - 5;
          drawFlower(fx, fy, 4 + 2 * Math.sin(time * 0.002 + seedPhase), pal.flower);
        }
      }
    }

    function updateAndDrawParticles(groundY) {
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.type === 'splash') p.vy += 0.15;
        if (p.type === 'leafFall') { p.x += Math.sin(p.phase) * 0.4; p.vy += 0.01; if (p.y > groundY) p.life = Math.min(p.life, 20); }
        p.life--;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size || 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      textParticlesRef.current = textParticlesRef.current.filter((t) => t.life > 0);
      textParticlesRef.current.forEach((t) => {
        t.y += t.vy; t.life--;
        ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
        ctx.fillStyle = t.color;
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.globalAlpha = 1;
      });
    }

    function updateDrops(groundY) {
      dropsRef.current = dropsRef.current.filter((d) => !d.done);
      dropsRef.current.forEach((d) => {
        d.y += d.vy;
        d.vy += 0.25;
        ctx.fillStyle = 'rgba(120,190,255,0.85)';
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (d.y >= groundY - 4) {
          d.done = true;
          for (let i = 0; i < 14; i++) {
            const a = Math.random() * Math.PI * 2;
            particlesRef.current.push({
              type: 'splash', x: d.x, y: groundY,
              vx: Math.cos(a) * 2, vy: -Math.random() * 3 - 1,
              life: 30 + Math.random() * 10, maxLife: 40,
              color: '#7fc8ff', size: 1.5 + Math.random() * 1.5,
            });
          }
          for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2;
            particlesRef.current.push({
              type: 'sparkle', x: d.x + Math.cos(a) * 4, y: groundY + Math.sin(a) * 2,
              vx: Math.cos(a) * 0.6, vy: Math.sin(a) * 0.6 - 0.2,
              life: 40, maxLife: 40, color: '#bff2a0', size: 1.5,
            });
          }
          textParticlesRef.current.push({ text: '+1', x: d.x, y: groundY - 10, vy: -0.8, life: 70, maxLife: 70, color: '#ffffff' });
          setPoints((p) => Math.min(MAX_POINTS + 30, p + 1));
        }
      });
    }

    function loop(now) {
      const dpr2 = window.devicePixelRatio || 1;
      const w = canvas.width / dpr2, h = canvas.height / dpr2;
      ctx.clearRect(0, 0, w, h);

      const night = nightRef.current;
      const groundY = drawBackground(now, w, h, night);

      displayedPointsRef.current += (pointsRef.current - displayedPointsRef.current) * 0.03;
      displayedHealthRef.current += (healthRef.current - displayedHealthRef.current) * 0.05;

      const maturity = Math.max(0, Math.min(1, displayedPointsRef.current / MAX_POINTS));
      const golden = displayedPointsRef.current >= 100;
      const pal = getPalette(paletteRef.current, night, golden);

      if (maturity < 0.02) {
        drawSeed(w, groundY, now);
      } else {
        drawTree(now, w, h, groundY, maturity, displayedHealthRef.current, windRef.current, pal);
        if (golden) drawFlame(w / 2, groundY - 2, now);
      }

      updateDrops(groundY);
      updateAndDrawParticles(groundY);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const stage = STAGES[stageIndex];
  const nextStage = STAGES[stageIndex + 1];
  const progressPct = nextStage
    ? Math.min(100, ((points - stage.min) / (nextStage.min - stage.min)) * 100)
    : 100;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>🌳 Tree of Life</h2>
            <div style={styles.stageName}>{stage.name}{points >= 100 ? ' · ✨ Golden' : ''}</div>
            <div style={styles.stageDesc}>{stage.desc}</div>
          </div>
          <div style={styles.pointsBadge}>{points} pts</div>
        </div>

        <canvas ref={canvasRef} style={styles.canvas} />

        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>
        <div style={styles.progressLabel}>
          {nextStage ? `${Math.max(0, nextStage.min - points)} pts to ${nextStage.name}` : 'Max stage reached'}
        </div>

        <div style={styles.healthTrack}>
          <div style={{ ...styles.healthFill, width: `${health * 100}%` }} />
        </div>
        <div style={styles.progressLabel}>Health {Math.round(health * 100)}%</div>

        <div style={styles.controls}>
          <button style={styles.primaryBtn} onClick={waterHabit}>💧 Complete Habit</button>
          <button style={styles.ghostBtn} onClick={missHabit}>😔 Missed Day</button>
          <button style={styles.ghostBtn} onClick={() => setIsNight((n) => !n)}>{isNight ? '☀️ Day' : '🌙 Night'}</button>
          <button style={styles.ghostBtn} onClick={() => setWindOn((w) => !w)}>{windOn ? '💨 Wind: On' : '🍂 Wind: Off'}</button>
          <select style={styles.select} value={palette} onChange={(e) => setPalette(e.target.value)}>
            <option value="natural">Natural</option>
            <option value="warm">Warm</option>
            <option value="cool">Cool</option>
            <option value="mystic">Mystic</option>
          </select>
          <button style={styles.ghostBtn} onClick={reset}>↺ Reset</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0f1420', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' },
  card: { width: '100%', maxWidth: 760, background: '#161c2c', borderRadius: 20, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { color: '#fff', margin: 0, fontSize: 22 },
  stageName: { color: '#8fce4c', fontWeight: 700, marginTop: 4, fontSize: 16 },
  stageDesc: { color: '#9aa4b8', fontSize: 13, marginTop: 2 },
  pointsBadge: { background: '#22283c', color: '#ffe066', padding: '6px 14px', borderRadius: 999, fontWeight: 700, height: 'fit-content' },
  canvas: { width: '100%', borderRadius: 16, display: 'block', background: '#000' },
  progressTrack: { height: 8, background: '#22283c', borderRadius: 999, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#4c9a4c,#8fce4c)', transition: 'width 0.4s ease' },
  healthTrack: { height: 6, background: '#22283c', borderRadius: 999, marginTop: 10, overflow: 'hidden' },
  healthFill: { height: '100%', background: 'linear-gradient(90deg,#e05c5c,#ffd76b,#6ab04c)', transition: 'width 0.4s ease' },
  progressLabel: { color: '#7c869c', fontSize: 12, marginTop: 6 },
  controls: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  primaryBtn: { background: '#3ca7e0', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' },
  ghostBtn: { background: '#22283c', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer' },
  select: { background: '#22283c', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer' },
};