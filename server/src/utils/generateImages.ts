import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads');
const THUMBS_DIR = path.join(UPLOADS_DIR, 'thumbnails');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });

interface GarmentVisual {
  filename: string;
  category: string;
  name: string;
  colorName: string;
  bgHex: string;
  accentHex: string;
  svgIcon: string;
}

const garments: GarmentVisual[] = [
  {
    filename: 'placeholder-tops.png',
    category: 'Tops',
    name: 'Minimalist Cotton Tee',
    colorName: 'Black and White',
    bgHex: '#242424',
    accentHex: '#FAF7F2',
    svgIcon: `
      <path d="M120 180 L180 140 L240 180 L220 230 L195 215 L195 380 L105 380 L105 215 L80 230 Z" fill="#FAF7F2" />
      <path d="M135 140 C145 160 155 160 165 140" fill="none" stroke="#242424" stroke-width="6" />
    `,
  },
  {
    filename: 'placeholder-bottoms.png',
    category: 'Bottoms',
    name: 'Tailored Chinos and Denim',
    colorName: 'Beige and Navy',
    bgHex: '#E7DFD5',
    accentHex: '#64172D',
    svgIcon: `
      <path d="M110 140 L190 140 L210 380 L160 380 L150 240 L140 380 L90 380 Z" fill="#64172D" />
      <line x1="110" y1="170" x2="190" y2="170" stroke="#FAF7F2" stroke-width="4" />
    `,
  },
  {
    filename: 'placeholder-footwear.png',
    category: 'Footwear',
    name: 'Leather Low Sneakers',
    colorName: 'Clean White',
    bgHex: '#FAF7F2',
    accentHex: '#64172D',
    svgIcon: `
      <path d="M90 260 C90 230 140 220 180 230 L220 270 C240 280 260 290 260 310 L260 330 L80 330 L80 290 Z" fill="#64172D" />
      <rect x="75" y="325" width="190" height="15" rx="5" fill="#242424" />
      <circle cx="150" cy="265" r="4" fill="#FAF7F2" />
      <circle cx="170" cy="275" r="4" fill="#FAF7F2" />
    `,
  },
  {
    filename: 'placeholder-outerwear.png',
    category: 'Outerwear',
    name: 'Wool Layer Overshirt',
    colorName: 'Deep Navy',
    bgHex: '#1E293B',
    accentHex: '#E7DFD5',
    svgIcon: `
      <path d="M100 150 L150 130 L200 150 L240 250 L200 265 L185 220 L185 380 L115 380 L115 220 L100 265 L60 250 Z" fill="#E7DFD5" />
      <line x1="150" y1="130" x2="150" y2="380" stroke="#1E293B" stroke-width="4" />
      <circle cx="150" cy="200" r="5" fill="#1E293B" />
      <circle cx="150" cy="250" r="5" fill="#1E293B" />
      <circle cx="150" cy="300" r="5" fill="#1E293B" />
    `,
  },
  {
    filename: 'placeholder-accessories.png',
    category: 'Accessories',
    name: 'Matte Chrono Watch',
    colorName: 'Charcoal and Gold',
    bgHex: '#F5EFE6',
    accentHex: '#242424',
    svgIcon: `
      <rect x="135" y="110" width="30" height="280" rx="6" fill="#64172D" />
      <circle cx="150" cy="250" r="55" fill="#242424" stroke="#FAF7F2" stroke-width="8" />
      <line x1="150" y1="250" x2="150" y2="215" stroke="#FAF7F2" stroke-width="4" stroke-linecap="round" />
      <line x1="150" y1="250" x2="175" y2="250" stroke="#FAF7F2" stroke-width="4" stroke-linecap="round" />
    `,
  },
];

