# FITSYNC — Consent Management & Transparency Architecture

FITSYNC separates user consents into discrete, purpose-specific permissions rather than bundling unrelated authorizations into a single blanket agreement.

---

## 1. Consent Matrix by Purpose

| Consent Identifier | Purpose Description | Classification | Default State | Revocable? |
|---|---|---|---|---|
| `terms` | Agreement to User Terms & Conditions | Mandatory for service | Granted on registration | Yes (via account deletion) |
| `wardrobe_ai_processing` | Vision model parsing of clothing images | Optional Core Feature | Granted by default | **Yes** (anytime in UI) |
| `community_visibility` | Ability to publish community discussions | Optional Community | Granted by default | **Yes** (anytime in UI) |
| `analytics` | Pseudonymized performance telemetry | Non-Essential | **Withdrawn (Opt-in)** | **Yes** (anytime in UI) |
| `marketing` | Style trend digests & lookbooks | Optional Marketing | **Withdrawn (Opt-in)** | **Yes** (anytime in UI) |

---

## 2. Audit Trail & Record Keeping

Every consent event (grant or withdrawal) is committed to the database table `consent_records`:
```sql
CREATE TABLE consent_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('granted', 'withdrawn')),
  policy_version TEXT DEFAULT '1.0',
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Key Compliance Rules:
1. **Explicit Action Required**: Checkboxes for age confirmation and terms acceptance are never pre-checked.
2. **Version Tracking**: Whenever terms or privacy policies update, the policy version changes (e.g. `1.1`), prompting users to review updates upon their next login.
3. **No Coercion**: Disabling optional consents (e.g. `analytics`, `community_visibility`) does not block users from using the digital wardrobe and outfit recommendation features.
