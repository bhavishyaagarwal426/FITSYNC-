import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET / - List notifications
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(req.user!.id) as any[];

  res.json({
    data: rows.map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: Boolean(n.is_read),
      createdAt: n.created_at,
    })),
  });
});

// PUT /:id/read - Mark single as read
router.put('/:id/read', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  res.json({ message: 'Marked as read' });
});

// PUT /read-all - Mark all as read
router.put('/read-all', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user!.id);
  res.json({ message: 'All notifications marked as read' });
});

// DELETE /:id - Delete notification
router.delete('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  res.json({ message: 'Notification deleted' });
});

export default router;
