import { Router, Response } from 'express';
import { body } from 'express-validator';
import { getDb } from '../db/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateId } from '../utils/helpers.js';

const router = Router();

// Helper to format post row
function formatPost(p: any, currentUserId?: string, userVote?: string) {
  return {
    id: p.id,
    userId: p.user_id,
    user: {
      id: p.user_id,
      displayName: p.display_name,
      avatarUrl: p.profile_picture,
    },
    title: p.title,
    content: p.content,
    imageUrl: p.image_path,
    postType: p.post_type,
    upvotes: p.upvotes || 0,
    downvotes: p.downvotes || 0,
    commentCount: p.comment_count || 0,
    userVote: userVote || null,
    isReported: Boolean(p.is_flagged),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// GET /posts - Feed with sorting (latest, top, hot)
router.get('/posts', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const { sort = 'latest', page = 1, limit = 20, search } = req.query as any;

  let orderBy = 'p.created_at DESC';
  if (sort === 'top') {
    orderBy = '(p.upvotes - p.downvotes) DESC, p.created_at DESC';
  } else if (sort === 'hot') {
    // Score based on upvotes and recent time
    orderBy = '((p.upvotes * 2) + p.comment_count) DESC, p.created_at DESC';
  }

  let whereClause = 'WHERE p.is_removed = 0';
  const params: any[] = [];

  if (search && search.trim()) {
    whereClause += ' AND (p.title LIKE ? OR p.content LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }

  const offset = (Number(page) - 1) * Number(limit);

  const posts = db.prepare(`
    SELECT p.*, u.display_name, u.profile_picture,
      (SELECT vote_type FROM votes WHERE user_id = ? AND target_type = 'post' AND target_id = p.id) as user_vote
    FROM community_posts p
    JOIN users u ON p.user_id = u.id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(req.user!.id, ...params, Number(limit), offset) as any[];

  const countRow = db.prepare(`
    SELECT COUNT(*) as total FROM community_posts p ${whereClause}
  `).get(...params) as any;

  res.json({
    data: posts.map((p: any) => formatPost(p, req.user!.id, p.user_vote)),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / Number(limit)),
    },
  });
});

// POST /posts - Create post
router.post(
  '/posts',
  authenticate,
  validate([
    body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('content').optional().trim(),
    body('postType').optional().isIn(['text', 'image', 'outfit']),
    body('imageUrl').optional().isString(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { title, content, postType = 'text', imageUrl } = req.body;
    const db = getDb();
    const id = generateId();

    db.prepare(`
      INSERT INTO community_posts (id, user_id, title, content, image_path, post_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user!.id, title, content || '', imageUrl || null, postType);

    const post = db.prepare(`
      SELECT p.*, u.display_name, u.profile_picture
      FROM community_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(id) as any;

    res.status(201).json(formatPost(post, req.user!.id));
  }
);

// GET /posts/:id - Single post with comments
router.get('/posts/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const post = db.prepare(`
    SELECT p.*, u.display_name, u.profile_picture,
      (SELECT vote_type FROM votes WHERE user_id = ? AND target_type = 'post' AND target_id = p.id) as user_vote
    FROM community_posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ? AND p.is_removed = 0
  `).get(req.user!.id, req.params.id) as any;

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  // Get comments
  const comments = db.prepare(`
    SELECT c.*, u.display_name, u.profile_picture,
      (SELECT vote_type FROM votes WHERE user_id = ? AND target_type = 'comment' AND target_id = c.id) as user_vote
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ? AND c.is_removed = 0
    ORDER BY c.created_at ASC
  `).all(req.user!.id, req.params.id) as any[];

  res.json({
    post: formatPost(post, req.user!.id, post.user_vote),
    comments: comments.map((c: any) => ({
      id: c.id,
      postId: c.post_id,
      userId: c.user_id,
      user: {
        id: c.user_id,
        displayName: c.display_name,
        avatarUrl: c.profile_picture,
      },
      parentId: c.parent_id,
      content: c.content,
      upvotes: c.upvotes || 0,
      downvotes: c.downvotes || 0,
      userVote: c.user_vote || null,
      createdAt: c.created_at,
    })),
  });
});

// POST /posts/:id/vote - Upvote / Downvote post
router.post(
  '/posts/:id/vote',
  authenticate,
  validate([body('value').isIn(['up', 'down', 'none'])]),
  (req: AuthRequest, res: Response): void => {
    const { value } = req.body;
    const db = getDb();

    const post = db.prepare('SELECT id, upvotes, downvotes FROM community_posts WHERE id = ?').get(req.params.id) as any;
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const existingVote = db.prepare(`
      SELECT id, vote_type FROM votes
      WHERE user_id = ? AND target_type = 'post' AND target_id = ?
    `).get(req.user!.id, req.params.id) as any;

    db.transaction(() => {
      let upDelta = 0;
      let downDelta = 0;

      if (existingVote) {
        if (existingVote.vote_type === 'up') upDelta -= 1;
        if (existingVote.vote_type === 'down') downDelta -= 1;
        db.prepare('DELETE FROM votes WHERE id = ?').run(existingVote.id);
      }

      if (value === 'up' || value === 'down') {
        db.prepare(`
          INSERT INTO votes (id, user_id, target_type, target_id, vote_type)
          VALUES (?, ?, 'post', ?, ?)
        `).run(generateId(), req.user!.id, req.params.id, value);

        if (value === 'up') upDelta += 1;
        if (value === 'down') downDelta += 1;
      }

      db.prepare(`
        UPDATE community_posts
        SET upvotes = MAX(0, upvotes + ?), downvotes = MAX(0, downvotes + ?)
        WHERE id = ?
      `).run(upDelta, downDelta, req.params.id);
    })();

    const updated = db.prepare('SELECT upvotes, downvotes FROM community_posts WHERE id = ?').get(req.params.id) as any;
    res.json({ upvotes: updated.upvotes, downvotes: updated.downvotes, userVote: value === 'none' ? null : value });
  }
);

// POST /posts/:id/comments - Add comment
router.post(
  '/posts/:id/comments',
  authenticate,
  validate([
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment content is required'),
    body('parentId').optional().isString(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { content, parentId } = req.body;
    const db = getDb();

    const post = db.prepare('SELECT id FROM community_posts WHERE id = ? AND is_removed = 0').get(req.params.id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const commentId = generateId();

    db.transaction(() => {
      db.prepare(`
        INSERT INTO comments (id, post_id, user_id, parent_id, content)
        VALUES (?, ?, ?, ?, ?)
      `).run(commentId, req.params.id, req.user!.id, parentId || null, content);

      db.prepare(`
        UPDATE community_posts
        SET comment_count = comment_count + 1
        WHERE id = ?
      `).run(req.params.id);
    })();

    const user = db.prepare('SELECT display_name, profile_picture FROM users WHERE id = ?').get(req.user!.id) as any;

    res.status(201).json({
      id: commentId,
      postId: req.params.id,
      userId: req.user!.id,
      user: {
        id: req.user!.id,
        displayName: user.display_name,
        avatarUrl: user.profile_picture,
      },
      parentId: parentId || null,
      content,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      createdAt: new Date().toISOString(),
    });
  }
);

// POST /posts/:id/report - Report post
router.post(
  '/posts/:id/report',
  authenticate,
  validate([
    body('reason').trim().isLength({ min: 3, max: 200 }).withMessage('Reason is required'),
    body('details').optional().trim(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { reason, details } = req.body;
    const db = getDb();

    db.prepare(`
      INSERT INTO reports (id, reporter_id, target_type, target_id, reason, details)
      VALUES (?, ?, 'post', ?, ?, ?)
    `).run(generateId(), req.user!.id, req.params.id, reason, details || null);

    db.prepare('UPDATE community_posts SET is_flagged = 1 WHERE id = ?').run(req.params.id);

    res.status(201).json({ message: 'Report submitted for moderation review' });
  }
);

export default router;
