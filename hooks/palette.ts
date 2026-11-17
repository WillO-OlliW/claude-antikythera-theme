import { makeColors } from './make-colors.js'

// Cyber-Greek: indigo night and electric cobalt.
// Dark is the hero; light is the same idea as cobalt ink on cool marble.
export const { theme, problems } = makeColors({
  label: 'Antikythera',
  roles: {
    accent: '#1f1ff2', // electric cobalt
    danger: '#dc3d43', // vermilion
    success: '#2fb58a', // patina green
    warning: '#d9a33a', // gilded laurel
    pro: '#8a5cf6', // Tyrian violet
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0d0d24',
        'surface-1': '#121230',
        'surface-2': '#171738',
        'surface-3': '#1a1a3d',
        'text-primary': '#ececf6',
        'text-secondary': '#c0c0dc',
        'text-muted': '#9a9ac4',
      },
    },
    git: { added: '#3ccf9a', removed: '#f2666b', modified: '#a5a5ff' },
  },
  light: {
    gray: {
      anchors: {
        'surface-0': '#eaeaf3',
        'surface-1': '#f2f2f8',
        'surface-2': '#fafafe',
        'surface-3': '#fafafe',
        'text-primary': '#0a0a33',
        'text-secondary': '#2b2b63',
        'text-muted': '#4f4f84',
      },
    },
    roles: { warning: '#c27a10' },
    git: { added: '#1f8a5e', removed: '#c4313a', modified: '#2424c8', merged: '#6a3fd6', closed: '#5a5a7a', conflicting: '#b0570f', draft: '#5f5f80' },
  },
})
