import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/* ─────────────────────────────────────────────────────────────
   Hero backgrounds: twelve canvas scenes behind one render loop,
   plus the service that remembers the visitor's choice.
   ───────────────────────────────────────────────────────────── */

export type BgKind =
  | 'network'
  | 'starfield'
  | 'rain'
  | 'aurora'
  | 'bokeh'
  | 'flow'
  | 'synthwave'
  | 'fireflies'
  | 'streams'
  | 'sonar'
  | 'galaxy'
  | 'dots';

export const BACKGROUNDS: ReadonlyArray<{ id: BgKind; label: string; hint: string }> = [
  { id: 'network', label: 'Network', hint: 'Services linking up, events in flight' },
  { id: 'starfield', label: 'Warp', hint: 'Flying through a starfield' },
  { id: 'rain', label: 'Code rain', hint: 'Falling glyphs' },
  { id: 'aurora', label: 'Aurora', hint: 'Slow ribbons of light' },
  { id: 'bokeh', label: 'Bokeh', hint: 'Soft drifting lights' },
  { id: 'flow', label: 'Flow field', hint: 'Particles on invisible currents' },
  { id: 'synthwave', label: 'Synthwave', hint: 'A retro grid to the horizon' },
  { id: 'fireflies', label: 'Fireflies', hint: 'Warm sparks that follow the pointer' },
  { id: 'streams', label: 'Event streams', hint: 'Messages racing along their topics' },
  { id: 'sonar', label: 'Sonar', hint: 'Pings that light the grid as they pass' },
  { id: 'galaxy', label: 'Galaxy', hint: 'A slowly turning spiral' },
  { id: 'dots', label: 'Dot wave', hint: 'A ripple through a field of dots' },
];

const KINDS = BACKGROUNDS.map((b) => b.id);
const STORAGE_KEY = 'vk-bg';

/** Remembers the chosen hero background across visits. */
@Injectable({ providedIn: 'root' })
export class BackgroundService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _kind = signal<BgKind>(this.readInitial());
  readonly kind = this._kind.asReadonly();

  set(kind: BgKind): void {
    this._kind.set(kind);
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, kind);
    } catch {
      // Storage can be unavailable; the choice still applies for this view.
    }
  }

  /** Moves to the next (1) or previous (-1) background, wrapping round. */
  step(dir: 1 | -1): void {
    const i = KINDS.indexOf(this._kind());
    this.set(KINDS[(i + dir + KINDS.length) % KINDS.length]);
  }

  private readInitial(): BgKind {
    if (!this.isBrowser) return 'network';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as BgKind | null;
      if (stored && KINDS.includes(stored)) return stored;
    } catch {
      /* ignore */
    }
    return 'network';
  }
}

/* ───────────── Render loop ───────────── */

type Pointer = { x: number; y: number } | null;

interface Scene {
  /** Called when the scene starts and on every resize. */
  init(w: number, h: number): void;
  /**
   * Draws one frame. `t` is elapsed milliseconds; `k` is this frame's length
   * relative to a 60 fps frame, so motion keeps its speed at any frame rate.
   */
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, k: number, p: Pointer): void;
}

const SCENES: Record<BgKind, () => Scene> = {
  network,
  starfield,
  rain,
  aurora,
  bokeh,
  flow,
  synthwave,
  fireflies,
  streams,
  sonar,
  galaxy,
  dots,
};

/**
 * Runs the chosen scene on the hero canvas. Only animates while the hero is
 * on screen and the tab is visible. Under reduced motion each scene is
 * advanced off-screen for a moment and left as a still image.
 *
 * Returns `use(kind)`, which crossfades to another scene.
 */
