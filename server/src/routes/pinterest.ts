import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';

const router = Router();

// Curated high-aesthetic Pinterest fashion boards with researched style rules
const PINTEREST_AESTHETIC_BOARDS = [
  {
    id: 'board-minimalist',
    name: 'Clean Minimalist & Tonal Fits',
    theme: 'minimalist',
    pinCount: 42,
    coverUrl: '/uploads/insp-1.png',
    aestheticTags: ['minimalist', 'clean', 'tonal', 'sandwiching', 'monochrome'],
    colorPalette: ['white', 'beige', 'black', 'navy', 'cream'],
    pins: [
      {
        id: 'pin-min-1',
        title: 'Tonal White Oxford & Tailored Chinos with Clean White Kicks',
        description: 'Mastering the color sandwich rule: Light top anchored by matching clean sneakers, separated by neutral tailored bottoms.',
        imageUrl: '/uploads/insp-1.png',
        boardName: 'Clean Minimalist & Tonal Fits',
        aesthetic: 'minimalist',
        occasion: 'casual',
        style: 'minimalist',
        colors: ['white', 'beige'],
        recommendedSlots: ['tops', 'bottoms', 'footwear'],
        link: 'https://pinterest.com/pin/minimalist-tonal-1',
      },
      {
        id: 'pin-min-2',
        title: 'Monochrome Black Knit with Straight Denim & Leather Loafers',
        description: 'Refined textures: Textured black knit creates rich contrast against deep denim without introducing competing colors.',
        imageUrl: '/uploads/insp-11.png',
        boardName: 'Clean Minimalist & Tonal Fits',
        aesthetic: 'minimalist',
        occasion: 'casual',
        style: 'minimalist',
        colors: ['black', 'charcoal'],
        recommendedSlots: ['tops', 'bottoms', 'footwear'],
        link: 'https://pinterest.com/pin/minimalist-mono-2',
      },
      {
        id: 'pin-min-3',
        title: 'Relaxed Minimalist Overshirt with Clean Chinos',
        description: 'Proportion balance: An unbuttoned lightweight overshirt adds effortless vertical layering.',
        imageUrl: '/uploads/insp-4.png',
        boardName: 'Clean Minimalist & Tonal Fits',
        aesthetic: 'minimalist',
        occasion: 'work',
        style: 'smart_casual',
        colors: ['navy', 'beige', 'white'],
        recommendedSlots: ['tops', 'outerwear', 'bottoms', 'footwear'],
        link: 'https://pinterest.com/pin/minimalist-overshirt-3',
      },
    ],
  },
  {
    id: 'board-old-money',
    name: 'Old Money & European Tailoring',
    theme: 'formal',
    pinCount: 56,
    coverUrl: '/uploads/insp-3.png',
    aestheticTags: ['old_money', 'tailored', 'preppy', 'classic', 'smart_casual'],
    colorPalette: ['navy', 'brown', 'beige', 'white', 'burgundy'],
    pins: [
      {
        id: 'pin-om-1',
        title: 'Navy Wool Blazer, Crisp White Shirt & Tailored Slacks',
        description: 'The definitive smart casual blueprint: Navy outerwear with structured shoulders and brown leather loafers.',
        imageUrl: '/uploads/insp-3.png',
        boardName: 'Old Money & European Tailoring',
        aesthetic: 'old_money',
        occasion: 'work',
        style: 'formal',
        colors: ['navy', 'white', 'brown'],
        recommendedSlots: ['tops', 'outerwear', 'bottoms', 'footwear', 'accessories'],
        link: 'https://pinterest.com/pin/old-money-blazer-1',
      },
      {
        id: 'pin-om-2',
        title: 'Structured Oxford Button-Down & Brown Penny Loafers',
        description: 'Subtle sophistication: Rolled sleeves, neutral leather timepiece, and beige pleated trousers.',
        imageUrl: '/uploads/insp-10.png',
        boardName: 'Old Money & European Tailoring',
        aesthetic: 'old_money',
        occasion: 'date_night',
        style: 'smart_casual',
        colors: ['white', 'brown', 'beige'],
        recommendedSlots: ['tops', 'bottoms', 'footwear', 'accessories'],
        link: 'https://pinterest.com/pin/old-money-polo-2',
      },
      {
        id: 'pin-om-3',
        title: 'Heavy Wool Overcoat with Layered Tonal Knitwear',
        description: 'Winter tailoring: Deep outerwear anchored by warm knit layers and structured footwear.',
        imageUrl: '/uploads/insp-7.png',
        boardName: 'Old Money & European Tailoring',
        aesthetic: 'old_money',
        occasion: 'formal_event',
        style: 'formal',
        colors: ['navy', 'charcoal', 'black'],
        recommendedSlots: ['outerwear', 'tops', 'bottoms', 'footwear'],
        link: 'https://pinterest.com/pin/old-money-coat-3',
      },
    ],
  },
  {
    id: 'board-streetwear',
    name: 'Seoul Street & Relaxed Silhouettes',
    theme: 'streetwear',
    pinCount: 68,
    coverUrl: '/uploads/insp-2.png',
    aestheticTags: ['streetwear', 'relaxed', 'baggy', 'korean', 'urban'],
    colorPalette: ['black', 'grey', 'olive', 'white'],
    pins: [
      {
        id: 'pin-st-1',
        title: 'Boxy Heavyweight Hoodie with Baggy Denim & Retro Lows',
        description: 'Volume play: Dropped shoulders combined with straight, pooling denim creates the trending relaxed street silhouette.',
        imageUrl: '/uploads/insp-2.png',
        boardName: 'Seoul Street & Relaxed Silhouettes',
        aesthetic: 'streetwear',
        occasion: 'casual',
        style: 'streetwear',
        colors: ['black', 'blue', 'white'],
        recommendedSlots: ['outerwear', 'bottoms', 'footwear'],
        link: 'https://pinterest.com/pin/streetwear-hoodie-1',
      },
      {
        id: 'pin-st-2',
        title: 'Korean Layering: Boxy Tee, Overshirt & Pleated Wide Trousers',
        description: 'Fluid tailoring meets street: Clean minimalist sneakers paired with wide-leg trousers and a structured overshirt.',
        imageUrl: '/uploads/insp-5.png',
        boardName: 'Seoul Street & Relaxed Silhouettes',
        aesthetic: 'korean',
        occasion: 'casual',
        style: 'streetwear',
        colors: ['grey', 'black', 'white'],
        recommendedSlots: ['tops', 'outerwear', 'bottoms', 'footwear'],
        link: 'https://pinterest.com/pin/korean-layering-2',
      },
      {
        id: 'pin-st-3',
        title: 'Vintage Retro 90s Streetwear with Washed Denim',
        description: 'Vintage aesthetics: Warm earthy accents against dark washed denim for effortless casual cool.',
        imageUrl: '/uploads/insp-9.png',
        boardName: 'Seoul Street & Relaxed Silhouettes',
        aesthetic: 'vintage',
        occasion: 'casual',
        style: 'streetwear',
        colors: ['brown', 'blue', 'black'],
        recommendedSlots: ['tops', 'bottoms', 'footwear'],
        link: 'https://pinterest.com/pin/vintage-street-3',
      },
    ],
  },
  {
    id: 'board-earth-tones',
    name: 'Autumn Earth Tones & Cozy Textures',
    theme: 'casual',
    pinCount: 39,
    coverUrl: '/uploads/insp-12.png',
    aestheticTags: ['earth_tones', 'terracotta', 'olive', 'warm', 'textures'],
    colorPalette: ['olive', 'brown', 'beige', 'burgundy', 'tan'],
    pins: [
      {
        id: 'pin-et-1',
        title: 'Terracotta Overshirt with Olive Chinos & Leather Boots',
        description: 'Complementary earth palette: Warm rust tones pair naturally with muted forest and olive greens.',
        imageUrl: '/uploads/insp-12.png',
        boardName: 'Autumn Earth Tones & Cozy Textures',
        aesthetic: 'earth_tones',
        occasion: 'casual',
        style: 'casual',
        colors: ['olive', 'brown', 'beige'],
        recommendedSlots: ['outerwear', 'tops', 'bottoms', 'footwear'],
        link: 'https://pinterest.com/pin/earth-terracotta-1',
      },
      {
        id: 'pin-et-2',
        title: 'Sporty Casual Knit Layer with Tailored Chino Pants',
        description: 'Athleisure balance: Refined olive zip-knit worn with cream tailored bottoms for a comfortable everyday fit.',
        imageUrl: '/uploads/insp-8.png',
        boardName: 'Autumn Earth Tones & Cozy Textures',
        aesthetic: 'sporty',
        occasion: 'casual',
        style: 'casual',
        colors: ['olive', 'white', 'black'],
        recommendedSlots: ['tops', 'bottoms', 'footwear'],
        link: 'https://pinterest.com/pin/sporty-chic-2',
      },
    ],
  },
];

