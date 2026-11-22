import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'fitsync.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDb();

  database.exec(`
    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      profile_picture TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'moderator')),
      email_verified INTEGER DEFAULT 0,
      age_confirmed INTEGER DEFAULT 0,
      onboarding_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      last_login TEXT,
      is_active INTEGER DEFAULT 1
    );

    -- User Preferences
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      preferred_styles TEXT DEFAULT '[]',
      favourite_colours TEXT DEFAULT '[]',
      preferred_occasions TEXT DEFAULT '[]',
      preferred_categories TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Wardrobe Items
    CREATE TABLE IF NOT EXISTS wardrobe_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      image_path TEXT NOT NULL,
      thumbnail_path TEXT,
      original_filename TEXT,
      category TEXT NOT NULL,
      subcategory TEXT,
      primary_color TEXT,
      secondary_colors TEXT DEFAULT '[]',
      pattern TEXT,
      texture TEXT,
      material TEXT,
      style TEXT,
      formality TEXT,
      season TEXT,
      use_cases TEXT DEFAULT '[]',
      ai_confidence REAL,
      ai_analyzed INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      is_available INTEGER DEFAULT 1,
      custom_name TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_wardrobe_user ON wardrobe_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_wardrobe_category ON wardrobe_items(category);

    -- Outfits
    CREATE TABLE IF NOT EXISTS outfits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT,
      occasion TEXT,
      style TEXT,
      weather TEXT,
      explanation TEXT,
      ai_generated INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_outfits_user ON outfits(user_id);

    -- Outfit Items (junction table)
    CREATE TABLE IF NOT EXISTS outfit_items (
      id TEXT PRIMARY KEY,
      outfit_id TEXT NOT NULL,
      wardrobe_item_id TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
      FOREIGN KEY (wardrobe_item_id) REFERENCES wardrobe_items(id) ON DELETE CASCADE
    );

    -- Outfit Feedback
    CREATE TABLE IF NOT EXISTS outfit_feedback (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      outfit_id TEXT NOT NULL,
      feedback TEXT NOT NULL CHECK(feedback IN ('loved', 'rejected', 'saved')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_feedback_user ON outfit_feedback(user_id);

    -- Saved Outfits
    CREATE TABLE IF NOT EXISTS saved_outfits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      outfit_id TEXT NOT NULL,
      collection_id TEXT,
      notes TEXT,
      worn_count INTEGER DEFAULT 0,
      last_worn TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL
    );

    -- Collections
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Outfit History
    CREATE TABLE IF NOT EXISTS outfit_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      outfit_id TEXT NOT NULL,
      worn_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE
    );

    -- Community Posts
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      image_path TEXT,
      post_type TEXT DEFAULT 'text' CHECK(post_type IN ('text', 'image', 'outfit')),
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      is_flagged INTEGER DEFAULT 0,
      is_removed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_posts_user ON community_posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts(created_at);

    -- Comments
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      parent_id TEXT,
      content TEXT NOT NULL,
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      is_removed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    );

    -- Votes
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment')),
      target_id TEXT NOT NULL,
      vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'down')),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, target_type, target_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Reports
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment', 'user')),
      target_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
      reviewed_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

    -- Consent Records
    CREATE TABLE IF NOT EXISTS consent_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      consent_type TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('granted', 'withdrawn')),
      policy_version TEXT DEFAULT '1.0',
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Deletion Requests
    CREATE TABLE IF NOT EXISTS deletion_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'VERIFICATION_REQUIRED', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
      reason TEXT,
      requested_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Blocked Users
    CREATE TABLE IF NOT EXISTS blocked_users (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      blocked_user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, blocked_user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Audit Log
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);

    -- Style Inspiration
    CREATE TABLE IF NOT EXISTS style_inspirations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      category TEXT,
      style TEXT,
      season TEXT,
      tags TEXT DEFAULT '[]',
      likes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Saved Inspirations
    CREATE TABLE IF NOT EXISTS saved_inspirations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      inspiration_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, inspiration_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (inspiration_id) REFERENCES style_inspirations(id) ON DELETE CASCADE
    );
  `);

  // Seed style inspirations if empty
  const count = database.prepare('SELECT COUNT(*) as count FROM style_inspirations').get() as { count: number };
  if (count.count === 0) {
    seedInspirations(database);
  }

  console.log('Database initialized successfully');
}