export function startBackground(
  canvas: HTMLCanvasElement,
  destroyRef: DestroyRef,
  initial: BgKind,
): { use(kind: BgKind): void } {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { use: () => {} };

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let kind = initial;
  let scene = SCENES[kind]();
  let w = 0;
  let h = 0;
  let pointer: Pointer = null;
  let frame = 0;
  let last = 0;
  let onScreen = true;
  let swap: ReturnType<typeof setTimeout> | undefined;

  const prime = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    scene.init(w, h);
    if (still) for (let i = 0; i < 120; i++) scene.draw(ctx, w, h, i * 16.7, 1, null);
  };

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = box.width;
    h = box.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    prime();
  };

  const loop = (now: number) => {
    const k = last ? Math.min(3, (now - last) / 16.67) : 1;
    last = now;
    scene.draw(ctx, w, h, now, k, pointer);
    frame = requestAnimationFrame(loop);
  };
  const start = () => {
    if (!still && !frame && onScreen && !document.hidden) frame = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  };

  const host = canvas.parentElement ?? canvas;
  const onMove = (e: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - box.left, y: e.clientY - box.top };
  };
  const onLeave = () => (pointer = null);
  const onVisibility = () => (document.hidden ? stop() : start());

  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(canvas);
  const viewObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) start();
    else stop();
  });
  viewObserver.observe(canvas);
  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  start();

  destroyRef.onDestroy(() => {
    stop();
    clearTimeout(swap);
    sizeObserver.disconnect();
    viewObserver.disconnect();
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
  });

  return {
    use(next: BgKind) {
      if (next === kind) return;
      kind = next;
      clearTimeout(swap);
      // Fade the old scene out (the canvas has an opacity transition),
      // switch while it is invisible, then fade the new one in.
      canvas.style.opacity = '0';
      swap = setTimeout(
        () => {
          scene = SCENES[next]();
          prime();
          canvas.style.opacity = '1';
        },
        still ? 0 : 260,
      );
    },
  };
}

/* ───────────── Scene helpers ───────────── */

const TEAL = '94, 234, 212';
const VIOLET = '192, 132, 252';
const PINK = '244, 114, 182';
const BLUE = '96, 165, 250';
const AMBER = '251, 191, 36';
const INDIGO = '148, 163, 255';

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
/** Paints the hero ground colour over the frame, leaving fading trails. */
const fade = (ctx: CanvasRenderingContext2D, w: number, h: number, a: number) => {
  ctx.fillStyle = `rgba(6, 9, 18, ${Math.min(1, a)})`;
  ctx.fillRect(0, 0, w, h);
};
const dot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

/* ───────────── Scenes ───────────── */

/**
 * Service nodes drifting, linked when in range, with event packets
 * travelling the links; nodes near the pointer link to it.
 *
 * ponytail: O(n²) link search per frame; n stays under 50, so about a
 * thousand distance checks. A spatial grid only matters far beyond that.
 */
