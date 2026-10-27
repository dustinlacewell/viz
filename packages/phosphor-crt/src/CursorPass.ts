import { StampPass, type DrawablePass, type DrawCtx, type ResizablePass } from '@ldlework/crt'
import type { ScreenPointerSample } from '@ldlework/phosphor'
import { createArrowTexture } from './arrow-texture'
import { cursorStamp } from './cursor-stamp'

/**
 * Deposits the cursor arrow into the phosphor each frame it is on the
 * glass. The phosphor's own decay draws the trail once it moves on.
 */
export class CursorPass implements DrawablePass<DrawCtx>, ResizablePass {
  private readonly gl: WebGL2RenderingContext
  private readonly stamp: StampPass
  private readonly texture: WebGLTexture
  private readonly read: () => ScreenPointerSample | null
  private readonly intensity: () => number

  /**
   * `read` returns the mouse on the screen, and `intensity` the
   * deposit strength; both are read every frame.
   */
  constructor(
    gl: WebGL2RenderingContext,
    read: () => ScreenPointerSample | null,
    intensity: () => number,
  ) {
    this.gl = gl
    this.read = read
    this.intensity = intensity
    this.stamp = new StampPass(gl, { capacity: 1 })
    this.texture = createArrowTexture(gl)
    this.stamp.setTexture(this.texture)
  }

  draw(ctx: DrawCtx): void {
    const sample = this.read()
    const stamp = sample && cursorStamp(sample, ctx.fboWidth, this.intensity())
    this.stamp.setStamps(stamp ? [stamp] : [])
    this.stamp.draw(ctx)
  }

  resize(width: number, height: number): void {
    this.stamp.resize(width, height)
  }

  dispose(): void {
    this.stamp.dispose()
    this.gl.deleteTexture(this.texture)
  }
}
