import { CURSOR_ARROW } from '@ldlework/phosphor'
import { CURSOR_SQUARE_PX } from './cursor-stamp'

/** Texture pixels per CSS pixel; enough to stay sharp at 3x DPR. */
const TEXELS_PER_PX = 4

/**
 * Rasterise the cursor arrow into an alpha texture for StampPass: a
 * faint fill under a full-strength outline, matching the CSS pointer.
 * The caller owns the texture.
 */
export function createArrowTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const size = CURSOR_SQUARE_PX * TEXELS_PER_PX
  const canvas = new OffscreenCanvas(size, size)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('createArrowTexture: 2d context unavailable')
  drawArrow(ctx)

  const tex = gl.createTexture()
  if (!tex) throw new Error('createTexture failed (cursor arrow)')
  gl.bindTexture(gl.TEXTURE_2D, tex)
  // Canvas rows run top-down; GL rows run bottom-up.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindTexture(gl.TEXTURE_2D, null)
  return tex
}

function drawArrow(ctx: OffscreenCanvasRenderingContext2D) {
  const path = new Path2D(CURSOR_ARROW.path)
  ctx.scale(TEXELS_PER_PX, TEXELS_PER_PX)
  ctx.translate(CURSOR_ARROW.inset, CURSOR_ARROW.inset)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.fill(path)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1
  ctx.lineJoin = 'round'
  ctx.stroke(path)
}
