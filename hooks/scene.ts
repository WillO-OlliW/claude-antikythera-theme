// Antikythera: an original cyber-Greek backdrop.
// An engraved bronze mechanism (the ancient Greek computer) turning behind a
// dial of the 24 Greek letters, wired out to circuit traces, over cobalt
// halftone, beside a ruined Doric column inscribed ΓΝΩΘΙ ΣΑΥΤΟΝ.
// Built once at load: plain math, no DOM. Animation is CSS (plus one SMIL orbit).

const r1 = (n: number): number => Math.round(n * 10) / 10
const rad = (deg: number): number => (deg * Math.PI) / 180
const xy = (r: number, deg: number): string => `${r1(r * Math.cos(rad(deg)))},${r1(r * Math.sin(rad(deg)))}`
const circlePath = (r: number): string => `M${r},0A${r},${r} 0 1 0 ${-r},0A${r},${r} 0 1 0 ${r},0Z`

let seed = 11
const rand = (): number => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

// ---------------------------------------------------------------- gears
// Module 3.75: pitch radius = 3.75 * teeth / 2, so any pair meshes at r1 + r2.
const MODULE = 3.75
type Gear = { n: number; x: number; y: number; phase: number; dir: 1 | -1 }

function toothRing(n: number, pitch: number): string {
  // Triangular teeth, as on the surviving fragments.
  const s = 360 / n
  const depth = MODULE * 1.9
  let d = ''
  for (let i = 0; i < n; i++) {
    d += `${i === 0 ? 'M' : 'L'}${xy(pitch + depth / 2, i * s)}L${xy(pitch - depth / 2, i * s + s / 2)}`
  }
  return `${d}Z`
}

function drawGear(n: number, spokes: number): string {
  const pitch = (MODULE * n) / 2
  const rim = pitch - MODULE * 1.4
  const inner = rim - Math.max(7, pitch * 0.09)
  const hub = Math.max(7, pitch * 0.15)
  const w = Math.max(3.5, pitch * 0.055)
  let spokeD = ''
  for (let k = 0; k < spokes; k++) {
    const a = rad((k * 360) / spokes + 45)
    const [c, s] = [Math.cos(a), Math.sin(a)]
    const p = (r: number, off: number): string => `${r1(r * c - off * s)},${r1(r * s + off * c)}`
    spokeD += `M${p(hub - 1, -w)}L${p(inner + 1, -w * 1.5)}L${p(inner + 1, w * 1.5)}L${p(hub - 1, w)}Z`
  }
  // Fine engraved ticks inside the rim.
  const tickR = (rim + inner) / 2
  const circ = 2 * Math.PI * tickR
  const ticks = Math.round(n * 1.5)
  return [
    `<path class="body" d="${toothRing(n, pitch)}${circlePath(inner)}"/>`,
    `<path class="body" d="${spokeD}"/>`,
    `<circle class="tk" r="${r1(tickR)}" stroke-width="${r1(rim - inner - 2)}" stroke-dasharray="0.5 ${r1(circ / ticks - 0.5)}"/>`,
    `<circle class="ln" r="${r1(rim)}"/>`,
    `<circle class="body" r="${r1(hub)}"/><circle class="ln" r="${r1(hub * 0.45)}"/>`,
  ].join('')
}

// The phase that makes gear B (at `theta` degrees from gear A's center) mesh with A.
function meshPhase(a: { n: number; phase: number }, theta: number, nB: number): number {
  const sA = 360 / a.n
  const sB = 360 / nB
  const frac = ((((theta - a.phase) % sA) + sA) % sA) / sA
  return theta + 180 + (frac + 0.5) * sB
}

function meshAt(a: Gear, theta: number, nB: number): Gear {
  const dist = (MODULE * (a.n + nB)) / 2
  return {
    n: nB,
    x: a.x + dist * Math.cos(rad(theta)),
    y: a.y + dist * Math.sin(rad(theta)),
    phase: meshPhase(a, theta, nB),
    dir: a.dir === 1 ? -1 : 1,
  }
}

const MAIN_PERIOD = 240 // seconds per turn of the great wheel
const g1: Gear = { n: 96, x: 0, y: 0, phase: 0, dir: 1 }
const g2 = meshAt(g1, 38, 40)
const g3 = meshAt(g2, 96, 24)
const g4 = meshAt(g1, 248, 30)

