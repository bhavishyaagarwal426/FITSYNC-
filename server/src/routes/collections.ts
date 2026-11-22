import { Router, Response } from 'express';
import { body } from 'express-validator';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateId } from '../utils/helpers.js';

const router = Router();

// GET / - List collections
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const collections = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM saved_outfits so WHERE so.collection_id = c.id) as outfit_count
    FROM collections c
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `).all(req.user!.id) as any[];

  res.json({
    data: collections.map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      description: c.description || '',
      outfitCount: c.outfit_count || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
  });
});

// POST / - Create collection
router.post(
  '/',
  authenticate,
  validate([
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Collection name is required'),
    body('description').optional().trim(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { name, description } = req.body;
    const db = getDb();
    const id = generateId();

    db.prepare(`
      INSERT INTO collections (id, user_id, name, description)
      VALUES (?, ?, ?, ?)
    `).run(id, req.user!.id, name, description || null);

    res.status(201).json({
      id,
      userId: req.user!.id,
      name,
      description: description || '',
      outfitCount: 0,
      createdAt: new Date().toISOString(),
    });
  }
);

// GET /:id - Single collection with outfits
router.get('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const collection = db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;

  if (!collection) {
    res.status(404).json({ error: 'Collection not found' });
    return;
  }

  const savedOutfits = db.prepare(`
    SELECT so.id as saved_id, so.notes, so.created_at as saved_at, o.*
    FROM saved_outfits so
    JOIN outfits o ON so.outfit_id = o.id
    WHERE so.collection_id = ? AND so.user_id = ?
  `).all(req.params.id, req.user!.id) as any[];

  res.json({
    id: collection.id,
    userId: collection.user_id,
    name: collection.name,
    description: collection.description || '',
    outfitCount: savedOutfits.length,
    outfits: savedOutfits,
    createdAt: collection.created_at,
    updatedAt: collection.updated_at,
  });
});

// PUT /:id - Update collection
router.put(
  '/:id',
  authenticate,
  validate([
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { name, description } = req.body;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM collections WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);
    if (!existing) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    const updates: string[] = ["updated_at = datetime('now')"];
    const params: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    params.push(req.params.id, req.user!.id);
    db.prepare(`UPDATE collections SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM collections WHERE id = ?').get(req.params.id) as any;
    res.json(updated);
  }
);

// DELETE /:id - Delete collection
router.delete('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const result = db.prepare('DELETE FROM collections WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Collection not found' });
    return;
  }

  // Also detach saved outfits from this collection (set collection_id to null)
  db.prepare('UPDATE saved_outfits SET collection_id = NULL WHERE collection_id = ?').run(req.params.id);

  res.json({ message: 'Collection deleted successfully' });
});

export default router;
