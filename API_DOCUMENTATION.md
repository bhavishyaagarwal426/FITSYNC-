# FITSYNC — RESTful API Documentation

This document outlines all operational endpoints exposed by the FITSYNC Backend Server on base path `/api`.

---

## Authentication & Headers

Protected routes require an Authorization Bearer token header or an HTTP-only session cookie named `token`:
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

---

## 1. Authentication Routes (`/api/auth`)

### `POST /api/auth/register`
Creates a new user account, initializes their default style preferences, and returns a JWT session.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "displayName": "Alex Morgan",
    "ageConfirmed": true
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid-v4",
      "email": "user@example.com",
      "displayName": "Alex Morgan",
      "role": "user",
      "onboardingCompleted": false
    }
  }
  ```

### `POST /api/auth/login`
Authenticates existing credentials and issues JWT token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": { ... }
  }
  ```

### `GET /api/auth/me`
Fetches current authenticated profile information.
- **Auth Required**: Yes
- **Response** (`200 OK`):
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "Alex Morgan",
    "role": "user",
    "onboardingCompleted": true
  }
  ```

### `PUT /api/auth/me`
Updates user profile settings (display name, onboarding status).
- **Auth Required**: Yes

---

## 2. Digital Wardrobe Routes (`/api/wardrobe`)

### `POST /api/wardrobe/upload`
Uploads garment photo (`multipart/form-data`), generates optimized thumbnail via Sharp, triggers vision AI analysis, and saves record.
- **Auth Required**: Yes
- **Request**: Form field `image` containing JPG, PNG, or WebP (max 10MB).
- **Response** (`201 Created`):
  ```json
  {
    "message": "Clothing item uploaded and analyzed successfully",
    "item": {
      "id": "uuid",
      "name": "Black Minimalist Tee",
      "category": "tops",
      "subcategory": "T-shirt",
      "color": "black",
      "pattern": "solid",
      "material": "cotton",
      "formality": "casual",
      "style": "minimalist",
      "imageUrl": "/uploads/filename.jpg",
      "thumbnailUrl": "/uploads/thumbnails/thumb-filename.jpg",
      "isAvailable": true,
      "isFavorite": false
    }
  }
  ```

### `GET /api/wardrobe`
Lists garments with optional filters:
- **Query Params**: `category` (e.g. `tops`), `search`, `favorite` (`true`), `sortBy` (`newest`, `oldest`, `name`), `page`, `limit`.
- **Response** (`200 OK`): Paginated array of wardrobe items.

### `GET /api/wardrobe/:id`
Retrieves single item with verified tenant ownership check.

### `PUT /api/wardrobe/:id`
Updates item attributes (name, category, colors, formality, season).

### `DELETE /api/wardrobe/:id`
Permanently deletes wardrobe item and unlinks image files from storage.

### `POST /api/wardrobe/:id/favorite`
Toggles favorite flag.

### `POST /api/wardrobe/:id/availability`
Toggles availability flag (ready vs in-laundry).

---

## 3. AI Stylist & Outfits (`/api/outfits`)

### `POST /api/outfits/generate`
Executes multi-factor recommendation engine over the user's verified owned garments.
- **Request Body**:
  ```json
  {
    "occasion": "casual",
    "style": "minimalist",
    "weather": "mild",
    "colorPreference": "beige",
    "excludeItems": []
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "outfit-uuid",
    "occasion": "casual",
    "style": "minimalist",
    "weather": "mild",
    "explanation": "Pairing your black cotton tee with tailored beige chinos establishes a balanced, clean contrast suitable for a casual day.",
    "score": 0.95,
    "items": [
      {
        "id": "link-uuid",
        "slot": "tops",
        "position": 0,
        "wardrobeItem": { ... }
      },
      {
        "id": "link-uuid",
        "slot": "bottoms",
        "position": 1,
        "wardrobeItem": { ... }
      }
    ]
  }
  ```

### `POST /api/outfits/surprise`
Selects randomized styling parameters and generates an instant recommendation.

### `POST /api/outfits/:id/feedback`
Records user sentiment (`loved`, `rejected`, `saved`). Negative feedback prevents repeat suggestions.

### `GET /api/outfits/saved/all`
Lists all saved outfit combinations.

### `POST /api/outfits/:id/save`
Saves an outfit to collections.

### `POST /api/outfits/:id/worn`
Logs outfit into personal wear calendar history.

---

## 4. Collections (`/api/collections`)

- `GET /api/collections`: List collections with outfit counts.
- `POST /api/collections`: Create new collection.
- `GET /api/collections/:id`: View collection with outfits.
- `PUT /api/collections/:id`: Rename or edit description.
- `DELETE /api/collections/:id`: Delete collection (retains individual outfits).

---

## 5. Community (`/api/community`)

- `GET /api/community/posts`: List discussions (supports `sort=latest|top|hot`, search).
- `POST /api/community/posts`: Create text or image post.
- `GET /api/community/posts/:id`: Post details with threaded comments.
- `POST /api/community/posts/:id/vote`: Cast upvote or downvote.
- `POST /api/community/posts/:id/comments`: Add threaded comment reply.
- `POST /api/community/posts/:id/report`: Submit post for moderation review.

---

## 6. Style Exploration (`/api/explore`)

- `GET /api/explore/inspirations`: Paginated masonry lookbook items.
- `GET /api/explore/inspirations/:id`: Single inspiration detail.
- `POST /api/explore/inspirations/:id/like`: Upvote inspiration.
- `POST /api/explore/inspirations/:id/save`: Save inspiration to board.

---

## 7. Privacy & Consent Governance (`/api/privacy`)

- `GET /api/privacy/data`: Download full personal machine-readable archive in JSON format.
- `POST /api/privacy/delete-account`: Initiate verified account deletion workflow. Requires confirmation string `"DELETE MY ACCOUNT"`.
- `GET /api/privacy/delete-status`: Review status of account deletion request.
- `GET /api/privacy/consents`: List active consent logs.
- `POST /api/privacy/consents`: Update granular consent permission.

---

## 8. Administration (`/api/admin`)

*All administrative endpoints require role `admin`.*
- `GET /api/admin/stats`: Aggregate system metrics (users, clothes, outfits, reports).
- `GET /api/admin/users`: Paginated user accounts directory.
- `PUT /api/admin/users/:id/role`: Change role (`user`, `admin`, `moderator`).
- `PUT /api/admin/users/:id/status`: Activate or suspend user.
- `GET /api/admin/reports`: Pending moderation queue.
- `PUT /api/admin/reports/:id`: Resolve or dismiss report with content removal.
- `GET /api/admin/health`: Database connection status, AI model ready state, server uptime.
