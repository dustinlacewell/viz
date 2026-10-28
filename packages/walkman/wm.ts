import { defineProject } from '@ldlework/workmark/define'

export default defineProject({
  name: 'walkman',
  tags: ['app'],
  has: {
    testable: { typecheck: 'pnpm typecheck' },
  },
})
