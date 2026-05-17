# Security Considerations for Public Repository

## GitHub Actions Workflow Security

### Current Protections

The scraper workflow (`.github/workflows/scraper.yml`) includes the following security measures:

1. **Manual Trigger Restrictions**
   - `workflow_dispatch` can only be triggered by users with write access
   - Public users cannot manually run the workflow

2. **No Secrets Exposed**
   - Uses built-in `GITHUB_TOKEN` (automatically scoped to the repository)
   - No custom secrets or API keys required

3. **Scheduled Runs Only**
   - Workflow runs on a schedule (4 AM daily)
   - Does not run on pull requests or push events

### Required Security Configuration

**⚠️ Important:** To protect your repository when public, you MUST configure branch protection:

#### 1. Branch Protection Rules (REQUIRED)

Go to: **Settings → Branches → Add rule** for `main` branch:

**Essential settings:**

- ✅ **Require a pull request before merging**
  - Require approvals: 1 (or 0 if you're the only maintainer)
- ✅ **Allow specified actors to bypass required pull requests**
  - Add yourself to the bypass list
  - This allows you to push directly when needed
- ❌ **Do NOT enable "Restrict who can push to matching branches"**
  - If enabled, GitHub Actions bot cannot push commits
  - Branch protection already prevents unauthorized access (forks have no write permission)

**Recommended additional settings:**

- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging

**Why this works:**

- **Forks cannot push to your `main` branch** - No write access by default (GitHub's core security)
- **External contributors must create PRs** - They don't have write access
- **GitHub Actions workflow can auto-commit** - Runs with GITHUB_TOKEN which has write access
- **You can push directly** - You're in the bypass list for PR requirements
- **PR requirement still protects you** - External contributors with write access (if you add collaborators) must use PRs

**Important:** The security comes from GitHub's permission model, not from restricting push access:

- Only repository collaborators have write access
- Forks never have write access to the upstream repository
- GITHUB_TOKEN in workflows has write access by design (to enable automation)
- If you restrict push access, automation breaks

#### 2. Actions Permissions

Go to: **Settings → Actions → General**:

**Workflow permissions:**

- ✅ Select **Read and write permissions**
  - Required for the workflow to commit and push database changes
- ✅ **Allow GitHub Actions to create and approve pull requests** (optional)

**Fork pull request workflows:**

- Set to **Require approval for first-time contributors**
- This prevents workflows from running on PRs from unknown forks

### What This Protects Against

✅ **Unauthorized commits to main** - Branch protection requires PRs from external contributors
✅ **Fork abuse** - Forks can't push to your repository (no write access)
✅ **Unauthorized manual triggers** - Only users with write access can trigger `workflow_dispatch`
✅ **Pull request abuse** - Workflow requires approval for first-time contributors
✅ **Token abuse** - GITHUB_TOKEN is automatically scoped and expires after workflow completes

### What's Still Possible (by design)

⚠️ **Forks can see the workflow code** - This is expected for open source
⚠️ **Forks can run the workflow on their own fork** - They'll create their own database copy (doesn't affect your repo)
⚠️ **Database file is public** - Anyone can download `data/vinyls.db` (this is intentional)
⚠️ **You can still push directly** - You're in the bypass list for branch protection

### Alternative: Stricter Control with Deploy Keys or PAT

If you want to restrict push access to only yourself AND keep automation working, you need to:

1. **Create a Personal Access Token (PAT)** or **Deploy Key**
2. **Add it as a repository secret**
3. **Update the workflow to use the secret instead of GITHUB_TOKEN**

**Workflow changes needed:**

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
   token: ${{ secrets.PAT_TOKEN }} # Instead of GITHUB_TOKEN
   persist-credentials: true
```

**Branch protection with this approach:**

- ✅ Enable "Restrict who can push to matching branches"
- ✅ Add yourself and the deploy key/app to the allowed list
- ✅ GitHub Actions bot is now explicitly authorized

**Downside:** More complex setup and maintenance (tokens expire, need rotation).

**Recommendation:** For a public open-source project, the default approach (without push restrictions) is standard and secure. The "restrict push" feature is mainly useful for enterprise repos with many collaborators.

---

### How Forks Work (Why This is Safe)

When someone forks your repository:

1. **They get their own copy** - Changes in their fork don't affect your repository
2. **Workflow runs on their fork** - Uses their Actions minutes, updates their database
3. **They can't push to your repo** - GitHub permissions prevent this automatically
4. **Pull requests are safe** - You review and approve before merging

**Bottom line:** Forks are completely isolated. The workflow running on a fork only affects that fork's database file, never yours.

### If You Need to Keep the Repo Private

If these protections aren't sufficient, consider:

1. **Make the repository private** (Settings → Danger Zone → Change visibility)
2. **Use a separate private repository** for the workflow and database
3. **Implement webhook authentication** for automated commits

### Monitoring

To monitor for suspicious activity:

1. Check **Actions** tab regularly for unexpected workflow runs
2. Review **Commits** for unauthorized database updates
3. Set up **notifications** for workflow failures (Settings → Notifications)

### Questions?

If you notice any suspicious activity or have security concerns, immediately:

1. Disable the workflow (Actions → Workflow → Disable)
2. Rotate any tokens/secrets (if added in the future)
3. Review recent commits and workflow runs
