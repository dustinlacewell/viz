import { createTexture2D } from '@ldlework/gl';
import type { FxDef, FxPreset } from './def';
import { f2, f3, f4, fint, fmul, sel } from '../patch/fmt';
import { COMMON } from './glsl';
import { SPECIES, decodeCells, type Species } from './species';

const CELL_NAMES = ['Noise', ...SPECIES.map(s => s.name)];

/* A catalogued creature, as a set of knob positions. The seed pattern
   rides along on `species`, which the dropdown drives and the drawer
   never shows — the knobs below it stay the honest state.

   Time and Cell are deliberately NOT recalled. They are how fast you
   want to watch and how big you want to look, not facts about the
   animal, and a preset has no business overruling either. The species'
   own T rides in the tooltip instead — it only matters for the two
   discrete entries (SmoothLife, Conway), which want T=1 by hand. */
const recall = (s: Species, i: number): FxPreset => ({
  label: s.name,
  desc: `${s.code} — R ${s.R}, T ${s.T}, m ${s.m}, s ${s.s}, b ${s.b.join(' ')}`,
  values: {
    species: i + 1,
    radius: s.R, mu: s.m, sigma: s.s,
    shells: s.b.length,
    b1: s.b[0] ?? 0, b2: s.b[1] ?? 0, b3: s.b[2] ?? 0, b4: s.b[3] ?? 0,
    kern: s.kn, growth: s.gn, fill: 0.25, sow: 0,
  },
});

const PRESETS: FxPreset[] = [
  {
    label: 'Random soup',
    desc: 'Orbium’s regime, sown with scattered noise instead of a creature — the search the catalogue came out of',
    values: {
      species: 0, radius: 13, mu: 0.15, sigma: 0.015,
      shells: 1, b1: 1, b2: 0, b3: 0, b4: 0,
      kern: 0, growth: 0, fill: 0.25, sow: 0,
    },
  },
  ...SPECIES.map(recall),
];

/* The creature's cells as a texture. Eight bits because that is how the
   reference stores them too (ch2val/255), and because R8 filters
   everywhere — the pattern is sampled at a scale the current radius
   sets, so it has to interpolate. Row alignment drops to 1 for the
   upload: most patterns are an odd number of cells wide, and GL's
   default four-byte row padding would shear every one of them. */
function cellTex(gl: WebGL2RenderingContext, s: Species | undefined) {
  const w = s ? s.w : 1, h = s ? s.h : 1;
  const data = new Uint8Array(w * h);
  if (s) {
    const cells = decodeCells(s);
    for (let i = 0; i < cells.length; i++) data[i] = Math.round(cells[i] * 255);
  }
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  const tex = createTexture2D(gl, {
    width: w, height: h,
    internalFormat: gl.R8, format: gl.RED, type: gl.UNSIGNED_BYTE,
    data, filter: gl.LINEAR,
  });
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
  return { tex, dims: [w, h], nativeR: s ? s.R : 1 };
}

/* Lenia — Bert Chan's continuous cellular automaton, ported from the
   reference at github.com/Chakazul/Lenia (Python/LeniaND.py, the
   version whose conventions the shipped animals.json follows).

   The whole rule, verbatim:

     U = (K * A)(x)              convolution, K normalized to sum 1
     A' = clamp(A + G(U)/T, 0, 1)

   The reference convolves by FFT; that is a speed choice, not a
   semantic one — with a kernel of finite support (r < 1) circular FFT
   convolution and direct toroidal convolution agree to float error, so
   the disc is walked here tap by tap. The field wraps, as it does
   there.

   Two passes. The SIM pass steps the automaton on its own lattice —
   a single-channel texture at loop-res/Cell, one texel per cell,
   integer-addressed with texelFetch so there is no filtering to be
   subtle about — which is where the cost lives: each cell walks the
   kernel once, instead of once per covering pixel, so the work falls
   by Cell². The DISPLAY pass (frag) just paints the state up to the
   loop ring as chunky cells. State stays in its own texture, so the
   view can invert freely and the loop never notices; colour belongs
   downstream, on a Colorize. The kernel's mass (sumK) depends only on
   knobs, so it is summed tick-side in JS and arrives as a uniform
   rather than being re-accumulated per cell.

   Enum order follows Python (kn=1 quad4 first), NOT the JavaScript
   version, which lists bump4 first. The species tables use Python's. */

