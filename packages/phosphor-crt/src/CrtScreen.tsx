import { useEffect, useRef, useState } from 'react'
import { CrtSurface, type CrtSurfaceProps, type PassFactory } from '@ldlework/crt/react'
import { useScreenPointer } from '@ldlework/phosphor'
import { CursorPass } from './CursorPass'

export interface CrtScreenProps extends Omit<CrtSurfaceProps, 'passes' | 'className' | 'style'> {
  /** Your own passes, drawn under the cursor. Read once, at mount. */
  passes?: PassFactory
  /** Strength of the cursor's deposit into the phosphor. Default 0.5. */
  cursorIntensity?: number
}

/**
 * A CRT phosphor renderer behind a screen's HTML. Place it as a child
 * of a Display or EmbeddedScreen; it fills the glass and paints under
 * every sibling (see styles.css).
 *
 * When the screen has `cursor`, CrtScreen claims it while the CRT is
 * drawing: the lit CSS pointer hides and the arrow is drawn into the
 * phosphor instead, so it glows and leaves a fading trail. The arrow
 * passes under the screen's HTML. Without WebGL2 the claim never
 * happens and the CSS pointer stays.
 */
export function CrtScreen({ passes, cursorIntensity = 0.5, onRunningChange, ...surface }: CrtScreenProps) {
  const pointer = useScreenPointer()
  // Claim only while the CRT draws; if WebGL fails, the CSS pointer stays.
  const [running, setRunning] = useState(false)
  useEffect(() => (running ? pointer?.claim() : undefined), [running, pointer])

  // The pass factory runs once, at mount; the pass reads these refs each frame.
  const pointerRef = useRef(pointer)
  pointerRef.current = pointer
  const intensityRef = useRef(cursorIntensity)
  intensityRef.current = cursorIntensity

  const buildPasses: PassFactory = (gl) => [
    ...(passes?.(gl) ?? []),
    new CursorPass(gl, () => pointerRef.current?.get() ?? null, () => intensityRef.current),
  ]

  return (
    <div className="crt-screen">
      <CrtSurface
        {...surface}
        passes={buildPasses}
        onRunningChange={(next) => {
          setRunning(next)
          onRunningChange?.(next)
        }}
      />
    </div>
  )
}
