import { useEffect } from 'react'
import type { PlayerAction } from './player'

/** While playing, advances the track one second per second. */
export function usePlaybackClock(playing: boolean, dispatch: (a: PlayerAction) => void): void {
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => dispatch({ type: 'tick', rand: Math.random() }), 1000)
    return () => window.clearInterval(id)
  }, [playing, dispatch])
}