function network(): Scene {
  const LINK = 165;
  let nodes: { x: number; y: number; vx: number; vy: number; hub: boolean }[] = [];
  let packets: { a: number; b: number; t: number; speed: number }[] = [];
  return {
    init(w, h) {
      const count = Math.round(Math.min(48, Math.max(18, (w * h) / 24000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: rnd(0, w),
        y: rnd(0, h),
        vx: rnd(-0.11, 0.11),
        vy: rnd(-0.11, 0.11),
        hub: i % 6 === 0,
      }));
      packets = [];
    },
    draw(ctx, w, h, _t, k, p) {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx * k;
        n.y += n.vy * k;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      const links: [number, number][] = [];
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < LINK) {
            links.push([i, j]);
            ctx.strokeStyle = `rgba(${INDIGO}, ${(1 - d / LINK) * 0.28})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      if (p) {
        for (const n of nodes) {
          const d = Math.hypot(n.x - p.x, n.y - p.y);
          if (d < 190) {
            ctx.strokeStyle = `rgba(${TEAL}, ${(1 - d / 190) * 0.45})`;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }
      if (links.length && packets.length < 16 && Math.random() < 0.08 * k) {
        const [a, b] = pick(links);
        const speed = rnd(0.006, 0.016);
        packets.push(Math.random() < 0.5 ? { a, b, t: 0, speed } : { a: b, b: a, t: 0, speed });
      }
      packets = packets.filter((pk) => {
        const A = nodes[pk.a];
        const B = nodes[pk.b];
        pk.t += pk.speed * k;
        if (pk.t >= 1 || Math.hypot(A.x - B.x, A.y - B.y) > LINK) return false;
        const x = A.x + (B.x - A.x) * pk.t;
        const y = A.y + (B.y - A.y) * pk.t;
        ctx.fillStyle = `rgba(${TEAL}, 0.18)`;
        dot(ctx, x, y, 5);
        ctx.fillStyle = 'rgba(167, 243, 230, 0.95)';
        dot(ctx, x, y, 1.7);
        return true;
      });
      for (const n of nodes) {
        if (n.hub) {
          ctx.fillStyle = `rgba(${VIOLET}, 0.16)`;
          dot(ctx, n.x, n.y, 7);
        }
        ctx.fillStyle = n.hub ? 'rgba(216, 180, 254, 0.9)' : 'rgba(186, 198, 255, 0.55)';
        dot(ctx, n.x, n.y, n.hub ? 2.6 : 1.6);
      }
    },
  };
}

/** Stars streaking past from a vanishing point that leans toward the pointer. */
function starfield(): Scene {
  let stars: { x: number; y: number; z: number; pz: number }[] = [];
  let cx = 0;
  let cy = 0;
  const reset = (s: { x: number; y: number; z: number; pz: number }, far: boolean) => {
    s.x = rnd(-1, 1);
    s.y = rnd(-1, 1);
    s.z = far ? rnd(0.15, 1) : 1;
    s.pz = s.z;
  };
  return {
    init(w, h) {
      cx = w * 0.62;
      cy = h * 0.45;
      stars = Array.from({ length: 420 }, () => {
        const s = { x: 0, y: 0, z: 0, pz: 0 };
        reset(s, true);
        return s;
      });
    },
    draw(ctx, w, h, _t, k, p) {
      ctx.clearRect(0, 0, w, h);
      const tx = p ? p.x : w * 0.62;
      const ty = p ? p.y : h * 0.45;
      cx += (tx - cx) * 0.03 * k;
      cy += (ty - cy) * 0.03 * k;
      const f = Math.max(w, h) * 0.45;
      for (const s of stars) {
        s.pz = s.z;
        s.z -= 0.0042 * k;
        if (s.z <= 0.02) {
          reset(s, false);
          continue;
        }
        const x = cx + (s.x / s.z) * f;
        const y = cy + (s.y / s.z) * f;
        if (x < 0 || x > w || y < 0 || y > h) {
          reset(s, false);
          continue;
        }
        const px = cx + (s.x / s.pz) * f;
        const py = cy + (s.y / s.pz) * f;
        const near = 1 - s.z;
        ctx.strokeStyle = `rgba(226, 232, 255, ${Math.min(0.9, near * 1.1)})`;
        ctx.lineWidth = near * 2.2 + 0.3;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    },
  };
}

/** Columns of falling glyphs with bright heads and fading trails. */
function rain(): Scene {
  const SIZE = 16;
  const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01{}<>[]=+*#$λ';
  let drops: number[] = [];
  let speeds: number[] = [];
  return {
    init(w, h) {
      const cols = Math.ceil(w / SIZE);
      drops = Array.from({ length: cols }, () => rnd(-h / SIZE, 0));
      speeds = Array.from({ length: cols }, () => rnd(0.18, 0.55));
    },
    draw(ctx, w, h, _t, k) {
      fade(ctx, w, h, 0.08 * k);
      ctx.font = `${SIZE - 3}px "JetBrains Mono", ui-monospace, monospace`;
      for (let i = 0; i < drops.length; i++) {
        const prev = Math.floor(drops[i]);
        drops[i] += speeds[i] * k;
        const row = Math.floor(drops[i]);
        if (row !== prev && row >= 0) {
          ctx.fillStyle = Math.random() < 0.1 ? 'rgba(220, 255, 245, 0.95)' : `rgba(${TEAL}, 0.55)`;
          ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * SIZE, row * SIZE);
        }
        if (row * SIZE > h && Math.random() > 0.97) drops[i] = rnd(-24, 0);
      }
    },
  };
}

/**
 * Layered ribbons of light. Drawn at a quarter of the resolution and scaled
 * up, which softens the edges like a blur at a fraction of a blur's cost.
 */
function aurora(): Scene {
  const ribbons = [
    { a: TEAL, b: BLUE, y: 0.3, amp: 70, len: 0.0026, speed: 0.00022, thick: 120, ph: 0 },
    { a: VIOLET, b: PINK, y: 0.42, amp: 90, len: 0.0019, speed: -0.00017, thick: 150, ph: 2 },
    { a: BLUE, b: VIOLET, y: 0.56, amp: 60, len: 0.0031, speed: 0.00027, thick: 110, ph: 4 },
    { a: TEAL, b: VIOLET, y: 0.7, amp: 80, len: 0.0022, speed: -0.0002, thick: 140, ph: 1 },
  ];
  const off = document.createElement('canvas');
  const octx = off.getContext('2d')!;
  const S = 0.25;
  return {
    init(w, h) {
      off.width = Math.max(1, Math.round(w * S));
      off.height = Math.max(1, Math.round(h * S));
    },
    draw(ctx, w, h, t) {
      const ow = off.width;
      const oh = off.height;
      octx.clearRect(0, 0, ow, oh);
      octx.globalCompositeOperation = 'lighter';
      for (const r of ribbons) {
        const top = (x: number) =>
          (r.y * h +
            Math.sin((x / S) * r.len + t * r.speed + r.ph) * r.amp +
            Math.sin((x / S) * r.len * 2.3 - t * r.speed * 1.6) * r.amp * 0.35) *
          S;
        const g = octx.createLinearGradient(0, 0, ow, 0);
        g.addColorStop(0, `rgba(${r.a}, 0)`);
        g.addColorStop(0.35, `rgba(${r.a}, 0.22)`);
        g.addColorStop(0.7, `rgba(${r.b}, 0.22)`);
        g.addColorStop(1, `rgba(${r.b}, 0)`);
        octx.fillStyle = g;
        octx.beginPath();
        octx.moveTo(0, top(0));
        for (let x = 0; x <= ow; x += 4) octx.lineTo(x, top(x));
        for (let x = ow; x >= 0; x -= 4) {
          octx.lineTo(x, top(x) + r.thick * S * (0.6 + 0.4 * Math.sin((x / S) * 0.004 + t * 0.0004 + r.ph)));
        }
        octx.closePath();
        octx.fill();
      }
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(off, 0, 0, w, h);
    },
  };
}

/** Soft out-of-focus lights drifting upward. */
function bokeh(): Scene {
  let orbs: { x: number; y: number; r: number; vx: number; vy: number; c: string; a: number; ph: number }[] = [];
  return {
    init(w, h) {
      orbs = Array.from({ length: 26 }, () => ({
        x: rnd(0, w),
        y: rnd(0, h),
        r: rnd(18, 90),
        vx: rnd(-0.12, 0.12),
        vy: rnd(-0.3, -0.06),
        c: pick([TEAL, VIOLET, PINK, BLUE, AMBER]),
        a: rnd(0.08, 0.22),
        ph: rnd(0, Math.PI * 2),
      }));
    },
    draw(ctx, w, h, t, k) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const o of orbs) {
        o.x += (o.vx + Math.sin(t * 0.0005 + o.ph) * 0.1) * k;
        o.y += o.vy * k;
        if (o.y < -o.r) {
          o.y = h + o.r;
          o.x = rnd(0, w);
        }
        if (o.x < -o.r) o.x = w + o.r;
        if (o.x > w + o.r) o.x = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${o.c}, ${o.a})`);
        g.addColorStop(0.6, `rgba(${o.c}, ${o.a * 0.45})`);
        g.addColorStop(1, `rgba(${o.c}, 0)`);
        ctx.fillStyle = g;
        dot(ctx, o.x, o.y, o.r);
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}

/** Particles following a slowly shifting flow field, leaving trails. */
function flow(): Scene {
  let ps: { x: number; y: number; life: number }[] = [];
  const angle = (x: number, y: number, t: number) =>
    (Math.sin(x * 0.0035 + t * 0.00012) + Math.cos(y * 0.004 - t * 0.0001) + Math.sin((x + y) * 0.0015)) *
    Math.PI;
  return {
    init(w, h) {
      ps = Array.from({ length: Math.round(Math.min(1000, (w * h) / 1300)) }, () => ({
        x: rnd(0, w),
        y: rnd(0, h),
        life: rnd(60, 300),
      }));
    },
    draw(ctx, w, h, t, k) {
      fade(ctx, w, h, 0.05 * k);
      ctx.lineWidth = 1;
      // Two batched paths, one per colour, instead of a stroke per particle.
      const left = new Path2D();
      const right = new Path2D();
      for (const p of ps) {
        const a = angle(p.x, p.y, t);
        const nx = p.x + Math.cos(a) * 1.3 * k;
        const ny = p.y + Math.sin(a) * 1.3 * k;
        const path = p.x < w / 2 ? left : right;
        path.moveTo(p.x, p.y);
        path.lineTo(nx, ny);
        p.x = nx;
        p.y = ny;
        p.life -= k;
        if (p.life <= 0 || nx < 0 || nx > w || ny < 0 || ny > h) {
          p.x = rnd(0, w);
          p.y = rnd(0, h);
          p.life = rnd(80, 300);
        }
      }
      ctx.strokeStyle = `rgba(${TEAL}, 0.38)`;
      ctx.stroke(left);
      ctx.strokeStyle = `rgba(${VIOLET}, 0.38)`;
      ctx.stroke(right);
    },
  };
}

/** A striped sun setting behind a perspective grid rolling toward the viewer. */
function synthwave(): Scene {
  let stars: { x: number; y: number; a: number }[] = [];
  return {
    init(w, h) {
      stars = Array.from({ length: 90 }, () => ({ x: rnd(0, w), y: rnd(0, h * 0.55), a: rnd(0.2, 0.8) }));
    },
    draw(ctx, w, h, t) {
      ctx.clearRect(0, 0, w, h);
      const hy = h * 0.6;
      const cx = w * 0.66;
      for (const s of stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.a * (0.6 + 0.4 * Math.sin(t * 0.002 + s.x))})`;
        ctx.fillRect(s.x, s.y, 1.3, 1.3);
      }

      // Sun, with stripes cut out of its lower half.
      const R = Math.min(w, h) * 0.2;
      const sy = hy - R * 0.35;
      const glow = ctx.createRadialGradient(cx, sy, R * 0.6, cx, sy, R * 2.4);
      glow.addColorStop(0, `rgba(${PINK}, 0.2)`);
      glow.addColorStop(1, `rgba(${PINK}, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, hy);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, sy, R, 0, Math.PI * 2);
      ctx.clip();
      const g = ctx.createLinearGradient(0, sy - R, 0, sy + R);
      g.addColorStop(0, `rgba(${AMBER}, 0.85)`);
      g.addColorStop(0.55, `rgba(${PINK}, 0.75)`);
      g.addColorStop(1, `rgba(${VIOLET}, 0.55)`);
      ctx.fillStyle = g;
      ctx.fillRect(cx - R, sy - R, R * 2, R * 2);
      ctx.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 7; i++) ctx.fillRect(cx - R, sy + R * 0.08 + i * R * 0.13, R * 2, 2 + i * 1.6);
      ctx.restore();

      // Floor and grid.
      ctx.fillStyle = 'rgba(6, 9, 18, 0.92)';
      ctx.fillRect(0, hy, w, h - hy);
      ctx.strokeStyle = `rgba(${VIOLET}, 0.42)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -30; i <= 30; i++) {
        ctx.moveTo(cx + i * 6, hy);
        ctx.lineTo(cx + i * 150, h);
      }
      const phase = (t * 0.00035) % 1;
      for (let n = 0; n < 14; n++) {
        const q = (n + phase) / 14;
        const y = hy + (h - hy) * q * q;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
      ctx.strokeStyle = `rgba(${PINK}, 0.6)`;
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.lineTo(w, hy);
      ctx.stroke();
    },
  };
}

/** Glowing sparks wandering on their own, drawn toward the pointer when near. */
function fireflies(): Scene {
  let fs: { x: number; y: number; a: number; ph: number; sp: number }[] = [];
  return {
    init(w, h) {
      fs = Array.from({ length: 70 }, () => ({
        x: rnd(0, w),
        y: rnd(0, h),
        a: rnd(0, Math.PI * 2),
        ph: rnd(0, Math.PI * 2),
        sp: rnd(0.2, 0.55),
      }));
    },
    draw(ctx, w, h, t, k, p) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const f of fs) {
        f.a += (Math.random() - 0.5) * 0.25 * k;
        if (p && Math.hypot(p.x - f.x, p.y - f.y) < 220) {
          const want = Math.atan2(p.y - f.y, p.x - f.x);
          f.a += Math.sin(want - f.a) * 0.06 * k;
        }
        f.x += Math.cos(f.a) * f.sp * k;
        f.y += Math.sin(f.a) * f.sp * k;
        if (f.x < 0) f.x = w;
        if (f.x > w) f.x = 0;
        if (f.y < 0) f.y = h;
        if (f.y > h) f.y = 0;
        const glow = 0.3 + 0.7 * Math.max(0, Math.sin(t * 0.0021 + f.ph));
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 11);
        g.addColorStop(0, `rgba(253, 230, 138, ${0.9 * glow})`);
        g.addColorStop(0.3, `rgba(190, 242, 100, ${0.35 * glow})`);
        g.addColorStop(1, 'rgba(190, 242, 100, 0)');
        ctx.fillStyle = g;
        dot(ctx, f.x, f.y, 11);
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}

/** Lanes of messages racing along like records on Kafka topics. */
function streams(): Scene {
  type Lane = { y: number; dir: 1 | -1; speed: number; c: string; msgs: { x: number; len: number }[] };
  let lanes: Lane[] = [];
  return {
    init(w, h) {
      const n = Math.max(8, Math.round(h / 54));
      lanes = Array.from({ length: n }, (_, i) => ({
        y: ((i + 0.5) * h) / n,
        dir: i % 3 === 1 ? -1 : 1,
        speed: rnd(1.1, 3.2),
        c: [TEAL, VIOLET, BLUE, PINK][i % 4],
        msgs: Array.from({ length: Math.round(rnd(2, 5)) }, () => ({ x: rnd(0, w), len: rnd(30, 110) })),
      }));
    },
    draw(ctx, w, h, _t, k) {
      ctx.clearRect(0, 0, w, h);
      for (const l of lanes) {
        ctx.strokeStyle = `rgba(${l.c}, 0.07)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, l.y);
        ctx.lineTo(w, l.y);
        ctx.stroke();
        for (const m of l.msgs) {
          m.x += l.dir * l.speed * k;
          if (l.dir > 0 && m.x - m.len > w) {
            m.x = -rnd(0, 220);
            m.len = rnd(30, 110);
          } else if (l.dir < 0 && m.x + m.len < 0) {
            m.x = w + rnd(0, 220);
            m.len = rnd(30, 110);
          }
          const tail = m.x - l.dir * m.len;
          const g = ctx.createLinearGradient(tail, 0, m.x, 0);
          g.addColorStop(0, `rgba(${l.c}, 0)`);
          g.addColorStop(1, `rgba(${l.c}, 0.75)`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tail, l.y);
          ctx.lineTo(m.x, l.y);
          ctx.stroke();
          ctx.fillStyle = `rgba(${l.c}, 0.95)`;
          dot(ctx, m.x, l.y, 2.2);
        }
      }
    },
  };
}

