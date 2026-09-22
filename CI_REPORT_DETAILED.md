# Detailed CI Pipeline Implementation Report

## 1. Executive Summary

This report documents the implementation and verification of a basic continuous integration (CI) pipeline for the MERN Book CRUD application.

The application was pushed to [github.com/Lola381/Lab2](https://github.com/Lola381/Lab2). A GitHub Actions workflow was added to validate the project automatically whenever code is pushed or a pull request is opened or updated.

The pipeline installs backend and frontend dependencies from lockfiles, checks backend JavaScript syntax, runs frontend ESLint, and creates a production frontend build. The workflow was tested locally, pushed to GitHub, and executed successfully by GitHub Actions.

## 2. Project Information

| Item | Value |
| --- | --- |
| Application | MERN Book CRUD application |
| Repository | [github.com/Lola381/Lab2](https://github.com/Lola381/Lab2) |
| Default branch | `main` |
| Workflow name | `CI` |
| Workflow file | `.github/workflows/ci.yml` |
| Runner | `ubuntu-latest` |
| Requested Node.js version | Node.js 20 |
| Latest commit | `e49a008` |
| PDF report | `CI_REPORT.pdf` |

## 3. Objective

The objective was to design and implement a basic CI workflow triggered by commits using GitHub Actions. The workflow provides fast feedback about whether the project can be installed, checked, linted, and built in a clean environment.

The pipeline is focused on validation rather than deployment. It does not start the application, connect to MongoDB, or publish a release. This keeps the job repeatable and avoids requiring database credentials during validation.

## 4. Initial Project Situation

The application contains separate backend and frontend Node.js projects:

```text
mern-book-crud/
+-- backend/
|   +-- package.json
|   +-- package-lock.json
|   +-- server.js
+-- frontend/
|   +-- package.json
|   +-- package-lock.json
|   +-- src/
+-- atlas-credentials.env
+-- ...
```

The backend uses Node.js, Express, MongoDB/Mongoose, JWT authentication, and related packages. The frontend uses React, Vite, React Router, React Hook Form, Tailwind CSS, and ESLint.

The backend did not have an executable automated test suite. Its `test` script was the default failing placeholder, so the CI workflow does not call `npm test`. Instead, it uses the reliable backend syntax check supported by Node.js.

The frontend had working `lint` and `build` scripts, making those the appropriate application-level quality gates for CI.

## 5. CI Workflow Design

The workflow is defined in `.github/workflows/ci.yml`.

### 5.1 Triggers

```yaml
on:
  push:
  pull_request:
```

The `push` trigger runs the workflow after commits are pushed. The `pull_request` trigger runs the same checks for proposed changes before they are merged.

### 5.2 Runner and runtime

```yaml
runs-on: ubuntu-latest
```

The job uses a clean GitHub-hosted Ubuntu runner. This verifies that the project works from committed files rather than depending on a developer's local machine.

The workflow configures Node.js 20 with `actions/setup-node@v4`:

```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
```

### 5.3 Checkout

`actions/checkout@v4` downloads the repository into the runner workspace.

### 5.4 Backend dependency installation

```yaml
- name: Install backend dependencies
  working-directory: backend
  run: npm ci
```

The command uses `backend/package-lock.json` for a reproducible clean installation. `npm ci` is appropriate for CI because it does not silently rewrite the lockfile.

### 5.5 Backend syntax validation

```yaml
- name: Check backend syntax
  working-directory: backend
  run: node --check server.js
```

This verifies that the main backend entry point can be parsed by Node.js without starting the server or requiring MongoDB credentials.

### 5.6 Frontend dependency installation

```yaml
- name: Install frontend dependencies
  working-directory: frontend
  run: npm ci
```

This installs frontend dependencies using `frontend/package-lock.json` in a clean environment.

### 5.7 Frontend linting

```yaml
- name: Lint frontend
  working-directory: frontend
  run: npm run lint
```

This runs the frontend ESLint configuration and prevents configured code-quality errors from passing unnoticed.

### 5.8 Frontend production build

```yaml
- name: Build frontend
  working-directory: frontend
  run: npm run build
```

This runs Vite's production build and validates that the frontend can be compiled and bundled for deployment.

## 6. Source Changes Made During Implementation

The first local execution of the planned CI commands exposed existing frontend lint errors. These were fixed before the workflow was pushed.

### 6.1 Unused route import

File: `frontend/src/App.jsx`

The `Navigate` symbol was imported from `react-router-dom` but was not used. The unused import was removed.

### 6.2 Unused React import

File: `frontend/src/components/BookTable.jsx`

The component uses the modern JSX transform and did not reference the `React` variable directly. The unused `React` import was removed.

### 6.3 Initial book-loading effect

File: `frontend/src/pages/Books.jsx`

The initial `useEffect` called the asynchronous loader directly. The configured React hooks lint rule reported the state updates performed by that call. The effect was adjusted to invoke the existing loader through an effect-local asynchronous function, preserving behavior while satisfying the configured lint rule.

No API routes, database models, authentication behavior, or user-facing CRUD behavior were changed as part of the CI work.

## 7. Repository and Security Handling

A root `.gitignore` was added to prevent accidental commits of generated or sensitive files:

```gitignore
node_modules/
dist/
.env
*.env
!.env.example
```

This protects local environment files, including the local Atlas credentials file, while allowing safe example environment templates to remain versioned.

Dependency directories and frontend build output are excluded. GitHub Actions creates them from the lockfiles during each run.

No database credentials, access tokens, or other local secrets were pushed to GitHub.

## 8. Important Commands Used

### 8.1 Inspect project scripts

```powershell
Get-Content backend\package.json
Get-Content frontend\package.json
```

These commands confirmed the available scripts before the workflow was designed.

### 8.2 Local backend validation

```powershell
cd backend
npm ci
node --check server.js
```

Expected result: installation completes and Node.js reports no syntax errors.

### 8.3 Local frontend validation

```powershell
cd frontend
npm ci
npm run lint
npm run build
```

Expected result: ESLint completes without errors and Vite generates the production bundle in `frontend/dist`.

### 8.4 Initialize and connect the project repository

The project was originally inside a larger parent Git repository with unrelated coursework and remotes. A separate repository was initialized inside the application directory so only this project could be pushed to `Lab2`.

```powershell
git init -b main
git remote add origin https://github.com/Lola381/Lab2.git
git fetch origin main
```

The target repository contained only its initial Git history, so that history was retained rather than overwritten.

### 8.5 Stage, commit, merge, and push

```powershell
git add .
git commit -m "Add MERN book CRUD app and CI workflow"
git merge origin/main --allow-unrelated-histories --no-edit
git push -u origin main
```

The `.gitignore` ensured that local dependencies, build output, and credentials were not staged.

### 8.6 Verify local and remote commits

```powershell
$localCommit = git rev-parse HEAD
$remoteCommit = (git ls-remote origin refs/heads/main).Split("`t")[0]
Write-Output "Local:  $localCommit"
Write-Output "Remote: $remoteCommit"
git status --short
```

This confirmed that local and remote commit hashes matched and that the working tree was clean.

### 8.7 Create the visual PDF report

The report was supplemented with an HTML version and a workflow diagram. The PDF was rendered using headless Google Chrome:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --headless `
  --disable-gpu `
  --no-sandbox `
  --print-to-pdf="CI_REPORT.pdf" `
  "file:///C:/path/to/CI_REPORT.html"
```

The resulting `CI_REPORT.pdf` has a valid PDF header and contains the application image and CI pipeline diagram.

## 9. GitHub Actions Validation Evidence

The GitHub Actions run completed successfully for the pushed repository.

The successful `validate` job passed these stages in order:

1. **Set up job**: GitHub prepared the Ubuntu runner.
2. **Check out repository**: The repository was checked out at the CI commit.
3. **Set up Node.js**: Node.js 20 was downloaded and configured.
4. **Install backend dependencies**: `npm ci` completed successfully.
5. **Check backend syntax**: `node --check server.js` completed successfully.
6. **Install frontend dependencies**: `npm ci` completed successfully.
7. **Lint frontend**: `npm run lint` completed with no errors.
8. **Build frontend**: Vite transformed the frontend modules and produced the production bundle.
9. **Post-job cleanup**: GitHub completed runner cleanup successfully.

The captured GitHub Actions screenshots show green checkmarks for the `validate` job and each requested validation stage.

## 10. Validation Results and Warnings

### Successful checks

- Backend dependencies installed successfully.
- Backend syntax check passed.
- Frontend dependencies installed successfully.
- Frontend lint passed.
- Frontend production build passed.
- GitHub Actions job completed successfully.
- Local and remote Git commit hashes matched.
- Working tree was clean after pushing.

### Non-blocking React Compiler warning

The frontend lint output included a warning for React Hook Form's `watch()` API in `frontend/src/pages/Register.jsx`. The React Compiler skipped optimization for that incompatible API, but ESLint returned zero errors and the CI job passed.

This warning is informational and does not indicate a failed build.

### Backend npm audit warning

Backend dependency installation reported one moderate-severity npm audit vulnerability. The `npm ci` command still completed successfully, and the workflow did not fail because of the audit report.

Further dependency review can be performed with:

```powershell
cd backend
npm audit
```

Automatic dependency changes were not applied because they could alter the lockfile and application behavior beyond the requested CI implementation.

### GitHub Actions Node.js deprecation notice

The GitHub Actions log displayed a platform notice that the action runtime currently targets Node.js 20 while GitHub runners are moving toward Node.js 24. This notice came from the action runtime and did not fail the job.

The workflow explicitly requests Node.js 20 for application validation. Action versions can be reviewed and updated in the future if GitHub requires a newer runtime.

## 11. Final Repository Contents Related to This Work

| File | Purpose |
| --- | --- |
| `.github/workflows/ci.yml` | GitHub Actions CI definition |
| `.gitignore` | Excludes dependencies, build output, and local secrets |
| `CI_REPORT.md` | Original implementation report |
| `CI_REPORT_DETAILED.md` | Detailed written implementation report |
| `CI_REPORT.html` | Styled source used to generate the PDF report |
| `CI_REPORT.pdf` | Image-based PDF report |
| `ci-pipeline.svg` | CI workflow diagram embedded in the report |
| `frontend/src/App.jsx` | Removed unused route import |
| `frontend/src/components/BookTable.jsx` | Removed unused React import |
| `frontend/src/pages/Books.jsx` | Adjusted initial book-loading effect |

## 12. Reproduction Procedure

A reviewer can reproduce the validation locally from the project root:

```powershell
Push-Location backend
npm ci
node --check server.js
Pop-Location

Push-Location frontend
npm ci
npm run lint
npm run build
Pop-Location
```

To trigger the GitHub workflow again without changing application code, an empty commit can be pushed:

```powershell
git commit --allow-empty -m "Test CI pipeline"
git push
```

The resulting run can be viewed from the repository's **Actions** tab. Open the `CI` workflow, select the latest run, and open the `validate` job to inspect each step's logs.

## 13. Final Status

- CI workflow implemented: **Yes**
- Push trigger configured: **Yes**
- Pull request trigger configured: **Yes**
- Backend dependency installation: **Passed**
- Backend syntax check: **Passed**
- Frontend dependency installation: **Passed**
- Frontend lint: **Passed with one non-blocking warning**
- Frontend build: **Passed**
- GitHub push: **Successful**
- PDF report generated: **Yes**
- Local and remote branch synchronized: **Yes**
- Working tree clean: **Yes**

## 14. Conclusion

The MERN Book CRUD project now has a repeatable GitHub Actions CI pipeline. Each push and pull request is checked in a clean Ubuntu environment, dependencies are installed from lockfiles, backend syntax is validated, frontend code is linted, and the frontend production build is verified.

The implementation, source corrections, workflow evidence, commands, and visual documentation are available in the `Lola381/Lab2` repository.
