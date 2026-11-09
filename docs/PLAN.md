# PLAN.md

# CollabNote — Development Plan

**Project:** CollabNote  
**Version:** 1.0  
**Status:** Planning  
**Development Method:** Incremental, phase-based development  
**AI Coding Assistant:** Google Antigravity

---

## 1. Purpose

This document defines the implementation roadmap for CollabNote.

It converts the requirements and architecture into small, manageable development tasks.

The project will be implemented one phase at a time.

Each phase must be completed, tested, reviewed, and approved before moving to the next phase.

## 2. Project Goals

The primary goals are:

1. Build a functional collaborative writing application.
2. Establish a maintainable monorepo architecture.
3. Implement secure authentication and authorization.
4. Create a rich-text document editor.
5. Support real-time editing between multiple users.
6. Persist collaborative document changes reliably.
7. Provide document sharing and access control.
8. Prepare the application for production deployment.

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | Shadcn UI |
| Editor | Tiptap |
| CRDT | Yjs |
| Collaboration Server | Hocuspocus |
| Communication | WebSockets |
| Backend | Express.js |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM (provisional) |
| Package Manager | npm |
| Monorepo | npm workspaces |

## 4. Implementation Strategy

Development follows this cycle:

```text
Understand requirements
        ↓
Inspect repository
        ↓
Create implementation plan
        ↓
Implement one small task
        ↓
Run tests and checks
        ↓
Review implementation
        ↓
Approve completion
        ↓
Move to next task
```

Do not ask the AI coding assistant to implement multiple major phases in one prompt.

---

# 5. Development Phases

## Phase 1 — Project Foundation

<badge color="warning">Pending verification</badge>

**Objective:** Establish a working monorepo and development environment.

### Tasks

- [ ] Create the root project directory.
- [ ] Initialize Git.
- [ ] Initialize the root npm project.
- [ ] Configure npm workspaces.
- [ ] Create `apps/web`.
- [ ] Create `apps/server`.
- [ ] Create `packages/shared`.
- [ ] Create workspace `package.json` files.
- [ ] Configure `.gitignore`.
- [ ] Install dependencies.
- [ ] Verify workspace resolution.
- [ ] Configure TypeScript.
- [ ] Configure development scripts.

### Expected result

A working monorepo with three recognized workspaces.

### Acceptance criteria

- [ ] `npm install` succeeds.
- [ ] npm recognizes all workspaces.
- [ ] Git repository is initialized.
- [ ] TypeScript configuration is available.
- [ ] No unnecessary dependency duplication.

---

## Phase 2 — Frontend and Backend Foundation

**Objective:** Create the initial runnable frontend and backend applications.

### Frontend tasks

- [ ] Initialize Next.js inside `apps/web`.
- [ ] Configure TypeScript.
- [ ] Configure Tailwind CSS.
- [ ] Install and configure Shadcn UI.
- [ ] Establish the global design tokens.
- [ ] Create the application layout.
- [ ] Create a basic landing page.

### Backend tasks

- [ ] Initialize Express.js inside `apps/server`.
- [ ] Configure TypeScript.
- [ ] Create the application entry point.
- [ ] Create the HTTP server.
- [ ] Configure CORS.
- [ ] Add centralized error handling.
- [ ] Add a health-check endpoint.

### Shared package tasks

- [ ] Configure `packages/shared`.
- [ ] Add shared TypeScript configuration.
- [ ] Add basic shared types.

### Acceptance criteria

- [ ] Frontend starts successfully.
- [ ] Backend starts successfully.
- [ ] Health endpoint responds successfully.
- [ ] Shared package can be imported.
- [ ] Type checking succeeds.

---

## Phase 3 — Database Foundation

**Objective:** Connect the backend to Neon PostgreSQL.

### Tasks

- [ ] Create a Neon PostgreSQL project.
- [ ] Configure `DATABASE_URL`.
- [ ] Confirm ORM selection.
- [ ] Install and configure the selected ORM.
- [ ] Create database connection module.
- [ ] Define the initial database schema.
- [ ] Create migration configuration.
- [ ] Generate migrations.
- [ ] Run migrations.
- [ ] Verify database connectivity.

