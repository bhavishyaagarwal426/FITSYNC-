import { Router, Response } from 'express';
import { body } from 'express-validator';
import path from 'path';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateId } from '../utils/helpers.js';

const router = Router();

function formatHistoryItem(row: any, db: any) {
  const items = db.prepare(`
    SELECT oi.position, w.*
    FROM outfit_items oi
    JOIN wardrobe_items w ON oi.wardrobe_item_id = w.id
    WHERE oi.outfit_id = ?
    ORDER BY oi.position ASC
  `).all(row.outfit_id) as any[];

  return {
    id: row.id,
    userId: row.user_id,
    outfitId: row.outfit_id,
    wornAt: row.worn_date,
    notes: row.notes,
    createdAt: row.created_at,
    outfit: {
      id: row.outfit_id,
      occasion: row.occasion,
      style: row.style,
      weather: row.weather,
      explanation: row.explanation,
      items: items.map((i: any) => ({
        id: i.id,
        name: i.custom_name || `${i.primary_color || ''} ${i.subcategory || i.category}`.trim(),
        imageUrl: i.image_path.startsWith('/uploads') ? i.image_path : `/uploads/${path.basename(i.image_path)}`,
        category: i.category,
      })),
    },
  };
}

// GET / - List outfit history
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const { startDate, endDate, limit = 50, page = 1 } = req.query as any;

  let query = `
    SELECT h.*, o.occasion, o.style, o.weather, o.explanation
    FROM outfit_history h
    JOIN outfits o ON h.outfit_id = o.id
    WHERE h.user_id = ?
  `;
  const params: any[] = [req.user!.id];

  if (startDate) {
    query += ' AND h.worn_date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND h.worn_date <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY h.worn_date DESC';
  const offset = (Number(page) - 1) * Number(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const rows = db.prepare(query).all(...params) as any[];
  const countRow = db.prepare('SELECT COUNT(*) as total FROM outfit_history WHERE user_id = ?').get(req.user!.id) as any;

  res.json({
    data: rows.map((r: any) => formatHistoryItem(r, db)),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / Number(limit)),
    },
  });
});

// GET /calendar - Monthly calendar view
router.get('/calendar', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const { year, month } = req.query as any;

  const currentYear = year || new Date().getFullYear();
  const currentMonth = month ? String(month).padStart(2, '0') : String(new Date().getMonth() + 1).padStart(2, '0');
  const monthPrefix = `${currentYear}-${currentMonth}`;

  const rows = db.prepare(`
    SELECT h.*, o.occasion, o.style, o.weather, o.explanation
    FROM outfit_history h
    JOIN outfits o ON h.outfit_id = o.id
    WHERE h.user_id = ? AND h.worn_date LIKE ?
    ORDER BY h.worn_date ASC
  `).all(req.user!.id, `${monthPrefix}%`) as any[];

  res.json({
    month: monthPrefix,
    entries: rows.map((r: any) => formatHistoryItem(r, db)),
  });
});

// POST / - Add history entry
router.post(
  '/',
  authenticate,
  validate([
    body('outfitId').notEmpty().withMessage('Outfit ID is required'),
    body('wornDate').optional().isISO8601().withMessage('Valid date required (YYYY-MM-DD)'),
    body('notes').optional().isString(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { outfitId, wornDate = new Date().toISOString().split('T')[0], notes } = req.body;
    const db = getDb();

    const outfit = db.prepare('SELECT id FROM outfits WHERE id = ? AND user_id = ?').get(outfitId, req.user!.id);
    if (!outfit) {
      res.status(404).json({ error: 'Outfit not found' });
      return;
    }

    const id = generateId();
    db.prepare(`
      INSERT INTO outfit_history (id, user_id, outfit_id, worn_date, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user!.id, outfitId, wornDate, notes || null);

    res.status(201).json({ id, outfitId, wornDate, notes });
  }
);

export default router;
