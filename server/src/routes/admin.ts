import { Router, Response } from 'express';
import { body } from 'express-validator';
import { getDb } from '../db/database.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { config } from '../config/index.js';

const router = Router();

// Apply auth & admin check to all admin routes
router.use(authenticate, requireAdmin);

// GET /stats - Overall administrative metrics
router.get('/stats', (_req: AuthRequest, res: Response): void => {
  const db = getDb();

  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const activeUsers = (db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get() as any).count;
  const itemCount = (db.prepare('SELECT COUNT(*) as count FROM wardrobe_items').get() as any).count;
  const outfitCount = (db.prepare('SELECT COUNT(*) as count FROM outfits').get() as any).count;
  const postCount = (db.prepare('SELECT COUNT(*) as count FROM community_posts WHERE is_removed = 0').get() as any).count;
  const reportCount = (db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'").get() as any).count;

  res.json({
    userCount,
    activeUsers,
    itemCount,
    outfitCount,
    postCount,
    reportCount,
  });
});

// GET /users - Paginated user management
router.get('/users', (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const { search, page = 1, limit = 20 } = req.query as any;

  let query = 'SELECT id, email, display_name, role, is_active, email_verified, created_at, last_login FROM users WHERE 1=1';
  const params: any[] = [];

  if (search && search.trim()) {
    query += ' AND (email LIKE ? OR display_name LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }

  query += ' ORDER BY created_at DESC';
  const offset = (Number(page) - 1) * Number(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const users = db.prepare(query).all(...params);
  const countRow = db.prepare('SELECT COUNT(*) as total FROM users').get() as any;

  res.json({
    data: users.map((u: any) => ({
      id: u.id,
      email: u.email,
      displayName: u.display_name,
      role: u.role,
      isActive: Boolean(u.is_active),
      emailVerified: Boolean(u.email_verified),
      createdAt: u.created_at,
      lastLogin: u.last_login,
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / Number(limit)),
    },
  });
});

// PUT /users/:id/role - Update user role
router.put(
  '/users/:id/role',
  validate([body('role').isIn(['user', 'admin', 'moderator'])]),
  (req: AuthRequest, res: Response): void => {
    const { role } = req.body;
    const db = getDb();

    db.prepare('UPDATE users SET role = ?, updated_at = datetime(\'now\') WHERE id = ?').run(role, req.params.id);
    res.json({ message: 'User role updated', role });
  }
);

// PUT /users/:id/status - Update active status
router.put(
  '/users/:id/status',
  validate([body('isActive').isBoolean()]),
  (req: AuthRequest, res: Response): void => {
    const { isActive } = req.body;
    const db = getDb();

    db.prepare('UPDATE users SET is_active = ?, updated_at = datetime(\'now\') WHERE id = ?').run(isActive ? 1 : 0, req.params.id);
    res.json({ message: `User ${isActive ? 'activated' : 'suspended'}` });
  }
);

// GET /reports - List pending reports
router.get('/reports', (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const { status = 'pending' } = req.query as any;

  const reports = db.prepare(`
    SELECT r.*, u.display_name as reporter_name
    FROM reports r
    JOIN users u ON r.reporter_id = u.id
    WHERE r.status = ?
    ORDER BY r.created_at DESC
  `).all(status) as any[];

  res.json({
    data: reports.map((r: any) => ({
      id: r.id,
      reporterId: r.reporter_id,
      reporter: {
        id: r.reporter_id,
        displayName: r.reporter_name,
      },
      targetType: r.target_type,
      targetId: r.target_id,
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.created_at,
    })),
  });
});

// PUT /reports/:id - Resolve or dismiss report
router.put(
  '/reports/:id',
  validate([
    body('status').isIn(['resolved', 'dismissed']),
    body('action').optional().isIn(['none', 'remove_content', 'suspend_user']),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { status, action = 'none' } = req.body;
    const db = getDb();

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id) as any;
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    db.transaction(() => {
      db.prepare(`
        UPDATE reports
        SET status = ?, reviewed_by = ?, resolved_at = datetime('now')
        WHERE id = ?
      `).run(status, req.user!.id, req.params.id);

      if (action === 'remove_content') {
        if (report.target_type === 'post') {
          db.prepare('UPDATE community_posts SET is_removed = 1 WHERE id = ?').run(report.target_id);
        } else if (report.target_type === 'comment') {
          db.prepare('UPDATE comments SET is_removed = 1 WHERE id = ?').run(report.target_id);
        }
      }
    })();

    res.json({ message: `Report marked as ${status}`, actionTaken: action });
  }
);

// GET /health - System health check
router.get('/health', (_req: AuthRequest, res: Response): void => {
  const db = getDb();
  let dbHealthy = false;
  try {
    db.prepare('SELECT 1').get();
    dbHealthy = true;
  } catch {}

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: { status: dbHealthy ? 'connected' : 'error', type: 'sqlite3' },
    aiService: {
      provider: config.ai.provider,
      status: config.ai.apiKey || config.ai.provider === 'demo' ? 'ready' : 'awaiting_credentials',
      model: config.ai.model,
    },
    uptime: process.uptime(),
  });
});

export default router;
