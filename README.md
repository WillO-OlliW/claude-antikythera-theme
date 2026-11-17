# Antikythera

A cyber-Greek theme for Claude Code in the Claude desktop and mobile apps: indigo night and electric cobalt, with an engraved bronze gear mechanism turning slowly behind the chat.

- **Colors.** Indigo-black surfaces and an electric cobalt accent in dark mode, cool paper and deep cobalt ink in light mode.
- **Animated backdrop.** Meshing gears behind a dial of Greek letters, a laurel wreath, glowing circuit traces, and a ruined Doric column with "ΓΝΩΘΙ ΣΑΥΤΟΝ" (know thyself) on its frieze. The motion is slow, and it stops entirely when your system asks for reduced motion.
- **Frosted panels.** The chat panels are frosted glass, so text stays readable over the art.

The backdrop's light or dark art follows your operating system's color scheme. The theme draws in the desktop and mobile apps; a terminal session loads it but has nothing to paint.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install antikythera --marketplace WillO-OlliW/claude-antikythera-theme
```

Answer `y` to add the marketplace, then pick the user scope (the first one, chosen with Enter) so the theme loads in every session.

From a shell:

```bash
claude plugin install antikythera --marketplace WillO-OlliW/claude-antikythera-theme
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `WillO-OlliW/claude-antikythera-theme`, then **Add plugin**.

New sessions start with the theme. Sessions that were already open pick it up after a restart.

## Turn it off

```bash
claude plugin disable antikythera@antikythera-theme
```

Or, in the desktop app: **+** next to the prompt box, then **Plugins**.

## What's inside

- `hooks/register.tsx` sets the theme when a session starts and draws the backdrop.
- `hooks/palette.ts` holds the colors for both modes.
- `hooks/scene.ts` builds the animated SVG scene.
- `tests/look.test.tsx` checks the theme and scene; run it with `claude plugin test .`