function placeGear(g: Gear, spokes: number): string {
  const period = r1((MAIN_PERIOD * g.n) / g1.n)
  const anim = `${g.dir === 1 ? 'cw' : 'ccw'} ${period}s linear infinite`
  return `<g transform="translate(${r1(g.x)},${r1(g.y)})"><g class="spin" style="animation:${anim}"><g transform="rotate(${r1(g.phase)})">${drawGear(g.n, spokes)}</g></g></g>`
}

// ---------------------------------------------------------------- dial
const GREEK = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'

function dial(): string {
  const tickR = 241
  const c = 2 * Math.PI * tickR
  let letters = ''
  for (let i = 0; i < 24; i++) {
    letters += `<text class="gl" text-anchor="middle" transform="rotate(${i * 15 + 7.5}) translate(0,-262)">${GREEK[i]}</text>`
  }
  return [
    `<circle class="ln" r="232"/><circle class="ln" r="250"/><circle class="th" r="282" stroke-dasharray="2 6"/>`,
    `<circle class="tk" r="${tickR}" stroke-width="17" stroke-dasharray="0.5 ${r1(c / 360 - 0.5)}"/>`,
    `<circle class="tk" r="${tickR}" stroke-width="17" stroke-dasharray="1.6 ${r1(c / 24 - 1.6)}" style="stroke:var(--ink)"/>`,
    letters,
  ].join('')
}

// ---------------------------------------------------------------- laurel
function laurel(): string {
  let out = ''
  // A leaf drawn pointing up points along screen angle (rotation - 90), so a
  // leaf laid along the branch, angled off it by `tilt`, turns by heading + 90.
  const leaf = (r: number, deg: number, heading: number, tilt: number, size: number): string => {
    const [x, y] = xy(r, deg).split(',')
    return `<use href="#leaf" transform="translate(${x},${y}) rotate(${r1(heading + 90 + tilt)}) scale(${size})"/>`
  }
  // Two branches rising from the foot of the dial, leaves paired either side.
  const n = 17
  for (let i = 0; i < n; i++) {
    const size = r1(1.15 - (i / n) * 0.45)
    const t = 100 + i * 8.2 // left branch climbs clockwise
    out += leaf(304, t, t + 90, -34, size) + leaf(304, t + 3, t + 90, 34, size)
    const u = 80 - i * 8.2 // right branch climbs counter-clockwise
    out += leaf(304, u, u - 90, 34, size) + leaf(304, u - 3, u - 90, -34, size)
  }
  return `<path class="ln" d="M${xy(304, 98)}A304,304 0 0 1 ${xy(304, 236)}M${xy(304, 82)}A304,304 0 0 0 ${xy(304, -56)}"/>${out}`
}

// ---------------------------------------------------------------- sunburst
function rays(): string {
  let short = ''
  let long = ''
  for (let i = 0; i < 180; i++) {
    const a = i * 2 + rand() * 1.6
    const start = 318 + rand() * 10
    const len = 30 + Math.pow(rand(), 2.2) * 330
    short += `M${xy(start, a)}L${xy(start + len, a)}`
  }
  for (let i = 0; i < 28; i++) {
    const a = rand() * 360
    long += `M${xy(330, a)}L${xy(560 + rand() * 260, a)}`
  }
  return `<path class="ray" d="${short}"/><path class="ray faint" d="${long}"/>`
}

// ---------------------------------------------------------------- circuit traces
const TRACES = [
  'M262,-80H330L372,-122H520',
  'M276,-24H404L436,8H600',
  'M190,-196L232,-238H318L356,-276H560',
  'M-152,-214L-196,-258V-480',
  'M108,-258V-330L140,-362V-480',
]

function traces(): string {
  let out = ''
  TRACES.forEach((d, i) => {
    out += `<path class="trace" d="${d}"/><path class="pulse" d="${d}" style="animation-delay:${-i * 1.7}s"/>`
  })
  const nodes: Array<[number, number]> = [
    [262, -80], [276, -24], [190, -196], [-152, -214], [108, -258],
    [372, -122], [436, 8], [356, -276], [140, -362],
  ]
  for (const [x, y] of nodes) {
    out += `<circle class="node" cx="${x}" cy="${y}" r="3"/>`
  }
  return out
}

