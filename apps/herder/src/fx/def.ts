/* One effect device, whole: its shader, its knobs, how knob values
   become uniforms, and the words its shell wears. Everything else —
   PARAMS, DRAWER, labels, whitelists, renderer passes, the engine
   step, the toolbar — derives from the FX registry (index.ts), so an
   effect is one file plus an icon. */

import type { ParamDef } from '../patch/params';

export interface FxCtx {
  simTime: number;
  /** per-node scratch that survives across ticks (accumulators) */
  state: Record<string, unknown>;
  /** for effects that carry a lookup table — build it once, keep it in state */
  gl: WebGL2RenderingContext;
}

/** a named set of knob positions the device can recall from a dropdown */
export interface FxPreset {
  label: string;
  desc: string;
  /** param key -> value; keys must exist in the def's params */
  values: Record<string, number>;
}

/* A simulating effect runs on its OWN lattice, not on pixels: the sim
   pass ping-pongs a single-channel state texture at loop-res/scale,
   and the def's `frag` becomes a cheap display pass that paints the
   state up to the ring. Costs fall by scale² because each lattice cell
   is computed once instead of once per covering pixel. The sim pass
   gets uPrev (its own last state, NEAREST — texelFetch it), uSrc, and
   uRes = the LATTICE size; the display pass gets uState (the fresh
   state), uGrid (the lattice size), and the usual full-res uRes. */
export interface FxSim {
  /** loop pixels per sim cell, off the resolved knobs — a change
      reallocates the lattice and resets the device's scratch */
  scale: (pv: (key: string) => number) => number;
  /** the simulation pass */
  frag: string;
}

export interface FxDef {
  /** device label (node header, KIND_LABEL) */
  label: string;
  /** fragment source — one FullscreenPass over uSrc (uRes, uTime free);
      for a simulating effect, the display pass over uState */
  frag: string;
  /** present on devices that simulate on a coarse lattice */
  sim?: FxSim;
  params: Record<string, ParamDef>;
  /** recallable knob positions — the shell grows a dropdown when present */
  presets?: FxPreset[];
  /** resolved knob values → shader uniforms, once per tick */
  uniforms: (pv: (key: string) => number, ctx: FxCtx) => Record<string, number | number[] | WebGLTexture>;
  /** the shell's words */
  face: { inp: string; out: string; reset: string };
  /** the toolbar's words */
  hint: string;
}
