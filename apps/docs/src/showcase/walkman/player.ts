// ─── Player state (pure) ─────────────────────────────────────────────

export interface Track {
  title: string
  artist: string
  seconds: number
}

export const TRACKS: readonly Track[] = [
  { title: 'Night Drive', artist: 'The Phosphors', seconds: 214 },
  { title: 'Cathode Bloom', artist: 'Halation', seconds: 187 },
  { title: 'Slow Decay', artist: 'Persistence', seconds: 242 },
  { title: 'Beam Current', artist: 'Raster Kids', seconds: 198 },
  { title: 'Afterglow', artist: 'The Phosphors', seconds: 263 },
  { title: 'Vertical Hold', artist: 'Sync Pulse', seconds: 176 },
  { title: 'Grain', artist: 'Halation', seconds: 221 },
  { title: 'White Hot', artist: 'Saturation Knee', seconds: 205 },
]

export interface PlayerState {
  index: number
  elapsed: number
  playing: boolean
  shuffle: boolean
}

export type PlayerAction =
  | { type: 'toggle' }
  | { type: 'shuffle' }
  | { type: 'tick'; rand: number }
  | { type: 'next'; rand: number }
  | { type: 'prev' }
  | { type: 'seek'; seconds: number }

export const INITIAL_PLAYER: PlayerState = { index: 0, elapsed: 0, playing: false, shuffle: false }

/** Seconds into a track after which Previous restarts it instead of going back. */
const RESTART_AFTER = 3

export function playerReducer(s: PlayerState, a: PlayerAction): PlayerState {
  switch (a.type) {
    case 'toggle':
      return { ...s, playing: !s.playing }
    case 'shuffle':
      return { ...s, shuffle: !s.shuffle }
    case 'tick':
      return s.elapsed + 1 >= TRACKS[s.index]!.seconds
        ? { ...s, index: nextIndex(s, a.rand), elapsed: 0 }
        : { ...s, elapsed: s.elapsed + 1 }
    case 'next':
      return { ...s, index: nextIndex(s, a.rand), elapsed: 0 }
    case 'prev':
      return s.elapsed > RESTART_AFTER
        ? { ...s, elapsed: 0 }
        : { ...s, index: (s.index - 1 + TRACKS.length) % TRACKS.length, elapsed: 0 }
    case 'seek':
      return { ...s, elapsed: a.seconds }
  }
}

/** The following track, or a random other one when shuffling. `rand` is in [0, 1). */
function nextIndex(s: PlayerState, rand: number): number {
  if (!s.shuffle) return (s.index + 1) % TRACKS.length
  const offset = 1 + Math.floor(rand * (TRACKS.length - 1))
  return (s.index + offset) % TRACKS.length
}
