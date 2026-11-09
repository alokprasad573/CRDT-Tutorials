# SETUP.md

# CollabNote — Development Environment Setup

**Project:** CollabNote  
**Operating System:** Windows 10 / 11  
**Package Manager:** npm  
**Monorepo:** npm workspaces  
**Development Assistant:** Google Antigravity

---

## 1. Purpose

This guide explains how to initialize, configure, and run the CollabNote development environment.

Follow the steps in order.

Do not skip verification steps.

## 2. Prerequisites

The following tools should be installed.

| Tool | Required |
|---|---|
| Node.js | Yes |
| npm | Yes |
| Git | Yes |
| VS Code or Antigravity | Recommended |
| Neon PostgreSQL account | For database phase |

### Expected development environment

The project environment previously reported:

```text
Node.js: v26.13.0
npm:     11.20.0
Git:     2.56.0.windows.4
```

Verify your environment using PowerShell:

```powershell
node -v
npm -v
git --version
```

If the commands return version numbers, the tools are available.

---

## 3. Create the Project Directory

Open PowerShell.

Navigate to the location where you want to store the project.

Example:

```powershell
cd D:\Projects
```

Create the project directory:

```powershell
mkdir collabnote
cd collabnote
```

Initialize Git:

```powershell
git init
```

Initialize the root npm project:

```powershell
npm init -y
```

---

## 4. Create the Monorepo Structure

CollabNote uses npm workspaces.

Create the application directories:

```powershell
New-Item -ItemType Directory -Force -Path `
  apps/web, `
  apps/server, `
  packages/shared
```

Expected structure:

```text
collabnote/
│
├── apps/
│   ├── web/
│   └── server/
│
├── packages/
│   └── shared/
│
└── package.json
```

---

## 5. Configure Root package.json

Open the root `package.json`.

Replace its contents with:

```json
{
  "name": "collabnote",
  "version": "1.0.0",
  "private": true,
  "packageManager": "npm@11.20.0",
  "workspaces": [
    "apps/web",
    "apps/server",
    "packages/shared"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "test": "npm run test --workspaces --if-present"
  }
}
```

**Important:** The development script is a placeholder until the workspace scripts are configured. It does not guarantee that all applications will start concurrently.

---

## 6. Create Workspace package.json Files

### Frontend

Create `apps/web/package.json`:

```json
{
  "name": "@collabnote/web",
  "version": "1.0.0",
  "private": true
}
```

### Backend

Create `apps/server/package.json`:

```json
{
  "name": "@collabnote/server",
  "version": "1.0.0",
  "private": true
}
```

### Shared package

Create `packages/shared/package.json`:

```json
{
  "name": "@collabnote/shared",
  "version": "1.0.0",
  "private": true
}
```

---

## 7. Configure .gitignore

Create `.gitignore` in the repository root.

```gitignore
# Dependencies
node_modules/

# Next.js
.next/
out/

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Testing
coverage/

# Logs
*.log
npm-debug.log*

# Operating system
.DS_Store
Thumbs.db

