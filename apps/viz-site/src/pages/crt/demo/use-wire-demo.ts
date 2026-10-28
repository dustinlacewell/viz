import { useState, type RefObject } from 'react'
import type { CrtSurfaceProps } from '@ldlework/crt/react'
import { StampPass } from '@ldlework/crt'
import { MAX_STAMPS, WIRE_DIVISIONS, WIRE_SAMPLES, wireStamps } from './stamps'
import { cubeWireframe } from './wireframe'

/** Edge length of the dot texture, in texels. */
const DOT_TEXTURE_SIZE = 64

type WireDemo = Required<Pick<CrtSurfaceProps, 'passes' | 'stage'>>

/**
 * The CRT wiring for the crt page demo: one StampPass that paints the
 * morphing wireframe each frame. The grid is built once. The canvas
 * aspect is read from `stageEl` every frame, so a resize never
 * stretches the shape.
 */
export function useWireDemo(stageEl: RefObject<HTMLElement | null>): WireDemo {
  const [demo] = useState<WireDemo>(() => {
    let stamp: StampPass | null = null
    const lines = cubeWireframe(WIRE_DIVISIONS, WIRE_SAMPLES)
    return {
      passes: (gl) => {
        stamp = new StampPass(gl, { capacity: MAX_STAMPS })
        stamp.setTexture(makeDotTexture(gl))
        return [stamp]
      },
      stage: (t) => {
        stamp?.setStamps(wireStamps(lines, t, aspectOf(stageEl.current)))
      },
    }
  })
  return demo
}

/** Width over height of `el`; 1 until it has a size. */
function aspectOf(el: HTMLElement | null): number {
  if (!el) return 1
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 ? r.width / r.height : 1
}

/** A soft round dot as an alpha-only texture for StampPass to sample. */
function makeDotTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const size = DOT_TEXTURE_SIZE
  const data = new Uint8Array(size * size * 4)
  const c = (size - 1) / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - c) / c
      const dy = (y - c) / c
      const r = Math.sqrt(dx * dx + dy * dy)
      // Smooth falloff to zero at the edge; squared for a tighter core.
      const a = Math.max(0, 1 - r)
      const o = (y * size + x) * 4
      data[o] = 255
      data[o + 1] = 255
      data[o + 2] = 255
      data[o + 3] = Math.round(a * a * 255)
    }
  }
  const tex = gl.createTexture()
  if (!tex) throw new Error('createTexture failed (dot)')
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindTexture(gl.TEXTURE_2D, null)
  return tex
}
