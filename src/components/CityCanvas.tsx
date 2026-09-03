"use client";

import { useEffect, useRef } from "react";

/*
 * A street on Robinhood Chain, drawn as painter's-algorithm 2D canvas:
 * every quad is projected by hand, sorted far to near, and faded into the
 * horizon. No WebGL, no assets — the whole city is arithmetic.
 */

type RGB = [number, number, number];
type Camera = { x: number; y: number; z: number; f: number; cx: number; cy: number };
type Point = [number, number, number];

const FOG: RGB = [191, 229, 250];
const ROAD: RGB = [30, 46, 66];
const GROUND: RGB = [214, 236, 250];
const INK: RGB = [7, 26, 43];

const BUILDINGS: { wall: RGB; win: RGB; lit: RGB }[] = [
  { wall: [255, 255, 255], win: [15, 42, 66], lit: [121, 200, 245] },
  { wall: [234, 247, 255], win: [11, 40, 66], lit: [121, 200, 245] },
  { wall: [11, 40, 66], win: [7, 26, 43], lit: [255, 255, 255] },
  { wall: [7, 26, 43], win: [11, 40, 66], lit: [234, 247, 255] },
  { wall: [169, 221, 247], win: [11, 40, 66], lit: [255, 255, 255] },
  { wall: [223, 239, 250], win: [15, 42, 66], lit: [121, 200, 245] },
];

const CARS: RGB[] = [
  [255, 255, 255],
  [11, 40, 66],
  [7, 26, 43],
  [169, 221, 247],
  [121, 200, 245],
  [234, 247, 255],
];

const SHIRTS: RGB[] = [
  [7, 26, 43],
  [11, 40, 66],
  [255, 255, 255],
  [85, 112, 131],
];

/** The mark, as flat polygon outlines, painted onto building faces. */
const SIGN_POLYS = [
  [473, 270, 608, 270, 684, 347, 502, 347, 306, 540, 256, 490],
  [541, 432, 773, 432, 826, 489, 541, 768, 372, 603, 423, 551, 539, 667, 703, 503, 577, 503, 534, 548, 479, 494],
];

const BLOCK = 14; // metres between cross streets
const DEPTH = 12.8; // how far a building runs back from the street
const DRAW_DISTANCE = 150;

/** Deterministic hash so the same block looks the same on every frame. */
function hash(a: number, b = 0) {
  let n = (Math.imul(0x165667b1, a) + Math.imul(0x27d4eb2f, b)) | 0;
  n = Math.imul(n ^ (n >>> 13), 0x4bf19f61);
  return ((n ^= n >>> 16) >>> 0) % 1e5 / 1e5;
}

