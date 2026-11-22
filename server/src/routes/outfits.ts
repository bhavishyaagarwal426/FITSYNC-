import { Router, Response } from 'express';
import { body } from 'express-validator';
import path from 'path';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateId } from '../utils/helpers.js';
import { recommendOutfits } from '../services/recommendation.js';
import { getAIProvider } from '../services/ai.js';

const router = Router();

function formatOutfitItem(itemRow: any) {
  return {
    id: itemRow.id,
    userId: itemRow.user_id,
    imageUrl: itemRow.image_path.startsWith('/uploads') ? itemRow.image_path : `/uploads/${path.basename(itemRow.image_path)}`,
    thumbnailUrl: itemRow.thumbnail_path
      ? (itemRow.thumbnail_path.startsWith('/uploads') ? itemRow.thumbnail_path : `/uploads/thumbnails/${path.basename(itemRow.thumbnail_path)}`)
      : (itemRow.image_path.startsWith('/uploads') ? itemRow.image_path : `/uploads/${path.basename(itemRow.image_path)}`),
    name: itemRow.custom_name || `${itemRow.primary_color || ''} ${itemRow.subcategory || itemRow.category}`.trim(),
    category: itemRow.category,
    subcategory: itemRow.subcategory || '',
    color: itemRow.primary_color || 'neutral',
    secondaryColor: itemRow.secondary_colors ? JSON.parse(itemRow.secondary_colors || '[]')[0] || '' : '',
    pattern: itemRow.pattern || 'solid',
    material: itemRow.material || '',
    style: itemRow.style || 'casual',
    formality: itemRow.formality || 'casual',
    season: itemRow.season || 'all',
    tags: itemRow.use_cases ? JSON.parse(itemRow.use_cases || '[]') : [],
    isFavorite: Boolean(itemRow.is_favorite),
    isAvailable: Boolean(itemRow.is_available),
    timesWorn: 0,
    createdAt: itemRow.created_at,
    updatedAt: itemRow.updated_at,
  };
}

function assembleOutfit(db: any, outfitRow: any) {
  const outfitItems = db.prepare(`
    SELECT oi.id as link_id, oi.position, w.*
    FROM outfit_items oi
    JOIN wardrobe_items w ON oi.wardrobe_item_id = w.id
    WHERE oi.outfit_id = ?
    ORDER BY oi.position ASC
  `).all(outfitRow.id);

  const feedbackRow = db.prepare('SELECT feedback FROM outfit_feedback WHERE outfit_id = ?').get(outfitRow.id) as any;

  return {
    id: outfitRow.id,
    userId: outfitRow.user_id,
    occasion: outfitRow.occasion || 'casual',
    style: outfitRow.style || 'casual',
    weather: outfitRow.weather || 'mild',
    explanation: outfitRow.explanation || '',
    score: 0.95,
    feedback: feedbackRow?.feedback ? { rating: feedbackRow.feedback } : undefined,
    items: outfitItems.map((item: any, idx: number) => ({
      id: item.link_id,
      outfitId: outfitRow.id,
      wardrobeItemId: item.id,
      slot: item.category,
      position: item.position || idx,
      wardrobeItem: formatOutfitItem(item),
    })),
    createdAt: outfitRow.created_at,
  };
}

