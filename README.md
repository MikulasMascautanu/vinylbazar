# Vinyl Bazar Scraper

Automated vinyl record scraper with email notifications for new inventory.

## Features

- 🎵 Automated scraping of vinyl records from vinylbazar.cz
- 📧 Email notifications when new records are discovered
- 🤖 GitHub Actions automation (runs hourly)
- 💾 SQLite database with scraped data
- 🚀 React frontend for browsing records

## Email Notifications

The scraper automatically sends email alerts when new vinyl records are found during the scrape. Notifications include:

- Count of new records discovered
- Details for each record (title, artist, price, category, image)
- Direct link to your frontend
- Responsive HTML email design

### Setting Up Email Notifications

#### 1. Create Gmail App Password

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (must be enabled first)
3. Scroll to **App passwords** → Click **Generate**
4. Select **Mail** and **Other (Custom name)**
5. Copy the 16-character password (format: `xxxx-xxxx-xxxx-xxxx`)

#### 2. Add GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of the following:

| Secret Name    | Description                                       | Example                                                             |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| `EMAIL_USER`   | Your Gmail address                                | `your-email@gmail.com`                                              |
| `EMAIL_PASS`   | Gmail app password (16 chars)                     | `xxxx-xxxx-xxxx-xxxx`                                               |
| `EMAIL_FROM`   | Sender email (same as EMAIL_USER)                 | `your-email@gmail.com`                                              |
| `EMAIL_TO`     | Recipient email(s) - comma-separated for multiple | `recipient@example.com` or `email1@example.com, email2@example.com` |
| `FRONTEND_URL` | _(Optional)_ Link to your frontend                | `https://yoursite.com`                                              |

#### 3. Test the Setup

Trigger a manual workflow run:

1. Go to **Actions** tab in your repository
2. Click **Vinyl Scraper Automation**
3. Click **Run workflow** → **Run workflow**
4. Check your email inbox (and spam folder)

### Local Testing

To test email notifications locally:

1. Create a `.env` file in the project root:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com
# For multiple recipients: EMAIL_TO=email1@example.com, email2@example.com, email3@example.com
FRONTEND_URL=http://localhost:5173
```

2. Run the test script:

```bash
node test-email.js
```

3. Run a full scrape with notifications:

```bash
npm run scrape
```

### Troubleshooting

**No email received?**

- Check spam/junk folder
- Verify GitHub Secrets are set correctly (no extra spaces)
- Check workflow logs for error messages
- Make sure 2-Step Verification is enabled on Gmail

**Email looks broken?**

- Ensure you're using Gmail SMTP (other providers not tested)
- Check that EMAIL_FROM matches EMAIL_USER

**Want to disable notifications?**

- Simply remove the email secrets from GitHub
- The scraper will continue to work normally without notifications

## Installation

```bash
npm install
```

## Usage

### Local Development

```bash
# Run scraper once
npm run scrape

# Start React frontend
cd client
npm run dev
```

### GitHub Actions

The scraper runs automatically every hour from 5 AM to 11 PM UTC. Results are committed to the repository and email notifications are sent when new records are found.

## Documentation

- [Email Setup Guide](docs/EMAIL_SETUP.md) - Detailed email configuration instructions
- [Implementation Plan](implementation-plan-notifications.md) - Development roadmap

## Environment Variables

| Variable       | Required | Description                                                         |
| -------------- | -------- | ------------------------------------------------------------------- |
| `EMAIL_USER`   | Yes\*    | Gmail address for SMTP authentication                               |
| `EMAIL_PASS`   | Yes\*    | Gmail app password (16 characters)                                  |
| `EMAIL_FROM`   | Yes\*    | Sender email (typically same as EMAIL_USER)                         |
| `EMAIL_TO`     | Yes\*    | Recipient email(s) for notifications (comma-separated for multiple) |
| `FRONTEND_URL` | No       | Link to frontend (optional, for email footer)                       |

\* Required only if you want email notifications

## Project Structure

```
vinylbazar/
├── src/
│   ├── index.js       # Main scraper entry point
│   ├── scraper.js     # Scraping logic
│   ├── db.js          # Database operations
│   ├── notify.js      # Email notification system
│   ├── api.js         # REST API
│   └── config.js      # Configuration
├── client/            # React frontend
├── data/              # SQLite database
├── .github/workflows/ # GitHub Actions automation
└── docs/              # Documentation

```

## License

MIT
