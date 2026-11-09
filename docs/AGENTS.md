# AGENTS.md

# CollabNote — AI Agent Instructions

**Project:** CollabNote  
**Project Type:** Real-Time Collaborative Text Editor  
**Development Approach:** AI-assisted, step-by-step implementation  
**Primary AI Coding Assistant:** Google Antigravity

---

## 1. Project Overview

CollabNote is a lightweight, web-based collaborative writing application.

Users can create documents, edit content, share documents, and collaborate with other users in real time.

The application uses:

- Next.js for the frontend.
- Tailwind CSS for styling.
- Shadcn UI for reusable UI components.
- Tiptap for rich-text editing.
- Yjs for conflict-free collaborative editing.
- Hocuspocus for collaboration server functionality.
- Express.js for backend REST APIs.
- Neon PostgreSQL for persistent data.
- TypeScript for application development.
- npm workspaces for monorepo management.

The project is organized as a monorepo.

```text
collabnote/
├── apps/
│   ├── web/
│   └── server/
├── packages/
│   └── shared/
├── PRD.md
├── DESIGN.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── AGENTS.md
└── package.json
```

---

## 2. Document Authority

Before implementing any feature, read the relevant project documentation.

| Document | Purpose |
|---|---|
| `PRD.md` | Product requirements and MVP scope |
| `DESIGN.md` | Visual design and user experience |
| `ARCHITECTURE.md` | System architecture and technical responsibilities |
| `DATABASE.md` | Database schema and persistence |
| `API.md` | API contracts and collaboration endpoints |
| `AGENTS.md` | AI development rules |

Follow these documents together.

### Priority when requirements conflict

1. Explicit decisions made by the project owner.
2. `PRD.md` for product scope.
3. `ARCHITECTURE.md` for architectural boundaries.
4. `DATABASE.md` for data structures.
5. `API.md` for API contracts.
6. `DESIGN.md` for visual and interaction design.
7. This file for development workflow.

If two documents contain conflicting technical decisions, stop and explain the conflict.

Do not silently choose one.

---

## 3. Core Development Rules

These rules are mandatory.

### Rule 1: Work incrementally

- Implement one phase at a time.
- Break large tasks into small steps.
- Do not implement the entire application in one operation.
- Finish and verify the current task before moving forward.

### Rule 2: Inspect before modifying

Before changing code:

1. Inspect the repository structure.
2. Read the relevant source files.
3. Understand existing implementations.
4. Identify dependencies and potential side effects.
5. Explain the intended changes.

Never assume the repository is empty or that existing code can be safely replaced.

### Rule 3: Preserve working functionality

- Avoid unnecessary rewrites.
- Do not delete existing functionality without approval.
- Do not replace working implementations just to use a different library.
- Keep changes focused on the requested task.

### Rule 4: Explain technical decisions

When implementing a feature, explain:

- What is being built.
- Why it is needed.
- Which files are affected.
- How the implementation works.
- How to test it.

Keep explanations beginner-friendly.

### Rule 5: Do not invent requirements

- Follow the PRD.
- Do not introduce unapproved MVP features.
- Do not invent API contracts.
- Do not change database relationships without justification.
- Ask before making major architectural changes.

---

## 4. Technology Rules

Use the approved project stack.

| Area | Technology |
|---|---|
| Frontend | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI |
| Rich Text Editor | Tiptap |
| Collaborative State | Yjs |
| Collaboration Server | Hocuspocus |
| Backend | Express.js |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM (provisional) |
| Package Manager | npm |
| Monorepo | npm workspaces |

Do not introduce alternative frameworks or databases without approval.

### Version management

- Inspect installed package versions before changing dependencies.
- Use compatible versions of Tiptap, Yjs, and Hocuspocus.
- Avoid mixing incompatible major versions.
- Do not blindly install `latest` versions.
- Preserve the lockfile unless dependency changes require updating it.
- Explain dependency changes.

The project owner's actual Node.js and npm environment should be checked before recommending environment-specific changes.

---

## 5. Monorepo Responsibilities

### `apps/web`

Responsible for:

- Next.js application.
- Authentication screens.
- Dashboard.
- Document editor interface.
- Tiptap integration.
- Collaboration client connection.
- Presence and cursor UI.
- Responsive layouts.

Must not:

- Access PostgreSQL directly.
- Contain database credentials.
- Bypass backend authorization.
- Implement its own competing collaboration protocol.

### `apps/server`

Responsible for:

- Express REST APIs.
- Authentication.
- Authorization.
- Document management.
- Membership management.
- Database operations.
- Hocuspocus collaboration server.
- Yjs persistence.
- Snapshot and recovery logic.

### `packages/shared`

Responsible for reusable:

- TypeScript types.
- Shared validation schemas.
- Constants.
- Common interfaces.
- API-related shared definitions.

Do not put browser-specific or server-specific implementations here unless they are intentionally designed to be environment-independent.

---

## 6. Frontend Development Rules

### Next.js

