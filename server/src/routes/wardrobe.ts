import { Router, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generateId, sanitizeFilename, isValidImageType } from '../utils/helpers.js';
import { getAIProvider, SmartLocalVisionProvider, computeDHash, hammingDistance } from '../services/ai.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads');
const THUMBS_DIR = path.join(UPLOADS_DIR, 'thumbnails');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${generateId()}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (isValidImageType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Only JPEG, PNG, and WebP are accepted.'));
    }
  },
});

// Helper to format wardrobe item for frontend
function formatItem(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    imageUrl: row.image_path.startsWith('/uploads') ? row.image_path : `/uploads/${path.basename(row.image_path)}`,
    thumbnailUrl: row.thumbnail_path
      ? (row.thumbnail_path.startsWith('/uploads') ? row.thumbnail_path : `/uploads/thumbnails/${path.basename(row.thumbnail_path)}`)
      : (row.image_path.startsWith('/uploads') ? row.image_path : `/uploads/${path.basename(row.image_path)}`),
    name: row.custom_name || `${row.primary_color || ''} ${row.subcategory || row.category}`.trim(),
    category: row.category,
    subcategory: row.subcategory || '',
    color: row.primary_color || 'neutral',
    secondaryColor: row.secondary_colors ? JSON.parse(row.secondary_colors || '[]')[0] || '' : '',
    pattern: row.pattern || 'solid',
    material: row.material || '',
    style: row.style || 'casual',
    formality: row.formality || 'casual',
    season: row.season || 'all',
    tags: row.use_cases ? JSON.parse(row.use_cases || '[]') : [],
    isFavorite: Boolean(row.is_favorite),
    isAvailable: Boolean(row.is_available),
    timesWorn: 0,
    aiConfidence: row.ai_confidence || 0.95,
    imageHash: row.image_hash || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// POST /upload
router.post('/upload', authenticate, upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const originalPath = req.file.path;
    const filename = path.basename(originalPath);
    const thumbFilename = `thumb-${filename}`;
    const thumbPath = path.join(THUMBS_DIR, thumbFilename);

    // 1. Calculate Perceptual Image Hash (dHash) & Check for Duplicates
    let uploadDHash = '';
    try {
      uploadDHash = await computeDHash(originalPath);
    } catch (hashErr) {
      console.warn('Failed to compute image hash:', hashErr);
    }

    const db = getDb();

    if (uploadDHash) {
      const existingHashedItems = db.prepare(`
        SELECT * FROM wardrobe_items
        WHERE user_id = ? AND image_hash IS NOT NULL
      `).all(req.user!.id) as any[];

      const duplicate = existingHashedItems.find((item) => {
        const dist = hammingDistance(uploadDHash, item.image_hash);
        return dist <= 4;
      });

      if (duplicate) {
        // Clean up uploaded temporary files to prevent server clutter
        try {
          if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
        } catch {}

        res.status(409).json({
          error: 'This garment is already in your digital wardrobe!',
          isDuplicate: true,
          message: `"${duplicate.custom_name || duplicate.subcategory || duplicate.category}" already exists in your digital wardrobe. Duplicate upload was prevented.`,
          existingItem: formatItem(duplicate),
        });
        return;
      }
    }

    // Generate thumbnail using sharp
    try {
      await sharp(originalPath)
        .resize(300, 300, { fit: 'cover', position: 'center' })
        .toFile(thumbPath);
    } catch (sharpErr) {
      console.warn('Sharp thumbnail generation failed, using original:', sharpErr);
    }

    // AI Analysis using Vision & Heuristic engine
    const aiProvider = getAIProvider();
    const userHint = (req.body?.category as string) || '';
    const originalFilename = req.file.originalname || '';
    let analysis;
    try {
      analysis = await aiProvider.analyzeClothing(originalPath, originalFilename, userHint);
    } catch (aiErr) {
      console.warn('Primary AI analysis failed, falling back to local vision engine:', aiErr);
      const fallbackEngine = new SmartLocalVisionProvider();
      analysis = await fallbackEngine.analyzeClothing(originalPath, originalFilename, userHint);
    }

    const id = generateId();

    const insert = db.prepare(`
      INSERT INTO wardrobe_items (
        id, user_id, image_path, thumbnail_path, original_filename,
        category, subcategory, primary_color, secondary_colors, pattern,
        texture, material, style, formality, season, use_cases,
        ai_confidence, ai_analyzed, is_favorite, is_available, custom_name, image_hash
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, 1, 0, 1, ?, ?
      )
    `);

    const imageRelPath = `/uploads/${filename}`;
    const thumbRelPath = `/uploads/thumbnails/${thumbFilename}`;
    const customName = `${analysis.primaryColor || ''} ${analysis.subcategory || analysis.category}`.trim();

    insert.run(
      id,
      req.user!.id,
      imageRelPath,
      thumbRelPath,
      req.file.originalname,
      analysis.category.toLowerCase(),
      analysis.subcategory,
      analysis.primaryColor,
      JSON.stringify(analysis.secondaryColors || []),
      analysis.pattern,
      analysis.texture,
      analysis.material,
      analysis.style,
      analysis.formality,
      analysis.season,
      JSON.stringify(analysis.useCases || []),
      analysis.confidence,
      customName,
      uploadDHash
    );

    const created = db.prepare('SELECT * FROM wardrobe_items WHERE id = ?').get(id);

    res.status(201).json({
      message: 'Clothing item uploaded and analyzed successfully',
      item: formatItem(created),
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process clothing upload' });
  }
});

// GET / - List items with filters
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const { category, search, favorite, available, sortBy, page = 1, limit = 50 } = req.query as any;

  let query = 'SELECT * FROM wardrobe_items WHERE user_id = ?';
  const params: any[] = [req.user!.id];

  if (category && category !== 'all') {
    query += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }

  if (favorite === 'true' || favorite === '1') {
    query += ' AND is_favorite = 1';
  }

  if (available !== undefined && available !== '') {
    query += ' AND is_available = ?';
    params.push(available === 'true' || available === '1' ? 1 : 0);
  }

  if (search && search.trim()) {
    query += ' AND (custom_name LIKE ? OR subcategory LIKE ? OR primary_color LIKE ? OR category LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  if (sortBy === 'oldest') {
    query += ' ORDER BY created_at ASC';
  } else if (sortBy === 'name') {
    query += ' ORDER BY custom_name ASC';
  } else {
    query += ' ORDER BY created_at DESC';
  }

  const offset = (Number(page) - 1) * Number(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const items = db.prepare(query).all(...params);

  // Total count
  const countRow = db.prepare('SELECT COUNT(*) as total FROM wardrobe_items WHERE user_id = ?').get(req.user!.id) as any;

  res.json({
    data: items.map(formatItem),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / Number(limit)),
    },
  });
});

