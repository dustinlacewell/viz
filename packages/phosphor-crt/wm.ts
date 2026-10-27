import { defineProject } from '@ldlework/workmark/define'

export default defineProject({
  name: 'phosphor-crt',
  tags: ['design-system'],
  has: {
    buildable: { command: 'pnpm build' },
    testable: { typecheck: 'pnpm typecheck' },
    publishable: { npmName: '@ldlework/phosphor-crt' },
  },
})
