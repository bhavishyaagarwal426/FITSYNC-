# FITSYNC — Email & Electronic Communications Compliance

This document defines the email communication protocols, consent verification mechanisms, and unsubscribe management enforced by FITSYNC.

---

## 1. Categorization of Communications

FITSYNC strictly separates transactional and marketing messages across distinct delivery channels:

### Category A: Strictly Transactional Messages
- **Examples**: Account registration verification, password reset links, security alerts, data export readiness notifications, and account deletion confirmations.
- **Consent Basis**: Contractual necessity to service the user's account.
- **Opt-out**: Non-revocable while account is active (essential for service security).

### Category B: Marketing & Editorial Digests
- **Examples**: Monthly style trend lookbooks, seasonal fashion editorial digests, and new feature announcements.
- **Consent Basis**: Explicit, unbundled opt-in via Consent Management (`marketing` consent flag).
- **Opt-out**: One-click unsubscribe link in every marketing email + toggle in `Settings > Privacy Consent`.

---

## 2. Technical Safeguards & Anti-Spam Architecture

1. **Explicit Consent Verification**:
   - The backend mail dispatcher verifies `SELECT status FROM consent_records WHERE user_id = ? AND consent_type = 'marketing'` before queueing any marketing email.
   - If status is `withdrawn` or nonexistent, marketing delivery is aborted.

2. **One-Click Unsubscribe (RFC 8058)**:
   - All outgoing marketing headers include:
     ```http
     List-Unsubscribe: <https://[DOMAIN]/api/privacy/unsubscribe?token=...>, <mailto:unsubscribe@[DOMAIN]>
     List-Unsubscribe-Post: List-Unsubscribe=One-Click
     ```
   - Clicking unsubscribe immediately updates the suppression record without requiring the user to log in or enter passwords.

3. **Suppression List Persistence**:
   - Unsubscribed email hashes are stored in a persistent suppression table to prevent accidental re-enrollment even if the user re-registers under similar metadata.
