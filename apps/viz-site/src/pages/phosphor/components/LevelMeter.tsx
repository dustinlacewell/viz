/* An output meter for the glass: a level bar under a pinned readout.
   It paints with `--display-color`, so it takes the screen's color. */

const FLOOR_DB = -30

export function LevelMeter({ db }: { db: number }) {
  return (
    <>
      <span className="screen-readout">{formatDb(db)}</span>
      <div style={{ paddingTop: 32 }}>
        <div
          style={{
            height: 10,
            borderRadius: 2,
            background: 'color-mix(in oklch, var(--display-color) 25%, transparent)',
          }}
        >
          <div
            style={{
              width: `${((db - FLOOR_DB) / -FLOOR_DB) * 100}%`,
              height: '100%',
              borderRadius: 2,
              background: 'var(--display-color)',
              boxShadow: '0 0 8px var(--display-color)',
            }}
          />
        </div>
      </div>
    </>
  )
}

function formatDb(db: number): string {
  return db === 0 ? '0 dB' : `−${Math.abs(db)} dB`
}