### Initial tables

- [ ] `users`
- [ ] `documents`
- [ ] `document_members`
- [ ] `document_updates`
- [ ] `document_snapshots`

### Acceptance criteria

- [ ] Backend connects to Neon.
- [ ] Migrations execute successfully.
- [ ] Foreign keys and indexes are created.
- [ ] Database errors are handled correctly.
- [ ] Secrets remain server-side.

---

## Phase 4 — Authentication

**Objective:** Implement secure user authentication.

### Tasks

- [ ] Finalize authentication strategy.
- [ ] Implement registration.
- [ ] Implement login.
- [ ] Implement logout.
- [ ] Implement session validation.
- [ ] Implement current-user endpoint.
- [ ] Implement password hashing if using password-based authentication.
- [ ] Protect private backend routes.
- [ ] Implement frontend registration page.
- [ ] Implement frontend login page.
- [ ] Implement authenticated application layout.

### Acceptance criteria

- [ ] Users can register.
- [ ] Users can log in.
- [ ] Users can log out.
- [ ] Invalid credentials are rejected.
- [ ] Private endpoints require authentication.
- [ ] Sessions are handled securely.

---

## Phase 5 — Document Management

**Objective:** Allow authenticated users to manage documents.

### Backend tasks

- [ ] Create document endpoint.
- [ ] List accessible documents.
- [ ] Get document details.
- [ ] Update document title.
- [ ] Delete document.
- [ ] Implement ownership checks.
- [ ] Implement document repository and service layers.

### Frontend tasks

- [ ] Build dashboard.
- [ ] Build document list.
- [ ] Add create-document action.
- [ ] Add document rename action.
- [ ] Add delete confirmation.
- [ ] Add empty state.
- [ ] Add loading and error states.

### Acceptance criteria

- [ ] Users can create documents.
- [ ] Users can view their documents.
- [ ] Users can rename documents.
- [ ] Users can delete their documents.
- [ ] Users cannot access another user's private documents.

---

## Phase 6 — Rich-Text Editor

**Objective:** Build the core writing experience.

### Tasks

- [ ] Install Tiptap packages.
- [ ] Create reusable editor configuration.
- [ ] Build editor layout.
- [ ] Implement editor toolbar.
- [ ] Implement heading formatting.
- [ ] Implement bold and italic.
- [ ] Implement lists.
- [ ] Implement blockquotes.
- [ ] Implement links.
- [ ] Implement undo and redo.
- [ ] Connect editor to document metadata.
- [ ] Implement a basic editor loading state.

### Acceptance criteria

- [ ] Editor renders correctly.
- [ ] Formatting commands work.
- [ ] Editor content can be changed.
- [ ] Editor layout follows `DESIGN.md`.
- [ ] Editor works on supported screen sizes.

At this stage, the editor is not yet considered collaborative.

---

## Phase 7 — Real-Time Collaboration

<badge color="warning">Critical milestone</badge>

**Objective:** Enable multiple users to edit the same document simultaneously.

### Tasks

- [ ] Install compatible Yjs dependencies.
- [ ] Install compatible Hocuspocus dependencies.
- [ ] Configure the Hocuspocus server.
- [ ] Configure the WebSocket endpoint.
- [ ] Integrate Tiptap with Yjs.
- [ ] Configure the Hocuspocus client provider.
- [ ] Connect clients using the same document identity.
- [ ] Implement connection status.
- [ ] Handle disconnection and reconnection.
- [ ] Implement server-side authentication.
- [ ] Implement document-level authorization.
- [ ] Enforce viewer read-only permissions.

### Mandatory two-client test

1. Open the same document in Browser A.
2. Open the same document in Browser B.
3. Edit text in Browser A.
4. Verify that Browser B receives the change.
5. Edit text in Browser B.
6. Verify that Browser A receives the change.
7. Test simultaneous edits.
8. Verify that the resulting documents converge.

### Acceptance criteria

- [ ] Two independent clients synchronize.
- [ ] Concurrent editing works.
- [ ] Unauthorized users cannot connect.
- [ ] Viewer users cannot submit document updates.
- [ ] Connection failures are handled properly.