// GET /:id - Single item
router.get('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const item = db.prepare('SELECT * FROM wardrobe_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);

  if (!item) {
    res.status(404).json({ error: 'Wardrobe item not found' });
    return;
  }

  res.json(formatItem(item));
});

// PUT /:id - Update item
router.put('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM wardrobe_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);

  if (!existing) {
    res.status(404).json({ error: 'Wardrobe item not found' });
    return;
  }

  const {
    name,
    category,
    subcategory,
    color,
    pattern,
    material,
    style,
    formality,
    season,
    isFavorite,
    isAvailable,
  } = req.body;

  const updates: string[] = ["updated_at = datetime('now')"];
  const params: any[] = [];

  if (name !== undefined) {
    updates.push('custom_name = ?');
    params.push(name);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    params.push(category.toLowerCase());
  }
  if (subcategory !== undefined) {
    updates.push('subcategory = ?');
    params.push(subcategory);
  }
  if (color !== undefined) {
    updates.push('primary_color = ?');
    params.push(color);
  }
  if (pattern !== undefined) {
    updates.push('pattern = ?');
    params.push(pattern);
  }
  if (material !== undefined) {
    updates.push('material = ?');
    params.push(material);
  }
  if (style !== undefined) {
    updates.push('style = ?');
    params.push(style);
  }
  if (formality !== undefined) {
    updates.push('formality = ?');
    params.push(formality);
  }
  if (season !== undefined) {
    updates.push('season = ?');
    params.push(season);
  }
  if (isFavorite !== undefined) {
    updates.push('is_favorite = ?');
    params.push(isFavorite ? 1 : 0);
  }
  if (isAvailable !== undefined) {
    updates.push('is_available = ?');
    params.push(isAvailable ? 1 : 0);
  }

  params.push(req.params.id, req.user!.id);
  db.prepare(`UPDATE wardrobe_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM wardrobe_items WHERE id = ?').get(req.params.id);
  res.json(formatItem(updated));
});

// DELETE /:id - Delete item and associated files
router.delete('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const item = db.prepare('SELECT * FROM wardrobe_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;

  if (!item) {
    res.status(404).json({ error: 'Wardrobe item not found' });
    return;
  }

  // Delete actual files if stored locally
  if (item.image_path) {
    const fullPath = path.resolve(__dirname, '..', '..', item.image_path.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      try { fs.unlinkSync(fullPath); } catch {}
    }
  }
  if (item.thumbnail_path) {
    const fullThumb = path.resolve(__dirname, '..', '..', item.thumbnail_path.replace(/^\//, ''));
    if (fs.existsSync(fullThumb)) {
      try { fs.unlinkSync(fullThumb); } catch {}
    }
  }

  db.prepare('DELETE FROM wardrobe_items WHERE id = ?').run(req.params.id);
  res.json({ message: 'Wardrobe item deleted successfully' });
});

// POST /:id/favorite - Toggle favorite
router.post('/:id/favorite', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const item = db.prepare('SELECT is_favorite FROM wardrobe_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;

  if (!item) {
    res.status(404).json({ error: 'Wardrobe item not found' });
    return;
  }

  const newStatus = item.is_favorite ? 0 : 1;
  db.prepare('UPDATE wardrobe_items SET is_favorite = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newStatus, req.params.id);

  res.json({ isFavorite: Boolean(newStatus) });
});

// POST /:id/availability - Toggle availability
router.post('/:id/availability', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const item = db.prepare('SELECT is_available FROM wardrobe_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;

  if (!item) {
    res.status(404).json({ error: 'Wardrobe item not found' });
    return;
  }

  const newStatus = item.is_available ? 0 : 1;
  db.prepare('UPDATE wardrobe_items SET is_available = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newStatus, req.params.id);

  res.json({ isAvailable: Boolean(newStatus) });
});

export default router;
