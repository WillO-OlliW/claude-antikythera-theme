import type { Register, ThemeSetArgs } from 'claude-code'

import { problems, theme } from './palette'
import { SCENE, SCENE_ALT } from './scene'

const SCENE_NAME = 'antikythera'

const LOOK: ThemeSetArgs = {
  colors: theme,
  // Panels frost over the scene: enough blur to keep words crisp, light enough
  // that the turning gears still glow through.
  backdrop: { scene: SCENE_NAME, glass: { blur: 14, opacity: 0.68 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // While building: the one line that would stop Desktop painting the colors.
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    // A requestId means a surface that draws looks hasn't attached yet; it will.
    if (!set.isDrawn && set.requestId === undefined) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== SCENE_NAME) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt={SCENE_ALT} isInteractive />
  })
}
