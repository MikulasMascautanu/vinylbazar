# Implementation Plan: Email Notifications for New Vinyl Records

## Overview

Add email notifications to the vinyl scraper that sends an alert when new records are discovered during the daily GitHub Actions scrape.

**Tech Stack:** Node.js, Nodemailer, Gmail SMTP, GitHub Actions
**Notification Method:** HTML Email
**Trigger:** After successful scrape (only if new records found)

---

## Phase 1: Email Service Setup & Local Testing

**Goal:** Set up Gmail SMTP and test email sending locally.

### Context

- **SMTP Service:** Gmail SMTP (free, reliable, 500 emails/day limit)
- **Library:** `nodemailer` (most popular Node.js email library)
- **Authentication:** Gmail App Password (not your regular password)
- **HTML Template:** Create a nice-looking email with vinyl details

### Tasks

- [x] Install dependencies: `nodemailer` and `dotenv`
- [x] Create `src/notify.js` module:
  - Email configuration (SMTP settings)
  - HTML template generation
  - Send email function
  - Error handling
- [x] Create `.env.example` file with required variables
- [x] Create test script `test-email.js`
- [/] Test email sending locally (requires user to configure .env):
  - Send sample email with mock data
  - Verify delivery and formatting

### Files to Create

- `src/notify.js` - Email notification module
- `.env.example` - Template for environment variables
- `test-email.js` - Local testing script

### Required Environment Variables

```
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Gmail App Password Setup

1. Go to Google Account settings
2. Security → 2-Step Verification (must be enabled)
3. App passwords → Generate new app password
4. Select "Mail" and "Other (Custom name)"
5. Copy the 16-character password
6. Use this in `EMAIL_PASS` (NOT your Gmail password)

### Email Template Design

**Subject:** `🎵 New Vinyl Records Found - [DATE]`

**Body (HTML):**

- Header with logo/title
- Summary: "Found X new records today"
- Table/list of new records:
  - Vinyl cover image (if available)
  - Title
  - Artist
  - Category
  - Price
- Footer with link to frontend
- Styled with CSS (responsive)

### Verification Steps

- [x] Install `nodemailer` successfully
- [x] Install `dotenv` for environment variable management
- [x] Create email configuration in `notify.js`
- [x] Generate HTML email template with responsive design
- [x] Add .env to .gitignore to prevent credential exposure
- [/] Send test email locally: `node test-email.js` (requires user setup)
- [ ] Verify email arrives in inbox (check spam folder too)
- [ ] Check email formatting in desktop and mobile
- [ ] Confirm links work correctly

**Status:** ✅ Implementation complete. Ready for user testing with their Gmail credentials.

**Implementation Date:** 2026-05-31

**Deliverables:**

- ✅ `src/notify.js` - Email notification module (4.9 KB)
- ✅ `test-email.js` - Testing script (3.8 KB)
- ✅ `.env.example` - Environment template (527 B)
- ✅ `docs/EMAIL_SETUP.md` - Setup guide (3.5 KB)
- ✅ `test-template-generation.js` - Automated tests
- ✅ Updated `.gitignore` to exclude `.env`
- ✅ Updated `package.json` with `nodemailer` and `dotenv`

**Manual Testing Required:** See `test-plan.md` for user testing checklist.

---

## Phase 2: Scraper Integration

**Goal:** Integrate email notifications into the scraper to detect and report new records.

### Context

- **Detection Logic:** Query records where `notified = 0` (flag-based, not date-based)
- **Marking Logic:** After successful email, mark records as `notified = 1`
- **Threshold:** Only send email if at least 1 new record found
- **Data Format:** Extract relevant fields for email template
- **Timing:** Send email at the end of scrape, after database is updated
- **Reliability:** Works even with multiple scrapes per day, failed scrapes, or retries

### Tasks

- [x] Update `src/index.js`:
  - Import notification module
  - After scraping completes, query for new records
  - Format data for email template
  - Call email function if new records exist
  - Log notification status
  - Load environment variables with dotenv
  - Handle notification errors gracefully (don't fail scrape)
- [x] Add query function to `src/db.js`:
  - `getNewRecords()` - Get all records where `notified = 0`
  - `markAsNotified(recordIds)` - Set `notified = 1` for given record IDs
  - Return array with: id, title, artist, price, category, image_url, product_url, created_at
  - Added `notified` column to database schema with automatic migration
  - Existing records marked as `notified = 1` during migration
- [x] `src/notify.js` already handles:
  - Accept array of new records as parameter ✓
  - Generate dynamic HTML based on records ✓
  - Handle empty list gracefully ✓
- [x] Add configuration to `src/config.js`:
  - Notification enabled flag
  - Notification threshold (min records to trigger)
  - Frontend URL for links (with env var override)

### Files to Modify

- `src/index.js` - Add notification call
- `src/db.js` - Add `getNewRecords()` query
- `src/notify.js` - Update to handle real data
- `src/config.js` - Add email configuration

### Example Integration

```javascript
// In src/index.js after scraping
const newRecords = await db.getNewRecords();

