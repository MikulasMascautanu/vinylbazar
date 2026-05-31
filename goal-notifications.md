# Vinyl Scraper: New Records Notification System

## Objective

Add automated notifications when new vinyl records are discovered during the daily scrape, sending alerts via email or Telegram to stay informed about fresh inventory without manually checking the website.

**Requirements:**
- Free or low-cost solution
- Automated (runs with GitHub Actions)
- Simple configuration
- Reliable delivery

---

## Architecture Options

### Option 1: Email Notifications (Recommended)
**Pros:**
- Universal (everyone has email)
- Free via GitHub Actions + SMTP services
- Built-in formatting support (HTML emails)
- No app installation required
- Easy to archive/search

**Cons:**
- May end up in spam folder
- Slightly slower than instant messaging

### Option 2: Telegram Bot
**Pros:**
- Instant notifications
- Mobile + desktop apps
- Free and simple API
- Rich formatting support
- Can send images

**Cons:**
- Requires Telegram account
- Need to create a bot
- Need to find your chat ID

### Option 3: Discord Webhook
**Pros:**
- Free and instant
- Rich embeds with images
- Good for team sharing
- Easy webhook setup

**Cons:**
- Requires Discord account
- Less personal than email/Telegram

---

## Recommended Solution: Telegram Bot

**Why Telegram:**
1. **Free forever** - No usage limits
2. **Instant delivery** - Get notified immediately after scrape
3. **Rich formatting** - Send nice-looking messages with vinyl details
4. **Simple setup** - Just create a bot and get chat ID
5. **Reliable** - Telegram's infrastructure is very stable
6. **Mobile-friendly** - Native app with excellent notifications

---

## Implementation Plan

### Phase 1: Telegram Bot Setup
1. Create Telegram bot via BotFather
2. Get bot token
3. Get your chat ID
4. Store credentials in GitHub Secrets

### Phase 2: Notification Logic
1. After scraping, detect new records (created_at = today)
2. Format notification message with:
   - Number of new records
   - List of top 10 new vinyls (title, artist, price, category)
   - Link to frontend
3. Send via Telegram Bot API

### Phase 3: GitHub Actions Integration
1. Add notification step to `.github/workflows/scraper.yml`
2. Run after successful scrape
3. Only send if new records found
4. Handle errors gracefully

---

## Technical Details

### Data to Include in Notification
```
🎵 New Vinyl Alert! 🎵

Found 5 new records today:

1. 🆕 Hoodoo Man Blues (LP)
   Artist: Junior Wells' Chicago Blues Band
   Category: Jazz, Blues - USA, UK
   Price: 450 Kč
   
2. 🆕 Straight From The Heart (LP)
   Artist: Chet Baker
   Category: Jazz, Blues - USA, UK
   Price: 380 Kč

...

View all: https://your-frontend-url.com
```

### Telegram Bot API
- **Endpoint:** `https://api.telegram.org/bot<TOKEN>/sendMessage`
- **Method:** POST
- **Payload:**
  ```json
  {
    "chat_id": "YOUR_CHAT_ID",
    "text": "Message text",
    "parse_mode": "HTML"
  }
  ```

### GitHub Secrets Needed
- `TELEGRAM_BOT_TOKEN` - Bot token from BotFather
- `TELEGRAM_CHAT_ID` - Your personal chat ID

---

## Files to Create/Modify

### New Files
- `src/notify.js` - Notification sender module
- `docs/TELEGRAM_SETUP.md` - Step-by-step setup guide

### Modified Files
- `.github/workflows/scraper.yml` - Add notification step
- `src/index.js` - Integrate notification logic
- `package.json` - Add scripts if needed

---

## Alternative: Email Option

If Telegram is not preferred, here's the email approach:

### Using GitHub Actions + Gmail SMTP
```yaml
- name: Send Email Notification
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_APP_PASSWORD }}
    subject: "🎵 New Vinyl Records Found!"
    body: file://notification.html
    to: your-email@example.com
    from: Vinyl Scraper Bot
```

**Requires:**
- Gmail account with app password
- GitHub Secrets: `EMAIL_USERNAME`, `EMAIL_APP_PASSWORD`

---

## Implementation Phases

### Phase 1: Core Notification System
- [ ] Choose notification method (Telegram/Email)
- [ ] Create notification module (`src/notify.js`)
- [ ] Implement message formatting
- [ ] Test locally with mock data

### Phase 2: Scraper Integration
- [ ] Modify scraper to track new records
- [ ] Call notification after scrape completes
- [ ] Only notify if new records found
- [ ] Include summary statistics

### Phase 3: GitHub Actions Integration
- [ ] Add secrets to GitHub repository
- [ ] Update workflow to call notification
- [ ] Test with manual workflow trigger
- [ ] Verify notification delivery

### Phase 4: Enhancements (Optional)
- [ ] Add configurable notification threshold (e.g., only if >5 new records)
- [ ] Include vinyl images in notification
- [ ] Add filtering by category
- [ ] Support multiple recipients

---

## Estimated Effort

**Time:** 2-3 hours
**Complexity:** Low-Medium
**Dependencies:** 
- Telegram account (if using Telegram)
- GitHub repository with Actions enabled

---

## Success Criteria

1. ✅ Receive notification after each successful scrape
2. ✅ Notification includes count and list of new records
3. ✅ Only sent when new records are found
4. ✅ Delivery is reliable (>95% success rate)
5. ✅ Setup takes <30 minutes for new users

---

## Next Steps

1. **Choose notification method** (Telegram recommended)
2. **Set up bot/service** (follow setup guide)
3. **Implement notification module**
4. **Test locally**
5. **Deploy to GitHub Actions**

Start with: `@implement-phase <phase-number>` once you've chosen the notification method!
