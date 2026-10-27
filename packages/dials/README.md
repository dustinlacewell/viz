# dials

Values you can modulate. The modulators have values too, and you can modulate
those, as deep as you like. Read a value and you get a plain number.

```ts
import { dial, read, sine, perlin1D } from '@ldlework/dials'

const params = {
  freq: dial(2, { min: 0.1, max: 12, step: 0.1 }),
  // amp rides a sine. The sine's own speed is driven by noise.
  amp: dial(0.6, {
    min: 0,
    max: 1,
    mod: sine({ freq: dial(1, { mod: perlin1D() }) }),
    depth: 0.4,
  }),
}

// Once per frame:
const { freq, amp } = read(params, { t, dt })
```

`dial(0.6, ...)` is the value you set. `mod` is the source that moves it.
`depth` is how far the source moves it, as a fraction of the dial's travel from
`min` to `max`. `0.4` means up to 0.4 of the way up and 0.4 of the way down,
stopping at the ends.

The library has no clock. You pass a context, `{ t, dt }` above, and sources
read what they need from it. `t` is time in seconds. `dt` is seconds since the
last read. Sources that move over time use `dt`, and fall back to 1/60 without
it.

`read()` returns one shared object that it fills in again on every call.
Destructure it or copy it. Do not keep a reference to it.

---

## Dials

```ts
dial(value, options?)             // a number
typedDial<T>(type, value, options?) // any other value, tagged with a type name
```

Options:

| Option | Meaning |
|---|---|
| `min`, `max`, `step` | Range and step. With both `min` and `max`, modulation stays inside the range. |
| `scale` | `'linear'` (default) or `'log'`. Log needs `min > 0`. |
| `unit` | Suffix for readouts, such as `'Hz'`. |
| `label`, `description` | Text for the panel. |
| `format` | Function that turns the value into display text. |
| `modulatable` | `false` hides the attach control and refuses a source. |
| `glidable` | `true` shows the glide control in the panel. |
| `mod` | A source to attach, such as `sine()`. |
| `depth` | Modulation depth, 0 to 1. |
| `mode` | `'center'` (both ways), `'up'` or `'down'`. |
| `glide` | Seconds. The output eases toward its target instead of jumping. |

If you give `mod` and no `depth`, the depth is `DEFAULT_DEPTH` (0.15).

## Sources

A source turns its own parameters into one number. Call it to make an
instance. Each parameter takes a number, or a dial.

```ts
sine()                              // defaults
sine({ freq: 3 })                   // a number
sine({ freq: dial(1, { mod: perlin1D() }) }) // a dial, which has its own mod
```

A number sets the parameter's value. A dial replaces the parameter's range,
label and so on where it sets them, and brings its own `mod`. Every call makes
a new instance with its own state.

To drive several slots from one source, attach the same instance to each:

```ts
const lfo = sine({ freq: 0.5 })
const params = {
  x: dial(0, { min: -1, max: 1, mod: lfo }),
  y: dial(0, { min: -1, max: 1, mod: lfo }),
}
```

Pass `t` in the context so a shared source moves once per frame, not once per
slot.

### Built-in sources

All return numbers. They are registered when you import the package.

| Name | Parameters | Output |
|---|---|---|
| `sine`, `tri`, `saw` | `freq`, `phase` | -1 to 1 |
| `square` | `freq`, `duty`, `phase` | -1 or 1 |
| `whiteNoise` | `seed` | -1 to 1 |
| `valueNoise`, `perlin1D` | `seed`, `rate` | -1 to 1 |
| `fbm` | `seed`, `rate`, `octaves`, `lacunarity`, `gain` | -1 to 1 |
| `brown` | `seed`, `rate` | -1 to 1 |
| `smooth` | `signal`, `tau` | -1 to 1 |
| `add`, `mul` | `a`, `b` | -1 to 1 |
| `lerp` | `a`, `b`, `t` | -1 to 1 |
| `gate` | `signal`, `closed`, `period`, `lo`, `hi` | -1 to 1 |
| `phaseGate` | `signal`, `closed`, `lo`, `hi` | -1 to 1 |

`smooth`, `add`, `mul`, `lerp`, `gate` and `phaseGate` take a signal as a
parameter. Give that parameter its own `mod` to feed it another source.
`phaseGate` reads `ctx.phase`, a number from 0 to 1 that you supply.

## Make your own source

A source with no memory uses `body`. The body gets the current parameter values
and the context, and returns a number.

```ts
import { defineSource, dial, registerSource } from '@ldlework/dials'

const clip = defineSource({
  name: 'clip',
  description: 'Limits a signal to plus or minus limit.',
  polarity: 'bipolar',
  params: {
    signal: dial(0, { min: -1, max: 1 }),
    limit: dial(0.5, { min: 0, max: 1 }),
  },
  body: ({ signal, limit }) => Math.max(-limit, Math.min(limit, signal)),
})
```