const rgba = (c: RGB | number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const shade = (c: RGB, f: number): RGB =>
  c.map((v) => Math.max(0, Math.min(255, v * f))) as RGB;

export function CityCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = ctx;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = true;
    let width = 0;
    let height = 0;
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    let start = performance.now();

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (still) frame(4000);
    };

    /** Project a quad and fill it, fading toward the horizon. */
    const quad = (
      cam: Camera,
      points: Point[],
      color: RGB | number[],
      dist: number,
      alpha = 1,
    ) => {
      const screen = points.map(([px, py, pz]) => {
        const depth = pz - cam.z;
        if (depth < 0.6) return null;
        const s = cam.f / depth;
        return [cam.cx + (px - cam.x) * s, cam.cy - (py - cam.y) * s] as const;
      });
      if (screen.some((p) => p === null)) return;

      const fog = Math.max(0, Math.min(1, (dist - 18) / 132)) ** 0.9;
      ctx.fillStyle = rgba(
        [
          color[0] + (FOG[0] - color[0]) * fog,
          color[1] + (FOG[1] - color[1]) * fog,
          color[2] + (FOG[2] - color[2]) * fog,
        ],
        alpha,
      );
      ctx.beginPath();
      ctx.moveTo(screen[0]![0], screen[0]![1]);
      for (let i = 1; i < screen.length; i++) ctx.lineTo(screen[i]![0], screen[i]![1]);
      ctx.closePath();
      ctx.fill();
    };

    /** A rooftop sign: the mark, extruded onto the street-facing wall. */
    const sign = (cam: Camera, side: number, x: number, z: number, y: number) => {
      const dist = z - cam.z;
      quad(
        cam,
        [
          [x, y - 1.1, z - 1.1],
          [x, y - 1.1, z + 1.1],
          [x, y + 1.1, z + 1.1],
          [x, y + 1.1, z - 1.1],
        ],
        [121, 200, 245],
        dist,
      );
      for (const poly of SIGN_POLYS) {
        const pts: Point[] = [];
        for (let i = 0; i < poly.length; i += 2) {
          const u = (poly[i] - 536) / 1073;
          const v = (poly[i + 1] - 519) / 1073;
          pts.push([x, y - 2.2 * v * 0.8, z + side * u * 2.2 * 0.8]);
        }
        quad(cam, pts, [255, 255, 255], dist);
      }
    };

    const building = (cam: Camera, side: number, index: number) => {
      const seed = 2 * index + (side > 0 ? 1 : 0);
      const z = BLOCK * index + 0.6;
      const tall = 10 + 30 * hash(seed, 1);
      const wide = 8 + 6 * hash(seed, 2);
      const skin = BUILDINGS[Math.floor(hash(seed, 3) * BUILDINGS.length)];
      const near = 9.5 * side;
      const far = side * (9.5 + wide);
      const dist = z - cam.z;
      if (dist + DEPTH < 1.2 || dist > DRAW_DISTANCE) return;

      // Face turned toward the camera, only once we are past it.
      if (dist > 1.2) {
        quad(
          cam,
          [
            [near, 0, z],
            [far, 0, z],
            [far, tall, z],
            [near, tall, z],
          ],
          shade(skin.wall, 0.86),
          dist,
        );
        const cols = Math.max(1, Math.floor(wide / 2.4));
        const rows = Math.floor(tall / 3.1);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const wx = near + side * (0.7 + 2.4 * c);
            const wx2 = wx + 1.3 * side;
            const wy = 1 + 3.1 * r;
            quad(
              cam,
              [
                [wx, wy, z - 0.02],
                [wx2, wy, z - 0.02],
                [wx2, wy + 1.9, z - 0.02],
                [wx, wy + 1.9, z - 0.02],
              ],
              hash(31 * seed + 7 * r + c, 9) > 0.62 ? skin.lit : skin.win,
              dist,
            );
          }
        }
      }

      // Wall along the street.
      quad(
        cam,
        [
          [near, 0, z],
          [near, 0, z + DEPTH],
          [near, tall, z + DEPTH],
          [near, tall, z],
        ],
        skin.wall,
        dist,
      );
      const sideCols = Math.floor(DEPTH / 2.4);
      const sideRows = Math.floor(tall / 3.1);
      for (let r = 0; r < sideRows; r++) {
        for (let c = 0; c < sideCols; c++) {
          const wz = z + 0.7 + 2.4 * c;
          if (wz - cam.z < 1.2) continue;
          const wz2 = wz + 1.3;
          const wy = 1 + 3.1 * r;
          quad(
            cam,
            [
              [near - 0.02 * side, wy, wz],
              [near - 0.02 * side, wy, wz2],
              [near - 0.02 * side, wy + 1.9, wz2],
              [near - 0.02 * side, wy + 1.9, wz],
            ],
            hash(17 * seed + 13 * r + c, 5) > 0.6 ? skin.lit : skin.win,
            wz - cam.z,
          );
        }
      }

      // Dark plinth where the wall meets the pavement.
      quad(
        cam,
        [
          [near - 0.03 * side, 0, z],
          [near - 0.03 * side, 0, z + DEPTH],
          [near - 0.03 * side, 0.5, z + DEPTH],
          [near - 0.03 * side, 0.5, z],
        ],
        INK,
        dist,
      );

      if (hash(seed, 11) > 0.7 && dist > 1.2) {
        sign(cam, side, near - 0.08 * side, z + DEPTH / 2, 4 + hash(seed, 12) * (tall - 8));
      }
    };

    const tree = (cam: Camera, x: number, z: number, seed: number) => {
      const dist = z - cam.z;
      if (dist < 1.2 || dist > 90) return;
      const scale = 1.2 + 0.8 * hash(seed, 21);
      quad(
        cam,
        [
          [x - 0.15, 0, z],
          [x + 0.15, 0, z],
          [x + 0.15, 1.4 * scale, z],
          [x - 0.15, 1.4 * scale, z],
        ],
        [64, 46, 32],
        dist,
      );
      const leaves: RGB[] = [
        [52, 120, 92],
        [70, 148, 110],
        [88, 168, 124],
      ];
      for (let i = 0; i < 3; i++) {
        const w = (1.6 - 0.35 * i) * scale;
        const y = (1.1 + 0.8 * i) * scale;
        quad(
          cam,
          [
            [x - w / 2, y, z - w / 2],
            [x + w / 2, y, z - w / 2],
            [x + w / 2, y + 0.9 * scale, z - w / 2],
            [x - w / 2, y + 0.9 * scale, z - w / 2],
          ],
          leaves[i],
          dist,
        );
      }
    };

    const lamp = (cam: Camera, x: number, z: number) => {
      const dist = z - cam.z;
      if (dist < 1.2 || dist > 70) return;
      quad(
        cam,
        [
          [x - 0.06, 0, z],
          [x + 0.06, 0, z],
          [x + 0.06, 4.2, z],
          [x - 0.06, 4.2, z],
        ],
        INK,
        dist,
      );
      quad(
        cam,
        [
          [x - 0.35, 4.1, z],
          [x + 0.35, 4.1, z],
          [x + 0.35, 4.4, z],
          [x - 0.35, 4.4, z],
        ],
        [255, 255, 255],
        dist,
      );
    };

    const car = (cam: Camera, x: number, z: number, color: RGB, towards: boolean) => {
      const dist = z - cam.z;
      if (dist + 4 < 1.2 || dist > 80) return;
      const back = z + 4.2;
      const cabinFront = z + (towards ? 0.9 : 1.6);
      const cabinBack = back - (towards ? 1.6 : 0.9);

      quad(cam, [[x - 0.95, 1.25, z], [x + 0.95, 1.25, z], [x + 0.95, 1.25, back], [x - 0.95, 1.25, back]], shade(color, 1), dist);
      quad(cam, [[x - 0.8, 2.1, cabinFront], [x + 0.8, 2.1, cabinFront], [x + 0.8, 2.1, cabinBack], [x - 0.8, 2.1, cabinBack]], shade(color, 0.95), dist);

      const flank = x > 0 ? x - 0.95 : x + 0.95;
      quad(cam, [[flank, 0.35, z], [flank, 0.35, back], [flank, 1.25, back], [flank, 1.25, z]], shade(color, 0.78), dist);
      quad(cam, [[flank, 1.25, cabinFront], [flank, 1.25, cabinBack], [flank, 2.1, cabinBack], [flank, 2.1, cabinFront]], [40, 70, 100], dist);
      quad(cam, [[x - 0.95, 0.35, z], [x + 0.95, 0.35, z], [x + 0.95, 1.25, z], [x - 0.95, 1.25, z]], shade(color, 0.7), dist);
      quad(cam, [[x - 0.8, 1.25, cabinFront], [x + 0.8, 1.25, cabinFront], [x + 0.8, 2.1, cabinFront], [x - 0.8, 2.1, cabinFront]], [40, 70, 100], dist);

      // Headlights coming at you, tail lights heading away.
      const lights: RGB = towards ? [255, 255, 255] : [255, 96, 64];
      quad(cam, [[x - 0.85, 0.65, z - 0.01], [x - 0.5, 0.65, z - 0.01], [x - 0.5, 0.95, z - 0.01], [x - 0.85, 0.95, z - 0.01]], lights, dist);
      quad(cam, [[x + 0.5, 0.65, z - 0.01], [x + 0.85, 0.65, z - 0.01], [x + 0.85, 0.95, z - 0.01], [x + 0.5, 0.95, z - 0.01]], lights, dist);

      for (const wz of [z + 0.7, back - 0.7]) {
        const wx = flank - (x > 0 ? 0.05 : -0.05);
        quad(cam, [[wx, 0, wz - 0.4], [wx, 0, wz + 0.4], [wx, 0.7, wz + 0.4], [wx, 0.7, wz - 0.4]], [20, 24, 30], dist);
      }
    };

    const walker = (
      cam: Camera,
      x: number,
      z: number,
      phase: number,
      shirt: RGB,
      facing: number,
    ) => {
      const dist = z - cam.z;
      if (dist < 1.2 || dist > 60) return;
      const bob = 0.05 * Math.sin(9 * phase);
      const stride = 0.22 * Math.sin(9 * phase);

      quad(cam, [[x - 0.16 + stride, 0, z], [x - 0.02 + stride, 0, z], [x - 0.02, 0.75, z], [x - 0.16, 0.75, z]], INK, dist);
      quad(cam, [[x + 0.02 - stride, 0, z], [x + 0.16 - stride, 0, z], [x + 0.16, 0.75, z], [x + 0.02, 0.75, z]], INK, dist);
      quad(cam, [[x - 0.21, 0.75 + bob, z], [x + 0.21, 0.75 + bob, z], [x + 0.21, 1.45 + bob, z], [x - 0.21, 1.45 + bob, z]], shirt, dist);
      quad(cam, [[x - 0.17, 1.5 + bob, z], [x + 0.17, 1.5 + bob, z], [x + 0.17, 1.85 + bob, z], [x - 0.17, 1.85 + bob, z]], [232, 196, 170], dist);
      quad(cam, [[x + 0.32 * facing, 0.55 + bob, z], [x + 0.55 * facing, 0.55 + bob, z], [x + 0.55 * facing, 0.85 + bob, z], [x + 0.32 * facing, 0.85 + bob, z]], [11, 40, 66], dist);
    };

    function frame(now: number) {
      const t = (now - start) / 1000;
      eased.x += (pointer.x - eased.x) * 0.04;
      eased.y += (pointer.y - eased.y) * 0.04;

      const z = still ? 20 : 2.6 * t;
      const cam: Camera = {
        x: 1.6 * eased.x,
        y: 5.2 + (still ? 0 : 0.05 * Math.sin(1.3 * t)) - 0.6 * eased.y,
        z,
        f: 0.62 * Math.max(width, 1.35 * height),
        cx: width / 2,
        cy: 0.46 * height,
      };

      const sky = g.createLinearGradient(0, 0, 0, cam.cy + 40);
      sky.addColorStop(0, "#79C8F5");
      sky.addColorStop(1, "#BFE5FA");
      g.fillStyle = sky;
      g.fillRect(0, 0, width, height);

      const far = z + DRAW_DISTANCE;
      const near = z + 1.2;

      quad(cam, [[-23.5, 0, near], [23.5, 0, near], [23.5, 0, far], [-23.5, 0, far]], GROUND, 60);
      quad(cam, [[-6.3, 0.12, near], [6.3, 0.12, near], [6.3, 0.12, far], [-6.3, 0.12, far]], INK, 40);
      quad(cam, [[-6, 0.1, near], [6, 0.1, near], [6, 0.1, far], [-6, 0.1, far]], ROAD, 30);

      // Lane markings.
      const firstDash = 6 * Math.floor(z / 6);
      for (let dz = firstDash; dz < z + 120; dz += 6) {
        quad(cam, [[-0.12, 0.11, dz], [0.12, 0.11, dz], [0.12, 0.11, dz + 3], [-0.12, 0.11, dz + 3]], [255, 255, 255], dz - z, 0.85);
        for (const lx of [-3, 3]) {
          quad(cam, [[lx - 0.08, 0.11, dz], [lx + 0.08, 0.11, dz], [lx + 0.08, 0.11, dz + 3], [lx - 0.08, 0.11, dz + 3]], [255, 255, 255], dz - z, 0.35);
        }
      }

      const firstBlock = Math.floor(z / BLOCK) - 1;
      const blocks = Math.ceil(DRAW_DISTANCE / BLOCK);
      const lastBlock = firstBlock + blocks;

      // Zebra crossings, every fourth block.
      for (let i = firstBlock; i < lastBlock + 1; i++) {
        if (((i % 4) + 4) % 4 !== 0) continue;
        const cz = BLOCK * i;
        if (cz - z < -2.8) continue;
        for (let sx = -5.5; sx < 5.6; sx += 1.2) {
          quad(cam, [[sx, 0.115, cz - 1.8], [sx + 0.7, 0.115, cz - 1.8], [sx + 0.7, 0.115, cz + 1.8], [sx, 0.115, cz + 1.8]], [255, 255, 255], cz - z, 0.9);
        }
      }

      // Street furniture, back to front.
      for (let i = lastBlock; i >= firstBlock; i--) {
        building(cam, -1, i);
        building(cam, 1, i);
        const bz = BLOCK * i + 4;
        tree(cam, -7.6, bz, 3 * i + 1);
        tree(cam, 7.6, bz + 5, 3 * i + 2);
        lamp(cam, -6.8, bz + 8);
        lamp(cam, 6.8, bz + 1);
      }

      for (let i = lastBlock; i >= firstBlock; i--) {
        const bz = BLOCK * i;

        // Four people crossing at the lights.
        if (((i % 4) + 4) % 4 === 0) {
          for (let a = 0; a < 4; a++) {
            const seed = 7 * i + a;
            const dir = hash(seed, 41) > 0.5 ? 1 : -1;
            const speed = 1.1 + 0.6 * hash(seed, 42);
            const span = 18;
            const offset = hash(seed, 43) * span;
            const x = dir * ((still ? offset : (t * speed + offset) % (span + 6)) - span / 2 - 3);
            if (Math.abs(x) > 9) continue;
            walker(cam, x, bz + (a - 1.5) * 0.7, t + a, SHIRTS[a % SHIRTS.length], dir);
          }
        }

        // Two more on the pavements.
        for (let a = 0; a < 2; a++) {
          const seed = 11 * i + a;
          const dir = a === 0 ? -1 : 1;
          const speed = 0.9 + 0.5 * hash(seed, 51);
          const wz = bz + (((still ? 5 : t * speed * dir) + BLOCK * hash(seed, 52) + 1400) % BLOCK);
          walker(cam, 8.6 * dir, wz, t + 2 * a, SHIRTS[(a + i) % SHIRTS.length], -dir);
        }
      }

      // Traffic: two lanes each way, painted far to near so it overlaps right.
      const traffic: { x: number; z: number; c: RGB; towards: boolean }[] = [];
      [
        { x: -4.4, v: -9, towards: true },
        { x: -1.5, v: -7.5, towards: true },
        { x: 1.5, v: 7.5, towards: false },
        { x: 4.4, v: 9.5, towards: false },
      ].forEach((lane, li) => {
        for (let n = 0; n < 6; n++) {
          const spacing = 160 / 6;
          const cz =
            z + 1.2 +
            (((spacing * n + 12 * hash(10 * li + n, 61) + (still ? 0 : (lane.v - 2.6) * t)) % 160) + 160) % 160;
          traffic.push({ x: lane.x, z: cz, c: CARS[(li + n) % CARS.length], towards: lane.towards });
        }
      });
      traffic.sort((a, b) => b.z - a.z);
      for (const c of traffic) car(cam, c.x, c.z, c.c, c.towards);

      if (running && !still) raf = requestAnimationFrame(frame);
    }

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    // Stop the drive when the hero scrolls out of view.
    const observer = new IntersectionObserver(([entry]) => {
      const visible = !!entry?.isIntersecting;
      if (visible && !running) {
        running = true;
        start = performance.now() - 1;
        raf = requestAnimationFrame(frame);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });

    resize();
    window.addEventListener("resize", resize);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    observer.observe(wrap);
    if (!still) raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
    </div>
  );
}
