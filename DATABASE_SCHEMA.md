# FITSYNC — Database Schema & Architecture

FITSYNC employs an ACID-compliant relational storage architecture built on SQLite 3 with Write-Ahead Logging (`WAL`) enabled for high concurrency and zero lock contention during background AI processing.

Foreign key constraints and cascade deletions ensure strict referential integrity across all user-owned entities.

---

## Entity-Relationship Diagram (ERD)

```
[ users ]
   │
   ├── (1:1) ── [ user_preferences ]
   ├── (1:N) ── [ wardrobe_items ]
   │                 ▲
   │                 │ (1:N)
   ├── (1:N) ── [ outfits ] ── (1:N) ── [ outfit_items ]
   │                 │
   │                 ├── (1:N) ── [ outfit_feedback ]
   │                 ├── (1:N) ── [ saved_outfits ] ◄── (N:1) ── [ collections ]
   │                 └── (1:N) ── [ outfit_history ]
   │
   ├── (1:N) ── [ community_posts ] ── (1:N) ── [ comments ]
   ├── (1:N) ── [ votes ]
   ├── (1:N) ── [ reports ]
   ├── (1:N) ── [ notifications ]
   ├── (1:N) ── [ consent_records ]
   └── (1:N) ── [ deletion_requests ]
```

---

## Detailed Table Specifications

### 1. `users`
Core user identity and authentication credentials.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID identifier |
| `email` | TEXT | UNIQUE, NOT NULL | Account email address |
| `password_hash` | TEXT | NOT NULL | Bcrypt hashed password (10 salt rounds) |
| `display_name` | TEXT | NOT NULL | User's chosen public name |
| `profile_picture` | TEXT | NULL | Optional custom avatar URL |
| `role` | TEXT | DEFAULT 'user' | CHECK (`user`, `admin`, `moderator`) |
| `email_verified` | INTEGER | DEFAULT 0 | Verification status |
| `age_confirmed` | INTEGER | DEFAULT 0 | 16+ age confirmation check |
| `onboarding_completed` | INTEGER | DEFAULT 0 | Flags completion of style setup |
| `is_active` | INTEGER | DEFAULT 1 | 0 if suspended or pending deletion |
| `created_at` | TEXT | DEFAULT datetime('now') | ISO-8601 registration timestamp |
| `updated_at` | TEXT | DEFAULT datetime('now') | Last record update |
| `last_login` | TEXT | NULL | Timestamp of most recent auth session |

### 2. `user_preferences`
Personal style parameters used to personalize AI styling recommendations.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID identifier |
| `user_id` | TEXT | UNIQUE, FK -> users(id) | Tenant owner |
| `preferred_styles` | TEXT | DEFAULT '[]' | JSON array (e.g. `["casual", "minimalist"]`) |
| `favourite_colours` | TEXT | DEFAULT '[]' | JSON array of preferred color names |
| `preferred_occasions`| TEXT | DEFAULT '[]' | JSON array of common outfit use cases |
| `preferred_categories`| TEXT | DEFAULT '[]' | Priority categories |

### 3. `wardrobe_items`
Digital representation of physically owned clothing articles.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID identifier |
| `user_id` | TEXT | FK -> users(id) | Tenant owner |
| `image_path` | TEXT | NOT NULL | Path to uploaded image in secure storage |
| `thumbnail_path` | TEXT | NULL | Path to optimized 300x300 thumbnail |
| `custom_name` | TEXT | NULL | User-provided or AI generated label |
| `category` | TEXT | NOT NULL | `tops`, `bottoms`, `footwear`, `outerwear`, `accessories` |
| `subcategory` | TEXT | NULL | e.g. `Oversized Cotton Tee`, `Oxford Shirt` |
| `primary_color` | TEXT | NULL | Dominant detected color |
| `secondary_colors` | TEXT | DEFAULT '[]' | JSON array of accent colors |
| `pattern` | TEXT | NULL | `solid`, `striped`, `plaid`, `graphic`, etc. |
| `texture` | TEXT | NULL | `smooth`, `knit`, `denim`, `leather` |
| `material` | TEXT | NULL | Extracted fabric (e.g. `cotton`, `linen`) |
| `style` | TEXT | NULL | Detected aesthetic |
| `formality` | TEXT | NULL | `very_casual`, `casual`, `smart_casual`, `formal` |
| `season` | TEXT | NULL | `spring`, `summer`, `autumn`, `winter`, `all` |
| `ai_confidence` | REAL | NULL | Vision model confidence rating (0.0 - 1.0) |
| `is_favorite` | INTEGER | DEFAULT 0 | Bookmark flag |
| `is_available` | INTEGER | DEFAULT 1 | 0 if in laundry or unavailable |
| `created_at` | TEXT | DEFAULT datetime('now') | Upload timestamp |

*Indexes:*
- `idx_wardrobe_user`: `ON wardrobe_items(user_id)`
- `idx_wardrobe_category`: `ON wardrobe_items(category)`

### 4. `outfits`
Generated or assembled outfit recommendations.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID identifier |
| `user_id` | TEXT | FK -> users(id) | Tenant owner |
| `occasion` | TEXT | NULL | Target occasion (e.g. `work`, `casual`) |
| `style` | TEXT | NULL | Styling direction |
| `weather` | TEXT | NULL | Weather parameter |
| `explanation` | TEXT | NULL | AI Stylist reasoning commentary |
| `ai_generated` | INTEGER | DEFAULT 1 | 1 if AI created, 0 if custom |
| `created_at` | TEXT | DEFAULT datetime('now') | Generation timestamp |

### 5. `outfit_items`
Junction table linking specific wardrobe items to an outfit.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID identifier |
| `outfit_id` | TEXT | FK -> outfits(id) ON DELETE CASCADE | Parent outfit |
| `wardrobe_item_id` | TEXT | FK -> wardrobe_items(id) ON DELETE CASCADE | Associated garment |
| `position` | INTEGER | DEFAULT 0 | Layout order (top, bottom, shoes) |

### 6. `saved_outfits` & `collections`
User curated favorite looks and themed collections.
- `saved_outfits`: links `outfits` to optional `collections(id)`, tracking `worn_count` and `last_worn`.
- `collections`: name, description, timestamps.

### 7. `outfit_history`
Calendar log of daily worn outfits.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID identifier |
| `user_id` | TEXT | FK -> users(id) ON DELETE CASCADE | Tenant owner |
| `outfit_id` | TEXT | FK -> outfits(id) ON DELETE CASCADE | Outfit worn |
| `worn_date` | TEXT | NOT NULL | YYYY-MM-DD date string |
| `notes` | TEXT | NULL | Personal user diary notes |

### 8. `community_posts`, `comments`, `votes`, `reports`
Full Reddit-style community infrastructure with up/down voting, nested discussions, and moderator flagged queues.

### 9. `consent_records` & `deletion_requests`
Audit records proving compliance with explicit user consent grants, policy versions, and permanent account erasure status workflows (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