const CORES = ['QUAD4', 'BUMP4', 'STEP', 'LIFE'];
const GROWTHS = ['QUAD4', 'GAUS', 'STEP'];

/* The kernel's mass, mirroring the sim pass's disc walk term for term
   — same rows, same half-widths, same cutoff, same core — so the
   shader can divide by it instead of re-summing per cell per tick. It
   only moves when a kernel knob does; uniforms() memoizes on those. */
function kernelSum(R: number, shells: number, betas: number[], kn: number): number {
  const core = (r: number): number => {
    if (kn === 0) { let q = 4 * r * (1 - r); q *= q; return q * q; }
    if (kn === 1) { const d = r * (1 - r); return d <= 0 ? 0 : Math.exp(4 - 1 / d); }
    if (kn === 2) return r >= 0.25 && r <= 0.75 ? 1 : 0;
    return r >= 0.25 && r <= 0.75 ? 1 : r < 0.25 ? 0.5 : 0;
  };
  const ri = Math.trunc(R + 0.5);
  let sum = 0;
  for (let oy = -ri; oy <= ri; oy++) {
    const hx = Math.trunc(Math.sqrt(Math.max(R * R - oy * oy, 0)));
    for (let ox = -hx; ox <= hx; ox++) {
      const d = Math.sqrt(ox * ox + oy * oy) / R;
      if (d >= 1) continue;
      const br = shells * d;
      const i = Math.min(Math.floor(br), shells - 1);
      sum += core(br % 1) * (betas[i] ?? 0);
    }
  }
  return sum;
}

