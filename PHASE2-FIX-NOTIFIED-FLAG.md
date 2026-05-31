# Phase 2 Fix: Notified Flag System

## Problem with Original Implementation

The initial Phase 2 implementation used **date-based detection**:
```javascript
// OLD APPROACH - FLAWED
WHERE DATE(created_at) = DATE(CURRENT_DATE)
```

### Issues with Date-Based Approach

❌ **Multiple scrapes per day:** If you run scraper twice in one day, second run won't notify  
❌ **Failed notifications:** If email fails, records are "lost" until next new scrape  
❌ **Testing difficulties:** Hard to test without waiting a full day  
❌ **Timezone confusion:** Date comparison can be tricky across timezones

## Solution: Flag-Based Detection

### The Fix

Added a `notified` column to the database:
- `notified = 0` → Record is new, needs notification
- `notified = 1` → Record has been notified, skip

### How It Works

1. **New records created:** `notified = 0` (default)
2. **Query for notifications:** `WHERE notified = 0`
3. **After successful email:** `UPDATE vinyls SET notified = 1 WHERE id IN (...)`
4. **Failed email:** Records stay `notified = 0`, retry next time

### Benefits

✅ **Reliable:** Works with multiple scrapes per day  
✅ **Persistent:** Failed notifications retry automatically  
✅ **Accurate:** Each record notified exactly once  
✅ **Testable:** Easy to reset flags for testing  
✅ **Simple:** No date/time complexity

## Implementation Details

### Database Changes

**New Column:**
```sql
ALTER TABLE vinyls ADD COLUMN notified INTEGER DEFAULT 0;
```

**Migration Logic:**
- Automatically adds `notified` column if missing
- Marks all existing records as `notified = 1` (already exist, don't notify)
- New records automatically get `notified = 0`

### Code Changes

**`src/db.js`:**
- ✅ Added `notified` column to schema
- ✅ Added `migrateNotifiedColumn()` migration helper
- ✅ Updated `insertVinyl()` to set `notified = 0` for new records
- ✅ Updated `getNewRecords()` to use `WHERE notified = 0`
- ✅ Added `markAsNotified(recordIds)` function

**`src/index.js`:**
- ✅ Added call to `markAsNotified()` after successful email
- ✅ Only marks records if email succeeds
- ✅ Failed emails leave records unmarked for retry

### Testing

**New Test Script: `test-notified-flag.js`**

Tests the complete workflow:
1. Set records to `notified = 0`
2. Verify `getNewRecords()` returns them
3. Call `markAsNotified()`
4. Verify records are now excluded
5. Verify database has `notified = 1`

**Test Results:**
```
🎉 All tests PASSED!

Summary:
  ✅ getNewRecords() returns only notified=0 records
  ✅ markAsNotified() correctly updates notified flag
  ✅ Marked records are excluded from getNewRecords()
```

## Migration

### Automatic Migration

When you run the scraper (or any script that calls `db.init()`):
1. Database checks if `notified` column exists
2. If missing, adds column with `DEFAULT 0`
3. Marks all existing records as `notified = 1`
4. Future records automatically get `notified = 0`

### Manual Migration (if needed)

Mark all existing records as notified:
```bash
sqlite3 data/vinyls.db "UPDATE vinyls SET notified = 1;"
```

Reset specific records for testing:
```bash
sqlite3 data/vinyls.db "UPDATE vinyls SET notified = 0 WHERE id IN (1, 2, 3);"
```

Check notification status:
```bash
sqlite3 data/vinyls.db "SELECT notified, COUNT(*) FROM vinyls GROUP BY notified;"
```

## Example Workflow

### Scenario 1: Normal Operation

1. Scraper finds 5 new vinyls → `notified = 0`
2. Email sent successfully
3. Records marked → `notified = 1`
4. Next scrape: Those 5 won't be notified again ✅

### Scenario 2: Email Failure

1. Scraper finds 5 new vinyls → `notified = 0`
2. Email fails (network issue)
3. Records stay → `notified = 0`
4. Next scrape: Retry notification for same 5 records ✅

### Scenario 3: Multiple Scrapes Per Day

1. Morning scrape: 3 new vinyls → notified
2. Afternoon scrape: 2 more new vinyls → notified
3. Both batches handled correctly ✅

### Scenario 4: Testing

```bash
# Reset some records for testing
sqlite3 data/vinyls.db "UPDATE vinyls SET notified = 0 LIMIT 5;"

# Run integration test
node test-integration.js

# Records will be sent in email and marked as notified ✅
```

## Files Changed

```
Modified:
  src/db.js              - Added notified column, migration, and mark function
  src/index.js           - Added markAsNotified() call after email
  test-new-records.js    - Updated to show notified flag logic
  docs/PHASE2-USAGE.md   - Updated documentation
  implementation-plan-notifications.md - Updated Phase 2 description

Created:
  test-notified-flag.js  - Comprehensive test for flag system
  PHASE2-FIX-NOTIFIED-FLAG.md - This document
```

## Backwards Compatibility

✅ **Fully compatible** with existing databases  
✅ **Automatic migration** on first run  
✅ **No manual intervention** required  
✅ **Existing records** marked as notified automatically

---

**Status:** ✅ Implemented and Tested  
**Breaking Changes:** None  
**Migration Required:** Automatic on first run  
**Tests:** All passing
