import { Router, Response } from 'express';
import { body } from 'express-validator';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateId } from '../utils/helpers.js';

const router = Router();

// GET /data - Download / Export all user data
router.get('/data', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const userId = req.user!.id;

  const user = db.prepare('SELECT id, email, display_name, role, created_at FROM users WHERE id = ?').get(userId);
  const preferences = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId);
  const wardrobeItems = db.prepare('SELECT * FROM wardrobe_items WHERE user_id = ?').all(userId);
  const outfits = db.prepare('SELECT * FROM outfits WHERE user_id = ?').all(userId);
  const savedOutfits = db.prepare('SELECT * FROM saved_outfits WHERE user_id = ?').all(userId);
  const collections = db.prepare('SELECT * FROM collections WHERE user_id = ?').all(userId);
  const history = db.prepare('SELECT * FROM outfit_history WHERE user_id = ?').all(userId);
  const communityPosts = db.prepare('SELECT * FROM community_posts WHERE user_id = ?').all(userId);
  const consents = db.prepare('SELECT * FROM consent_records WHERE user_id = ?').all(userId);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    account: user,
    preferences,
    wardrobeItems,
    outfits,
    savedOutfits,
    collections,
    outfitHistory: history,
    communityPosts,
    consentRecords: consents,
    complianceNote: 'Exported in compliance with user data portability and privacy regulations.',
  };

  res.setHeader('Content-Disposition', `attachment; filename=fitsync-data-export-${userId}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.json(exportPayload);
});

// POST /delete-account - Initiate account deletion workflow
router.post(
  '/delete-account',
  authenticate,
  validate([
    body('confirmation').equals('DELETE MY ACCOUNT').withMessage('Explicit confirmation string required'),
    body('reason').optional().trim(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { reason } = req.body;
    const db = getDb();
    const userId = req.user!.id;

    // Check if deletion request is already pending
    const existing = db.prepare("SELECT * FROM deletion_requests WHERE user_id = ? AND status IN ('PENDING', 'IN_PROGRESS')").get(userId) as any;
    if (existing) {
      res.json({
        message: 'Account deletion request is already queued and being processed',
        requestId: existing.id,
        status: existing.status,
        requestedAt: existing.requested_at,
      });
      return;
    }

    const requestId = generateId();
    db.prepare(`
      INSERT INTO deletion_requests (id, user_id, status, reason)
      VALUES (?, ?, 'PENDING', ?)
    `).run(requestId, userId, reason || 'User requested account closure');

    // Soft disable user account immediately to prevent unauthorized logins during grace period
    db.prepare("UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?").run(userId);

    res.clearCookie('token');
    res.json({
      message: 'Account deletion initiated. Your data is queued for complete purge according to retention policies.',
      requestId,
      status: 'PENDING',
    });
  }
);

// GET /delete-status - Check deletion request status
router.get('/delete-status', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const request = db.prepare('SELECT * FROM deletion_requests WHERE user_id = ? ORDER BY requested_at DESC LIMIT 1').get(req.user!.id) as any;

  if (!request) {
    res.json({ status: 'NONE' });
    return;
  }

  res.json({
    id: request.id,
    status: request.status,
    requestedAt: request.requested_at,
    completedAt: request.completed_at,
  });
});

// GET /consents - List consents
router.get('/consents', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM consent_records WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.id) as any[];

  res.json({
    data: rows.map((r: any) => ({
      id: r.id,
      consentType: r.consent_type,
      status: r.status,
      policyVersion: r.policy_version,
      updatedAt: r.created_at,
    })),
  });
});

// POST /consents - Grant or update consent
router.post(
  '/consents',
  authenticate,
  validate([
    body('consentType').isString().notEmpty(),
    body('status').isIn(['granted', 'withdrawn']),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { consentType, status } = req.body;
    const db = getDb();
    const id = generateId();

    db.prepare(`
      INSERT INTO consent_records (id, user_id, consent_type, status, policy_version, ip_address)
      VALUES (?, ?, ?, ?, '1.0', ?)
    `).run(id, req.user!.id, consentType, status, req.ip || '127.0.0.1');

    res.status(201).json({ message: 'Consent updated', consentType, status });
  }
);

export default router;