// ---------------------------------------------------------------- temple
function column(x: number, top: number, h: number, broken: boolean): string {
  const tw = 48
  const bw = 56
  const topEdge = broken
    ? [[-48, 10], [-32, -4], [-14, 9], [3, -12], [20, 5], [36, -5], [48, 7]].map(([dx, dy]) => `${x + dx!},${top + dy!}`).join('L')
    : `${x - tw},${top}L${x + tw},${top}`
  const shaft = `M${topEdge}L${x + bw},${top + h}L${x - bw},${top + h}Z`
  let flutes = ''
  for (let i = 1; i < 12; i++) {
    const xt = x - tw + (i * 2 * tw) / 12
    const xb = x - bw + (i * 2 * bw) / 12
    flutes += `M${r1(xt)},${top + (broken ? 14 : 4)}L${r1(xb)},${top + h}`
  }
  // Engraver's hatching down the shaded side.
  let hatch = ''
  for (let y = top + (broken ? 16 : 6); y < top + h; y += 7) {
    const t = (y - top) / h
    const half = tw + (bw - tw) * t
    hatch += `M${r1(x + half * 0.42)},${y}L${r1(x + half - 1)},${y + 2}`
  }
  let out = `<path class="stone" d="${shaft}"/><path class="th" d="${flutes}"/><path class="hatch" d="${hatch}"/>`
  if (!broken) {
    out += `<path class="stone" d="M${x - 48},${top}C${x - 60},${top - 4} ${x - 70},${top - 14} ${x - 66},${top - 22}H${x + 66}C${x + 70},${top - 14} ${x + 60},${top - 4} ${x + 48},${top}Z"/>`
    out += `<rect class="stone" x="${x - 72}" y="${top - 38}" width="144" height="16"/>`
    out += `<path class="th" d="M${x - 47},${top + 6}H${x + 47}M${x - 47},${top + 10}H${x + 47}M${x - 47},${top + 14}H${x + 47}"/>`
  }
  // Stylobate.
  out += `<rect class="stone" x="${x - 84}" y="${top + h}" width="168" height="14"/><rect class="stone" x="${x - 102}" y="${top + h + 14}" width="204" height="14"/>`
  return out
}

function temple(): string {
  const y0 = -38 // top of the abacus
  const L = -112
  const R = 270
  const jag = `${R - 26},${y0 - 132}L${R - 6},${y0 - 110}L${R - 30},${y0 - 88}L${R - 14},${y0 - 64}L${R - 40},${y0 - 36}L${R - 24},${y0}`
  const clip = `M${L},${y0 - 132}H${R - 26}L${jag}H${L}Z`
  const ent = [
    // architrave with fasciae
    `<rect class="stone" x="${L}" y="${y0 - 40}" width="${R - L}" height="40"/>`,
    `<path class="th" d="M${L},${y0 - 14}H${R}M${L},${y0 - 27}H${R}"/>`,
    // running meander, scrolling like a data bus
    `<rect class="stone" x="${L}" y="${y0 - 64}" width="${R - L}" height="24"/>`,
    `<g class="meander"><rect x="${L - 24}" y="${y0 - 64}" width="${R - L + 48}" height="24" fill="url(#key)"/></g>`,
    // frieze with the Delphic maxim
    `<rect class="stone" x="${L}" y="${y0 - 114}" width="${R - L}" height="50"/>`,
    `<text class="insc" x="${(L + R) / 2 - 18}" y="${y0 - 81}" text-anchor="middle">ΓΝΩΘΙ ΣΑΥΤΟΝ</text>`,
    // cornice and dentils
    `<rect class="stone" x="${L - 8}" y="${y0 - 132}" width="${R - L + 16}" height="18"/>`,
    `<path class="tk" d="M${L - 8},${y0 - 120}H${R}" stroke-width="7" stroke-dasharray="5 5"/>`,
  ].join('')
  return [
    `<clipPath id="entClip"><path d="${clip}"/></clipPath>`,
    `<g clip-path="url(#entClip)">${ent}</g>`,
    `<path class="ln" d="M${R - 26},${y0 - 132}L${jag}"/>`,
    column(0, 0, 600, false),
    column(252, 210, 390, true),
    `<text class="lbl" x="-96" y="660">ΔΕΛΦΟΙ · ΝΑΟΣ · III</text>`,
  ].join('')
}

// ---------------------------------------------------------------- sparkles
const SPARKS: Array<[number, number, number]> = [
  [980, 150, 1], [1500, 690, 0.8], [640, 92, 0.7], [1458, 96, 0.9], [300, 110, 0.75], [1180, 770, 0.6],
]