async function executeOutfitGeneration(
  userId: string,
  res: Response,
  {
    occasion = 'casual',
    style = 'casual',
    weather = 'mild',
    colorPreference,
    excludeItems = [],
  }: {
    occasion?: string;
    style?: string;
    weather?: string;
    colorPreference?: string;
    excludeItems?: string[];
  }
) {
  const db = getDb();

  // Retrieve eligible wardrobe items
  const items = db.prepare(`
    SELECT * FROM wardrobe_items
    WHERE user_id = ? AND is_available = 1
  `).all(userId) as any[];

  if (!items || items.length === 0) {
    res.status(400).json({
      error: 'Your wardrobe is empty. Please upload some clothes first!',
      missingCategories: ['tops', 'bottoms', 'footwear'],
    });
    return;
  }

  // Check previously rejected outfit items to avoid repeats
  const rejectedRows = db.prepare(`
    SELECT oi.outfit_id, GROUP_CONCAT(oi.wardrobe_item_id) as item_ids
    FROM outfit_feedback of
    JOIN outfit_items oi ON of.outfit_id = oi.outfit_id
    WHERE of.user_id = ? AND of.feedback = 'rejected'
    GROUP BY oi.outfit_id
  `).all(userId) as any[];

  const rejectedItemSets = rejectedRows.map((r: any) => r.item_ids.split(','));

  // Retrieve user's linked Pinterest style signals if available
  const pinterestRow = db.prepare('SELECT * FROM pinterest_connections WHERE user_id = ?').get(userId) as any;
  let pinterestAesthetics: string[] = [];
  let pinterestColorPalette: string[] = [];
  let pinterestUsername = '';
  if (pinterestRow) {
    pinterestUsername = pinterestRow.pinterest_username;
    try {
      pinterestAesthetics = JSON.parse(pinterestRow.aesthetic_tags || '[]');
      pinterestColorPalette = JSON.parse(pinterestRow.color_palette || '[]');
    } catch {}
  }

  // Run advanced stylist recommendation engine
  const candidates = recommendOutfits({
    items,
    occasion,
    style,
    weather,
    colorPreference,
    excludeItems,
    rejectedItemSets,
    pinterestAesthetics,
    pinterestColorPalette,
  });

  if (!candidates || candidates.length === 0) {
    const categoriesOwned = new Set(items.map((i: any) => i.category.toLowerCase()));
    const missing: string[] = [];
    if (!categoriesOwned.has('tops')) missing.push('tops');
    if (!categoriesOwned.has('bottoms') && !categoriesOwned.has('dresses')) missing.push('bottoms');
    if (!categoriesOwned.has('footwear')) missing.push('footwear');

    res.status(422).json({
      error: 'Could not assemble a complete outfit with your current wardrobe items and filters.',
      missingCategories: missing,
      suggestion: 'Try relaxing your style/color filters or uploading additional wardrobe categories.',
    });
    return;
  }

  const selectedCandidate = candidates[0];
  const outfitId = generateId();

  const aiProvider = getAIProvider();
  let explanation = '';
  const itemNames = selectedCandidate.items.map((i: any) => i.custom_name || i.subcategory || i.category).join(', ');
  const stylingNote = selectedCandidate.stylingTechnique || 'Curated Styling';
  const reasonText = selectedCandidate.reasons.length > 0 ? selectedCandidate.reasons.join('. ') : 'Cohesive color coordination and tailored silhouette.';

  if (pinterestUsername) {
    explanation = `[${stylingNote}] Researched from trending Pinterest aesthetics & aligned with your @${pinterestUsername} moodboard: Pairing ${itemNames}. ${reasonText}`;
  } else {
    explanation = `[${stylingNote}] ${reasonText} Combining ${itemNames} strictly from clothes in your digital wardrobe for an effortless ${occasion} look.`;
  }

  const insertOutfit = db.prepare(`
    INSERT INTO outfits (id, user_id, occasion, style, weather, explanation, ai_generated, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
  `);

  const insertItem = db.prepare(`
    INSERT INTO outfit_items (id, outfit_id, wardrobe_item_id, position)
    VALUES (?, ?, ?, ?)
  `);

  db.transaction(() => {
    insertOutfit.run(outfitId, userId, occasion, style, weather, explanation);
    selectedCandidate.items.forEach((item: any, idx: number) => {
      insertItem.run(generateId(), outfitId, item.id, idx);
    });
  })();

  const savedOutfitRow = db.prepare('SELECT * FROM outfits WHERE id = ?').get(outfitId);
  const outfitResult = assembleOutfit(db, savedOutfitRow);

  res.status(201).json(outfitResult);
}

// POST /generate
router.post(
  '/generate',
  authenticate,
  validate([
    body('occasion').optional().isString(),
    body('style').optional().isString(),
    body('weather').optional().isString(),
    body('colorPreference').optional().isString(),
    body('excludeItems').optional().isArray(),
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await executeOutfitGeneration(req.user!.id, res, req.body);
    } catch (err: any) {
      console.error('Outfit generation error:', err);
      res.status(500).json({ error: 'Failed to generate outfit' });
    }
  }
);

// POST /surprise - Quick random generator
router.post('/surprise', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const occasions = ['casual', 'date_night', 'work', 'everyday', 'brunch'];
    const styles = ['casual', 'streetwear', 'minimalist', 'smart_casual'];
    const weathers = ['mild', 'warm', 'cool'];

    const occasion = occasions[Math.floor(Math.random() * occasions.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const weather = weathers[Math.floor(Math.random() * weathers.length)];

    await executeOutfitGeneration(req.user!.id, res, { occasion, style, weather });
  } catch (err: any) {
    console.error('Surprise generation error:', err);
    res.status(500).json({ error: 'Failed to generate surprise outfit' });
  }
});

// GET /:id
router.get('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const outfitRow = db.prepare('SELECT * FROM outfits WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);

  if (!outfitRow) {
    res.status(404).json({ error: 'Outfit not found' });
    return;
  }

  res.json(assembleOutfit(db, outfitRow));
});