# IDE
.vscode/*
!.vscode/extensions.json
```

Never commit actual environment secrets.

---

## 8. Install Workspace Dependencies

From the root directory:

```powershell
npm install
```

Verify the workspaces:

```powershell
npm ls --workspaces --depth=0
```

Expected workspace names:

```text
@collabnote/web
@collabnote/server
@collabnote/shared
```

At this point, the monorepo structure should be recognized by npm.

---

## 9. Initialize the Frontend

The frontend will use:

- Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI

Initialize Next.js inside the existing workspace:

```powershell
npx create-next-app@latest apps/web --ts --tailwind --eslint --app --src-dir --use-npm
```

Follow the setup prompts if the installed generator asks additional questions.

After initialization, inspect `apps/web/package.json`.

Verify that the workspace name remains:

```json
"name": "@collabnote/web"
```

If the generator changes it, restore the workspace name.

Install Shadcn UI:

```powershell
npx shadcn@latest init
```

Run the command from the frontend workspace:

```powershell
cd apps/web
npx shadcn@latest init
cd ../..
```

Follow the prompts and use the design decisions in `DESIGN.md`.

---

## 10. Initialize the Backend

The backend will use:

- Express.js
- TypeScript
- Node.js

Navigate to the backend:

```powershell
cd apps/server
```

Initialize its package:

```powershell
npm init -y
```

Restore the workspace package name to:

```json
"name": "@collabnote/server"
```

Install Express:

```powershell
npm install express cors dotenv
```

Install development dependencies:

```powershell
npm install -D typescript tsx @types/node @types/express @types/cors
```

Return to the root:

```powershell
cd ../..
```

Create the backend TypeScript configuration and entry point during Phase 2.

---

## 11. Configure the Shared Package

The shared package will contain reusable TypeScript types, validation schemas, and constants.

Its implementation will be completed during Phase 2.

Do not put database connections or browser-specific components in this package.

---

## 12. Environment Variables

Create environment files when their respective applications are implemented.

### Backend

Create `apps/server/.env`:

```env
NODE_ENV=development
PORT=4000

DATABASE_URL=

FRONTEND_URL=http://localhost:3000

SESSION_SECRET=

COLLABORATION_URL=ws://localhost:4000/collaboration
```

### Frontend

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

NEXT_PUBLIC_COLLABORATION_URL=ws://localhost:4000/collaboration
```

These are proposed variable names. The implementation must validate and consistently use the final configuration.

Never put database credentials or session secrets in `NEXT_PUBLIC_` variables.

---

## 13. Neon Database Setup

Database configuration will be completed during Phase 3.

1. Create an account at Neon.
2. Create a PostgreSQL project.
3. Select the appropriate region.
4. Obtain the database connection string.
5. Add the connection string to `apps/server/.env`.
6. Configure the selected ORM.
7. Create database migrations.
8. Run migrations.
9. Verify the database connection.

Do not commit the connection string.

Follow `DATABASE.md`.

---

## 14. Start Development Servers

Once the applications have their development scripts configured, start them separately for the initial setup.

### Frontend

```powershell
npm run dev --workspace=@collabnote/web
```

Expected address:

```text
http://localhost:3000
```

### Backend

```powershell
npm run dev --workspace=@collabnote/server
```

Expected API address:

```text
http://localhost:4000
```

The backend health endpoint will eventually be:

```text
http://localhost:4000/api/v1/health
```

The Hocuspocus WebSocket endpoint will eventually be:

```text
ws://localhost:4000/collaboration
```

These endpoints become available after their respective backend features are implemented.

---

## 15. Recommended Root Scripts

After configuring the workspace scripts, the root project should support:

```powershell
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
```

Use a process runner such as `concurrently` if you want the root development command to start both frontend and backend simultaneously.

Only add scripts after confirming that their underlying workspace commands exist.

---

## 16. Verify the Project

Run these checks from the repository root:

```powershell
npm ls --workspaces --depth=0
```

Check Git:

```powershell
git status
```

Check the installed Node.js version:

```powershell
node -v
```

Check npm:

```powershell
npm -v
```

Once application scripts exist, verify:

- Frontend starts.
- Backend starts.
- Health endpoint responds.
- TypeScript checks pass.
- Production build succeeds.

Do not mark the setup complete until these checks have actually passed.

---

## 17. Common Problems

### Problem 1: npm cannot find a workspace

Check:

- Root `package.json`.
- Workspace directory names.
- Workspace `package.json` files.
- Workspace package names.

Then run:

```powershell
npm install
```

### Problem 2: Port already in use

Identify the process using the port.

For example:

```powershell
netstat -ano | findstr :3000
```

Do not terminate an unknown process without checking what it is.

### Problem 3: Missing environment variables

Check:

- Correct environment filename.
- Correct workspace directory.
- Variable spelling.
- Whether the application has been restarted after changes.

### Problem 4: Native package installation errors

Before deleting dependencies or lockfiles:

1. Read the complete error.
2. Check the affected package.
3. Check the package's Node.js compatibility.
4. Inspect the npm error log.
5. Choose the least destructive repair.

Do not delete `package-lock.json` or the entire `node_modules` directory automatically.

---

## 18. Important Development Rules

- Always run commands from the correct directory.
- Keep dependencies in the correct workspace.
- Use npm as the package manager.
- Commit `package-lock.json`.
- Never commit `.env` files.
- Do not change the documented architecture without approval.
- Implement one phase at a time.
- Test before moving to the next phase.

Follow `AGENTS.md` and `PLAN.md`.

---

## 19. Setup Completion Checklist

### Environment

- [ ] Node.js installed.
- [ ] npm installed.
- [ ] Git installed.
- [ ] Antigravity installed.

### Monorepo

- [ ] Root project created.
- [ ] Git initialized.
- [ ] npm workspaces configured.
- [ ] `apps/web` created.
- [ ] `apps/server` created.
- [ ] `packages/shared` created.
- [ ] Workspace manifests created.
- [ ] `.gitignore` configured.
- [ ] Dependencies installed.

### Applications

- [ ] Next.js initialized.
- [ ] Tailwind configured.
- [ ] Shadcn UI configured.
- [ ] Express initialized.
- [ ] TypeScript configured.
- [ ] Development scripts configured.

### Database

- [ ] Neon project created.
- [ ] Database connection configured.
- [ ] ORM confirmed.
- [ ] Initial migrations executed.

---

## 20. Next Step

After completing the setup checklist, continue with `PLAN.md`.

The next implementation objective is to establish a working frontend and backend foundation.

Do not start authentication, document management, or collaboration until the foundation is verified.

**End of SETUP.md**