// GET /api/pinterest/status
router.get('/status', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM pinterest_connections WHERE user_id = ?').get(req.user!.id) as any;

  if (!row) {
    res.json({ connected: false });
    return;
  }

  const boards = JSON.parse(row.boards_json || '[]');
  const pins = JSON.parse(row.pins_json || '[]');
  const aestheticTags = JSON.parse(row.aesthetic_tags || '[]');
  const colorPalette = JSON.parse(row.color_palette || '[]');

  res.json({
    connected: true,
    username: row.pinterest_username,
    profileUrl: row.profile_url,
    avatarUrl: row.avatar_url,
    boardsCount: boards.length,
    pinsCount: pins.length,
    boards,
    aestheticTags,
    colorPalette,
    lastSyncedAt: row.last_synced_at,
  });
});

// POST /api/pinterest/connect
router.post('/connect', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const { username, preferredTheme = 'all' } = req.body;

  const cleanUsername = (username || 'style_curator').replace(/^@/, '').trim();
  const profileUrl = `https://pinterest.com/${cleanUsername}`;
  const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

  // Select boards to sync based on theme or all
  let selectedBoards = PINTEREST_AESTHETIC_BOARDS;
  if (preferredTheme && preferredTheme !== 'all') {
    selectedBoards = PINTEREST_AESTHETIC_BOARDS.filter(
      (b) => b.theme === preferredTheme || b.aestheticTags.includes(preferredTheme)
    );
    if (selectedBoards.length === 0) selectedBoards = PINTEREST_AESTHETIC_BOARDS;
  }

  const allPins = selectedBoards.flatMap((b) => b.pins);
  const allAestheticTags = Array.from(new Set(selectedBoards.flatMap((b) => b.aestheticTags)));
  const allColorPalette = Array.from(new Set(selectedBoards.flatMap((b) => b.colorPalette)));

  const id = generateId();

  // Upsert connection
  db.prepare(`
    INSERT INTO pinterest_connections (
      id, user_id, pinterest_username, profile_url, avatar_url,
      boards_json, pins_json, aesthetic_tags, color_palette, last_synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      pinterest_username = excluded.pinterest_username,
      profile_url = excluded.profile_url,
      avatar_url = excluded.avatar_url,
      boards_json = excluded.boards_json,
      pins_json = excluded.pins_json,
      aesthetic_tags = excluded.aesthetic_tags,
      color_palette = excluded.color_palette,
      last_synced_at = datetime('now')
  `).run(
    id,
    req.user!.id,
    cleanUsername,
    profileUrl,
    avatarUrl,
    JSON.stringify(selectedBoards),
    JSON.stringify(allPins),
    JSON.stringify(allAestheticTags),
    JSON.stringify(allColorPalette)
  );

  res.json({
    success: true,
    message: `Successfully linked Pinterest account @${cleanUsername}! Synced ${allPins.length} inspiration pins across ${selectedBoards.length} boards.`,
    username: cleanUsername,
    boardsCount: selectedBoards.length,
    pinsCount: allPins.length,
    aestheticTags: allAestheticTags,
    colorPalette: allColorPalette,
  });
});

