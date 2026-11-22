import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';

const router = Router();

function formatInspiration(row: any, isLiked = false, isSaved = false) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    imageUrl: row.image_url,
    category: row.category || 'all',
    style: row.style || 'casual',
    season: row.season || 'all',
    tags: row.tags ? JSON.parse(row.tags || '[]') : [],
    likes: row.likes || 0,
    saves: 0,
    isLiked,
    isSaved,
    createdAt: row.created_at,
  };
}

// GET /inspirations
router.get('/inspirations', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const { category, style, season, search, page = 1, limit = 20 } = req.query as any;

  // Handle Pinterest feed tab
  if (category === 'pinterest') {
    const pinConn = db.prepare('SELECT * FROM pinterest_connections WHERE user_id = ?').get(req.user!.id) as any;
    let pins: any[] = [];
    let isConnected = false;
    let username = '';

    if (pinConn) {
      isConnected = true;
      username = pinConn.pinterest_username;
      try {
        pins = JSON.parse(pinConn.pins_json || '[]');
      } catch {
        pins = [];
      }
    }

    if (pins.length === 0) {
      // Fallback curated moodboard pins
      const defaultBoards = [
        {
          id: 'pin-min-1',
          title: 'Tonal White Oxford & Tailored Chinos with Clean White Kicks',
          description: 'Mastering the color sandwich rule: Light top anchored by matching clean sneakers, separated by neutral tailored bottoms.',
          imageUrl: '/uploads/insp-1.png',
          boardName: 'Clean Minimalist & Tonal Fits',
          aesthetic: 'minimalist',
          style: 'minimalist',
          season: 'all',
          tags: ['minimalist', 'clean', 'sandwiching'],
          isPinterest: true,
          sourceUrl: 'https://pinterest.com/pin/minimalist-tonal-1',
        },
        {
          id: 'pin-om-1',
          title: 'Navy Wool Blazer, Crisp White Shirt & Tailored Slacks',
          description: 'The definitive smart casual blueprint: Navy outerwear with structured shoulders and brown leather loafers.',
          imageUrl: '/uploads/insp-3.png',
          boardName: 'Old Money & European Tailoring',
          aesthetic: 'old_money',
          style: 'formal',
          season: 'all',
          tags: ['old_money', 'tailored', 'classic'],
          isPinterest: true,
          sourceUrl: 'https://pinterest.com/pin/old-money-blazer-1',
        },
        {
          id: 'pin-st-1',
          title: 'Boxy Heavyweight Hoodie with Baggy Denim & Retro Lows',
          description: 'Volume play: Dropped shoulders combined with straight, pooling denim creates the trending relaxed street silhouette.',
          imageUrl: '/uploads/insp-2.png',
          boardName: 'Seoul Street & Relaxed Silhouettes',
          aesthetic: 'streetwear',
          style: 'streetwear',
          season: 'all',
          tags: ['streetwear', 'relaxed', 'korean'],
          isPinterest: true,
          sourceUrl: 'https://pinterest.com/pin/streetwear-hoodie-1',
        },
        {
          id: 'pin-et-1',
          title: 'Terracotta Overshirt with Olive Chinos & Leather Boots',
          description: 'Complementary earth palette: Warm rust tones pair naturally with muted forest and olive greens.',
          imageUrl: '/uploads/insp-12.png',
          boardName: 'Autumn Earth Tones & Cozy Textures',
          aesthetic: 'earth_tones',
          style: 'casual',
          season: 'autumn',
          tags: ['earth_tones', 'terracotta', 'olive'],
          isPinterest: true,
          sourceUrl: 'https://pinterest.com/pin/earth-terracotta-1',
        },
      ];
      pins = defaultBoards;
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      pins = pins.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.boardName?.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    res.json({
      data: pins.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
        category: 'pinterest',
        style: p.style || p.aesthetic || 'minimalist',
        season: p.season || 'all',
        tags: p.tags || [p.aesthetic || 'aesthetic'],
        likes: p.likes || 124,
        saves: 42,
        isLiked: false,
        isSaved: false,
        isPinterest: true,
        boardName: p.boardName || 'Curated Moodboard',
        sourceUrl: p.link || p.sourceUrl || 'https://pinterest.com',
        createdAt: new Date().toISOString(),
      })),
      pagination: {
        page: 1,
        limit: pins.length,
        total: pins.length,
        totalPages: 1,
      },
      pinterestStatus: {
        isConnected,
        username,
      },
    });
    return;
  }

  let query = 'SELECT * FROM style_inspirations WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'all') {
    query += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }
  if (style && style !== 'all') {
    query += ' AND LOWER(style) = LOWER(?)';
    params.push(style);
  }
  if (season && season !== 'all') {
    query += ' AND (LOWER(season) = LOWER(?) OR season = "all")';
    params.push(season);
  }
  if (search && search.trim()) {
    query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC';
  const offset = (Number(page) - 1) * Number(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const inspirations = db.prepare(query).all(...params) as any[];

  // Get user's saved inspirations
  const savedIds = new Set(
    (db.prepare('SELECT inspiration_id FROM saved_inspirations WHERE user_id = ?').all(req.user!.id) as any[]).map(
      (r) => r.inspiration_id
    )
  );

  const countRow = db.prepare('SELECT COUNT(*) as total FROM style_inspirations').get() as any;

  res.json({
    data: inspirations.map((i: any) => formatInspiration(i, false, savedIds.has(i.id))),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / Number(limit)),
    },
  });
});

// GET /inspirations/:id
router.get('/inspirations/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM style_inspirations WHERE id = ?').get(req.params.id) as any;

  if (!row) {
    res.status(404).json({ error: 'Inspiration not found' });
    return;
  }

  const isSaved = Boolean(
    db.prepare('SELECT 1 FROM saved_inspirations WHERE user_id = ? AND inspiration_id = ?').get(req.user!.id, req.params.id)
  );

  res.json(formatInspiration(row, false, isSaved));
});

// POST /inspirations/:id/like
router.post('/inspirations/:id/like', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  db.prepare('UPDATE style_inspirations SET likes = likes + 1 WHERE id = ?').run(req.params.id);
  const updated = db.prepare('SELECT likes FROM style_inspirations WHERE id = ?').get(req.params.id) as any;
  res.json({ likes: updated?.likes || 0, isLiked: true });
});

// POST /inspirations/:id/save
router.post('/inspirations/:id/save', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM saved_inspirations WHERE user_id = ? AND inspiration_id = ?').get(req.user!.id, req.params.id) as any;

  if (existing) {
    db.prepare('DELETE FROM saved_inspirations WHERE id = ?').run(existing.id);
    res.json({ isSaved: false, message: 'Removed from saved inspiration' });
  } else {
    db.prepare('INSERT INTO saved_inspirations (id, user_id, inspiration_id) VALUES (?, ?, ?)').run(
      generateId(),
      req.user!.id,
      req.params.id
    );
    res.json({ isSaved: true, message: 'Saved to your inspiration board' });
  }
});

// GET /saved
router.get('/saved', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const saved = db.prepare(`
    SELECT si.*
    FROM saved_inspirations s
    JOIN style_inspirations si ON s.inspiration_id = si.id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `).all(req.user!.id) as any[];

  res.json({
    data: saved.map((i: any) => formatInspiration(i, false, true)),
  });
});

export default router;
