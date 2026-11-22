# FITSYNC — Security Audit & Threat Model

This audit assesses the defense controls, authentication flows, data protection mechanisms, and architectural isolation implemented across FITSYNC.

---

## 1. Authentication & Session Security

- **Password Hashing**: Passwords hashed using Bcrypt with 10 salt rounds. Plaintext passwords are never logged, stored, or transmitted in responses.
- **Token Verification**: Stateless JSON Web Tokens (JWT) verified via HMAC-SHA256 with server-side secret validation.
- **Session Transport**: Supported via HTTP-only, SameSite=Lax, Secure cookies (in production mode) preventing client-side script interception (XSS session theft).
- **Brute Force Protection**: Express-Rate-Limit limits IP requests to 100 requests per 15-minute window on all `/api/` endpoints.

---

## 2. Authorization & Tenant Isolation

- **Ownership Checks**: Every private route (`/api/wardrobe/:id`, `/api/outfits/:id`, `/api/collections/:id`) verifies that the requested record belongs to `req.user.id`. Modifying or deleting foreign user garments returns `404 Not Found` or `403 Forbidden`.
- **Role-Based Access Control (RBAC)**: Administrative routes (`/api/admin/*`) are protected by the `requireAdmin` middleware, which verifies `role === 'admin'` from both database state and token payload.
- **Privacy Shield on Photos**: Wardrobe photographs are served with tenant isolation. Community posts only display images explicitly published to the community board.

---

## 3. Input Validation & Injection Prevention

- **SQL Injection Prevention**: All queries to SQLite use parameterized prepared statements (`db.prepare('... WHERE user_id = ?').run(params)`). No SQL queries are constructed via string interpolation.
- **Express-Validator**: All POST/PUT endpoints strictly validate incoming payloads against predefined schemas, sanitizing email addresses and enforcing minimum/maximum character boundaries.
- **XSS & Content Security**: Helmet HTTP headers are applied globally to prevent clickjacking, MIME sniffing, and cross-site scripting.

---

## 4. File Upload & Image Processing Safety

- **Multer Storage Boundaries**: File uploads are restricted to a dedicated `uploads/` directory with randomly generated UUID filenames to prevent path traversal attacks.
- **MIME & Extension Whitelisting**: Strictly restricts uploads to `image/jpeg`, `image/png`, and `image/webp`. Executables and shell scripts are rejected.
- **File Size Restrictions**: Max upload limit enforced at 10MB per image on both backend and frontend layers.
- **Sharp Image Sanitization**: Images are processed through `sharp` to strip potentially malicious EXIF metadata and create standardized thumbnail dimensions.

---

## 5. Security Summary Checklist

| Security Control | Implementation Status | Notes |
|---|---|---|
| Password Hashing | **Passed** | Bcrypt 10 salt rounds |
| SQL Injection Defense | **Passed** | 100% Prepared Statements |
| CSRF Protection | **Passed** | SameSite cookie policy + Bearer Auth |
| File Upload Protection | **Passed** | Size caps, MIME check, Sharp sanitization |
| Tenant Isolation | **Passed** | User ownership verified on all mutations |
| RBAC Admin Guard | **Passed** | Backend middleware + database role check |
| Rate Limiting | **Passed** | 100 req / 15 min window |
