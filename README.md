# FITSYNC — AI Personal Wardrobe & Stylist

> **"Your wardrobe has more possibilities than you think."**

FITSYNC is a complete, production-ready AI personal wardrobe and styling platform designed to help people organize the clothes they already own and discover fresh, stylish outfit combinations.

Combining visual fashion discovery (Pinterest-inspired), an optional fashion discussion forum (Reddit-inspired), and an intelligent personal stylist, FITSYNC's core differentiator is that **every recommendation primarily uses clothes the user actually owns** — never silently injecting imaginary or unowned garments.

---

## Key Capabilities & Highlights

1. **Digital Wardrobe Digitization**: Drag-and-drop or batch photo upload for tops, bottoms, footwear, outerwear, and accessories.
2. **AI Vision Garment Identification**: Automatic recognition of garment category, subcategory, primary & secondary colors, fabric textures, formality, and seasonal suitability with full user-editing agency.
3. **AI Stylist Recommendation Engine**: Structured multi-tier scoring incorporating category compatibility, color harmonies, formality consistency, occasion relevance, and live weather adaptation.
4. **Explainable Styling**: Every generated look includes an editorial AI stylist critique explaining why the combination works.
5. **Interactive Outfit Actions**: Love It (refines style weights), Not My Style (avoids repeating combination), Try Another (instant re-generation), Save to Collection, and Mark as Worn (logs wear history).
6. **Pinterest-Style Explore**: Editorial masonry lookbook grids with seasonal aesthetics and look saving.
7. **Reddit-Style Fashion Community**: Optional fashion discussions, image posts, voting (up/down), threaded comments, and community moderation.
8. **Admin Dashboard**: System health metrics, user account management, moderation queues, and AI provider status.
9. **Privacy Governance & Compliance**: Granular consent management, machine-readable JSON data export ("Download My Data"), and a verifiable cryptographic account deletion workflow respecting the Indian DPDP Act framework.

---

## Design System

Designed strictly according to the mandatory FITSYNC visual specification:
- **Background**: Warm cream (`#FAF7F2`)
- **Primary Accent**: Deep burgundy (`#64172D`)
- **Typography**: Inter (Google Fonts)
- **Cards**: White & warm off-white with fine borders (`#E0D5C4`) and subtle shadows
- **Vibe**: Premium, minimalist fashion editorial

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Zustand, React Dropzone, React Hot Toast.
- **Backend**: Node.js, Express, TypeScript, Better-SQLite3 (WAL mode), Helmet, JWT Authentication, Bcrypt, Multer, Sharp (image optimization), Express-Rate-Limit.
- **AI Integration**: Provider abstraction supporting OpenAI Vision (`gpt-4o`) and built-in Demo Provider for development and credential-free offline testing.

---

## Quickstart & Local Installation

### Prerequisites
- Node.js 18+ (tested on v22)
- npm 9+

### 1. Clone & Setup
```bash
git clone <repo-url> fitsync
cd fitsync
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your JWT secret and optional AI credentials
npm run dev
# Server will run on http://localhost:3001
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
# Client will run on http://localhost:5173
```

### Pre-Seeded Demo Accounts
When initialized, FITSYNC automatically seeds two accounts:
- **Demo User**: `demo@fitsync.com` / `password123` (Preloaded with sample wardrobe pieces)
- **Administrator**: `admin@fitsync.com` / `admin123`

---

## Project Structure

```
fitsync/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # ProtectedRoute, AdminRoute, CookieBanner
│   │   │   ├── community/      # PostCard, CommentThread, VoteButtons
│   │   │   ├── dashboard/      # WardrobeOverview, RecentlyAdded, AIPicks, StyleInspiration
│   │   │   ├── layout/         # Sidebar, TopNav, MobileNav, AppLayout, AuthLayout
│   │   │   ├── onboarding/     # StyleCard, ColorCard, ProgressBar
│   │   │   ├── styleme/        # OccasionSelector, StyleSelector, WeatherSelector, ColorSelector, OutfitDisplay
│   │   │   ├── ui/             # Button, Input, Card, Modal, Badge, Skeleton, EmptyState, Select, Tabs, Avatar
│   │   │   └── wardrobe/       # WardrobeGrid, WardrobeItemCard, UploadDropzone
│   │   ├── pages/              # 32 Complete Lazy-Loaded Views
│   │   ├── services/           # Axios client with JWT interceptors
│   │   ├── store/              # Zustand state stores (auth, wardrobe, outfit, explore, community, ui)
│   │   ├── types/              # Comprehensive TypeScript interfaces
│   │   └── utils/              # Color swatches, style definitions, constants
├── server/                     # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Environment configuration & fallbacks
│   │   ├── db/                 # Database schema initialization & seeding
│   │   ├── middleware/         # JWT auth, RBAC admin check, express-validator
│   │   ├── routes/             # auth, wardrobe, outfits, collections, history, community, explore, privacy, admin
│   │   ├── services/           # AI provider abstraction (OpenAI / Demo), outfit recommendation engine
│   │   └── utils/              # Image validation, ID generators, helpers
│   ├── data/                   # SQLite database (fitsync.db)
│   └── uploads/                # Local secure file storage and thumbnails
└── documentation/              # Full Audit and Compliance Docs
```

---

## Required Documentation Index

1. [API Documentation](./API_DOCUMENTATION.md)
2. [Database Schema](./DATABASE_SCHEMA.md)
3. [Deployment Guide](./DEPLOYMENT_GUIDE.md)
4. [Security Audit](./SECURITY_AUDIT.md)
5. [Accessibility Report](./ACCESSIBILITY_REPORT.md)
6. [Third Party Audit](./THIRD_PARTY_AUDIT.md)
7. [Data Retention Policy](./DATA_RETENTION_POLICY.md)
8. [Data Deletion Workflow](./DATA_DELETION_WORKFLOW.md)
9. [Consent Management](./CONSENT_MANAGEMENT.md)
10. [Legal Compliance Checklist](./LEGAL_COMPLIANCE_CHECKLIST.md)
11. [Licence Inventory](./LICENCE_INVENTORY.md)
12. [Business Information](./BUSINESS_INFORMATION.md)
13. [Email Compliance](./EMAIL_COMPLIANCE.md)