- Use TypeScript.
- Prefer the App Router.
- Use Server Components where appropriate.
- Use Client Components only when browser interaction or client-side state requires them.
- Keep components focused and reusable.
- Handle loading, empty, error, and success states.

### Styling

- Use Tailwind CSS.
- Follow `DESIGN.md`.
- Use Shadcn UI components where appropriate.
- Avoid unnecessary custom CSS.
- Maintain consistent spacing, typography, and colors.
- Ensure responsive behavior.

### Tiptap

- Use Tiptap for rich-text editing.
- Keep editor configuration reusable.
- Keep toolbar logic separate from editor initialization.
- Do not manipulate editor HTML directly when Tiptap commands are available.
- Preserve document content structure during editing.

### Collaboration client

- Use Yjs as the shared document model.
- Connect through the configured Hocuspocus provider.
- Handle connection, synchronization, and disconnection states.
- Do not mistake local editor updates for successful server synchronization.
- Ensure multiple independent clients can edit the same document.

---

## 7. Backend Development Rules

### Express.js

- Keep routes, controllers, services, and repositories separated.
- Validate request data.
- Use centralized error handling.
- Return consistent API response formats.
- Do not expose internal stack traces in production.

### Authentication

- Protect private routes.
- Verify user sessions on the server.
- Never trust a user ID supplied by the frontend.
- Never store plaintext passwords.
- Use secure cookie and session practices if cookie-based authentication is selected.

### Authorization

Every protected document operation must verify access.

Use these roles:

- Owner
- Editor
- Viewer

Rules:

- Owner can manage the document and its members.
- Editor can read and edit content.
- Viewer can read content only.
- Unauthorized users cannot access private documents.

Frontend permissions are not security controls. Backend enforcement is mandatory.

---

## 8. Real-Time Collaboration Rules

This is one of the most important parts of CollabNote.

Understand the responsibilities of each technology:

| Technology | Responsibility |
|---|---|
| WebSocket | Communication transport |
| Yjs | Shared state and conflict resolution |
| Hocuspocus | Collaboration server and synchronization |
| Tiptap | Rich-text editor integration |
| Awareness | Temporary presence and cursor information |

### Mandatory rules

1. Never implement collaboration using only React state.
2. Never assume WebSockets automatically resolve editing conflicts.
3. Never treat a `Y.Doc` alone as a network connection.
4. Use a compatible Yjs provider to connect clients.
5. Use the same document identity for clients joining the same document.
6. Authenticate every collaboration connection.
7. Authorize every document connection.
8. Enforce viewer read-only permissions on the server.
9. Persist accepted Yjs updates.
10. Verify recovery after restarting the server.

### Awareness

Awareness is temporary.

Use it for:

- Online presence.
- Cursor positions.
- Text selections.
- Display information.

Do not use Awareness for:

- Authentication.
- Authorization.
- Permanent user profiles.
- Durable document content.

### Collaboration verification

Never claim collaboration is complete until:

- Two independent browser clients connect to the same document.
- Changes made in one client appear in the other.
- Concurrent changes converge.
- Presence information is synchronized.
- Unauthorized users are rejected.
- Viewer users cannot submit updates.
- Persisted document content survives server restart.

---

## 9. Database Rules

Follow `DATABASE.md`.

Proposed core tables:

- `users`
- `documents`
- `document_members`
- `document_updates`
- `document_snapshots`

Rules:

- Use Drizzle ORM if its selection is confirmed.
- Use migrations for schema changes.
- Keep database access on the backend.
- Use foreign keys and appropriate indexes.
- Validate database inputs.
- Do not store plaintext passwords.
- Do not expose Yjs binary update data through ordinary public APIs.

### Yjs persistence

Follow the approved persistence strategy.

If using append-only updates and snapshots:

- Store accepted updates.
- Generate snapshots periodically.
- Recover from a valid snapshot and subsequent updates.
- Ensure snapshot creation is safe under concurrent editing.
- Never delete updates before verifying that their contents are safely represented in a persisted snapshot.

---

## 10. Code Quality Standards

Write code that is:

- Readable.
- Maintainable.
- Modular.
- Type-safe.
- Testable.
- Consistent with existing conventions.

### TypeScript

- Avoid `any` unless absolutely necessary.
- Prefer explicit types for important interfaces.
- Validate external data at runtime.
- Avoid unnecessary type assertions.
- Keep shared types in the appropriate shared package.

### Components

- Keep components small and focused.
- Avoid excessively large files.
- Extract reusable logic when it improves clarity.
- Use descriptive names.
- Avoid duplicated business logic.

### Error handling

- Handle expected failures explicitly.
- Log useful server-side diagnostic information.
- Do not expose secrets or sensitive information in logs.
- Show understandable error messages to users.

---

## 11. Security Requirements

Security must be considered during implementation, not postponed until the end.

Mandatory:

- Authentication for private resources.
- Server-side authorization.
- Input validation.
- Secure session handling.
- CSRF protection where applicable.
- Explicit CORS configuration.
- Rate limiting for sensitive endpoints.
- Safe environment variable handling.
- Parameterized database operations.
- No hardcoded secrets.
- No client-side database credentials.

Never disable authentication or authorization simply to make development easier.

If a local-only development shortcut is necessary, clearly isolate it and prevent it from being enabled in production.

---

## 12. Testing Requirements

Every meaningful implementation should include appropriate tests.

### Frontend

Test:

- Rendering.
- User interactions.
- Form validation.
- Loading states.
- Error states.
- Permission-dependent UI.

### Backend

Test:

- API success responses.
- Validation errors.
- Authentication failures.
- Authorization failures.
- Database operations.
- Error handling.

### Integration

Test:

- Frontend-to-backend requests.
- Authentication across protected endpoints.
- Document creation and retrieval.
- Document membership.
- Real-time collaboration.
- Yjs persistence and recovery.

### Before declaring a task complete

Run applicable:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

These scripts are expected examples. Inspect the actual package scripts first. If a script does not exist, do not pretend it ran.

Report:

- Commands executed.
- Tests passed.
- Tests failed.
- Known issues.
- Anything not tested.

Never claim success without actual verification.

---

## 13. Environment Variables

- Keep secrets in environment files or deployment secret managers.
- Commit only example environment files.
- Maintain an updated `.env.example`.
- Validate required variables during server startup.
- Never expose server-only variables through frontend public configuration.

Example:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=
COLLABORATION_URL=ws://localhost:4000/collaboration
```

These are placeholders, not production credentials.

---

## 14. Git and Dependency Rules

- Use meaningful commit messages when asked to commit.
- Do not overwrite user changes.
- Do not run destructive Git commands without explicit approval.
- Do not delete lockfiles or node_modules unnecessarily.
- Keep dependencies in the correct workspace.
- Explain package additions and removals.
- Review the Git diff before considering a task complete.

Never run commands such as `git reset --hard`, force pushes, or destructive cleanup commands without explicit approval.

---

## 15. Development Workflow

Follow this workflow for every task.

### Step 1: Understand

- Read relevant documentation.
- Identify the requested feature.
- Identify dependencies and prerequisites.

### Step 2: Inspect

- Inspect existing files.
- Check package versions.
- Check current implementation.
- Identify potential conflicts.

### Step 3: Plan

Present a short implementation plan:

- Files to create.
- Files to modify.
- Dependencies needed.
- Tests to add or update.

### Step 4: Implement

- Make focused changes.
- Follow project architecture.
- Keep code modular.
- Avoid unrelated modifications.

### Step 5: Verify

- Run relevant tests.
- Run type checking and linting where configured.
- Verify expected behavior.
- Inspect the final diff.

### Step 6: Explain

Report:

1. What was implemented.
2. Which files changed.
3. Why the implementation works.
4. Commands to run.
5. Test results.
6. Remaining issues.
7. Recommended next task.

### Step 7: Stop

Do not automatically start the next phase.

Wait for the project owner to review and approve the current work.

---

## 16. Phase-Based Implementation

Implement CollabNote in controlled phases.

| Phase | Scope |
|---|---|
| Phase 1 | Monorepo and development environment |
| Phase 2 | Database connection and initial schema |
| Phase 3 | Authentication |
| Phase 4 | Document CRUD |
| Phase 5 | Basic Tiptap editor |
| Phase 6 | Yjs and Hocuspocus synchronization |
| Phase 7 | Document sharing and permissions |
| Phase 8 | Yjs persistence and recovery |
| Phase 9 | Presence and collaborative cursors |
| Phase 10 | Testing, security, and deployment preparation |

The exact phase order may be adjusted through an explicit approved plan.

Do not skip prerequisites.

---

## 17. When to Ask for Approval

Stop and ask the project owner before:

- Changing the technology stack.
- Replacing a major dependency.
- Changing database relationships.
- Changing authentication architecture.
- Changing API contracts.
- Introducing a new infrastructure service.
- Adding features outside MVP scope.
- Deleting important files.
- Running destructive commands.
- Changing the documented collaboration architecture.

Small implementation details can be decided independently when they do not conflict with project documentation.

---

## 18. Final Response Format

After completing a task, use this structure:

### Completed

Briefly describe the work.

### Files Changed

List created, modified, and deleted files.

### Technical Explanation

Explain the important implementation decisions.

### Verification

List commands executed and their actual results.

### Remaining Issues

Mention unresolved problems or limitations.

### Next Step

Recommend only one logical next task.

Do not overwhelm the project owner with multiple unrelated tasks.

---

## 19. Most Important Instruction

**Build CollabNote as a real, secure, maintainable collaborative application—not as a collection of UI mockups.**

Prioritize correctness over speed.

Prioritize real synchronization over simulated collaboration.

Prioritize server-side authorization over frontend-only restrictions.

Prioritize tested, incremental implementation over generating large amounts of unverified code.

Always preserve the project owner's decisions and explain important technical choices.

**End of AGENTS.md**