// POST /:id/feedback
router.post(
  '/:id/feedback',
  authenticate,
  validate([body('feedback').isIn(['loved', 'rejected', 'saved'])]),
  (req: AuthRequest, res: Response): void => {
    const { feedback } = req.body;
    const db = getDb();

    const outfit = db.prepare('SELECT id FROM outfits WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);
    if (!outfit) {
      res.status(404).json({ error: 'Outfit not found' });
      return;
    }

    const existing = db.prepare('SELECT id FROM outfit_feedback WHERE user_id = ? AND outfit_id = ?').get(req.user!.id, req.params.id) as any;

    if (existing) {
      db.prepare('UPDATE outfit_feedback SET feedback = ?, created_at = datetime(\'now\') WHERE id = ?').run(feedback, existing.id);
    } else {
      db.prepare('INSERT INTO outfit_feedback (id, user_id, outfit_id, feedback) VALUES (?, ?, ?, ?)').run(
        generateId(),
        req.user!.id,
        req.params.id,
        feedback
      );
    }

    res.json({ message: 'Feedback recorded successfully', feedback });
  }
);

// GET /saved - List saved outfits
router.get('/saved/all', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const saved = db.prepare(`
    SELECT so.id as saved_id, so.collection_id, so.notes, so.worn_count, so.last_worn, so.created_at as saved_at,
           o.*
    FROM saved_outfits so
    JOIN outfits o ON so.outfit_id = o.id
    WHERE so.user_id = ?
    ORDER BY so.created_at DESC
  `).all(req.user!.id) as any[];

  const results = saved.map((row: any) => {
    const outfit = assembleOutfit(db, row);
    return {
      id: row.saved_id,
      userId: req.user!.id,
      outfitId: row.id,
      outfit,
      collectionId: row.collection_id,
      notes: row.notes,
      savedAt: row.saved_at,
      wornCount: row.worn_count || 0,
      lastWorn: row.last_worn,
    };
  });

  res.json({ data: results });
});

// POST /:id/save - Save outfit
router.post(
  '/:id/save',
  authenticate,
  validate([
    body('collectionId').optional().isString(),
    body('notes').optional().isString(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { collectionId, notes } = req.body;
    const db = getDb();

    const outfit = db.prepare('SELECT id FROM outfits WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);
    if (!outfit) {
      res.status(404).json({ error: 'Outfit not found' });
      return;
    }

    const existing = db.prepare('SELECT id FROM saved_outfits WHERE user_id = ? AND outfit_id = ?').get(req.user!.id, req.params.id) as any;

    if (existing) {
      db.prepare('UPDATE saved_outfits SET collection_id = ?, notes = ? WHERE id = ?').run(
        collectionId || null,
        notes || null,
        existing.id
      );
      res.json({ message: 'Saved outfit updated', savedId: existing.id });
      return;
    }

    const savedId = generateId();
    db.prepare(`
      INSERT INTO saved_outfits (id, user_id, outfit_id, collection_id, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(savedId, req.user!.id, req.params.id, collectionId || null, notes || null);

    res.status(201).json({ message: 'Outfit saved successfully', savedId });
  }
);

// DELETE /saved/:id - Remove saved outfit
router.delete('/saved/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const result = db.prepare('DELETE FROM saved_outfits WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Saved outfit not found' });
    return;
  }

  res.json({ message: 'Saved outfit removed' });
});

// POST /:id/worn - Mark outfit as worn
router.post(
  '/:id/worn',
  authenticate,
  validate([
    body('wornDate').optional().isString(),
    body('notes').optional().isString(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { wornDate = new Date().toISOString().split('T')[0], notes } = req.body;
    const db = getDb();

    const outfit = db.prepare('SELECT id FROM outfits WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);
    if (!outfit) {
      res.status(404).json({ error: 'Outfit not found' });
      return;
    }

    const historyId = generateId();
    db.transaction(() => {
      db.prepare(`
        INSERT INTO outfit_history (id, user_id, outfit_id, worn_date, notes)
        VALUES (?, ?, ?, ?, ?)
      `).run(historyId, req.user!.id, req.params.id, wornDate, notes || null);

      // Update saved outfit worn count if exists
      db.prepare(`
        UPDATE saved_outfits
        SET worn_count = worn_count + 1, last_worn = ?
        WHERE user_id = ? AND outfit_id = ?
      `).run(wornDate, req.user!.id, req.params.id);
    })();

    res.status(201).json({ message: 'Marked as worn', historyId, wornDate });
  }
);

export default router;
