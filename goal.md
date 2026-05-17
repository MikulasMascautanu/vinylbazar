# Vinyl E-shop Scraper

## Objective

Scrape vinyl records from https://www.vinylbazar.net, store in SQLite, enable search/sort, auto-update via GitHub Actions.

**Requirements:**

- Free infrastructure
- No external APIs
- Automated updates

---

## Architecture

```
GitHub Actions (cron) → Node.js Scraper → node-html-parser → SQLite → Express API → Frontend
```

---

## Stack

**Scraper:** Node.js + `node-html-parser`  
**Automation:** GitHub Actions (cron schedule)  
**Database:** SQLite (`vinyls.db`)  
**API:** Express.js  
**Frontend:** React/Next.js

---

## Database Schema

```sql
CREATE TABLE vinyls (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  price REAL,
  image_url TEXT,
  product_url TEXT UNIQUE NOT NULL,
  scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

```
GET /api/vinyls - Returns all vinyl records (frontend handles search/sort/pagination)
```

**Rationale:** With only a few thousand records (~50-100KB gzipped), frontend search/sort is faster than backend queries and provides better UX.

---

## Scraping Logic

1. Fetch HTML from category page
2. Parse with `node-html-parser`
3. Extract: title, artist, price, image_url, product_url
4. Upsert to SQLite (unique key: `product_url`)
5. Handle pagination for multi-page support

---

## Automation Strategy

**GitHub Actions workflow:**

- Trigger: `cron: '0 4 * * *'` (4 AM daily)
- Steps:
  1. Checkout repo
  2. Run scraper script
  3. Commit updated `vinyls.db`
  4. Push changes

---

## Implementation Phases

**Phase 1:** Basic scraper + SQLite storage
**Phase 2:** Pagination support
**Phase 3:** Update detection (new items, price changes)
**Phase 4:** Express API (single endpoint returning all records)
**Phase 5:** GitHub Actions automation
**Phase 6:** Frontend UI with client-side search/sort/pagination (optional)

---

## Key Decisions

- **SQLite:** Zero-cost, file-based, no hosting needed
- **node-html-parser:** Lightweight, no browser overhead
- **GitHub Actions:** Free cron scheduling
- **product_url:** Unique identifier for deduplication

---

## Future Enhancements

- Price history tracking
- Email notifications for new items
- Caching layer
- Advanced filtering UI
