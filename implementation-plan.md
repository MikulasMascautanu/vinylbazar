# Implementation Plan: Vinyl E-shop Scraper

## Overview

Build a vinyl records scraper for https://www.vinylbazar.net that extracts product data, stores it in SQLite, provides an Express API, and displays it in a React frontend. The system will auto-update every 12 hours via GitHub Actions.

**Tech Stack:** Node.js, node-html-parser, SQLite3, Express.js, React
**Database Location:** `data/vinyls.db`
**API Port:** 8080
**Error Strategy:** Resilient (log errors, continue scraping)
**Price Tracking:** Simple overwrite (no history)
**Scraping Strategy:** Multi-category (extract all categories from menu, then scrape each)

---

## Phase 1: Project Setup & Basic Scraper

**Goal:** Initialize Node.js project and implement category discovery + single-category scraper with SQLite storage.

### Context

- **Target URL:** https://www.vinylbazar.net
- **Scraping Flow:**
  1. Scrape homepage to extract all category URLs from menu
  2. Scrape first category to test product extraction
- **Provided Selectors:**
  ```javascript
  const selectors = {
  	menuItem: ".root-eshop-menu > .leftmenuDef a", // Category links
  	product: ".productBody", // Product container
  	nextPage: '[rel="next"]', // Pagination link
  	title: ".productTitleContent a", // Product title
  	price: ".product_price_text", // Product price
  	img: ".img_box a img:first-of-type", // Product image
  };
  ```
- **Expected Data:** title, artist, price, image_url, product_url, category
- **Database Schema:** (from [goal.md](goal.md))
  ```sql
  CREATE TABLE vinyls (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT,
    price REAL,
    image_url TEXT,
    product_url TEXT UNIQUE NOT NULL,
    category TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```

### Tasks

