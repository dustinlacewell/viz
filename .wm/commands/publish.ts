import { cmd } from '@ldlework/workmark/define'
import { publishable } from '../traits/publishable.js'

/**
 * Publish a package to npm. Builds first via the package's prepublishOnly
 * hook. Interactive so npm can prompt for the one-time password.
 */
export default cmd({
  needs: [publishable],
  interactive: true,
  handler: (_, { sh }) => sh('pnpm publish --access public'),
})