function seedInspirations(db: Database.Database) {
  const inspirations = [
    { id: 'insp-1', title: 'Minimalist Monday', description: 'Clean lines and neutral tones for a polished start to the week', image_url: '/api/placeholder/inspiration/minimalist-1', category: 'minimalist', style: 'minimalist', season: 'all', tags: '["neutral","clean","modern"]' },
    { id: 'insp-2', title: 'Street Style Edge', description: 'Bold combinations that turn heads on the street', image_url: '/api/placeholder/inspiration/street-1', category: 'streetwear', style: 'streetwear', season: 'all', tags: '["bold","urban","trendy"]' },
    { id: 'insp-3', title: 'Old Money Elegance', description: 'Timeless sophistication with a touch of luxury', image_url: '/api/placeholder/inspiration/oldmoney-1', category: 'formal', style: 'old_money', season: 'all', tags: '["elegant","classic","luxury"]' },
    { id: 'insp-4', title: 'Casual Friday Vibes', description: 'Relaxed yet put-together looks for the weekend', image_url: '/api/placeholder/inspiration/casual-1', category: 'casual', style: 'casual', season: 'all', tags: '["relaxed","comfortable","weekend"]' },
    { id: 'insp-5', title: 'Korean Street Fashion', description: 'K-fashion inspired looks with layered textures', image_url: '/api/placeholder/inspiration/korean-1', category: 'korean', style: 'korean', season: 'spring', tags: '["korean","layered","trendy"]' },
    { id: 'insp-6', title: 'Summer Breeze', description: 'Light and airy outfits for warm days', image_url: '/api/placeholder/inspiration/summer-1', category: 'casual', style: 'casual', season: 'summer', tags: '["summer","light","breathable"]' },
    { id: 'insp-7', title: 'Winter Layering', description: 'Master the art of stylish layering in cold weather', image_url: '/api/placeholder/inspiration/winter-1', category: 'casual', style: 'smart_casual', season: 'winter', tags: '["winter","layers","cozy"]' },
    { id: 'insp-8', title: 'Sporty Chic', description: 'Athletic-inspired looks that work beyond the gym', image_url: '/api/placeholder/inspiration/sporty-1', category: 'sporty', style: 'sporty', season: 'all', tags: '["athletic","active","modern"]' },
    { id: 'insp-9', title: 'Vintage Revival', description: 'Retro-inspired pieces with a modern twist', image_url: '/api/placeholder/inspiration/vintage-1', category: 'vintage', style: 'vintage', season: 'autumn', tags: '["retro","classic","unique"]' },
    { id: 'insp-10', title: 'Smart Casual Perfection', description: 'The perfect balance between formal and relaxed', image_url: '/api/placeholder/inspiration/smart-casual-1', category: 'smart_casual', style: 'smart_casual', season: 'all', tags: '["versatile","polished","balanced"]' },
    { id: 'insp-11', title: 'Monochrome Magic', description: 'All-black or single-tone outfits that make a statement', image_url: '/api/placeholder/inspiration/mono-1', category: 'minimalist', style: 'minimalist', season: 'all', tags: '["monochrome","sleek","bold"]' },
    { id: 'insp-12', title: 'Earth Tones Collection', description: 'Warm browns, olives, and terracotta palettes', image_url: '/api/placeholder/inspiration/earth-1', category: 'casual', style: 'casual', season: 'autumn', tags: '["earth","natural","warm"]' },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO style_inspirations (id, title, description, image_url, category, style, season, tags)
    VALUES (@id, @title, @description, @image_url, @category, @style, @season, @tags)
  `);

  for (const insp of inspirations) {
    stmt.run(insp);
  }
}