**Do not declare collaboration complete based only on a successful WebSocket connection.**

---

## Phase 8 — Document Persistence and Recovery

**Objective:** Ensure document content survives refreshes and server restarts.

### Tasks

- [ ] Implement Yjs update persistence.
- [ ] Store updates in `document_updates`.
- [ ] Load document state when a collaboration session starts.
- [ ] Implement snapshot generation.
- [ ] Store snapshots in `document_snapshots`.
- [ ] Implement recovery from snapshots and subsequent updates.
- [ ] Implement safe update compaction.
- [ ] Handle persistence failures.
- [ ] Test server restart recovery.

### Acceptance criteria

- [ ] Document updates are persisted.
- [ ] Refreshing a browser does not lose saved content.
- [ ] Restarting the server does not lose persisted content.
- [ ] Snapshot recovery works.
- [ ] Concurrent updates are not lost during compaction.

---

## Phase 9 — Sharing and Permissions

**Objective:** Allow users to collaborate through controlled document access.

### Tasks

- [ ] Implement member listing.
- [ ] Implement adding existing users.
- [ ] Implement role changes.
- [ ] Implement member removal.
- [ ] Implement owner permissions.
- [ ] Implement editor permissions.
- [ ] Implement viewer permissions.
- [ ] Build sharing dialog.
- [ ] Build member list UI.
- [ ] Build role selection UI.
- [ ] Handle permission changes for active sessions.

### Acceptance criteria

- [ ] Owners can manage members.
- [ ] Editors can edit content.
- [ ] Viewers can read content only.
- [ ] Removed members lose access.
- [ ] Permission changes are enforced by the backend.

Email invitations and public share links can be considered after the initial sharing implementation.

---

## Phase 10 — Presence and Collaborative Cursors

**Objective:** Improve the collaboration experience.

### Tasks

- [ ] Configure Yjs Awareness.
- [ ] Display active collaborators.
- [ ] Display collaborator avatars.
- [ ] Display collaborator names.
- [ ] Implement live cursor positions.
- [ ] Implement selection indicators.
- [ ] Handle collaborator disconnection.
- [ ] Test presence across multiple clients.

### Acceptance criteria

- [ ] Connected users appear in presence UI.
- [ ] Cursor positions synchronize.
- [ ] Disconnected users disappear.
- [ ] Presence information is not used for authentication or authorization.

---

## Phase 11 — Quality Assurance and Security

**Objective:** Prepare the MVP for reliable usage.

### Tasks

- [ ] Add frontend component tests.
- [ ] Add backend unit tests.
- [ ] Add API integration tests.
- [ ] Add database integration tests.
- [ ] Add collaboration integration tests.
- [ ] Verify authentication security.
- [ ] Verify document authorization.
- [ ] Verify viewer restrictions.
- [ ] Review CORS and CSRF protections.
- [ ] Configure rate limiting.
- [ ] Review error handling.
- [ ] Review logging.
- [ ] Verify environment variable validation.
- [ ] Test responsive behavior.
- [ ] Run production builds.

### Acceptance criteria

- [ ] Critical user flows pass.
- [ ] Security checks pass.
- [ ] No known critical authorization issues remain.
- [ ] Application builds successfully.
- [ ] Critical collaboration and recovery tests pass.

---

## Phase 12 — Deployment

**Objective:** Deploy the MVP to production.

### Tasks

- [ ] Select frontend hosting.
- [ ] Select persistent Node.js backend hosting.
- [ ] Configure production Neon database.
- [ ] Configure production environment variables.
- [ ] Configure frontend and backend URLs.
- [ ] Configure secure CORS and cookies.
- [ ] Configure WebSocket support.
- [ ] Run production migrations.
- [ ] Deploy frontend.
- [ ] Deploy backend.
- [ ] Verify REST API.
- [ ] Verify collaboration WebSocket.
- [ ] Verify database persistence.
- [ ] Test production collaboration with multiple clients.

### Acceptance criteria

