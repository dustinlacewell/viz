/** On-glass label / value rows. */
export function ScreenRows({ rows }: { rows: ReadonlyArray<readonly [string, string]> }) {
  return (
    <div className="screen-rows">
      {rows.map(([label, value]) => (
        <div key={label} className="screen-row">
          <span className="screen-row-label">{label}</span>
          <span className="screen-row-readout">{value}</span>
        </div>
      ))}
    </div>
  )
}
