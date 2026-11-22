import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { getDb } from '../db/database.js';
import { config } from '../config/index.js';
import { generateId } from '../utils/helpers.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('displayName').trim().isLength({ min: 2, max: 50 }).withMessage('Display name must be 2-50 characters'),
  body('ageConfirmed').optional().isBoolean(),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /register
router.post('/register', validate(registerValidation), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, displayName, ageConfirmed } = req.body;
    const db = getDb();

    // Check existing email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = generateId();
    const prefId = generateId();

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, role, age_confirmed, onboarding_completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'user', ?, 0, datetime('now'), datetime('now'))
    `);

    const insertPrefs = db.prepare(`
      INSERT INTO user_preferences (id, user_id, preferred_styles, favourite_colours, preferred_occasions, preferred_categories)
      VALUES (?, ?, '[]', '[]', '[]', '[]')
    `);

    const recordConsent = db.prepare(`
      INSERT INTO consent_records (id, user_id, consent_type, status, policy_version, ip_address)
      VALUES (?, ?, 'terms', 'granted', '1.0', ?)
    `);

    db.transaction(() => {
      insertUser.run(userId, email, passwordHash, displayName, ageConfirmed ? 1 : 0);
      insertPrefs.run(prefId, userId);
      recordConsent.run(generateId(), userId, req.ip || '127.0.0.1');
    })();

    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        displayName,
        role: 'user',
        onboardingCompleted: false,
        ageConfirmed: !!ageConfirmed,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /login
router.post('/login', validate(loginValidation), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user = db.prepare(`
      SELECT id, email, password_hash, display_name, profile_picture, role, is_active, onboarding_completed, gender
      FROM users WHERE email = ?
    `).get(email) as any;

    if (!user || !user.is_active) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        profilePicture: user.profile_picture,
        role: user.role,
        gender: user.gender || 'unisex',
        onboardingCompleted: Boolean(user.onboarding_completed),
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// POST /logout
router.post('/logout', (_req: AuthRequest, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Successfully logged out' });
});

// GET /me
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const user = db.prepare(`
    SELECT id, email, display_name, profile_picture, role, email_verified, age_confirmed, onboarding_completed, gender, created_at
    FROM users WHERE id = ?
  `).get(req.user!.id) as any;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.profile_picture,
    role: user.role,
    gender: user.gender || 'unisex',
    emailVerified: Boolean(user.email_verified),
    ageConfirmed: Boolean(user.age_confirmed),
    onboardingCompleted: Boolean(user.onboarding_completed),
    createdAt: user.created_at,
  });
});

// PUT /me
router.put(
  '/me',
  authenticate,
  validate([
    body('displayName').optional().trim().isLength({ min: 2, max: 50 }),
    body('profilePicture').optional().isString(),
    body('gender').optional().isIn(['men', 'women', 'unisex', 'all']),
    body('onboardingCompleted').optional().isBoolean(),
  ]),
  (req: AuthRequest, res: Response): void => {
    const { displayName, profilePicture, gender, onboardingCompleted } = req.body;
    const db = getDb();

    const updates: string[] = ["updated_at = datetime('now')"];
    const params: any[] = [];

    if (displayName !== undefined) {
      updates.push('display_name = ?');
      params.push(displayName);
    }
    if (profilePicture !== undefined) {
      updates.push('profile_picture = ?');
      params.push(profilePicture);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      params.push(gender);
    }
    if (onboardingCompleted !== undefined) {
      updates.push('onboarding_completed = ?');
      params.push(onboardingCompleted ? 1 : 0);
    }

    params.push(req.user!.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare(`
      SELECT id, email, display_name, profile_picture, role, gender, onboarding_completed
      FROM users WHERE id = ?
    `).get(req.user!.id) as any;

    res.json({
      id: updated.id,
      email: updated.email,
      displayName: updated.display_name,
      avatarUrl: updated.profile_picture,
      role: updated.role,
      gender: updated.gender || 'unisex',
      onboardingCompleted: Boolean(updated.onboarding_completed),
    });
  }
);

// POST /forgot-password
router.post(
  '/forgot-password',
  validate([body('email').isEmail().normalizeEmail()]),
  (_req: AuthRequest, res: Response): void => {
    // Transparently respond without leaking email existence
    res.json({ message: 'If an account exists with this email, password recovery instructions have been queued.' });
  }
);

export default router;
