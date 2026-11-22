import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

import { config } from './config/index.js';
import { initializeDatabase, getDb } from './db/database.js';
import { generateId } from './utils/helpers.js';

import authRoutes from './routes/auth.js';
import preferencesRoutes from './routes/preferences.js';
import wardrobeRoutes from './routes/wardrobe.js';
import outfitsRoutes from './routes/outfits.js';
import collectionsRoutes from './routes/collections.js';
import historyRoutes from './routes/history.js';
import communityRoutes from './routes/community.js';
import exploreRoutes from './routes/explore.js';
import notificationsRoutes from './routes/notifications.js';
import privacyRoutes from './routes/privacy.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Initialize database
initializeDatabase();

// Seed initial users & sample wardrobe if database is new
async function seedInitialData() {
  const db = getDb();
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  if (userCount === 0) {
    console.log('Seeding demo & admin users...');
    const salt = await bcrypt.genSalt(10);
    const userPass = await bcrypt.hash('password123', salt);
    const adminPass = await bcrypt.hash('admin123', salt);

    const demoUserId = 'demo-user-1';
    const adminUserId = 'admin-user-1';

    // Demo User
    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, role, onboarding_completed, age_confirmed)
      VALUES (?, 'demo@fitsync.com', ?, 'Alex Morgan', 'user', 1, 1)
    `).run(demoUserId, userPass);

    db.prepare(`
      INSERT INTO user_preferences (id, user_id, preferred_styles, favourite_colours, preferred_occasions, preferred_categories)
      VALUES (?, ?, '["casual","minimalist","smart_casual"]', '["black","beige","white","navy"]', '["casual","work","everyday"]', '["tops","bottoms","footwear"]')
    `).run(generateId(), demoUserId);

    // Admin User
    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, role, onboarding_completed, age_confirmed)
      VALUES (?, 'admin@fitsync.com', ?, 'FITSYNC Admin', 'admin', 1, 1)
    `).run(adminUserId, adminPass);

    // Seed sample wardrobe items for demo user
    const sampleItems = [
      { id: 'item-1', cat: 'tops', sub: 'Oversized Cotton Tee', col: 'black', form: 'casual', style: 'minimalist', name: 'Black Minimalist Tee' },
      { id: 'item-2', cat: 'tops', sub: 'Oxford Button-Down', col: 'white', form: 'smart_casual', style: 'classic', name: 'White Oxford Shirt' },
      { id: 'item-3', cat: 'bottoms', sub: 'Slim Chinos', col: 'beige', form: 'smart_casual', style: 'minimalist', name: 'Beige Tailored Chinos' },
      { id: 'item-4', cat: 'bottoms', sub: 'Straight Denim', col: 'blue', form: 'casual', style: 'casual', name: 'Classic Blue Jeans' },
      { id: 'item-5', cat: 'footwear', sub: 'Leather Low Sneakers', col: 'white', form: 'casual', style: 'minimalist', name: 'Clean White Sneakers' },
      { id: 'item-6', cat: 'footwear', sub: 'Penny Loafers', col: 'brown', form: 'smart_casual', style: 'classic', name: 'Brown Leather Loafers' },
      { id: 'item-7', cat: 'outerwear', sub: 'Wool Overshirt', col: 'navy', form: 'casual', style: 'streetwear', name: 'Navy Wool Overshirt' },
      { id: 'item-8', cat: 'accessories', sub: 'Minimalist Watch', col: 'black', form: 'smart_casual', style: 'minimalist', name: 'Matte Black Chrono Watch' },
    ];

    const insertItem = db.prepare(`
      INSERT INTO wardrobe_items (
        id, user_id, image_path, thumbnail_path, original_filename,
        category, subcategory, primary_color, pattern, material, style,
        formality, season, use_cases, ai_confidence, ai_analyzed, is_favorite,
        is_available, custom_name
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, 'solid', 'cotton', ?,
        ?, 'all', '["casual","everyday"]', 0.95, 1, 1,
        1, ?
      )
    `);

    for (const s of sampleItems) {
      // Placeholder image URL for demo seed
      const imgPath = `/uploads/placeholder-${s.cat}.png`;
      insertItem.run(
        s.id,
        demoUserId,
        imgPath,
        imgPath,
        `${s.name}.png`,
        s.cat,
        s.sub,
        s.col,
        s.style,
        s.form,
        s.name
      );
    }

    // Seed a sample community post
    db.prepare(`
      INSERT INTO community_posts (id, user_id, title, content, post_type, upvotes, comment_count)
      VALUES (?, ?, 'Minimalist autumn outfit essentials - thoughts?', 'Just added beige chinos and an oxford shirt to my FITSYNC wardrobe. What do you all think about this color pairing for university or casual workdays?', 'text', 14, 2)
    `).run(generateId(), demoUserId);

    console.log('Seeding complete: demo@fitsync.com (pass: password123)');
  }
}

seedInitialData();

// Security & utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: true, // Allow frontend dev server
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting — relaxed for general usage, bypass localhost / development entirely
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || config.nodeEnv === 'development';
  },
  message: { error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// Serve uploaded images statically
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Serve built frontend assets directly from port 3001
const clientDistDir = path.resolve(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));
}

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/outfits', outfitsRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FITSYNC API Server',
    environment: config.nodeEnv,
  });
});

// 404 handler for unknown API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Single Page Application (SPA) fallback for non-API routes
app.get('*', (_req, res) => {
  const indexHtml = path.join(clientDistDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.send('FITSYNC API Server is active. Please run `npm run client:dev` to access the frontend.');
  }
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  const message = config.nodeEnv === 'production' ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
});

// Start listening
const server = app.listen(config.port, () => {
  console.log(`✨ FITSYNC Backend Server running on http://localhost:${config.port}`);
});

export default app;
