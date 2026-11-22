# FITSYNC — Data Deletion & Account Erasure Workflow

FITSYNC implements a cryptographically auditable, multi-stage account erasure workflow that guarantees the irreversible destruction of user data across database records and binary object storage.

---

## 1. Deletion Lifecycle Statuses

```
[ User Requests Deletion ]
           │
           ▼
     ( PENDING ) ────────── Account immediately deactivated (`is_active = 0`)
           │                Session tokens invalidated
           ▼
  ( IN_PROGRESS ) ──────── Storage scrubber unlinks all wardrobe photos & thumbnails
           │                Database executes cascade deletion across user tables
           ▼
   ( COMPLETED ) ───────── Deletion audit receipt generated with timestamp
```

| Status | Meaning | System Action |
|---|---|---|
| `PENDING` | Request received & verified | Disables account access immediately to prevent new logins |
| `VERIFICATION_REQUIRED`| Additional security verification | Triggered if request initiated from untrusted IP address |
| `IN_PROGRESS` | Deletion pipeline executing | Active background scrubber unlinks media and cascades SQL deletes |
| `COMPLETED` | Data permanently purged | Success status logged; user session cleared |
| `FAILED` | Process encountered error | Admin notification queued for manual audit review |

---

## 2. Technical Execution Steps

When a user calls `POST /api/privacy/delete-account` with the mandatory confirmation string `"DELETE MY ACCOUNT"`:

1. **Step 1: Account Lockout**
   - The user record is updated to `is_active = 0`.
   - The session cookie `token` is cleared from the response header.
   - All subsequent API requests with existing tokens are rejected with `401 User not found or inactive`.

2. **Step 2: Binary Media Scrubbing**
   - All `image_path` and `thumbnail_path` records in `wardrobe_items` associated with `user_id` are enumerated.
   - The filesystem unlinker iterates over each file path and destroys the file on disk.

3. **Step 3: Database Cascaded Deletion**
   - SQLite foreign key constraints (`ON DELETE CASCADE`) are triggered by running:
     ```sql
     DELETE FROM users WHERE id = ?;
     ```
   - Automatically cleans up `user_preferences`, `wardrobe_items`, `outfits`, `outfit_items`, `outfit_feedback`, `saved_outfits`, `collections`, `outfit_history`, `votes`, and `notifications`.

4. **Step 4: Community Content Anonymization**
   - To prevent breaking public discussion threads, public forum posts are retained with the author link anonymized to `"Deleted User"`.