/** Rings expanding from random points (and the pointer), lighting the dot grid as they pass. */
function sonar(): Scene {
  const GAP = 30;
  let grid: { x: number; y: number }[] = [];
  let rings: { x: number; y: number; r: number; max: number; c: string }[] = [];
  let next = 0;
  return {
    init(w, h) {
      grid = [];
      for (let y = GAP / 2; y < h; y += GAP) for (let x = GAP / 2; x < w; x += GAP) grid.push({ x, y });
      rings = [];
      next = 0;
    },
    draw(ctx, w, h, t, k, p) {
      ctx.clearRect(0, 0, w, h);
      if (t > next) {
        next = t + rnd(380, 950);
        const src = p && Math.random() < 0.5 ? p : { x: rnd(0, w), y: rnd(0, h) };
        rings.push({ x: src.x, y: src.y, r: 0, max: rnd(170, 330), c: pick([TEAL, VIOLET, BLUE]) });
      }
      rings = rings.filter((r) => (r.r += 1.6 * k) < r.max);

      for (const d of grid) {
        let lit = 0;
        for (const r of rings) {
          const off = Math.abs(Math.hypot(d.x - r.x, d.y - r.y) - r.r);
          if (off < 10) lit = Math.max(lit, (1 - off / 10) * (1 - r.r / r.max));
        }
        ctx.fillStyle = lit ? `rgba(${TEAL}, ${0.15 + lit * 0.85})` : 'rgba(148, 163, 255, 0.12)';
        const s = 1.4 + lit * 2;
        ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s);
      }
      for (const r of rings) {
        ctx.strokeStyle = `rgba(${r.c}, ${(1 - r.r / r.max) * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  };
}

/** A three-armed spiral turning slowly, inner stars faster than outer. */
function galaxy(): Scene {
  type Star = { r: number; a: number; s: number; c: string };
  let stars: Star[] = [];
  let cx = 0;
  let cy = 0;
  let R = 0;
  return {
    init(w, h) {
      cx = w * 0.64;
      cy = h * 0.47;
      R = Math.min(w, h) * 0.78;
      stars = Array.from({ length: 1900 }, () => {
        const arm = Math.floor(rnd(0, 3));
        const r = Math.pow(Math.random(), 0.7) * R;
        return {
          r,
          a: arm * ((Math.PI * 2) / 3) + r * 0.012 + rnd(-0.35, 0.35) * (1 - (r / R) * 0.5),
          s: rnd(0.8, 2.1),
          c: r < R * 0.16 ? '255, 228, 240' : pick([VIOLET, BLUE, PINK, INDIGO]),
        };
      });
      // Grouped by colour so a frame changes fillStyle five times, not 1900.
      stars.sort((x, y) => x.c.localeCompare(y.c));
    },
    draw(ctx, w, h, _t, k) {
      ctx.clearRect(0, 0, w, h);
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.3);
      core.addColorStop(0, 'rgba(255, 228, 240, 0.4)');
      core.addColorStop(1, `rgba(${VIOLET}, 0)`);
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);
      let colour = '';
      for (const s of stars) {
        s.a += 0.0016 * (120 / (s.r + 120)) * k;
        if (s.c !== colour) {
          colour = s.c;
          ctx.fillStyle = `rgba(${colour}, 0.9)`;
        }
        ctx.fillRect(cx + Math.cos(s.a) * s.r, cy + Math.sin(s.a) * s.r * 0.42, s.s, s.s);
      }
    },
  };
}

/** A grid of dots with a wave rippling out from a point that eases toward the pointer. */
function dots(): Scene {
  const GAP = 28;
  let pts: { x: number; y: number }[] = [];
  let ox = 0;
  let oy = 0;
  return {
    init(w, h) {
      pts = [];
      for (let y = GAP / 2; y < h; y += GAP) for (let x = GAP / 2; x < w; x += GAP) pts.push({ x, y });
      ox = w * 0.62;
      oy = h * 0.45;
    },
    draw(ctx, w, h, t, k, p) {
      ctx.clearRect(0, 0, w, h);
      ox += ((p ? p.x : w * 0.62) - ox) * 0.05 * k;
      oy += ((p ? p.y : h * 0.45) - oy) * 0.05 * k;
      const reach = Math.max(w, h) * 0.9;
      // Bucket dots by colour and brightness, then draw each bucket with
      // one fillStyle: twelve style changes a frame instead of one per dot.
      // Squares, not arcs: at a few pixels they read as dots and rasterise
      // several times faster.
      const LEVELS = 6;
      const buckets: number[][] = Array.from({ length: LEVELS * 2 }, () => []);
      for (const d of pts) {
        const dist = Math.hypot(d.x - ox, d.y - oy);
        const wave = (Math.sin(dist * 0.035 - t * 0.003) + 1) / 2;
        const fall = Math.max(0, 1 - dist / reach);
        const r = 0.7 + wave * 2.3 * fall;
        const level = Math.min(LEVELS - 1, Math.floor(wave * fall * LEVELS));
        buckets[(wave > 0.5 ? 0 : LEVELS) + level].push(d.x - r, d.y - r, r * 2);
      }
      buckets.forEach((b, i) => {
        if (!b.length) return;
        const level = (i % LEVELS) / (LEVELS - 1);
        ctx.fillStyle =
          i < LEVELS ? `rgba(${TEAL}, ${0.14 + level * 0.5})` : `rgba(${VIOLET}, ${0.12 + level * 0.4})`;
        for (let j = 0; j < b.length; j += 3) ctx.fillRect(b[j], b[j + 1], b[j + 2], b[j + 2]);
      });
    },
  };
}