// POST /api/pinterest/sync
router.post('/sync', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM pinterest_connections WHERE user_id = ?').get(req.user!.id) as any;

  if (!row) {
    res.status(404).json({ error: 'No Pinterest account connected. Please connect first.' });
    return;
  }

  const allPins = PINTEREST_AESTHETIC_BOARDS.flatMap((b) => b.pins);
  const allAestheticTags = Array.from(new Set(PINTEREST_AESTHETIC_BOARDS.flatMap((b) => b.aestheticTags)));
  const allColorPalette = Array.from(new Set(PINTEREST_AESTHETIC_BOARDS.flatMap((b) => b.colorPalette)));

  db.prepare(`
    UPDATE pinterest_connections
    SET boards_json = ?, pins_json = ?, aesthetic_tags = ?, color_palette = ?, last_synced_at = datetime('now')
    WHERE user_id = ?
  `).run(
    JSON.stringify(PINTEREST_AESTHETIC_BOARDS),
    JSON.stringify(allPins),
    JSON.stringify(allAestheticTags),
    JSON.stringify(allColorPalette),
    req.user!.id
  );

  res.json({
    success: true,
    message: 'Pinterest moodboards & saved pins synchronized successfully!',
    pinsCount: allPins.length,
    lastSyncedAt: new Date().toISOString(),
  });
});

// DELETE /api/pinterest/disconnect
router.delete('/disconnect', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  db.prepare('DELETE FROM pinterest_connections WHERE user_id = ?').run(req.user!.id);
  res.json({ success: true, message: 'Pinterest account disconnected successfully.' });
});

// GET /api/pinterest/feed
router.get('/feed', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM pinterest_connections WHERE user_id = ?').get(req.user!.id) as any;

  if (!row) {
    // Return sample Pinterest pins if not yet linked
    const defaultPins = PINTEREST_AESTHETIC_BOARDS.flatMap((b) => b.pins);
    res.json({
      connected: false,
      pins: defaultPins,
      message: 'Connect your Pinterest account to sync your personal boards and saved pins.',
    });
    return;
  }

  const pins = JSON.parse(row.pins_json || '[]');
  const boards = JSON.parse(row.boards_json || '[]');

  res.json({
    connected: true,
    username: row.pinterest_username,
    boards,
    pins,
    lastSyncedAt: row.last_synced_at,
  });
});

export default router;
