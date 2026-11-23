// Resume content. Used by the Resume tab on the site and by scripts/build-resume.mjs
// to generate the downloadable PDF and DOCX. Edit here, then run `npm run resume`.

export const RESUME = {
  name: 'Rajnandini Chavan',
  title: 'UI/UX & Visual Designer · 3D & Character Artist',
  location: 'Pune, India · open to remote or on-site in Pune',
  contact: {
    email: 'rajnandinichavan612@gmail.com',
    phone: '+91 93737 77294',
    portfolio: 'ojaseminem.github.io/nancys-portfolio',
    portfolioUrl: 'https://ojaseminem.github.io/nancys-portfolio/?ref=resume',
    artstation: 'artstation.com/rajnandinichavan1',
    artstationUrl: 'https://www.artstation.com/rajnandinichavan1',
    behance: 'behance.net/rajnandchavan1',
    behanceUrl: 'https://www.behance.net/rajnandchavan1',
  },
  summary:
    'UI/UX and visual designer who pairs an illustrator’s eye with a structured, systems-first way of working. Designs product interfaces, icon sets and brand identities, builds the design systems behind them, and hands off clean, production-ready files. Brings 3D modelling, animation and tactile design to projects that need more than a screen.',

  experience: [
    {
      org: 'Gaint Media Pvt. Ltd.',
      place: 'Pune',
      role: 'Freelance Designer',
      dates: 'Dec 2025 – Jul 2026',
      projects: [
        {
          name: 'Bamzee',
          points: [
            'Designed a custom illustration-style icon set for featured sections, giving the brand a distinctive visual language.',
            'Contributed to the landing page redesign, strengthening visual hierarchy and overall presentation.',
            'Helped build and refine the design system to keep components and interfaces consistent across the product.',
          ],
        },
        {
          name: 'Ruskin ChemPharma',
          points: [
            'Created custom illustrations and iconography aligned with the pharmaceutical brand’s identity.',
            'Delivered exhibition booth graphics end to end, keeping every element visually consistent.',
            'Produced supporting collateral (visiting cards, banners, brochures and promotional material) for one cohesive brand across print and exhibition.',
          ],
        },
        {
          name: 'HD Trade Platform',
          points: [
            'Redesigned a MetaTrader-based financial trading platform, focusing on interface clarity, usability and overall user experience.',
            'Built a full design system of reusable components, styles and guidelines for consistent implementation and smooth developer handoff.',
            'Designed the platform’s logo and visual identity across the product interface and supporting digital assets.',
          ],
        },
      ],
    },
    {
      org: 'impress',
      place: 'Remote',
      role: 'Graphic Designer / Clothing Designer',
      dates: 'May 2025 – Jul 2025',
      points: [
        'Worked in the mass clothing customisation team as a product assistant, turning customer briefs into production-ready designs.',
        'Prepared technically sound files and setups so orders could move straight into production and roll out to clients.',
        'Delivered polished artwork across top-wear and bottom-wear, specialising in hoodies and jackets.',
        'Learned StitchX quickly, scoring 95% in the one-month training and topping the batch.',
      ],
    },
    {
      org: 'Aira The Way of Life',
      role: 'Freelance UI Designer',
      dates: 'May 2024 – Jun 2025',
      projects: [
        {
          name: 'Website design',
          points: [
            'Worked with stakeholders to align the website with the brand’s vision and objectives.',
            'Designed and delivered, with the team, a visually rich website that strengthened Aira’s online presence and user engagement.',
          ],
        },
      ],
    },
    {
      org: 'Initiative Seva Foundation',
      place: 'Pune',
      role: 'Freelance Designer',
      dates: 'May 2024 – Jan 2025',
      projects: [
        {
          name: 'Tactile storytelling for visually impaired children',
          points: [
            'Designed tactile 3D wooden panels of The Hare and the Tortoise for a multisensory hallway, so visually impaired children can explore the story through touch.',
            'Prototyped a trial rabbit panel, testing hair textures and tactile contrast to sharpen sensory engagement.',
            'Produced six final story panels with distinct shapes and spatial depth, laying the groundwork for future panels on Indian civilisation and cultural heritage.',
          ],
        },
        {
          name: 'Creative drawing and digital art course',
          points: [
            'Designed a foundational art syllabus for children aged 8 to 16, covering traditional drawing and digital tools.',
            'The programme’s success led to its adoption across multiple orphanages in Pune and Bengaluru.',
          ],
        },
      ],
    },
    {
      org: 'Creator’s Media Entertainment Pvt. Ltd.',
      role: 'UI/UX Design Intern',
      dates: 'Aug 2024 – Nov 2024',
      points: ['Assisted in designing intuitive interfaces for digital platforms, improving usability and user satisfaction.'],
      projects: [
        {
          name: '3D modelling and animation',
          points: [
            'Produced a 3D animation communicating biodiversity conservation for a mobile exhibition van initiated by the Maharashtra State Biodiversity Board.',
          ],
        },
      ],
    },
  ],

  skills: [
    { group: 'UI/UX', items: ['Interface design', 'Design systems', 'Landing pages', 'Usability', 'Developer handoff'] },
    { group: 'Visual & brand', items: ['Iconography', 'Illustration', 'Logo & identity', 'Exhibition graphics', 'Print collateral'] },
    { group: '3D & motion', items: ['3D modelling', 'Sculpting & retopology', 'Texturing', 'Animation', 'Tactile & physical design'] },
    { group: 'Tools', items: ['Blender', 'ZBrush', 'StitchX'] },
  ],
};

export const RESUME_FILES = {
  pdf: './resume/Rajnandini-Chavan-Resume.pdf',
  docx: './resume/Rajnandini-Chavan-Resume.docx',
};
