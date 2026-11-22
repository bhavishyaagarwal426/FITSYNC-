import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generateId, isValidImageType } from '../utils/helpers.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `dream-${Date.now()}-${generateId()}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (isValidImageType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are supported.'));
    }
  },
});

// GET /api/bucket-list - Retrieve user's dream dresses & bucket list items
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const { category, priority, status, search, sortBy } = req.query as Record<string, string>;

    let query = 'SELECT * FROM bucket_list_items WHERE user_id = ?';
    const params: any[] = [userId];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category.toLowerCase());
    }

    if (priority && priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority.toLowerCase());
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status.toLowerCase());
    }

    if (search && search.trim()) {
      query += ' AND (title LIKE ? OR brand LIKE ? OR notes LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    switch (sortBy) {
      case 'price-desc':
        query += ' ORDER BY target_price DESC';
        break;
      case 'price-asc':
        query += ' ORDER BY target_price ASC';
        break;
      case 'priority':
        query += ` ORDER BY CASE priority 
          WHEN 'grail' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'saving' THEN 3 
          ELSE 4 END`;
        break;
      case 'oldest':
        query += ' ORDER BY created_at ASC';
        break;
      default:
        query += ' ORDER BY created_at DESC';
    }

    const items = db.prepare(query).all(...params) as any[];

    // Calculate overall stats for the user's bucket list
    const statsQuery = `
      SELECT 
        COUNT(*) as total_items,
        TOTAL(CASE WHEN status != 'acquired' THEN target_price ELSE 0 END) as total_desired_value,
        COUNT(CASE WHEN status = 'acquired' THEN 1 END) as acquired_count,
        COUNT(CASE WHEN status != 'acquired' THEN 1 END) as dreaming_count
      FROM bucket_list_items
      WHERE user_id = ?
    `;
    const stats = db.prepare(statsQuery).get(userId) as any;

    res.json({
      success: true,
      data: items.map(formatBucketItem),
      stats: {
        totalItems: stats.total_items || 0,
        totalDesiredValue: Math.round(stats.total_desired_value || 0),
        acquiredCount: stats.acquired_count || 0,
        dreamingCount: stats.dreaming_count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching bucket list items:', error);
    res.status(500).json({ error: 'Failed to retrieve bucket list items' });
  }
});

// POST /api/bucket-list - Add a dream dress / garment
router.post('/', authenticate, upload.single('image'), (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const {
      title,
      category = 'dresses',
      brand = '',
      targetPrice = 0,
      currency = '$',
      productUrl = '',
      priority = 'high',
      notes = '',
      imageUrl: directImageUrl,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Item title is required.' });
    }

    let finalImageUrl = directImageUrl || '';
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    // Default fallback placeholder if no image given
    if (!finalImageUrl) {
      finalImageUrl = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80';
    }

    const id = generateId();
    const priceNum = parseFloat(targetPrice) || 0;

    db.prepare(`
      INSERT INTO bucket_list_items (
        id, user_id, title, category, brand, target_price, currency, image_url, product_url, priority, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'dreaming')
    `).run(
      id,
      userId,
      title.trim(),
      category.toLowerCase().trim(),
      brand ? brand.trim() : null,
      priceNum,
      currency.trim() || '$',
      finalImageUrl,
      productUrl ? productUrl.trim() : null,
      priority.toLowerCase().trim(),
      notes ? notes.trim() : null
    );

    const created = db.prepare('SELECT * FROM bucket_list_items WHERE id = ?').get(id) as any;

    res.status(201).json({
      success: true,
      message: 'Dream item added to your Style Bucket List!',
      data: formatBucketItem(created),
    });
  } catch (error) {
    console.error('Error adding bucket list item:', error);
    res.status(500).json({ error: 'Failed to add item to bucket list' });
  }
});