A source that remembers things between reads uses `setup` instead. `setup`
runs once for each instance and returns the body. Variables inside `setup` are
that instance's state.

```ts
const wave = defineSource({
  name: 'wave',
  description: 'A sine wave.',
  polarity: 'bipolar',
  params: {
    freq: dial(1, { min: 0.01, max: 20, scale: 'log', unit: 'Hz' }),
  },
  setup: () => {
    let cycle = 0 // how far through the wave we are, 0 to 1
    return ({ freq }, ctx) => {
      const dt = typeof ctx['dt'] === 'number' ? ctx['dt'] : 1 / 60
      cycle = (cycle + freq * dt) % 1
      return Math.sin(2 * Math.PI * cycle)
    }
  },
})

wave({ freq: 2 })
```

Rules:

- Give `body` or `setup`, not both.
- `polarity` is the range the source returns. `'bipolar'` is -1 to 1. `'unipolar'`
  is 0 to 1. The slot uses it to place the swing around its value.
- `params` are dials. The body gets their current values as plain numbers, and
  the types come from `params`.
- `outType` is `'number'` unless you say otherwise. If the body returns
  anything else, you must give `outType`.
- Call `registerSource(wave)` to list the source in the panel's picker. Presets
  find sources by name through the same list.

A source that returns another type attaches to dials of that type:

```ts
const warm = defineSource({
  name: 'warm',
  outType: 'rgb',
  polarity: 'bipolar',
  body: () => [1, 0.5, 0] as [number, number, number],
})

const tint = typedDial<[number, number, number]>('rgb', [0, 0, 0], { mod: warm() })
```

Only numbers blend with the dial's value. For any other type the source's
output replaces the value.

## Change things at runtime

These are the calls the panel uses. Use them to build your own controls.

```ts
import { attach, detach, setDepth, setMode, setDial, setPos, getPos, setGlide, sine } from '@ldlework/dials'

const slot = params.amp

const src = attach(slot, sine({ freq: 2 })) // returns the source
src.params.freq                              // the source's own dials
setDepth(slot, 0.25)                         // 0 to 1
setMode(slot, 'up')                          // 'center' | 'up' | 'down'
setGlide(slot, 0.2)                          // seconds
setDial(slot, 0.8)                           // the value you set, clamped to min and max
setPos(slot, 0.5)                            // 0 is min, 1 is max; follows a log scale
getPos(slot)                                 // the value as 0 to 1
detach(slot)                                 // the value you set stays
```

`attach` throws if the source's `outType` is not the slot's type. Depth, mode
and glide belong to the slot. They survive `detach` and a later `attach`.

To read one slot or one source without a whole object, use `sampleSlot(slot,
ctx)` and `sampleSource(source, ctx)`.

## Presets

```ts
import { toJSON, fromJSON } from '@ldlework/dials'

const preset = toJSON(params)      // plain data, safe to JSON.stringify
fromJSON(params, preset)           // writes it back into params
```

A preset holds values, depth, mode, glide, and which source sits on each slot,
by name. It does not hold the code: ranges, labels and source definitions stay
in your code.

On load, a slot that already has the named source keeps it. Only the values
are applied to it. A slot with no source, or a different one, gets a new
instance of the registered source with that name. A name that is not
registered throws. To skip such slots and keep their values, pass
`{ onMissingSource: 'drop' }` as the third argument.

Keys missing from the preset keep their defaults. Keys in the preset that
`params` lacks are ignored.

Values go through `JSON.stringify` as they are. For a type that does not
survive that, such as a class instance, write your own save and load.

## React panel

```tsx
import { Panel, type SlotEditor } from '@ldlework/dials/react'

<Panel dials={params} title="Controls" editors={{ rgb: MyColorEditor }} />
```

The panel shows one row per slot. A number gets a slider and a number field.
Other types use `editors[outType]`, or show read-only. Each row has a picker
built from `sourcesForType(slot.outType)`. Picking a source opens a nested
panel for its parameters, and those nest the same way.

`onChange` runs after any edit. `components` replaces any part of the look.
`actions` replaces how edits are applied, for apps that route edits through
their own layer.

The default markup has no styles. These attributes are there for your CSS:
`data-dials-panel`, `data-dials-slot`, `data-dials-attached`,
`data-dials-source`, `data-dials-number`, `data-dials-readonly`,
`data-dials-attach`, `data-dials-depth`, `data-dials-mode`, `data-dials-glide`.

React is an optional peer dependency. The core has no React import.

## Notes

- The library has no clock and no scheduler. You call `read()` in your own
  frame loop.
- `ctx` is whatever object you pass. Sources read fields by name and use a
  default when one is missing.
- Reads do not allocate on the hot path.

## License

MIT