- [x] Initialize Node.js project (`package.json`)
- [x] Install dependencies: `node-html-parser`, `sqlite3`, `node-fetch`
- [x] Create `data/` directory for database
- [x] Create `src/config.js` - Store selectors and constants
- [x] Create `src/db.js` - SQLite connection and schema initialization (with `category` field)
- [x] Create `src/scraper.js` - Main scraper logic
  - **Step 1:** Fetch homepage (https://www.vinylbazar.net)
  - **Step 2:** Extract category URLs using selector `.root-eshop-menu > .leftmenuDef a`
  - **Step 3:** For first category, scrape products:
    - Use selector `.productBody` to find products
    - Extract title: `.productTitleContent a` (text + href)
    - Extract price: `.product_price_text` (parse number from text)
    - Extract image: `.img_box a img:first-of-type` (src attribute)
  - **Step 4:** Parse artist and title from raw title string:
    - Pattern: `FORMAT Artist – Title` (em-dash separator)
    - Extract format prefix (LP, 2xLP, LP+7", etc.)
    - Extract artist (text between format and `–`)
    - Extract title (text after `–`)
    - Move format to end of title in parentheses
    - Examples:
      - `"LP+7" Jefferson Starship – Gold"` → artist: `"Jefferson Starship"`, title: `"Gold (LP+7")"`
      - `"LP Jerry Harrison : Casual Gods – Casual Gods"` → artist: `"Jerry Harrison : Casual Gods"`, title: `"Casual Gods (LP)"`
  - **Step 5:** Insert records into SQLite
- [x] Create `src/index.js` - Entry point to run scraper
- [x] Add `.gitignore` (node_modules, data/\*.db during development)

### Files to Create

- `package.json`
- `src/config.js`
- `src/db.js`
- `src/scraper.js`
- `src/index.js`
- `.gitignore`

### Verification Steps

- [x] Run `node src/index.js` successfully
- [x] Check console output shows list of discovered categories (16 categories discovered)
- [x] Check `data/vinyls.db` exists
- [x] Query database: `SELECT COUNT(*) FROM vinyls` returns 72 products
- [x] Verify at least 4 products scraped (72 products scraped from first category, first page)
- [x] Check all fields populated: `SELECT * FROM vinyls LIMIT 5` shows title, price, product_url, category, image_url
- [x] Verify category field contains category name ("Pop, Rock - USA, UK")
- [x] Verify artist extraction: `SELECT artist, title FROM vinyls WHERE artist IS NOT NULL LIMIT 5`
  - ✅ Artist does NOT contain format prefix (LP, 2xLP, etc.)
  - ✅ Title has format in parentheses at end
  - ✅ Examples verified:
    - `"LP+7" Jefferson Starship – Gold"` → artist: `"Jefferson Starship"`, title: `"Gold (LP+7")"`
    - `"LP Jerry Harrison : Casual Gods – Casual Gods"` → artist: `"Jerry Harrison : Casual Gods"`, title: `"Casual Gods (LP)"`

### Implementation Notes

- Successfully implemented category discovery - found 16 categories on homepage
- First category "Pop, Rock - USA, UK" scraped successfully with 72 products
- All database fields are populated correctly (title, price, product_url, category, image_url)
- Artist field is empty for most records as titles include format prefix (LP, 2xLP, etc.) before artist name
- Database schema includes `category` column as specified

---

## Phase 2: Multi-Page & Multi-Category Scraping

**Goal:** Extend scraper to handle pagination within each category and scrape all categories.

### Context

- Website uses pagination with `[rel="next"]` selector (from provided selectors)
- Need to scrape ALL categories discovered in Phase 1
- Estimated: 10-20 categories × 10-50 pages each = hundreds of pages total
- Need progress logging to track scraping across categories and pages

### Tasks

- [ ] Update `src/scraper.js`:
  - Add pagination detection using `[rel="next"]` selector
  - Implement loop to scrape all pages within a category
  - Extend to scrape ALL categories (not just first one)
  - Add delay between requests (500ms-1s to be respectful)
  - Add comprehensive progress logging:
    - Current category (X/Y)
    - Current page within category
    - Products scraped per page
    - Running total
- [ ] Add error handling for network failures
  - Log errors with category and page URL
  - Continue to next page/category on failure
  - Track failed URLs for reporting at end

### Files to Modify

- `src/scraper.js`

### Verification Steps

- [ ] Run scraper and observe multi-category, multi-page scraping in logs
- [ ] Verify console shows: "Category: Hip-Hop (3/16) | Page 2 | Products: 20 | Total: 580"
- [ ] Verify total record count > 500 (multiple categories and pages)
- [ ] Check database has products from multiple categories: `SELECT DISTINCT category FROM vinyls`
- [ ] Confirm scraper completes without crashing
- [ ] Test resilience: simulate network error, verify scraper continues to next page/category

---

## Phase 3: Update Detection & Deduplication

**Goal:** Implement UPSERT logic to handle updates and prevent duplicates.

### Context

- **Unique Key:** `product_url` (from [goal.md](goal.md))
- **Strategy:** INSERT OR REPLACE to update existing records
- **Price Handling:** Simple overwrite (no history tracking)

### Tasks

- [ ] Update `src/db.js`:
  - Change INSERT to INSERT OR REPLACE ON CONFLICT(product_url)
  - Update `scraped_at` timestamp on each run
- [ ] Add statistics tracking:
  - Count new records inserted
  - Count existing records updated
  - Display summary at end of scraping
- [ ] Test deduplication:
  - Run scraper twice
  - Verify no duplicate product_urls

### Files to Modify

- `src/db.js`
- `src/scraper.js` (add statistics)

### Verification Steps

- [ ] Run scraper twice consecutively
- [ ] Query: `SELECT COUNT(DISTINCT product_url) FROM vinyls` equals total count
- [ ] Verify `scraped_at` timestamp updates on second run
- [ ] Check console output shows: "X new, Y updated"
- [ ] Confirm no duplicate rows: `SELECT product_url, COUNT(*) FROM vinyls GROUP BY product_url HAVING COUNT(*) > 1` returns 0

---

## Phase 4: Express API

**Goal:** Create Express server with single endpoint returning all vinyl records.

### Context

- **Endpoint:** `GET /api/vinyls` (from [goal.md](goal.md))
- **Port:** 8080
- **Response:** JSON array of all records
- **Features:** CORS, gzip compression
- **Rationale:** 3000 records ≈ 50-100KB gzipped (see [goal.md](goal.md))

### Tasks

- [ ] Install dependencies: `express`, `cors`, `compression`
- [ ] Create `src/api.js`:
  - Initialize Express app
  - Add CORS middleware
  - Add compression middleware (gzip)
  - Implement `GET /api/vinyls` endpoint
    - Query all records from SQLite
    - Return JSON array
    - Add error handling (500 on DB errors)
  - Start server on port 8080
- [ ] Update `package.json`:
  - Add script: `"start:api": "node src/api.js"`
  - Add script: `"scrape": "node src/index.js"`

### Files to Create/Modify

- `src/api.js` (new)
- `package.json` (update scripts)

### Verification Steps

- [ ] Run `npm run start:api`
- [ ] Visit `http://localhost:8080/api/vinyls` in browser
- [ ] Verify JSON array returned with all vinyl records
- [ ] Check response headers include `Content-Encoding: gzip`
- [ ] Test CORS: make fetch request from different origin (browser console)
- [ ] Verify response time < 500ms for full dataset

---

## Phase 5: GitHub Actions Automation

**Goal:** Automate scraping every 12 hours and commit updated database.

### Context

- **Schedule:** `cron: '0 */12 * * *'` (every 12 hours)
- **Actions:** Checkout → Scrape → Commit → Push
- **Authentication:** GitHub Actions built-in GITHUB_TOKEN

### Tasks

- [ ] Create `.github/workflows/scraper.yml`:
  - Trigger: cron schedule + manual dispatch
  - Steps:
    1. Checkout repository
    2. Setup Node.js (v18 or v20)
    3. Install dependencies (`npm ci`)
    4. Run scraper (`npm run scrape`)
    5. Configure git (user.name, user.email)
    6. Commit changes to `data/vinyls.db`
    7. Push to repository
  - Add conditional: only commit if database changed
- [ ] Update `.gitignore`:
  - Remove `data/*.db` exclusion (need to commit database)
- [ ] Add initial database commit to repository

### Files to Create/Modify

- `.github/workflows/scraper.yml` (new)
- `.gitignore` (update)
- `data/vinyls.db` (commit to repo)

### Verification Steps

- [ ] Push workflow to GitHub
- [ ] Trigger manual workflow run (Actions tab → Run workflow)
- [ ] Verify workflow completes successfully (may take 10-30 minutes for full scrape)
- [ ] Check new commit created with updated `data/vinyls.db`
- [ ] Wait 12 hours (or modify cron for testing) and verify automatic run
- [ ] Test failure case: introduce error in scraper, verify workflow fails gracefully

---

## Phase 6: Frontend UI

**Goal:** Build React frontend with client-side search, sort, and pagination.

### Context

- **Framework:** React (from [goal.md](goal.md))
- **Features:** Client-side search/sort/pagination (per simplified API design)
- **Data Source:** `GET /api/vinyls` from Phase 4
- **Search Library:** Consider `fuse.js` for fuzzy search

### Tasks

- [ ] Initialize React app: `npx create-react-app client` or use Vite
- [ ] Install dependencies: `axios` (or fetch), optional: `fuse.js`
- [ ] Create components:
  - `VinylList` - Main container
  - `VinylCard` - Individual vinyl display (image, title, artist, price, link)
  - `SearchBar` - Search input
  - `SortControls` - Dropdown for sort options (price asc/desc, title, date)
  - `Pagination` - Client-side pagination controls
- [ ] Implement state management:
  - Fetch all vinyls on component mount
  - Store in state
  - Implement search filter (title, artist)
  - Implement sort logic (price, title, date)
  - Implement client-side pagination (20 items per page)
- [ ] Add styling:
  - Grid layout for vinyl cards
  - Responsive design (mobile-friendly)
  - Loading states
  - Empty states (no results)
- [ ] Update `package.json`:
  - Add script: `"start:client": "cd client && npm start"`
  - Add proxy to API in client's package.json: `"proxy": "http://localhost:8080"`

### Files to Create/Modify

- `client/src/App.js` (main app)
- `client/src/components/VinylList.js`
- `client/src/components/VinylCard.js`
- `client/src/components/SearchBar.js`
- `client/src/components/SortControls.js`
- `client/src/components/Pagination.js`
- `client/src/App.css` (styling)
- `package.json` (update)

### Verification Steps

- [ ] Run both API and client: `npm run start:api` + `npm run start:client`
- [ ] Verify frontend loads and displays vinyl records
- [ ] Test search: type artist name, verify filtering works
- [ ] Test sort: change sort dropdown, verify order changes instantly
- [ ] Test pagination: navigate pages, verify 20 items per page
- [ ] Test responsive design: resize browser, verify mobile layout
- [ ] Check images load correctly from image_url
- [ ] Click product card, verify link to vinylbazar.net works

---

## Progress Tracking

- [ ] Phase 1: Project Setup & Basic Scraper
- [ ] Phase 2: Multi-Page Scraping
- [ ] Phase 3: Update Detection & Deduplication
- [ ] Phase 4: Express API
- [ ] Phase 5: GitHub Actions Automation
- [ ] Phase 6: Frontend UI

---

## Final Deliverables

1. **Scraper:** Node.js application scraping all vinyl records with pagination
2. **Database:** SQLite database (`data/vinyls.db`) with deduplicated records
3. **API:** Express server on port 8080 serving `GET /api/vinyls`
4. **Automation:** GitHub Actions workflow running every 6 hours
5. **Frontend:** React app with search, sort, and pagination
6. **Documentation:** Updated README.md with setup and usage instructions

---

## Next Steps

Start with **Phase 1** using the `implement-phase` skill:

```
@implement-phase 1
```

Each phase builds on the previous one and can be tested independently before moving forward.

- `src/api.js` (new)
- `package.json` (update scripts)

### Verification Steps

- [ ] Run `npm run start:api`
- [ ] Visit `http://localhost:8080/api/vinyls` in browser
- [ ] Verify JSON array returned with all vinyl records
- [ ] Check response headers include `Content-Encoding: gzip`
- [ ] Test CORS: make fetch request from different origin (browser console)
- [ ] Verify response time < 500ms for full dataset

---

## Phase 5: GitHub Actions Automation

**Goal:** Automate scraping every 6 hours and commit updated database.

### Context

- **Schedule:** `cron: '0 */6 * * *'` (every 6 hours) (from [goal.md](goal.md))
- **Actions:** Checkout → Scrape → Commit → Push
- **Authentication:** GitHub Actions built-in GITHUB_TOKEN

### Tasks

- [ ] Create `.github/workflows/scraper.yml`:
  - Trigger: cron schedule + manual dispatch
  - Steps:
    1. Checkout repository
    2. Setup Node.js (v18 or v20)
    3. Install dependencies (`npm ci`)
    4. Run scraper (`npm run scrape`)
    5. Configure git (user.name, user.email)
    6. Commit changes to `data/vinyls.db`
    7. Push to repository
  - Add conditional: only commit if database changed
- [ ] Update `.gitignore`:
  - Remove `data/*.db` exclusion (need to commit database)
- [ ] Add initial database commit to repository

### Files to Create/Modify

- `.github/workflows/scraper.yml` (new)
- `.gitignore` (update)
- `data/vinyls.db` (commit to repo)

### Verification Steps

- [ ] Push workflow to GitHub
- [ ] Trigger manual workflow run (Actions tab → Run workflow)
- [ ] Verify workflow completes successfully
- [ ] Check new commit created with updated `data/vinyls.db`
- [ ] Wait 6 hours (or modify cron for testing) and verify automatic run
- [ ] Test failure case: introduce error in scraper, verify workflow fails gracefully

---

## Phase 6: Frontend UI

**Goal:** Build React frontend with client-side search, sort, and pagination.

### Context

- **Framework:** React (from [goal.md](goal.md))
- **Features:** Client-side search/sort/pagination (per simplified API design)
- **Data Source:** `GET /api/vinyls` from Phase 4
- **Search Library:** Consider `fuse.js` for fuzzy search

### Tasks

- [ ] Initialize React app: `npx create-react-app client` or use Vite
- [ ] Install dependencies: `axios` (or fetch), optional: `fuse.js`
- [ ] Create components:
  - `VinylList` - Main container
  - `VinylCard` - Individual vinyl display (image, title, artist, price, link)
  - `SearchBar` - Search input
  - `SortControls` - Dropdown for sort options (price asc/desc, title, date)
  - `Pagination` - Client-side pagination controls