export const lenia: FxDef = {
  label: 'Lenia',
  /* the display pass: the lattice painted up as chunky cells */
  frag: /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform sampler2D uState; /* the lattice, fresh from the sim pass */
uniform vec2  uGrid;      /* its size, in cells */
uniform float uZoom;      /* view magnification, centre-anchored */
uniform float uInvert;    /* the view flips; the field does not */
void main(){
  /* zoom lives here, in the painter, so it costs nothing and touches
     nothing — the world is a torus, so the view past an edge simply
     wraps to the far side */
  vec2 uv = (vUv - 0.5) / uZoom + 0.5;
  float a = texelFetch(uState, ivec2(floor(fract(uv) * uGrid)), 0).r;
  frag = vec4(vec3(mix(a, 1.0 - a, uInvert)), 1.0);
}`,
  sim: {
    scale: pv => pv('cell'),
    frag: /* glsl */ `#version 300 es
precision highp float;
out vec4 frag;

uniform sampler2D uSrc;   /* what to sow into the field */
uniform sampler2D uPrev;  /* the lattice as it stood last tick */
uniform vec2  uRes;       /* the lattice size, in cells */
uniform float uSumK;      /* the kernel's mass, summed tick-side */
uniform float uR;         /* kernel radius, in cells */
uniform float uT;         /* time resolution — the step is 1/T */
uniform float uM;         /* growth centre, mu */
uniform float uS;         /* growth width, sigma */
uniform float uB;         /* how many shells the kernel wears */
uniform vec4  uBeta;      /* the shell peaks */
uniform float uKn;        /* kernel core index */
uniform float uGn;        /* growth mapping index */
uniform float uSeed;      /* 1 on the tick that sows a fresh field */
uniform float uSeedVal;
uniform float uFill;
uniform float uSow;
uniform sampler2D uCells; /* the catalogued creature's own cells */
uniform vec2  uCellDims;  /* that pattern's size, in its own cells */
uniform float uCellR;     /* the radius it was catalogued at */
uniform float uSpecies;   /* 0 sows noise instead of a creature */
${COMMON}

/* The kernel core, over one shell's normalized reach [0,1).
   LeniaND.py: kernel_core = { 0: (4r(1-r))^4, 1: exp(4 - 1/(r(1-r))),
   2: (r>=1/4)(r<=3/4), 3: that + (r<1/4)*0.5 } */
float core(float r){
  int kn = int(uKn);
  if (kn == 0){ float q = 4.0 * r * (1.0 - r); q *= q; return q * q; }
  if (kn == 1){
    /* the reference lets this divide by zero and leans on exp(-inf)=0 */
    float d = r * (1.0 - r);
    return d <= 0.0 ? 0.0 : exp(4.0 - 1.0 / d);
  }
  if (kn == 2) return (r >= 0.25 && r <= 0.75) ? 1.0 : 0.0;
  return (r >= 0.25 && r <= 0.75) ? 1.0 : (r < 0.25 ? 0.5 : 0.0);
}

/* kernel_shell: B concentric rings, each a whole core scaled by its
   peak. r arrives already divided by R and known to be under 1. */
float shell(float r){
  float br = uB * r;
  int i = int(min(floor(br), uB - 1.0));
  float b = i == 0 ? uBeta.x : i == 1 ? uBeta.y : i == 2 ? uBeta.z : uBeta.w;
  return core(fract(br)) * b;
}

/* growth_func: { 0: max(0, 1-(u-m)^2/(9s^2))^4 * 2 - 1,
   1: exp(-(u-m)^2/(2s^2)) * 2 - 1, 2: (|u-m|<=s) * 2 - 1 } */
float growth(float u){
  int gn = int(uGn);
  float d = u - uM;
  if (gn == 0){
    float q = max(0.0, 1.0 - d * d / (9.0 * uS * uS));
    q *= q;
    return q * q * 2.0 - 1.0;
  }
  if (gn == 1) return exp(-d * d / (2.0 * uS * uS)) * 2.0 - 1.0;
  return abs(d) <= uS ? 1.0 : -1.0;
}

const int MAXR = 20;

/* random_world(): squares of side int(R*0.9) filled with noise under
   0.9, scattered over an otherwise dead field.

   The reference counts them — 15 to 40 — but that count is calibrated
   to its 128-cell world. Carried over literally into a 960x540 loop
   (32x the area) it covers under 1% of the frame and leaves every
   patch further from its neighbours than the kernel can reach, so each
   one sees U~0, and G(0) at these mu is exactly -1: the field fades
   out in a few ticks. What transfers is the ratio, not the count. So
   the patches are laid on a jittered grid whose pitch is derived from
   Fill, which lands on the reference's own geometry at 0.25 and
   reaches its full-field seeding mode at 1. */
float soup(vec2 cell, vec2 grid){
  float dim = max(floor(uR * 0.9), 1.0);
  /* the block lattice has to close on itself the way the field does,
     so the pitch is trimmed to divide the grid a whole number of
     times; a block index off either end aliases to the block at the
     far side, and its patch lands half on each edge instead of being
     cut in two. A clipped creature is a malformed creature. */
  vec2 nb = max(floor(grid / (dim / sqrt(uFill))), vec2(1.0));
  vec2 pitch = grid / nb;
  vec2 blk = floor(cell / pitch);
  float v = 0.0;
  /* a patch straddling a block edge belongs to a neighbour's block */
  for (int j = -1; j <= 1; j++){
    for (int i = -1; i <= 1; i++){
      vec2 b = blk + vec2(float(i), float(j));
      vec2 bw = mod(b, nb);      /* who it is */
      /* both hashes stay on small arguments. COMMON's hash multiplies
         by ~435 and fracts, so feeding it a raw 4K cell coordinate
         spends the whole mantissa and the noise collapses onto a
         visible lattice — so jitter off the block index, and draw the
         fill from the cell's offset within its own patch. */
      vec2 r = hash3(bw * 0.0137 + uSeedVal * 0.0111).xy;
      vec2 c = (b + r) * pitch;  /* where its copy sits, unwrapped */
      if (all(lessThanEqual(abs(cell - c), vec2(dim * 0.5))))
        v = max(v, hash(cell - c + r * 61.0) * 0.9);
    }
  }
  return v;
}

/* Stamp the catalogued creature across the field.

   The pattern is stored at the radius it was found at, so it scales by
   R/R_native: Lenia is defined on r = d/R, so a creature is the same
   creature at any radius, and a species catalogued at 36 is honest at
   13. Each copy takes a random turn — the kernel is radially
   symmetric, so a rotated creature is still that creature — and the
   pitch is set off the pattern's diagonal so a turned copy can never
   land on its neighbour. */
float stamp(vec2 cell, vec2 grid){
  float sc = uR / uCellR;
  /* same closed lattice as soup(): a creature seeded across the seam
     must arrive whole from the other side, not truncated */
  vec2 nb = max(floor(grid / (length(uCellDims) * sc / sqrt(uFill))), vec2(1.0));
  vec2 pitch = grid / nb;
  vec2 blk = floor(cell / pitch);
  float v = 0.0;
  for (int j = -1; j <= 1; j++){
    for (int i = -1; i <= 1; i++){
      vec2 b = blk + vec2(float(i), float(j));
      vec2 bw = mod(b, nb);
      vec2 r = hash3(bw * 0.0137 + uSeedVal * 0.0111).xy;
      vec2 c = (b + r) * pitch;
      float a = hash(bw * 0.311 + uSeedVal * 0.017) * 6.2831853;
      float ca = cos(a), sa = sin(a);
      vec2 q = mat2(ca, sa, -sa, ca) * (cell - c) / sc;  /* into pattern cells */
      if (all(lessThan(abs(q), uCellDims * 0.5)))
        v = max(v, texture(uCells, q / uCellDims + 0.5).r);
    }
  }
  return v;
}

void main(){
  vec2 grid = uRes;
  vec2 cell = gl_FragCoord.xy;   /* this texel IS a cell; centre k+0.5 */

  if (uSeed > 0.5){
    frag = vec4(uSpecies < 0.5 ? soup(cell, grid) : stamp(cell, grid), 0.0, 0.0, 1.0);
    return;
  }

  /* U = (K*A)(x), the kernel already normalized by uSumK — the same
     number the reference divides by once up front. Integer taps with
     an explicit floored wrap: nothing here filters, nothing clamps. */
  ivec2 g = ivec2(grid);
  ivec2 me = ivec2(cell);
  int ri = int(uR + 0.5);
  float sumKA = 0.0;
  for (int iy = 0; iy <= 2 * MAXR; iy++){
    if (iy > 2 * ri) break;
    int oy = iy - ri;
    /* the row's half-width inside the disc — walking the square and
       rejecting the corners costs a third of the taps for nothing */
    int hx = int(sqrt(max(uR * uR - float(oy * oy), 0.0)));
    for (int ix = 0; ix <= 2 * MAXR; ix++){
      if (ix > 2 * hx) break;
      int ox = ix - hx;
      float d = sqrt(float(ox * ox + oy * oy)) / uR;
      if (d >= 1.0) continue;            /* kernel_shell's (r<1) cutoff */
      ivec2 p = ivec2(((me.x + ox) % g.x + g.x) % g.x,
                      ((me.y + oy) % g.y + g.y) % g.y);
      sumKA += shell(d) * texelFetch(uPrev, p, 0).r;
    }
  }

  float a = texelFetch(uPrev, me, 0).r;
  float u = uSumK > 0.0 ? sumKA / uSumK : 0.0;
  float an = clamp(a + growth(u) / uT, 0.0, 1.0);
  /* sowing paints the wired picture straight into the field — a Draw
     node becomes a brush, a Noise node becomes weather */
  if (uSow > 0.0) an = mix(an, luma(texture(uSrc, cell / uRes).rgb), uSow);
  frag = vec4(an, 0.0, 0.0, 1.0);
}`,
  },
  params: {
    radius: { label: 'Radius', min: 2, max: 20, def: 13, step: 1, fmt: fint, desc: 'Kernel radius R, in cells — the reach of one creature, and the only knob that costs real GPU: the field walks about πR² taps per cell, so 20 is roughly eleven times the work of 6. The classic species live at 13 (Orbium) and 18 (Hydrogeminium, Kronium, Ctenium). Because R is measured in cells, changing the global Res rescales every creature — and restarts the field.' },
    cell: { label: 'Cell', min: 1, max: 16, def: 4, step: 1, fmt: v => Math.round(v) + 'px', desc: 'How many screen pixels one lattice cell spans — the world\'s resolution, and the cost knob: the simulation runs once per cell, so doubling this quarters the GPU work. It is structural — changing it rebuilds the lattice and resows the field, like the global Res — so set it for your GPU budget and leave it; getting closer to the creatures is what Zoom is for.' },
    zoom: { label: 'Zoom', min: 1, max: 8, def: 1, fmt: fmul, scale: 'log', desc: 'Magnifies the view, centre-anchored — purely the painter looking closer at the lattice, so it costs nothing, never restarts the field, and can be ridden mid-run. Past an edge the view wraps to the far side, because the world does. For creature-sized detail, raise this; for a finer world, that is Cell.' },
    time: { label: 'Time', min: 1, max: 40, def: 10, fmt: f2, desc: 'Time resolution T — each tick advances the field by 1/T, so higher is smoother and slower. Nearly every catalogued species is tuned at 10; drop it and growth overshoots into blocky churn, raise it and the same creature crawls.' },
    mu: { label: 'Mu', min: 0.005, max: 0.5, def: 0.15, fmt: f3, desc: 'Growth centre — the neighbourhood density a cell most wants to sit in. Together with Sigma this is where Lenia lives or dies: the reference only ever searches Sigma between Mu/20 and Mu/5, and pairs outside that band are mostly empty fields.' },
    sigma: { label: 'Sigma', min: 0.001, max: 0.08, def: 0.015, fmt: f4, desc: 'Growth width — how forgiving that preference is. Narrow makes brittle, precise creatures; wide smears them into rolling foam. Keep it near a tenth of Mu and the field stays alive.' },
    shells: { label: 'Shells', min: 1, max: 4, def: 1, step: 1, fmt: fint, desc: 'How many concentric rings the kernel wears. One is the classic single annulus; more subdivides the same radius into a ripple of rings, each scaled by its own peak below. The species notated "1/2,1" or "1/6,1/2,1" are two- and three-shell creatures.' },
    b1: { label: 'B1', min: 0, max: 1, def: 1, fmt: f2, desc: 'Peak of the innermost shell. The reference quantizes these to twelfths — 1/12, 1/6, 1/4, 1/3, 5/12, 1/2 … — so the catalogue lands on clean fractions.' },
    b2: { label: 'B2', min: 0, max: 1, def: 0, fmt: f2, desc: 'Peak of the second shell. Ignored unless Shells reaches 2.' },
    b3: { label: 'B3', min: 0, max: 1, def: 0, fmt: f2, desc: 'Peak of the third shell. Ignored unless Shells reaches 3.' },
    b4: { label: 'B4', min: 0, max: 1, def: 0, fmt: f2, desc: 'Peak of the fourth shell. Ignored unless Shells reaches 4.' },
    kern: { label: 'Kernel', min: 0, max: 3, def: 0, step: 1, fmt: sel(CORES), desc: 'Shape of one shell. QUAD4 is canonical — 523 of the 548 catalogued species use it. BUMP4 is the smooth exponential bump, STEP a hard ring, LIFE the stepped core that reproduces Conway-like rules when paired with the STEP growth.' },
    growth: { label: 'Growth', min: 0, max: 2, def: 0, step: 1, fmt: sel(GROWTHS), desc: 'How neighbourhood density maps to growth, over [-1,+1]. QUAD4 is canonical and pairs with the QUAD4 kernel; GAUS is the smooth gaussian the browser version leads with; STEP is the discrete birth/death rule.' },
    seed: { label: 'Seed', min: 0, max: 999, def: 1, step: 1, fmt: fint, desc: 'Nudge this and the field is resown with scattered patches of noise, each about one creature wide, as the reference randomizer does it. Most rolls dissolve or congeal — that is the search. A live setting will throw off gliders on its own.' },
    fill: { label: 'Fill', min: 0.05, max: 1, def: 0.25, fmt: f2, desc: 'How much of the field the sown patches cover. This is the knob the reference does not have: it counts patches instead, for a world 32 times smaller than one video frame, and that count carried over literally leaves every patch stranded outside its neighbours’ reach — the whole field fades in a few ticks. 0.25 reproduces the spacing the reference actually lands at; 1 is its full-field seeding; below about 0.1 the patches are too lonely to survive.' },
    sow: { label: 'Sow', min: 0, max: 1, def: 0, fmt: f2, desc: 'How hard the wired picture is painted into the field each tick, by luma. At 0 the automaton runs closed and autonomous; lift it and a Draw node becomes a brush you seed life with, or a Noise node becomes weather the field has to survive.' },
    invert: { label: 'Invert', min: 0, max: 1, def: 0, fmt: f2, desc: 'Flips the picture — life in black on a white field. Purely the view: the simulation keeps its state in its own lattice texture this knob never touches, so you can ride it mid-run, or hold it halfway for a flat grey wash, without disturbing a single cell.' },
    species: { label: 'Species', min: 0, max: SPECIES.length, def: 0, step: 1, fmt: sel(CELL_NAMES), hidden: true, desc: 'Which catalogued creature gets stamped when the field is sown, or Noise for scattered soup. The dropdown drives this; it is not a knob because the knobs it sets are the real state, and twisting this one alone would leave them disagreeing with the field.' },
  },
  presets: PRESETS,
  uniforms: (pv, ctx) => {
    const st = (ctx.state.lenia ??= { seed: NaN, species: -1 }) as {
      seed: number; species: number;
      tex?: WebGLTexture; dims?: number[]; nativeR?: number;
      kkey?: string; ksum?: number;
    };
    /* the pattern only changes when the species does — build it once
       and park it in the scratch the engine already keeps per node */
    const sp = Math.round(pv('species'));
    const respec = sp !== st.species;
    if (respec) {
      if (st.tex) ctx.gl.deleteTexture(st.tex);
      Object.assign(st, cellTex(ctx.gl, SPECIES[sp - 1]), { species: sp });
    }
    /* to the nearest whole roll: a control signal riding this knob
       arrives fractional and would otherwise resow every single tick,
       leaving the field permanent static that never integrates */
    const seed = Math.round(pv('seed'));
    const fresh = seed !== st.seed || respec;   /* NaN on the first tick — sows itself */
    st.seed = seed;
    /* whole shell counts and core indices: the shader truncates them
       to int, and the JS mirror must land on the same rung even when
       a riding signal delivers 1.9999 */
    const R = pv('radius');
    const sh = Math.max(1, Math.round(pv('shells')));
    const kn = Math.round(pv('kern'));
    const betas = [pv('b1'), pv('b2'), pv('b3'), pv('b4')];
    const kkey = `${R}|${sh}|${kn}|${betas.join('|')}`;
    if (st.kkey !== kkey) { st.kkey = kkey; st.ksum = kernelSum(R, sh, betas, kn); }
    return {
      uR: R, uT: pv('time'), uM: pv('mu'), uS: pv('sigma'),
      uB: sh, uBeta: betas, uKn: kn, uGn: Math.round(pv('growth')),
      uSumK: st.ksum!,
      uSeed: fresh ? 1 : 0, uSeedVal: seed, uFill: Math.max(pv('fill'), 0.02),
      uSow: pv('sow'), uInvert: pv('invert'), uZoom: Math.max(pv('zoom'), 1),
      uSpecies: sp, uCells: st.tex!, uCellDims: st.dims!, uCellR: st.nativeR!,
    };
  },
  face: {
    inp: 'a picture to sow into the field',
    out: 'the living field',
    reset: 'Reset to Orbium unicaudatus — one shell, radius 13, and a fresh soup.',
  },
  hint: 'Lenia — Bert Chan’s continuous automaton: a ringed kernel and a growth curve, and the field grows its own gliders',
};
