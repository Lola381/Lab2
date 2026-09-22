# CI Pipeline Implementation Report

## 1. Project Details

- Project: MERN Book CRUD application
- GitHub repository: https://github.com/Lola381/Lab2
- Branch: `main`
- Latest documented commit: `0140e9c`
- Workflow file: `.github/workflows/ci.yml`
- Workflow name: `CI`

## 2. Objective

Implement a basic continuous integration pipeline that runs automatically when changes are pushed to GitHub or submitted through a pull request.

## 3. Work Completed

### CI workflow

The GitHub Actions workflow was added with the following triggers and checks:

- Trigger on every `push`
- Trigger on every `pull_request`
- Run on `ubuntu-latest`
- Set up Node.js 20
- Install backend dependencies with the backend lockfile
- Check backend JavaScript syntax
- Install frontend dependencies with the frontend lockfile
- Run frontend ESLint
- Build the frontend with Vite

### Source fixes required by CI

The first CI-equivalent local run found existing frontend lint errors. These were corrected by:

- Removing the unused `Navigate` import from `frontend/src/App.jsx`
- Removing the unused React import from `frontend/src/components/BookTable.jsx`
- Updating the initial book-loading effect in `frontend/src/pages/Books.jsx`

### Repository safety

A project-level `.gitignore` was added to exclude:

- `node_modules/`
- Frontend build output in `dist/`
- Local `.env` and environment credential files

No local Atlas credentials were pushed.

## 4. Important Commands

### Local backend validation

```powershell
cd backend
npm ci
node --check server.js
```

### Local frontend validation

```powershell
cd frontend
npm ci
npm run lint
npm run build
```

### Git repository setup and push

```powershell
git init -b main
git remote add origin https://github.com/Lola381/Lab2.git
git fetch origin main
git add .
git commit -m "Add MERN book CRUD app and CI workflow"
git merge origin/main --allow-unrelated-histories --no-edit
git push -u origin main
```

### Verify the pushed commit

```powershell
$localCommit = git rev-parse HEAD
$remoteCommit = (git ls-remote origin refs/heads/main).Split("`t")[0]
Write-Output "Local:  $localCommit"
Write-Output "Remote: $remoteCommit"
git status --short
```

## 5. Validation Result

The GitHub Actions run completed successfully. The `validate` job passed all stages:

1. Install backend dependencies
2. Check backend syntax
3. Install frontend dependencies
4. Lint frontend
5. Build frontend

The frontend lint command produced one non-blocking React Compiler warning related to React Hook Form's `watch()` API. It did not fail the pipeline.

The backend dependency installation reported one moderate npm audit vulnerability. This is reported by npm and does not currently fail the CI workflow.

## 6. Final Status

- GitHub push: successful
- GitHub Actions CI: successful
- Local and remote commit hashes: matched
- Working tree: clean