function sparkles(): string {
  return SPARKS.map(
    ([x, y, s], i) =>
      `<g transform="translate(${x},${y}) scale(${s})"><path class="spark" style="animation-delay:${-i * 1.3}s" d="M0,-12L1.6,-1.6L12,0L1.6,1.6L0,12L-1.6,1.6L-12,0L-1.6,-1.6Z"/></g>`,
  ).join('')
}

// ---------------------------------------------------------------- style
const STYLE = `
:root{--bg0:#0d0d24;--bg1:#1a1a63;--glow:#0000f2;--ink:#a9a9ff;--line:#7474f2;--dot:#2a2aff;--metal:#10103a;--stone:#101030;--txt:#b4b4ff;--art:.92}
@media (prefers-color-scheme:light){:root{--bg0:#e8e8f2;--bg1:#fbfbff;--glow:#9a9aff;--ink:#1b1bc4;--line:#4848e0;--dot:#5a5aff;--metal:#e4e4f7;--stone:#ececf7;--txt:#1717a8;--art:.62}}
.c0{stop-color:var(--bg0)}.c1{stop-color:var(--bg1)}.cg{stop-color:var(--glow)}
.ln{fill:none;stroke:var(--ink);stroke-width:.8}
.th{fill:none;stroke:var(--line);stroke-width:.5}
.tk{fill:none;stroke:var(--line)}
.body{fill:var(--metal);fill-opacity:.85;stroke:var(--ink);stroke-width:.9;fill-rule:evenodd}
.stone{fill:var(--stone);fill-opacity:.9;stroke:var(--ink);stroke-width:.8}
.hatch{fill:none;stroke:var(--line);stroke-width:.6;opacity:.7}
.gl{fill:var(--txt);font:14px Georgia,'Times New Roman',serif}
.insc{fill:var(--txt);font:22px Georgia,'Times New Roman',serif;letter-spacing:7px}
.lbl{fill:var(--txt);font:10px ui-monospace,'Cascadia Mono',Consolas,monospace;letter-spacing:3px;opacity:.7}
.fd{fill:var(--dot)}
.ray{fill:none;stroke:var(--line);stroke-width:.6;opacity:.55;animation:breathe 9s ease-in-out infinite}
.ray.faint{opacity:.3;animation-duration:13s}
.trace{fill:none;stroke:var(--line);stroke-width:.9;opacity:.6}
.pulse{fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-dasharray:14 620;animation:pulse 8.5s linear infinite}
.node{fill:var(--bg0);stroke:var(--ink);stroke-width:1}
.leaf{fill:var(--metal);stroke:var(--ink);stroke-width:.7}
.spark{fill:var(--ink);transform-origin:0 0;animation:twinkle 7s ease-in-out infinite}
.planet{fill:var(--ink)}
.art{opacity:var(--art)}
.spin{transform-origin:0 0}
.slow{transform-origin:0 0;animation:ccw 900s linear infinite}
.rays{transform-origin:0 0;animation:cw 1400s linear infinite}
.meander{animation:scroll 6s linear infinite}
.drift{animation:drift 14s linear infinite}
.sweep{animation:sweep 16s ease-in-out infinite}
#mech{transform:translate(1250px,330px)}
#temple{transform:translate(150px,370px)}
@media (min-aspect-ratio:2/1){#mech{transform:translate(1290px,420px) scale(.8)}#temple{transform:translate(170px,400px) scale(.82)}}
@media (max-aspect-ratio:5/4){#mech{transform:translate(1120px,280px) scale(.78)}#temple{transform:translate(260px,400px) scale(.8)}}
@media (max-aspect-ratio:3/4){#mech{transform:translate(800px,190px) scale(.5)}#temple{display:none}}
@keyframes cw{to{transform:rotate(360deg)}}
@keyframes ccw{to{transform:rotate(-360deg)}}
@keyframes breathe{0%,100%{opacity:.3}50%{opacity:.6}}
@keyframes pulse{from{stroke-dashoffset:634}to{stroke-dashoffset:0}}
@keyframes twinkle{0%,62%,100%{opacity:0;transform:scale(.3)}72%{opacity:1;transform:scale(1)}84%{opacity:.2;transform:scale(.6)}}
@keyframes scroll{to{transform:translateX(-24px)}}
@keyframes drift{to{transform:translate(-8px,-8px)}}
@keyframes sweep{0%{transform:translateY(0)}75%,100%{transform:translateY(1360px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`.trim()

