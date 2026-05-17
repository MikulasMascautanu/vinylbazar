# Project Improvement Proposals

This document tracks proposed improvements and refactoring ideas for the Vinyl Bazar project.

---

## 📁 Proposal #1: Restructure to Balanced Monorepo

**Status**: Proposed  
**Priority**: Low  
**Effort**: Medium  
**Date**: 2026-05-17

### Current State

The project currently uses a backend-in-root structure:

```
vinylbazar/
├── src/                    # Backend source code
├── client/                 # Frontend React app
│   └── package.json
├── data/                   # SQLite database
├── package.json            # Backend dependencies
└── various test files
```

**Issues with current structure:**
- Backend appears to be the "primary" application (implicit hierarchy)
- Not immediately clear where backend code lives vs. project root files
- Harder to add additional services (mobile app, admin panel, etc.) later
- Cannot easily share configuration or utilities between backend/frontend

### Proposed Solution

Restructure to a balanced monorepo with explicit backend/frontend separation:

```
vinylbazar/
├── backend/
│   ├── src/
│   │   ├── api.js
│   │   ├── scraper.js
│   │   ├── db.js
│   │   └── config.js
│   ├── data/              # SQLite database
│   ├── package.json
│   └── README.md
├── client/
│   ├── src/
│   ├── package.json
│   └── README.md
├── shared/                # Optional: shared utilities/types
│   └── package.json
├── package.json           # Workspace root configuration
├── README.md              # Project overview
├── SECURITY.md
└── test files (organized by service)
```

**Root `package.json` with npm workspaces:**
```json
{
  "name": "vinylbazar",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "backend",
    "client"
  ],
  "scripts": {
    "install:all": "npm install",
    "start:api": "npm run start -w backend",
    "start:client": "npm run dev -w client",
    "start:dev": "npm run start:api & npm run start:client",
    "scrape": "npm run scrape -w backend",
    "test": "npm run test -w backend && npm run test -w client",
    "build": "npm run build -w client",
    "lint": "npm run lint -w client"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

### Benefits

1. **Clear Organization**: Equal treatment of frontend and backend
2. **Scalability**: Easy to add new services (e.g., `admin/`, `mobile/`)
3. **Better Developer Experience**: Clear boundaries for frontend/backend teams
4. **Shared Dependencies**: Can create `shared/` package for common utilities/types
5. **Modern Tooling**: Works well with Turborepo, Nx, or other monorepo tools
6. **Simplified Scripts**: Single command to install all dependencies from root
7. **Better CI/CD**: Clear workspace boundaries for testing and deployment

### Migration Steps

1. **Create new structure** (non-breaking approach):
   ```bash
   mkdir backend
   mv src backend/
   mv data backend/
   mv package.json backend/
   mv package-lock.json backend/
   # Move backend-specific test files
   mv test-api.js backend/
   mv test-phase*.* backend/
   ```

2. **Create workspace root `package.json`** with workspaces configuration

3. **Update all script references**:
   - Update import paths if needed
   - Update test scripts
   - Update documentation

4. **Update `.gitignore`**:
   ```
   node_modules/
   backend/node_modules/
   client/node_modules/
   backend/data/*.db
   ```

5. **Install dependencies**:
   ```bash
   npm install  # Installs all workspaces
   ```

6. **Test everything**:
   - Backend API still runs
   - Frontend still connects
   - Scraper still works
   - All tests pass

7. **Update documentation** (README.md, implementation-plan.md, etc.)

### Risks & Considerations

- **Breaking Changes**: Import paths might need updates
- **Database Path**: Need to update path to `data/vinyls.db` in backend code
- **Deployment**: Hosting platforms may need configuration updates
- **Time Investment**: Requires testing to ensure nothing breaks

### Alternative: Keep Current Structure

The current structure is **perfectly valid** for this project because:
- Project started as a scraper/backend (historical reason)
- Backend is indeed the "core" functionality
- Small team/solo developer doesn't need strict boundaries
- Simple deployment (many platforms expect root `package.json`)

**When to keep current structure:**
- Project remains small and focused
- No plans to add additional services
- Deployment simplicity is priority

**When to refactor:**
- Adding more services (admin panel, mobile app, etc.)
- Growing team with specialized frontend/backend developers
- Want to share code/types between frontend and backend
- Planning to use advanced monorepo tooling

---

## 📋 Future Proposal Template

**Status**: Proposed | In Progress | Completed | Rejected  
**Priority**: Low | Medium | High | Critical  
**Effort**: Small | Medium | Large  
**Date**: YYYY-MM-DD

### Current State
[Describe the current situation]

### Proposed Solution
[Describe the proposed improvement]

### Benefits
[List the advantages]

### Migration Steps
[How to implement this]

### Risks & Considerations
[What could go wrong, what to watch out for]

---

## 📝 Notes

- Proposals should be discussed before implementation
- Mark status as "In Progress" when work begins
- Document lessons learned after implementation
- Archive completed proposals with outcome notes
