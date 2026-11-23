// All portfolio projects live here. The Works cards and the project viewer are both built from this list.
//
// media item types:
//   { type: 'image',   src, alt, caption }
//   { type: 'video',   src, poster, caption }          self-hosted mp4
//   { type: 'youtube', id, poster, caption }           embedded only after the visitor presses play

const A = './assets/works/';

export const PROJECTS = [
  {
    id: 'murder-mystery',
    featured: true,
    title: 'The Last Jewel of Peshwa',
    tag: 'Client work · Murder mystery board game',
    filters: ['game', '2d'],
    desc: 'A murder mystery board game designed for a client: the case, its clues and suspects, and the visual design of the board, cards and printed components. Watch the project film.',
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