if (newRecords.length > 0) {
	console.log(`📧 Sending notification for ${newRecords.length} new records...`);
	await sendEmailNotification(newRecords);
	console.log("✅ Notification sent successfully");
} else {
	console.log("ℹ️  No new records found, skipping notification");
}
```

### Verification Steps

- [x] Run full scrape locally with `.env` configured
- [x] Verify `getNewRecords()` returns correct records (test-new-records.js)
- [x] Email sent only when new records exist
- [x] Email contains correct record details (test-integration.js)
- [/] No email sent when no new records (requires manual test after scrape)
- [x] Error handling works - notification errors don't fail scrape
- [x] Integration test passed with real email sending

**Status:** ✅ Implementation complete. Ready for end-to-end testing with real scraper.

**Implementation Date:** 2026-05-31

**Deliverables:**

- ✅ `src/db.js` - Added `getNewRecords()` and `markAsNotified()` functions
- ✅ `src/db.js` - Added `notified` column with automatic migration
- ✅ `src/index.js` - Integrated notification logic with mark-as-notified
- ✅ `src/config.js` - Added notification configuration section
- ✅ `test-new-records.js` - Database query test script (updated for notified flag)
- ✅ `test-notified-flag.js` - Tests for notified flag system
- ✅ `test-integration.js` - End-to-end integration test
- ✅ All automated tests passing

**Key Improvement:** Changed from date-based detection to flag-based detection for reliability

**Manual Testing Required:** See `test-plan.md` for user testing checklist.

---

## Phase 3: GitHub Actions Integration

**Goal:** Automate email notifications in GitHub Actions workflow.

### Context

- **Secrets Storage:** GitHub repository secrets (encrypted)
- **Workflow Update:** Add email step after scrape
- **Error Handling:** Don't fail workflow if email fails
- **Conditional Execution:** Only run email step if scrape succeeded

### Tasks

- [ ] Add GitHub Secrets:
  - Navigate to repository Settings → Secrets and variables → Actions
  - Add `EMAIL_USER` (Gmail address)
  - Add `EMAIL_PASS` (Gmail app password)
  - Add `EMAIL_FROM` (sender email, usually same as EMAIL_USER)
  - Add `EMAIL_TO` (recipient email address)
- [ ] Update `.github/workflows/scraper.yml`:
  - Add environment variables from secrets
  - Notification runs after scrape step
  - Use `continue-on-error: true` for notification step
  - Add conditional: only run if scrape succeeded
- [ ] Update `.gitignore`:
  - Ensure `.env` is ignored (don't commit credentials!)
- [ ] Test workflow:
  - Trigger manual run from GitHub Actions tab
  - Verify email received
  - Check workflow logs for notification status

### GitHub Workflow Addition

```yaml
- name: Send Email Notification
  if: success()
  continue-on-error: true
  env:
   EMAIL_USER: ${{ secrets.EMAIL_USER }}
   EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
   EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
   EMAIL_TO: ${{ secrets.EMAIL_TO }}
  run: |
   # Email sending is already integrated in src/index.js
   # Notification sent automatically after scrape
   echo "Notification step completed (check scraper output above)"
