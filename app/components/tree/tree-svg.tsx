"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { springs } from "@/animations/springs";
import type { TreeStage } from "@/types";

interface TreeSVGProps {
  stage: TreeStage;
  size?: number;
  interactive?: boolean;
  onWater?: () => void;
}

interface TreeElement {
  type: "leaf" | "flower" | "butterfly" | "bird" | "water";
  x: number;
  y: number;
  delay: number;
  scale: number;
  rotation?: number;
}

// Deterministic pseudo-random number generator
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function getTreeElements(stage: TreeStage): TreeElement[] {
  const elements: TreeElement[] = [];
  let seed = 1;

  // Leaves (stage 2+)
  if (stage >= 2) {
    const count = stage >= 7 ? 12 : stage >= 5 ? 8 : stage >= 3 ? 5 : 2;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.15;
      const radius = 30 + pseudoRandom(seed++) * 20;
      elements.push({
        type: "leaf",
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius - 25 + pseudoRandom(seed++) * 15,
        delay: i * 0.12,
        scale: 0.7 + pseudoRandom(seed++) * 0.6,
        rotation: pseudoRandom(seed++) * 360,
      });
    }
  }

  // Flowers (stage 4+)
  if (stage >= 4) {
    const count = stage >= 7 ? 6 : stage >= 6 ? 4 : 2;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.4;
      elements.push({
        type: "flower",
        x: Math.cos(angle) * 35 + (pseudoRandom(seed++) - 0.5) * 15,
        y: Math.sin(angle) * 35 - 20 + pseudoRandom(seed++) * 10,
        delay: 0.6 + i * 0.2,
        scale: 0.8 + pseudoRandom(seed++) * 0.4,
      });
    }
  }

  // Butterflies (stage 5+)
  if (stage >= 5) {
    const count = stage >= 7 ? 3 : stage >= 6 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      elements.push({
        type: "butterfly",
        x: -25 + i * 25 + (pseudoRandom(seed++) - 0.5) * 20,
        y: -30 - i * 10 + pseudoRandom(seed++) * 10,
        delay: i * 0.3,
        scale: 0.9 + pseudoRandom(seed++) * 0.3,
      });
    }
  }

  // Birds (stage 6+)
  if (stage >= 6) {
    const count = stage >= 7 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      elements.push({
        type: "bird",
        x: -20 + i * 40,
        y: -40 - i * 12,
        delay: i * 0.5,
        scale: 1,
      });
    }
  }

  // Water drops (always floating up)
  if (stage >= 1) {
    for (let i = 0; i < 3; i++) {
      elements.push({
        type: "water",
        x: (i - 1) * 18 + pseudoRandom(seed++) * 10,
        y: 10 + pseudoRandom(seed++) * 15,
        delay: i * 0.8,
        scale: 0.6 + pseudoRandom(seed++) * 0.5,
      });
    }
  }

  return elements;
}

function TreeTrunk({ stage }: { stage: TreeStage }) {
  const trunkHeight = stage >= 5 ? 45 : stage >= 3 ? 35 : stage >= 1 ? 25 : 15;
  const trunkWidth = stage >= 5 ? 6 : stage >= 3 ? 5 : 4;

  return (
    <motion.rect
      x={-trunkWidth / 2}
      y={0}
      width={trunkWidth}
      height={trunkHeight}
      rx={trunkWidth / 2}
      fill={stage >= 7 ? "var(--color-tree-legend)" : "#8B6914"}
      initial={{ height: 0 }}
      animate={{ height: trunkHeight }}
      transition={springs.gentle}
    />
  );
}

function TreeCanopy({ stage }: { stage: TreeStage }) {
  if (stage === 0) return null;

  const canopyLayers = stage >= 7 ? 3 : stage >= 5 ? 3 : stage >= 3 ? 2 : 1;
  const baseColor =
    stage >= 7
      ? "var(--color-tree-legend)"
      : stage >= 6
        ? "var(--color-tree-mature)"
        : stage >= 3
          ? "var(--color-tree-plant)"
          : "var(--color-tree-sprout)";

  return (
    <g>
      {Array.from({ length: canopyLayers }).map((_, i) => {
        const size = 20 + i * 8;
        const y = -25 - i * 12;
        const opacity = 0.7 + i * 0.15;
        return (
          <motion.circle
            key={i}
            cx={0}
            cy={y}
            r={0}
            fill={baseColor}
            opacity={opacity}
            initial={{ r: 0 }}
            animate={{ r: size }}
            transition={{ ...springs.gentle, delay: i * 0.2 }}
          />
        );
      })}
    </g>
  );
}