// PUT /api/bucket-list/:id - Update item
router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM bucket_list_items WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Bucket list item not found' });
    }

    const {
      title = existing.title,
      category = existing.category,
      brand = existing.brand,
      targetPrice = existing.target_price,
      currency = existing.currency,
      imageUrl = existing.image_url,
      productUrl = existing.product_url,
      priority = existing.priority,
      notes = existing.notes,
      status = existing.status,
    } = req.body;

    const priceNum = parseFloat(targetPrice) || 0;
    const acquiredAt = status === 'acquired' && existing.status !== 'acquired' ? new Date().toISOString() : existing.acquired_at;

    db.prepare(`
      UPDATE bucket_list_items
      SET title = ?, category = ?, brand = ?, target_price = ?, currency = ?, image_url = ?, product_url = ?, priority = ?, notes = ?, status = ?, acquired_at = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(
      title.trim(),
      category.toLowerCase().trim(),
      brand ? brand.trim() : null,
      priceNum,
      currency.trim() || '$',
      imageUrl,
      productUrl ? productUrl.trim() : null,
      priority.toLowerCase().trim(),
      notes ? notes.trim() : null,
      status.toLowerCase().trim(),
      acquiredAt,
      id,
      userId
    );

    const updated = db.prepare('SELECT * FROM bucket_list_items WHERE id = ?').get(id) as any;
    res.json({
      success: true,
      message: 'Dream item updated!',
      data: formatBucketItem(updated),
    });
  } catch (error) {
    console.error('Error updating bucket list item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// POST /api/bucket-list/:id/acquire - Mark as acquired or toggle
router.post('/:id/acquire', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const { id } = req.params;

    const item = db.prepare('SELECT * FROM bucket_list_items WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!item) {
      return res.status(404).json({ error: 'Bucket list item not found' });
    }

    const isAcquired = item.status === 'acquired';
    const newStatus = isAcquired ? 'dreaming' : 'acquired';
    const acquiredAt = newStatus === 'acquired' ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE bucket_list_items
      SET status = ?, acquired_at = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(newStatus, acquiredAt, id, userId);

    const updated = db.prepare('SELECT * FROM bucket_list_items WHERE id = ?').get(id) as any;
    res.json({
      success: true,
      message: newStatus === 'acquired' ? 'Congratulations! Marked as acquired 🎉' : 'Moved back to dreaming list',
      data: formatBucketItem(updated),
    });
  } catch (error) {
    console.error('Error updating acquire status:', error);
    res.status(500).json({ error: 'Failed to update acquire status' });
  }
});

// POST /api/bucket-list/:id/move-to-wardrobe - Move acquired dream piece into active wardrobe
router.post('/:id/move-to-wardrobe', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const { id } = req.params;

    const item = db.prepare('SELECT * FROM bucket_list_items WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!item) {
      return res.status(404).json({ error: 'Bucket list item not found' });
    }

    // Map category to a valid wardrobe category
    const cat = item.category?.toLowerCase() || 'dresses';
    let wardrobeCat = 'tops';
    if (['tops', 'bottoms', 'outerwear', 'footwear', 'accessories'].includes(cat)) {
      wardrobeCat = cat;
    } else if (cat === 'dresses') {
      wardrobeCat = 'tops'; // or formal top/dress
    } else if (cat === 'bags' || cat === 'jewelry') {
      wardrobeCat = 'accessories';
    }

    const wardrobeItemId = generateId();
    const customName = item.brand ? `${item.brand} - ${item.title}` : item.title;

    // Insert into wardrobe_items
    db.prepare(`
      INSERT INTO wardrobe_items (
        id, user_id, image_path, thumbnail_path, original_filename,
        category, subcategory, primary_color, style, formality,
        custom_name, is_favorite, is_available, ai_confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0.99)
    `).run(
      wardrobeItemId,
      userId,
      item.image_url || '/uploads/placeholder-tops.png',
      item.image_url || '/uploads/placeholder-tops.png',
      `${item.title}.jpg`,
      wardrobeCat,
      item.category || 'dress',
      'neutral',
      'chic',
      'formal',
      customName
    );

    // Mark bucket list item as acquired
    db.prepare(`
      UPDATE bucket_list_items
      SET status = 'acquired', acquired_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

    res.json({
      success: true,
      message: `✨ "${item.title}" has been moved to your Digital Wardrobe!`,
      wardrobeItemId,
    });
  } catch (error) {
    console.error('Error moving dream item to wardrobe:', error);
    res.status(500).json({ error: 'Failed to transfer item to wardrobe' });
  }
});

// DELETE /api/bucket-list/:id - Remove from bucket list
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const { id } = req.params;

    const result = db.prepare('DELETE FROM bucket_list_items WHERE id = ? AND user_id = ?').run(id, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ success: true, message: 'Removed from bucket list' });
  } catch (error) {
    console.error('Error deleting bucket list item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

function formatBucketItem(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category || 'dresses',
    brand: row.brand || '',
    targetPrice: row.target_price || 0,
    currency: row.currency || '$',
    imageUrl: row.image_url || '',
    productUrl: row.product_url || '',
    priority: row.priority || 'high',
    notes: row.notes || '',
    status: row.status || 'dreaming',
    acquiredAt: row.acquired_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default router;
