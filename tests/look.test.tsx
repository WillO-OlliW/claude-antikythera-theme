import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'antikythera',
  component: 'Backdrop',
  props: { scene: 'antikythera', plugin: 'antikythera', glass: { blur: 14, opacity: 0.68 } },
} as const

test('the look is set at session start, colors and scene together', async ($, on) => {
  const sets: unknown[] = []

  on('theme.set', (_, e) => {
    sets.push(e)

    return { value: { isDrawn: true, requestId: 'look' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  expect(sets.length).toBe(1)
  const set = sets[0] as { backdrop?: { scene?: string }; colors?: { label?: string } }
  expect(set.backdrop?.scene).toBe('antikythera')
  expect(set.colors?.label).toBe('Antikythera')
})

test('the scene draws on desktop and mobile, under the size limit', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })
    const svg = (await ui.find({ type: 'Svg' })) as { props?: { source?: string } } | undefined

    expect(svg).toBeDefined()
    const source = svg?.props?.source ?? ''
    expect(source.startsWith('<svg')).toBe(true)
    expect(source.length < 131072).toBe(true)
    await ui.unmount()
  }
})