```

### Files to Modify

- `.github/workflows/scraper.yml` - Add secrets as env vars
- `.gitignore` - Ensure `.env` is excluded
- `README.md` - Document email setup process

### Verification Steps

- [ ] GitHub Secrets added correctly
- [ ] Trigger manual workflow run
- [ ] Workflow completes successfully
- [ ] Email received with new records
- [ ] Check workflow logs for notification confirmation
- [ ] Test failure case: invalid credentials (workflow should continue)
- [ ] Verify daily cron trigger sends emails

---

## Phase 4: Documentation & Polish

**Goal:** Document the setup process and add optional enhancements.

### Tasks

- [ ] Create `docs/EMAIL_SETUP.md`:
  - Step-by-step Gmail app password setup
  - GitHub Secrets configuration
  - Testing instructions
  - Troubleshooting guide
- [ ] Update main `README.md`:
  - Add email notification feature description
  - Link to setup guide
  - Add environment variables section
- [ ] Add optional enhancements:
  - Configurable email threshold (only if >X records)
  - Include vinyl images in email
  - HTML styling improvements
  - Option to disable notifications

### Files to Create/Modify

- `docs/EMAIL_SETUP.md` (new)
- `README.md` (update)
- `src/config.js` (add notification settings)

### Verification Steps

- [ ] Documentation is clear and complete
- [ ] Fresh user can follow setup guide successfully
- [ ] All environment variables documented
- [ ] Troubleshooting section helpful

---

## Environment Variables Summary

```bash
# Required for email notifications
EMAIL_USER=your-email@gmail.com        # Gmail address
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx        # Gmail app password (16 chars)
EMAIL_FROM=your-email@gmail.com        # Sender email (usually same as EMAIL_USER)
EMAIL_TO=recipient@example.com         # Recipient email address
FRONTEND_URL=https://your-site.com     # Link to your vinyl frontend (optional)
```

---

## Testing Strategy

### Local Testing

1. Create `.env` file with credentials
2. Run `node test-email.js` to test email sending
3. Run `npm run scrape` to test full integration
4. Verify email received with correct data

### GitHub Actions Testing

1. Add secrets to repository
2. Trigger manual workflow run
3. Verify email received
4. Check logs for any errors

### Edge Cases to Test

- No new records found (should not send email)
- Invalid email credentials (should log error, not crash)
- Network failure (should retry or fail gracefully)
- Large number of records (should format well, not timeout)

---

## Rollback Plan

If email notifications cause issues:

1. Remove environment variables from GitHub Secrets
2. Comment out notification code in `src/index.js`
3. Scraper will continue to work normally

---

## Success Criteria

1. ✅ Email sent after each successful scrape (if new records found)
2. ✅ Email contains accurate list of new records
3. ✅ Email formatting looks good on desktop and mobile
4. ✅ No emails sent when no new records exist
5. ✅ Workflow continues even if email fails
6. ✅ Setup process documented and easy to follow

---

## Estimated Effort

**Phase 1:** 1-2 hours (setup + testing)
**Phase 2:** 1 hour (integration)
**Phase 3:** 30 minutes (GitHub Actions)
**Phase 4:** 30 minutes (documentation)

**Total:** 3-4 hours

---

## Next Steps

Start with **Phase 1**: Email Service Setup

```bash
@implement-phase 1
```

This will:

1. Install nodemailer
2. Create the email notification module
3. Set up local testing
4. Send your first test email!