function LeafSVG({ x, y, delay, scale, rotation }: TreeElement) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale }}
      transition={{ ...springs.bouncy, delay }}
      style={{ originX: `${x}px`, originY: `${y}px` }}
    >
      <motion.g
        animate={{ rotate: [0, 5, 0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse
          cx={x}
          cy={y}
          rx={6}
          ry={3}
          fill="var(--color-accent-green)"
          opacity={0.7}
          transform={`rotate(${rotation || 0})`}
        />
        <line
          x1={x}
          y1={y}
          x2={x + 3}
          y2={y}
          stroke="var(--color-accent-green)"
          strokeWidth={0.5}
          opacity={0.5}
        />
      </motion.g>
    </motion.g>
  );
}

function FlowerSVG({ x, y, delay, scale }: TreeElement) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale }}
      transition={{ ...springs.bouncy, delay }}
    >
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <motion.ellipse
          key={i}
          cx={x}
          cy={y}
          rx={2.5}
          ry={1.2}
          fill="#FF6B8A"
          opacity={0.8}
          transform={`rotate(${angle}, ${x}, ${y})`}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
      <circle cx={x} cy={y} r={1.5} fill="#FFD700" />
    </motion.g>
  );
}

function ButterflySVG({ x, y, delay, scale }: TreeElement) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.g
        animate={{
          x: [x, x + 15, x - 10, x + 5, x],
          y: [y, y - 8, y - 18, y - 5, y],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.g
          animate={{ rotateY: [0, 180, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.5 }}
        >
          <ellipse cx={0} cy={-3} rx={3} ry={2} fill="#FF9500" opacity={0.8} />
          <ellipse cx={0} cy={3} rx={2.5} ry={1.5} fill="#FF9500" opacity={0.6} />
        </motion.g>
      </motion.g>
    </motion.g>
  );
}

function BirdSVG({ x, y, delay }: TreeElement) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.g
        animate={{
          x: [x, x + 20, x - 15, x + 10, x],
          y: [y, y - 12, y - 5, y - 15, y],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M-3,0 Q0,-3 3,0 Q0,-1.5 -3,0"
          fill="var(--color-accent-blue)"
          opacity={0.8}
        />
      </motion.g>
    </motion.g>
  );
}

function WaterDropSVG({ x, y, delay, scale }: TreeElement) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.g
        animate={{
          y: [y, y - 25],
          opacity: [0.8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay,
          ease: "easeOut",
        }}
      >
        <path
          d="M0,-3 C2,-1 3,1 2,3 C1,5 -1,5 -2,3 C-3,1 -2,-1 0,-3"
          fill="var(--color-accent-blue)"
          opacity={0.7}
          transform={`translate(${x}, ${y}) scale(${scale})`}
        />
      </motion.g>
    </motion.g>
  );
}

function SeedSVG() {
  return (
    <motion.g>
      {/* Soil */}
      <motion.ellipse
        cx={0}
        cy={12}
        rx={12}
        ry={4}
        fill="#8B6914"
        opacity={0.3}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={springs.gentle}
      />
      {/* Seed */}
      <motion.ellipse
        cx={0}
        cy={6}
        rx={5}
        ry={7}
        fill="#8B6914"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 15, 0, -15, 0] }}
        transition={{
          scale: springs.bouncy,
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      {/* Glow */}
      <motion.circle
        cx={0}
        cy={0}
        r={15}
        fill="var(--color-accent-green)"
        opacity={0}
        animate={{ opacity: [0, 0.12, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.g>
  );
}

export function TreeSVG({
  stage = 0,
  size = 200,
  interactive = false,
  onWater,
}: TreeSVGProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const elements = mounted ? getTreeElements(stage) : [];
  const vbSize = 120;
  const half = vbSize / 2;

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      whileTap={
        interactive ? { scale: 0.95, transition: springs.micro } : undefined
      }
      onClick={interactive ? onWater : undefined}
    >
      <svg
        viewBox={`0 0 ${vbSize} ${vbSize}`}
        className="h-full w-full"
        style={{ overflow: "visible" }}
      >
        <g transform={`translate(${half}, ${half + 10})`}>
          {stage === 0 ? (
            <SeedSVG />
          ) : (
            <>
              {/* Glow for golden tree */}
              {stage >= 7 && (
                <motion.circle
                  cx={0}
                  cy={-20}
                  r={50}
                  fill="var(--color-tree-legend)"
                  opacity={0}
                  animate={{ opacity: [0, 0.1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Trunk */}
              <TreeTrunk stage={stage} />

              {/* Canopy */}
              <TreeCanopy stage={stage} />

              {/* Elements */}
              {elements.map((el, i) => {
                const key = `${el.type}-${i}`;
                switch (el.type) {
                  case "leaf":
                    return <LeafSVG key={key} {...el} />;
                  case "flower":
                    return <FlowerSVG key={key} {...el} />;
                  case "butterfly":
                    return <ButterflySVG key={key} {...el} />;
                  case "bird":
                    return <BirdSVG key={key} {...el} />;
                  case "water":
                    return <WaterDropSVG key={key} {...el} />;
                  default:
                    return null;
                }
              })}

              {/* Ground */}
              <motion.ellipse
                cx={0}
                cy={10}
                rx={16}
                ry={3}
                fill="var(--color-bg-tertiary)"
                opacity={0.4}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={springs.gentle}
              />
            </>
          )}
        </g>
      </svg>
    </motion.div>
  );
}
