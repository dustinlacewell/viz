# @ldlework/phosphor-crt

Put a [`@ldlework/crt`](../crt) phosphor renderer behind a
[`@ldlework/phosphor`](../phosphor) screen.

```tsx
import '@ldlework/phosphor/styles.css'
import '@ldlework/phosphor-crt/styles.css'
import { Display } from '@ldlework/phosphor'
import { CrtScreen } from '@ldlework/phosphor-crt'

<Display cursor>
  <CrtScreen />
  <div className="screen-chip-row">…</div>
</Display>
```

`CrtScreen` fills the glass and paints under the screen's HTML. The
HTML is not drawn through the CRT, so it gets no halation or decay.

When the screen has `cursor`, `CrtScreen` draws the cursor into the
phosphor: it glows and leaves a fading trail. It passes under the
HTML. Pass your own `passes` to draw more into the same phosphor;
`cursorIntensity` sets how bright the cursor deposits.