const inspirations = [
  { id: 'insp-1', title: 'Minimalist Monday', color: '#1C1917', text: 'CLEAN CAPSULE' },
  { id: 'insp-2', title: 'Street Style Edge', color: '#64172D', text: 'URBAN SILHOUETTE' },
  { id: 'insp-3', title: 'Old Money Elegance', color: '#78350F', text: 'QUIET LUXURY' },
  { id: 'insp-4', title: 'Casual Friday Vibes', color: '#3B82F6', text: 'RELAXED TAILORING' },
  { id: 'insp-5', title: 'Korean Street Fashion', color: '#4F46E5', text: 'BOXED DRAPES' },
  { id: 'insp-6', title: 'Summer Breeze', color: '#0D9488', text: 'AIRY LINEN' },
  { id: 'insp-7', title: 'Winter Layering', color: '#334155', text: 'HEAVY KNITS' },
  { id: 'insp-8', title: 'Sporty Chic', color: '#16A34A', text: 'ATHLEISURE' },
  { id: 'insp-9', title: 'Vintage Revival', color: '#B45309', text: 'RETRO 90s' },
  { id: 'insp-10', title: 'Smart Casual Perfection', color: '#831843', text: 'BLAZER ESSENTIALS' },
  { id: 'insp-11', title: 'Monochrome Magic', color: '#18181B', text: 'ALL BLACK TONAL' },
  { id: 'insp-12', title: 'Earth Tones Collection', color: '#57534E', text: 'TERRACOTTA AND OLIVE' },
];

async function generateImages() {
  console.log('Generating high-resolution garment & inspiration visuals...');

  // 1. Generate Garments
  for (const g of garments) {
    const svg = `
      <svg width="600" height="600" viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${g.bgHex}" />
            <stop offset="100%" stop-color="#18181B" stop-opacity="0.9" />
          </linearGradient>
        </defs>
        <rect width="300" height="500" rx="30" fill="url(#bgGrad)" />
        <circle cx="150" cy="250" r="120" fill="none" stroke="${g.accentHex}" stroke-opacity="0.1" stroke-width="2" />
        <circle cx="150" cy="250" r="160" fill="none" stroke="${g.accentHex}" stroke-opacity="0.05" stroke-width="1" />
        ${g.svgIcon}
        <text x="150" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="#FAF7F2" text-anchor="middle" letter-spacing="1">
          ${g.category.toUpperCase()}
        </text>
        <text x="150" y="465" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#E0D5C4" text-anchor="middle">
          ${g.name}
        </text>
      </svg>
    `;

    const outPath = path.join(UPLOADS_DIR, g.filename);
    const thumbPath = path.join(THUMBS_DIR, `thumb-${g.filename}`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outPath);

    await sharp(outPath)
      .resize(300, 300, { fit: 'cover' })
      .toFile(thumbPath);

    console.log(`✓ Created ${g.filename}`);
  }

  // 2. Generate Inspiration Lookbooks
  for (const insp of inspirations) {
    const svg = `
      <svg width="600" height="800" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="inspGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${insp.color}" />
            <stop offset="100%" stop-color="#09090B" />
          </linearGradient>
        </defs>
        <rect width="300" height="400" rx="20" fill="url(#inspGrad)" />
        <rect x="20" y="20" width="260" height="360" rx="15" fill="none" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1.5" />
        <text x="35" y="60" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#E2E8F0" letter-spacing="3">
          FITSYNC EDITORIAL
        </text>
        <circle cx="150" cy="180" r="60" fill="none" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1" />
        <polygon points="150,135 185,210 115,210" fill="#FFFFFF" fill-opacity="0.25" />
        <text x="35" y="320" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF">
          ${insp.title}
        </text>
        <text x="35" y="345" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#CBD5E1" letter-spacing="1">
          ${insp.text}
        </text>
      </svg>
    `;

    const filename = `${insp.id}.png`;
    const outPath = path.join(UPLOADS_DIR, filename);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outPath);
  }

  console.log('✓ All inspiration visuals generated!');
}

generateImages().catch(console.error);