- [ ] Frontend is accessible.
- [ ] Backend is reachable.
- [ ] WebSocket connections work in production.
- [ ] Authentication works.
- [ ] Documents persist.
- [ ] Multiple users can collaborate.
- [ ] Production secrets are protected.

---

# 6. Milestones

| Milestone | Expected result |
|---|---|
| M1 | Monorepo successfully initialized |
| M2 | Frontend and backend running |
| M3 | Database connected |
| M4 | Authentication working |
| M5 | Document management working |
| M6 | Rich-text editor working |
| M7 | Two-client collaboration verified |
| M8 | Persistence and recovery verified |
| M9 | Sharing and permissions working |
| M10 | MVP quality checks completed |
| M11 | Production deployment completed |

---

# 7. Definition of Done

A task is complete only when:

- [ ] Implementation matches the approved requirements.
- [ ] Code follows the documented architecture.
- [ ] Relevant tests have been written.
- [ ] Relevant tests have passed.
- [ ] Type checking passes where configured.
- [ ] Linting passes where configured.
- [ ] No unrelated files were modified unnecessarily.
- [ ] Important changes are documented.
- [ ] Actual verification results are reported.
- [ ] Project owner has reviewed the work.

---

# 8. Risk Management

| Risk | Mitigation |
|---|---|
| Incompatible Yjs dependencies | Verify package compatibility before installation |
| Incorrect collaboration implementation | Test using two independent clients |
| Unauthorized document access | Enforce server-side authorization |
| Lost document updates | Use reliable update persistence and snapshots |
| Database schema mistakes | Use migrations and schema review |
| WebSocket hosting limitations | Select persistent backend hosting |
| AI-generated incorrect code | Inspect changes and run tests |
| Scope expansion | Keep future features outside MVP |

---

# 9. AI Coding Assistant Workflow

Google Antigravity must follow `AGENTS.md`.

For every phase:

1. Read relevant project documentation.
2. Inspect the existing codebase.
3. Present a short task plan.
4. Implement only the requested task.
5. Run applicable tests.
6. Explain the changes.
7. Report actual verification results.
8. Stop and wait for approval.

Never instruct the AI assistant to build all phases at once.

### Recommended prompt format

```text
Read AGENTS.md and the relevant project documentation.

We are currently working on Phase [NUMBER]:
[PHASE NAME]

Current task:
[DESCRIBE ONE SMALL TASK]

Before coding:
1. Inspect the existing implementation.
2. Identify relevant files.
3. Explain your implementation plan.
4. Identify possible risks.

Then implement only this task.

After implementation:
1. Run relevant tests.
2. Run type checking and linting if configured.
3. Explain all changed files.
4. Report actual test results.
5. Mention remaining issues.

Do not start the next task without my approval.
Do not change the documented architecture without asking.
```

---

# 10. Current Progress Tracker

Update this section after each approved milestone.

| Phase | Status |
|---|---|
| Phase 1 — Project Foundation | Pending verification |
| Phase 2 — Frontend and Backend Foundation | Not started |
| Phase 3 — Database Foundation | Not started |
| Phase 4 — Authentication | Not started |
| Phase 5 — Document Management | Not started |
| Phase 6 — Rich-Text Editor | Not started |
| Phase 7 — Real-Time Collaboration | Not started |
| Phase 8 — Persistence and Recovery | Not started |
| Phase 9 — Sharing and Permissions | Not started |
| Phase 10 — Presence and Cursors | Not started |
| Phase 11 — Quality Assurance | Not started |
| Phase 12 — Deployment | Not started |

**Progress rule:** Never mark a phase complete just because code was generated. Completion requires verification against its acceptance criteria.

---

# 11. Project Success Criteria

The CollabNote MVP is successful when:

1. A user can register and log in.
2. A user can create and manage documents.
3. A user can write and format document content.
4. Multiple authorized users can edit the same document simultaneously.
5. Concurrent changes synchronize correctly.
6. Users can see collaborator presence and cursors.
7. Documents save and recover reliably.
8. Owners can share documents and manage permissions.
9. Viewers cannot modify documents.
10. The application runs reliably in its production environment.

---

**Final principle: Build one reliable feature at a time.**

**End of PLAN.md**