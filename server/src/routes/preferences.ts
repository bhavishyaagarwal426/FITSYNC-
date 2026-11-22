import { Router, Response } from 'express';
import { body } from 'express-validator';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateId } from '../utils/helpers.js';

const router = Router();

// GET /api/preferences
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  let prefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user!.id) as any;

  if (!prefs) {
    // create default preferences if none exist
    const id = generateId();
    db.prepare(`
      INSERT INTO user_preferences (id, user_id, preferred_styles, favourite_colours, preferred_occasions, preferred_categories)
      VALUES (?, ?, '[]', '[]', '[]', '[]')
    `).run(id, req.user!.id);
    prefs = {
      id,
      user_id: req.user!.id,
      preferred_styles: '[]',
      favourite_colours: '[]',
      preferred_occasions: '[]',
      preferred_categories: '[]',
    };
  }

  res.json({
    id: prefs.id,
    userId: prefs.user_id,
    preferredStyles: JSON.parse(prefs.preferred_styles || '[]'),
    favouriteColours: JSON.parse(prefs.favourite_colours || '[]'),
    preferredOccasions: JSON.parse(prefs.preferred_occasions || '[]'),
    preferredCategories: JSON.parse(prefs.preferred_categories || '[]'),
    createdAt: prefs.created_at,
    updatedAt: prefs.updated_at,
  });
});

// PUT /api/preferences
router.put(
  '/',
  authenticate,
  validate([
    body('preferredStyles').optional().isArray(),
    body('favouriteColours').optional().isArray(),
    body('preferredOccasions').optional().isArray(),
    body('preferredCategories').optional().isArray(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { preferredStyles, favouriteColours, preferredOccasions, preferredCategories } = req.body;
    const db = getDb();

    let prefs = db.prepare('SELECT id FROM user_preferences WHERE user_id = ?').get(req.user!.id) as any;

    const stylesJson = JSON.stringify(preferredStyles || []);
    const coloursJson = JSON.stringify(favouriteColours || []);
    const occasionsJson = JSON.stringify(preferredOccasions || []);
    const categoriesJson = JSON.stringify(preferredCategories || []);

    if (prefs) {
      db.prepare(`
        UPDATE user_preferences
        SET preferred_styles = ?, favourite_colours = ?, preferred_occasions = ?, preferred_categories = ?, updated_at = datetime('now')
        WHERE user_id = ?
      `).run(stylesJson, coloursJson, occasionsJson, categoriesJson, req.user!.id);
    } else {
      const id = generateId();
      db.prepare(`
        INSERT INTO user_preferences (id, user_id, preferred_styles, favourite_colours, preferred_occasions, preferred_categories, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(id, req.user!.id, stylesJson, coloursJson, occasionsJson, categoriesJson);
    }

    res.json({
      message: 'Preferences updated successfully',
      preferences: {
        preferredStyles: preferredStyles || [],
        favouriteColours: favouriteColours || [],
        preferredOccasions: preferredOccasions || [],
        preferredCategories: preferredCategories || [],
      },
    });
  }
);

export default router;
