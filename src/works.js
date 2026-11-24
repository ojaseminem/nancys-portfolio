// All portfolio projects live here. The Works cards and the project viewer are both built from this list.
//
// media item types:
//   { type: 'image',   src, alt, caption }
//   { type: 'video',   src, poster, caption }          self-hosted mp4
//   { type: 'youtube', id, poster, caption }           embedded only after the visitor presses play

const A = './assets/works/';

export const PROJECTS = [
  {
    id: 'solorize',
    featured: true,
    title: 'Solorize',
    tag: 'UI/UX case study · Mobile app',
    filters: ['ui'],
    desc: 'A mobile app for planning and monitoring home solar systems. Designed the full flow in Figma: sign-in and OTP, a live energy dashboard, a system-size estimator, usage statistics, notifications, battery settings and service booking.',
    cover: `${A}solorize-cover.webp`,
    hover: `${A}solorize-screens.webp`,
    link: { href: 'https://www.behance.net/rajnandchavan1', label: 'More on Behance', icon: 'behance' },
    media: [
      { type: 'image', src: `${A}solorize-cover.webp`, alt: 'Four Solorize app screens: login, home dashboard, system estimator and statistics.', caption: 'Solorize. Dark interface with a lime accent for energy and action.' },
      { type: 'image', src: `${A}solorize-screens.webp`, alt: 'Key Solorize screens shown at full length.', caption: 'Key screens at full length: login, dashboard, design my system, weekly statistics.' },
      { type: 'image', src: `${A}solorize-home.webp`, alt: 'Solorize home dashboard with weather, panel count, status and an energy production gauge.', caption: 'Home dashboard. Live production gauge with status, capacity and daily cost at a glance.' },
      { type: 'image', src: `${A}solorize-login.webp`, alt: 'Solorize login screen with email and password fields.', caption: 'Sign-in. Clear hierarchy and one primary action.' },
    ],
  },
  {
    id: 'murder-mystery',
    featured: true,
    title: 'The Last Jewel of Peshwa',
    tag: 'Client work · The Tiebreakers Club',
    filters: ['game', '2d'],
    desc: 'A murder mystery game for The Tiebreakers Club, a Pune gaming community. Designed the complete visual graphics, thematic illustrations and game assets that carry the mystery, with one cohesive identity across the event.',
    cover: `${A}mystery-cover.webp`,
    link: { href: 'https://www.youtube.com/watch?v=wQ2zmSk6-lI', label: 'Watch on YouTube', icon: 'youtube' },
    media: [
      { type: 'youtube', id: 'wQ2zmSk6-lI', poster: `${A}mystery-cover.webp`, caption: 'Project film. The game, its components and how it plays.' },
    ],
  },
  {
    id: 'meta-quest',
    featured: true,
    title: 'Meta Quest 3 Campaign',
    tag: 'College project · 3D product visualisation',
    filters: ['3d', 'motion'],
    desc: 'A college project: a concept campaign for the Meta Quest 3. Modelled the headset, controllers and a lived-in room set in Blender, then lit, animated and rendered the product shots and two short films.',
    cover: `${A}meta-explode-b.webp`,
    hover: `${A}meta-front.webp`,
    link: { href: 'https://www.youtube.com/watch?v=miQX34ESRho', label: 'Watch on YouTube', icon: 'youtube' },
    media: [
      { type: 'youtube', id: 'miQX34ESRho', poster: `${A}meta-explode-b.webp`, caption: 'Campaign film, part one.' },
      { type: 'youtube', id: 'lOjsx8v0duY', poster: `${A}meta-lenses.webp`, caption: 'Campaign film, part two.' },
      { type: 'image', src: `${A}meta-final-renders.webp`, alt: 'Grid of final renders of the Meta Quest 3 headset: front, side, exploded views and lens close-ups.', caption: 'Final renders. Hero, exploded and lens close-up shots.' },
      { type: 'image', src: `${A}meta-intro-wip.webp`, alt: 'Blender viewport screenshots of the headset, controllers and a portal ring model.', caption: 'Intro shots in progress. Headset, controllers and the portal ring in Blender.' },
      { type: 'image', src: `${A}meta-room-wip.webp`, alt: 'Blender viewport screenshots of a modelled living room with balcony, sofa, shelves and lamps.', caption: 'Room set in progress. Modelled environment for the in-home scenes.' },
    ],
  },
  {
    id: 'ursula',
    title: 'Ursula',
    tag: '3D character · Fan art',
    filters: ['3d'],
    desc: 'A stylised take on the sea witch. Sculpted, retopologised for clean deformation, then lit and rendered in an underwater scene.',
    cover: `${A}ursula-thumb.webp`,
    hover: `${A}ursula-process-thumb.webp`,
    link: { href: 'https://www.artstation.com/artwork/Z0P43x', label: 'View on ArtStation', icon: 'artstation' },
    media: [
      { type: 'image', src: `${A}ursula-render.webp`, alt: 'Final render of Ursula seated in a shell throne, holding a golden trident.', caption: 'Final render. Lit for an underwater scene with a shaft of light from above.' },
      { type: 'image', src: `${A}ursula-sculpt.webp`, alt: 'Grey sculpt of Ursula: four face angles and a full-body T-pose.', caption: 'Sculpt. Face and expression studies with the full body blocked out in T-pose.' },
      { type: 'image', src: `${A}ursula-topology.webp`, alt: 'Wireframe views of the posed Ursula model and close-ups of the face topology.', caption: 'Topology. Retopologised mesh with clean edge flow around the face, hands and tentacles.' },
      { type: 'image', src: `${A}ursula-throne.webp`, alt: 'Shell throne shown as a wireframe model and as the final textured, glowing asset.', caption: 'Shell throne. Low-poly model and the hand-painted, glowing final.' },
    ],
  },
  {
    id: 'ac-ui',
    title: "Assassin's Creed Odyssey UI Study",
    tag: 'Game UI · Recreation study',
    filters: ['ui', 'game'],
    desc: 'The Odyssey inventory screen rebuilt in Figma as modular components: navigation tabs, resource bar, rarity item slots, alert and level badges, stat blocks and key prompts.',
    cover: `${A}acui-thumb.webp`,
    hover: `${A}acui-process-thumb.webp`,
    link: { href: 'https://www.behance.net/rajnandchavan1', label: 'More on Behance', icon: 'behance' },
    media: [
      { type: 'compare', before: `${A}acui-reference.webp`, after: `${A}acui-recreation.webp`, thumb: `${A}acui-compare.webp`, beforeAlt: 'Original in-game Assassin\'s Creed Odyssey inventory screen.', afterAlt: 'Her recreation of the inventory screen in Figma.', beforeLabel: 'Reference · in game', afterLabel: 'Recreation · Figma', caption: 'Reference vs recreation. Drag the line to compare the in-game screen with her Figma rebuild.' },
      { type: 'image', src: `${A}acui-recreation.webp`, alt: 'Recreated Assassin\'s Creed Odyssey inventory screen with Kassandra, gear slots and stats.', caption: 'Recreation. The full inventory screen rebuilt in Figma.' },
      { type: 'image', src: `${A}acui-sheet.webp`, alt: 'UI kit sheet of the recreated components: tabs, resources, item slots, badges, stats and prompts.', caption: 'UI kit. Every element split into a reusable component.' },
    ],
  },
  {
    id: 'blossom-lamp',
    title: 'Blossom Lamp',
    tag: 'Stylised prop · Animation',
    filters: ['3d', 'motion'],
    desc: 'A toon-shaded lamp that grows from a lotus bud into twin glowing blooms. Built and animated as a short looping reveal.',
    cover: `${A}blossom-lamp-thumb.webp`,
    hoverVideo: `${A}blossom-lamp.mp4`,
    link: { href: 'https://www.artstation.com/rajnandinichavan1', label: 'View on ArtStation', icon: 'artstation' },
    media: [
      { type: 'video', src: `${A}blossom-lamp.mp4`, poster: `${A}blossom-lamp.webp`, caption: 'Growth animation. Vines climb from the bud and the blooms light up.' },
      { type: 'image', src: `${A}blossom-lamp.webp`, alt: 'The finished lamp: twisting green vines on an amber base, ending in two cream bell-shaped glowing blooms.', caption: 'Final model. The full lamp at the end of the animation.' },
    ],
  },
  {
    id: 'swan',
    title: 'Swan & Lotus Relief',
    tag: '3D prop · Sculpt & texture',
    filters: ['3d'],
    desc: 'A carved stone panel of twin swans over a lotus. Breakdown from clean sculpt through moss and wear to the glowing final.',
    cover: `${A}swan-thumb.webp`,
    hover: `${A}swan-process-thumb.webp`,
    link: { href: 'https://www.artstation.com/artwork/AoQdyW', label: 'View on ArtStation', icon: 'artstation' },
    media: [
      { type: 'image', src: `${A}swan-final.webp`, alt: 'Carved stone relief of two swans around a glowing lotus.', caption: 'Final. Weathered stone with moss and a glowing lotus at the heart of the carving.' },
      { type: 'image', src: `${A}swan-breakdown.webp`, alt: 'Four stages of the relief side by side, from bare sculpt to final glowing version.', caption: 'Breakdown. Base sculpt, moss pass, wear and grime, then the emissive lotus.' },
    ],
  },
  {
    id: 'vaishnavi',
    title: 'Vaishnavi',
    tag: '2D character · Costume design',
    filters: ['2d'],
    desc: 'A wanderer between dream-worlds. Costume pulls from woven tribal borders and utility cargo cuts.',
    cover: './assets/character-1200.webp',
    coverFit: 'top',
    link: { href: 'https://www.artstation.com/rajnandinichavan1', label: 'View on ArtStation', icon: 'artstation' },
    media: [
      { type: 'image', src: './assets/character-2000.webp', alt: 'Full-body character design of Vaishnavi.', caption: 'Costume built on hand-woven tribal borders, cargo silhouettes and a sleeveless layered top.' },
    ],
  },
];

export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'ui', label: 'UI/UX' },
  { id: '3d', label: '3D' },
  { id: 'game', label: 'Game' },
  { id: 'motion', label: 'Motion' },
  { id: '2d', label: '2D' },
];

/** "2 films · 3 images" style summary of a project's media. */
export function mediaSummary(project) {
  const n = (t) => project.media.filter((m) => m.type === t).length;
  const videos = n('video') + n('youtube');
  const images = n('image');
  const parts = [];
  if (videos) parts.push(`${videos} ${videos === 1 ? 'video' : 'videos'}`);
  if (images) parts.push(`${images} ${images === 1 ? 'image' : 'images'}`);
  return parts.join(' · ');
}