// ---------------------------------------------------------------- assembly
const DEFS = [
  `<radialGradient id="bgG" cx="78%" cy="28%" r="80%"><stop offset="0" class="c1"/><stop offset=".75" class="c0"/></radialGradient>`,
  `<radialGradient id="glowG"><stop offset="0" class="cg" stop-opacity=".42"/><stop offset="1" class="cg" stop-opacity="0"/></radialGradient>`,
  `<radialGradient id="vigG" r="75%"><stop offset=".55" class="c0" stop-opacity="0"/><stop offset="1" class="c0" stop-opacity=".85"/></radialGradient>`,
  `<radialGradient id="fadeG"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".55" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
  `<radialGradient id="coreG"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
  `<linearGradient id="sweepG" x2="0" y2="1"><stop offset="0" class="cg" stop-opacity="0"/><stop offset=".5" class="cg" stop-opacity=".16"/><stop offset="1" class="cg" stop-opacity="0"/></linearGradient>`,
  `<linearGradient id="fieldG" x1="1" y1="0" x2=".2" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  `<pattern id="d1" width="8" height="8" patternUnits="userSpaceOnUse"><circle class="fd" cx="4" cy="4" r="1.05"/></pattern>`,
  `<pattern id="d2" width="8" height="8" patternUnits="userSpaceOnUse"><circle class="fd" cx="4" cy="4" r="2.3"/></pattern>`,
  `<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect class="fd" width="4" height="1"/></pattern>`,
  `<pattern id="key" width="24" height="24" x="0" y="-102" patternUnits="userSpaceOnUse"><path class="ln" style="stroke-width:1.6" d="M2,22V3H21V18H9V10H15M0,22.5H24"/></pattern>`,
  `<mask id="fadeM" maskContentUnits="userSpaceOnUse"><circle r="360" fill="url(#fadeG)"/></mask>`,
  `<mask id="coreM" maskContentUnits="userSpaceOnUse"><circle r="230" fill="url(#coreG)"/></mask>`,
  `<mask id="fieldM" maskContentUnits="userSpaceOnUse"><rect width="1600" height="1000" fill="url(#fieldG)"/></mask>`,
  `<path id="leaf" class="leaf" d="M0,0C4,-5 4.5,-13 0,-19C-4.5,-13 -4,-5 0,0Z"/>`,
].join('')

const MECH = [
  `<circle r="520" fill="url(#glowG)"/>`,
  `<circle r="360" fill="url(#d1)" mask="url(#fadeM)"/>`,
  `<circle r="230" fill="url(#d2)" mask="url(#coreM)" opacity=".5"/>`,
  `<g class="rays">${rays()}</g>`,
  `<g transform="rotate(20)"><path id="orb" class="th" stroke-dasharray="2 5" d="M-400,0A400,100 0 1 0 400,0A400,100 0 1 0 -400,0"/><circle class="planet" r="4"><animateMotion dur="90s" repeatCount="indefinite"><mpath href="#orb"/></animateMotion></circle></g>`,
  traces(),
  laurel(),
  `<g class="slow">${dial()}</g>`,
  placeGear(g1, 4),
  placeGear(g4, 4),
  placeGear(g2, 5),
  placeGear(g3, 3),
  `<text class="lbl" y="372" text-anchor="middle">ΜΗΧΑΝΙΣΜΟΣ · FR. A · 0x96</text>`,
].join('')

export const SCENE: string = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">`,
  `<style>${STYLE}</style>`,
  `<defs>${DEFS}</defs>`,
  `<rect width="1600" height="1000" fill="url(#bgG)"/>`,
  `<circle cx="120" cy="980" r="520" fill="url(#glowG)" opacity=".45"/>`,
  `<g mask="url(#fieldM)"><g class="drift"><rect width="1620" height="1020" fill="url(#d1)"/></g></g>`,
  `<g class="art">`,
  `<g id="temple">${temple()}</g>`,
  `<g id="mech">${MECH}</g>`,
  sparkles(),
  `</g>`,
  `<rect width="1600" height="1000" fill="url(#scan)" opacity=".05"/>`,
  `<rect class="sweep" y="-200" width="1600" height="200" fill="url(#sweepG)"/>`,
  `<rect width="1600" height="1000" fill="url(#vigG)"/>`,
  `</svg>`,
].join('')

export const SCENE_ALT =
  'An engraved bronze gear mechanism turning slowly behind a dial of Greek letters, wired to glowing circuit traces, beside a ruined Doric column inscribed "Know thyself", in electric cobalt on indigo night.'
