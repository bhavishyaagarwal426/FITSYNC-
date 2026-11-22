# FITSYNC — Data Retention & Lifecycle Policy

This policy defines the retention schedules, automated purging rules, and backup lifecycles applied to all user data stored within the FITSYNC platform.

---

## 1. Retention Matrix

| Data Category | Specific Entity | Retention Period | Disposal Method |
|---|---|---|---|
| **Active User Accounts** | Profile, preferences, email | Duration of active subscription/membership | Crypto-erasure upon deletion request |
| **Wardrobe Photographs** | JPG / PNG / WebP uploads | Duration of item cataloging | File unlinked and scrubbed from disk |
| **Generated Outfits** | Outfits, outfit items, feedback | Retained until user deletes account or resets closet | Cascaded database deletion |
| **Wear History Logs** | Daily calendar entries | Retained for wear tracking until account closure | Cascaded database deletion |
| **Community Content** | Public discussions & comments | Retained until author removes or account deleted | Soft-delete / author anonymization |
| **Authentication Logs** | `last_login`, session records | 90 days rolling window | Truncated via automated maintenance |
| **Temporary Uploads** | Unsubmitted file previews | Purged after 24 hours if unfinalized | Automated cleanup cron |
| **Database Backups** | Encrypted DB snapshots | 30 days maximum retention | Automated rolling overwrite |

---

## 2. Inactive Account Handling

- Accounts inactive for greater than 24 consecutive months receive a notification notice offering reactivation.
- If no reactivation occurs within 30 days of notice, non-essential temporary data is queued for automated archival.

---

## 3. Storage Minimization & Image Optimization

To prevent indefinite accumulation of unnecessary binary files:
- All uploaded images are processed via `sharp` into compressed WebP and compact 300x300 thumbnails.
- When a user deletes a garment from their wardrobe interface, the backend file unlinker immediately removes both the primary image and thumbnail from disk storage.
