# FEATURES.md

# CollabNote — Feature-by-Feature Implementation Guide

## 1. Purpose

This document defines how CollabNote must be developed, one feature at a time.

The goal is to build a functional, secure, maintainable real-time collaborative writing application without asking the AI coding assistant to implement everything at once.

**Primary rule: Complete, test, and verify the current feature before moving to the next feature.**

This document works alongside:

- `PRD.md` — Product requirements and MVP scope
- `DESIGN.md` — UI and interaction guidelines
- `ARCHITECTURE.md` — Application architecture
- `DATABASE.md` — Database schema and persistence
- `API.md` — API contracts
- `AGENTS.md` — Rules for AI coding assistants
- `PLAN.md` — Overall development roadmap
- `SETUP.md` — Local development setup

If requirements conflict, follow the authority hierarchy defined in `AGENTS.md`. Do not silently introduce new product or architecture decisions.

---

## 2. Feature Development Rules

Every feature must follow this workflow:

1. **Understand:** Read the relevant project documentation and inspect the existing code.
2. **Plan:** Explain what will be implemented and identify affected files.
3. **Implement:** Work only on the current feature.
4. **Validate:** Run relevant tests, type checks, linting, and build checks.
5. **Review:** Check security, error handling, accessibility, and consistency.
6. **Report:** Explain what changed, what was tested, and any remaining issues.
7. **Stop:** Wait for approval before starting the next feature.

### Mandatory rules for Antigravity

- Never implement multiple unrelated features in one task.
- Never skip an unfinished dependency.
- Never replace real functionality with mock data when implementing production functionality.
- Never create fake real-time collaboration using polling or local-only state.
- Never expose secrets or database credentials in frontend code.
- Never bypass backend authorization checks.
- Never change the agreed architecture without explaining the reason and receiving approval.
- Reuse existing components, utilities, types, and services.
- Do not unnecessarily rewrite working code.
- Update relevant documentation when implementation decisions change.
- Do not mark a feature complete until its acceptance criteria pass.

---

## 3. Feature Status Tracking

Use these statuses throughout development:

| Status | Meaning |
|---|---|
| Not Started | No implementation work has begun |
| In Progress | Currently being implemented |
| Blocked | Waiting for a dependency or decision |
| Testing | Implementation is complete and being verified |
| Completed | Acceptance criteria have passed |

Update this document as features progress.

---

# 4. Feature Implementation Roadmap

Features must be implemented in the following order.

## Phase 1 — Project Foundation

### Feature 1.1: Monorepo Setup

**Goal:** Establish the project structure and workspace configuration.

Tasks:
- [ ] Verify root project configuration.
- [ ] Configure npm workspaces.
- [ ] Create `apps/web`.
- [ ] Create `apps/server`.
- [ ] Create `packages/shared`.
- [ ] Configure TypeScript.
- [ ] Configure shared development scripts.
- [ ] Configure `.gitignore`.
- [ ] Verify workspace dependency resolution.

Acceptance criteria:
- Root npm workspace commands work.
- All three workspaces are recognized.
- TypeScript configuration is valid.
- No unnecessary duplicate configuration exists.

### Feature 1.2: Frontend Foundation

**Goal:** Establish the Next.js frontend.

Tasks:
- [ ] Configure Next.js App Router.
- [ ] Configure Tailwind CSS.
- [ ] Initialize Shadcn UI.
- [ ] Configure global styles and design tokens.
- [ ] Establish the frontend folder structure.
- [ ] Create a reusable application layout.
- [ ] Verify the frontend development server.

Acceptance criteria:
- Frontend starts without errors.
- A basic application page renders.
- Design tokens and reusable UI components are available.

### Feature 1.3: Backend Foundation

**Goal:** Establish the Express.js backend.

Tasks:
- [ ] Configure Express.js and TypeScript.
- [ ] Create the application entry point.
- [ ] Configure environment variables.
- [ ] Configure CORS and JSON parsing.
- [ ] Add centralized error handling.
- [ ] Add request validation infrastructure.
- [ ] Add a health-check endpoint.
- [ ] Verify the backend development server.

Acceptance criteria:
- Backend starts without errors.
- Health-check endpoint returns a successful response.
- Invalid requests and unexpected errors are handled consistently.

### Feature 1.4: Shared Package

**Goal:** Establish shared types and utilities.

Tasks:
- [ ] Configure the shared TypeScript package.
- [ ] Define common API response types.
- [ ] Define user-related types.
- [ ] Define document-related types.
- [ ] Define document role types.
- [ ] Configure package exports.
- [ ] Verify imports from frontend and backend.

Acceptance criteria:
- Frontend and backend can import shared types.
- No unnecessary duplication of shared contracts exists.

---

## Phase 2 — Database Foundation

### Feature 2.1: Neon PostgreSQL Connection

**Goal:** Connect the backend to Neon PostgreSQL.

Tasks:
- [ ] Create a Neon PostgreSQL database.
- [ ] Configure `DATABASE_URL`.
- [ ] Set up the selected ORM.
- [ ] Create a database connection module.
- [ ] Add connection error handling.
- [ ] Verify database connectivity.

Acceptance criteria:
- Backend can connect to Neon.
- Database credentials remain server-side.
- Connection failures produce useful errors.

### Feature 2.2: Database Schema and Migrations

**Goal:** Create the initial database structure.

Tasks:
- [ ] Create the users table.
- [ ] Create the documents table.
- [ ] Create the document members table.
- [ ] Create the document updates table.
- [ ] Create the document snapshots table.
- [ ] Configure foreign keys.
- [ ] Configure unique constraints.
- [ ] Configure indexes.
- [ ] Generate and run migrations.
- [ ] Verify the schema.

Acceptance criteria:
- All required tables exist.
- Relationships and constraints work.
- Migrations can be applied reliably.
- Database schema matches `DATABASE.md`.

---

## Phase 3 — Authentication

### Feature 3.1: User Registration

**Goal:** Allow users to create accounts.

Tasks:
- [ ] Create the registration UI.
- [ ] Create the registration API.
- [ ] Validate name, email, and password.
- [ ] Check email uniqueness.
- [ ] Hash passwords securely if using password-based authentication.
- [ ] Store the user record.
- [ ] Return a safe user response.
- [ ] Handle validation and duplicate-email errors.

Acceptance criteria:
- A valid user can register.
- Duplicate email addresses are rejected.
- Plaintext passwords are never stored.
- Sensitive information is never returned.

### Feature 3.2: User Login

**Goal:** Allow registered users to authenticate.

Tasks:
- [ ] Create the login UI.
- [ ] Create the login API.
- [ ] Validate credentials.
- [ ] Verify passwords securely.
- [ ] Establish the selected session mechanism.
- [ ] Configure secure cookie settings if cookie sessions are used.
- [ ] Handle invalid credentials.
- [ ] Add appropriate rate limiting.

Acceptance criteria:
- Valid credentials authenticate successfully.
- Invalid credentials are rejected.
- Session credentials are protected.
- Authentication survives page navigation and refresh as designed.

### Feature 3.3: Current User and Logout

**Goal:** Manage the authenticated user session.

Tasks:
- [ ] Create the current-user endpoint.
- [ ] Add frontend authentication state.
- [ ] Implement protected frontend routes.
- [ ] Implement logout.
- [ ] Clear or invalidate the session.
- [ ] Handle expired sessions.
- [ ] Handle unauthorized API requests.

Acceptance criteria:
- Authenticated users can access protected pages.
- Unauthenticated users cannot access protected resources.
- Logout invalidates the session.
- Expired sessions are handled correctly.

---

## Phase 4 — Application Dashboard

### Feature 4.1: Dashboard Layout

**Goal:** Create the main authenticated application interface.

Tasks:
- [ ] Create the dashboard route.
- [ ] Add navigation/sidebar.
- [ ] Add application header.
- [ ] Add user profile menu.
- [ ] Add create-document action.
- [ ] Add responsive layout.
- [ ] Add loading and error states.

Acceptance criteria:
- Authenticated users can access the dashboard.
- Navigation works.
- Layout follows `DESIGN.md`.
- Interface works on desktop and mobile.

### Feature 4.2: Document List

**Goal:** Display documents accessible to the current user.

Tasks:
- [ ] Create the document-list API.
- [ ] Retrieve owned documents.
- [ ] Retrieve shared documents.
- [ ] Display document titles.
- [ ] Display owner or relevant sharing information.
- [ ] Display last-updated information.
- [ ] Add empty state.
- [ ] Add loading and error states.

Acceptance criteria:
- Users see only documents they are authorized to access.
- Owned and shared documents are distinguishable.
- Empty, loading, and error states work correctly.

---

## Phase 5 — Document Management

### Feature 5.1: Create Document

**Goal:** Allow users to create documents.

Tasks:
- [ ] Create the new-document UI action.
- [ ] Create the document creation API.
- [ ] Generate a unique document ID.
- [ ] Set the authenticated user as owner.
- [ ] Set a default document title.
- [ ] Initialize document metadata.
- [ ] Redirect to the document editor.

Acceptance criteria:
- An authenticated user can create a document.
- The document is stored in the database.
- The creator becomes its owner.
- Other users cannot claim ownership through request manipulation.

### Feature 5.2: View Document

**Goal:** Allow authorized users to open a document.

Tasks:
- [ ] Create the document detail API.
- [ ] Fetch document metadata.
- [ ] Verify document access.
- [ ] Create the editor route.
- [ ] Handle missing documents.
- [ ] Handle unauthorized access.
- [ ] Add document loading state.

Acceptance criteria:
- Authorized users can open documents.
- Unauthorized users cannot retrieve document content.
- Missing and inaccessible documents show appropriate states.

### Feature 5.3: Rename Document

**Goal:** Allow authorized users to change document titles.

Tasks:
- [ ] Add an editable document title.
- [ ] Create the rename API.
- [ ] Validate the title.
- [ ] Enforce role permissions.
- [ ] Update the dashboard.
- [ ] Display success and error feedback.

Acceptance criteria:
- Owners and editors can rename documents.
- Viewers cannot rename documents.
- Updated titles appear consistently.

### Feature 5.4: Delete Document

**Goal:** Allow owners to delete documents.

Tasks:
- [ ] Add a delete action.
- [ ] Add a confirmation dialog.
- [ ] Create the delete API.
- [ ] Enforce owner-only deletion.
- [ ] Apply the chosen soft-delete strategy.
- [ ] Prevent deleted documents from being opened normally.
- [ ] Handle related persistence data appropriately.

Acceptance criteria:
- Only the owner can delete a document.
- Deleted documents disappear from normal listings.
- Unauthorized deletion attempts are rejected.
- Related data follows the agreed retention strategy.

---

## Phase 6 — Rich-Text Editor

### Feature 6.1: Tiptap Editor Setup

**Goal:** Build the document editing experience.

Tasks:
- [ ] Install and configure Tiptap.
- [ ] Create the editor component.
- [ ] Configure the required document extensions.
- [ ] Add basic text editing.
- [ ] Add headings.
- [ ] Add paragraphs.
- [ ] Add bold and italic formatting.
- [ ] Add bullet and numbered lists.
- [ ] Add blockquotes.
- [ ] Add links.
- [ ] Add undo and redo.
- [ ] Add editor styling.

Acceptance criteria:
- Users can edit rich text.
- Supported formatting works.
- Editor follows the design specification.
- Editor works without browser console errors.

### Feature 6.2: Editor Toolbar

**Goal:** Provide accessible formatting controls.

Tasks:
- [ ] Create a reusable toolbar.
- [ ] Add heading controls.
- [ ] Add text-formatting controls.
- [ ] Add list controls.
- [ ] Add link controls.
- [ ] Add undo and redo controls.
- [ ] Display active formatting state.
- [ ] Handle disabled toolbar actions.
- [ ] Add accessible labels and keyboard support.

Acceptance criteria:
- Toolbar controls perform their advertised actions.
- Active formatting is displayed correctly.
- Keyboard and mouse interaction work.

### Feature 6.3: Local Editor State

**Goal:** Manage editor content before adding persistence.

Tasks:
- [ ] Define the editor document format.
- [ ] Handle editor initialization.
- [ ] Track content changes.
- [ ] Handle editor destruction and cleanup.
- [ ] Avoid unnecessary editor reinitialization.

Acceptance criteria:
- Editor state remains stable while editing.
- Content changes are represented consistently.
- No duplicate editor instances or memory leaks occur.

---

## Phase 7 — Auto-Save and Content Persistence

### Feature 7.1: Auto-Save

**Goal:** Save document changes automatically.

Tasks:
- [ ] Define the save strategy.
- [ ] Implement debounced saving where appropriate.
- [ ] Create the document content save API if needed.
- [ ] Handle save success.
- [ ] Handle save failure.
- [ ] Display saving, saved, and error states.
- [ ] Prevent stale requests from overwriting newer content.

Acceptance criteria:
- Changes are saved without requiring a manual save button.
- Users receive clear save-status feedback.
- Failed saves can be retried safely.
- Refreshing the page does not lose successfully saved content.

### Feature 7.2: Load Saved Content

**Goal:** Restore document content when reopening a document.

Tasks:
- [ ] Retrieve stored content.
- [ ] Initialize the editor from persisted content.
- [ ] Handle empty documents.
- [ ] Handle invalid or missing content.
- [ ] Verify content survives a page refresh.

Acceptance criteria:
- Saved content loads correctly.
- Empty documents initialize properly.
- Existing content is not accidentally overwritten during initialization.

---

## Phase 8 — Real-Time Collaboration

### Feature 8.1: Yjs Integration

**Goal:** Establish a shared document model.

Tasks:
- [ ] Install Yjs dependencies.
- [ ] Create a Yjs document lifecycle.
- [ ] Define the shared editor data structure.
- [ ] Integrate the Tiptap collaboration extension.
- [ ] Configure shared document initialization.
- [ ] Handle connection and cleanup.

Acceptance criteria:
- Editor content is represented through Yjs.
- Local editing updates the shared Yjs document.
- Yjs lifecycle is handled safely.

### Feature 8.2: Hocuspocus Server

**Goal:** Establish the collaboration WebSocket service.

Tasks:
- [ ] Install and configure Hocuspocus.
- [ ] Integrate Hocuspocus with the backend.
- [ ] Configure document naming and routing.
- [ ] Configure connection lifecycle hooks.
- [ ] Configure authentication integration.
- [ ] Configure document authorization.
- [ ] Add connection error handling.

Acceptance criteria:
- Clients can establish collaboration connections.
- Server manages shared document sessions.
- Unauthorized connections are rejected.
- WebSocket errors are handled safely.

### Feature 8.3: Two-Client Synchronization

**Goal:** Prove real-time collaboration works.

Tasks:
- [ ] Connect two authenticated browser sessions.
- [ ] Open the same authorized document.
- [ ] Edit text in the first browser.
- [ ] Verify the second browser receives the change.
- [ ] Edit from the second browser.
- [ ] Verify the first browser receives the change.
- [ ] Test simultaneous edits.
- [ ] Test disconnect and reconnect.

Acceptance criteria:
- Both clients see synchronized content.
- Concurrent edits converge correctly.
- No manual refresh is needed.
- Reconnection restores the shared state.
- Synchronization is implemented using Yjs, not polling.

**Important:** Do not proceed to presence or advanced collaboration features until this feature works reliably.

---

## Phase 9 — Yjs Persistence and Recovery

### Feature 9.1: Persist Yjs Updates

**Goal:** Store collaboration updates durably.

Tasks:
- [ ] Integrate Hocuspocus persistence hooks.
- [ ] Encode Yjs updates safely.
- [ ] Store updates in `document_updates`.
- [ ] Associate updates with the correct document.
- [ ] Handle database failures.
- [ ] Prevent unauthorized writes.
- [ ] Verify update durability.

Acceptance criteria:
- Collaboration updates are stored in PostgreSQL.
- Updates cannot be written to another document through ID manipulation.
- Persistence failures are reported and recoverable.

### Feature 9.2: Restore Yjs Documents

**Goal:** Restore document state after a server restart.

Tasks:
- [ ] Load the latest snapshot if available.
- [ ] Load updates after the snapshot.
- [ ] Reconstruct the Yjs document.
- [ ] Handle documents without snapshots.
- [ ] Handle corrupted persistence data.
- [ ] Verify recovered state with clients.

Acceptance criteria:
- Server restart does not erase saved document content.
- Reconstructed content matches the persisted state.
- Recovery errors do not silently produce empty documents.

### Feature 9.3: Snapshots and Compaction

**Goal:** Keep persistence efficient as update history grows.

Tasks:
- [ ] Define snapshot creation strategy.
- [ ] Generate snapshots from Yjs state.
- [ ] Store snapshots in `document_snapshots`.
- [ ] Record the covered update position.
- [ ] Verify snapshots before compaction.
- [ ] Remove only updates safely covered by a durable snapshot.
- [ ] Test recovery after compaction.

Acceptance criteria:
- Snapshots restore the correct document state.
- Compaction does not remove unpersisted updates.
- Recovery works with snapshots and later updates.

---

## Phase 10 — Sharing and Permissions

### Feature 10.1: Document Membership

**Goal:** Allow document owners to share documents with other users.

Tasks:
- [ ] Create the member-list API.
- [ ] Create the add-member API.
- [ ] Validate target users.
- [ ] Prevent duplicate memberships.
- [ ] Add the sharing UI.
- [ ] Display existing collaborators.
- [ ] Handle invalid invitations or membership requests.

Acceptance criteria:
- Owners can share documents with eligible users.
- Membership is stored in PostgreSQL.
- Users cannot add themselves to documents without authorization.

### Feature 10.2: Role Management

**Goal:** Enforce owner, editor, and viewer permissions.

Tasks:
- [ ] Implement owner permissions.
- [ ] Implement editor permissions.
- [ ] Implement viewer permissions.
- [ ] Create the change-role API.
- [ ] Create the remove-member API.
- [ ] Enforce permissions in REST endpoints.
- [ ] Enforce permissions during WebSocket connections.
- [ ] Enforce read-only editing behavior for viewers.

Acceptance criteria:
- Owners can manage document membership.
- Editors can edit but cannot manage ownership.
- Viewers can read but cannot modify content.
- Backend permissions cannot be bypassed by frontend manipulation.

### Feature 10.3: Permission Revocation

**Goal:** Remove access reliably when membership changes.

Tasks:
- [ ] Re-check access when connections are established.
- [ ] Handle role changes during active sessions.
- [ ] Handle member removal during active sessions.
- [ ] Disconnect or restrict affected sessions as appropriate.
- [ ] Verify revoked users cannot continue sending updates.

Acceptance criteria:
- Removed members lose access.
- Downgraded viewers cannot continue editing.
- Existing WebSocket sessions respect permission changes.

---

## Phase 11 — Presence and Live Cursors

### Feature 11.1: Collaborator Presence

**Goal:** Show who is currently collaborating.

Tasks:
- [ ] Integrate Yjs Awareness.
- [ ] Define presence metadata.
- [ ] Display collaborator avatars.
- [ ] Display collaborator names.
- [ ] Handle user connection and disconnection.
- [ ] Clean up stale awareness states.

Acceptance criteria:
- Active collaborators appear in the editor.
- Disconnected users disappear.
- Presence is not treated as authentication or authorization.
- Presence data is not stored as permanent document content.

### Feature 11.2: Live Cursors

**Goal:** Show collaborator cursor positions.

Tasks:
- [ ] Configure Tiptap collaboration cursor support.
- [ ] Associate cursor information with the correct user.
- [ ] Display remote cursor positions.
- [ ] Display collaborator labels.
- [ ] Handle simultaneous cursor updates.
- [ ] Handle disconnected collaborators.
- [ ] Test multiple users editing together.

Acceptance criteria:
- Users can see other collaborators' cursor positions.
- Cursor positions update in real time.
- Cursor rendering does not interfere with editing.

---

## Phase 12 — Final Quality and Deployment

### Feature 12.1: Error Handling and User Feedback

Tasks:
- [ ] Review frontend error states.
- [ ] Review backend error responses.
- [ ] Add useful user-facing notifications.
- [ ] Handle offline and reconnecting states.
- [ ] Handle expired sessions.
- [ ] Handle missing documents.
- [ ] Handle permission failures.

Acceptance criteria:
- Common failures have clear user-facing feedback.
- Sensitive server details are not exposed.
- The application does not fail silently.

### Feature 12.2: Security Review

Tasks:
- [ ] Verify authentication.
- [ ] Verify authorization for every document endpoint.
- [ ] Verify WebSocket authorization.
- [ ] Verify viewer read-only enforcement.
- [ ] Review cookie and CORS configuration.
- [ ] Review input validation.
- [ ] Review rate limiting.
- [ ] Review secret management.
- [ ] Review database access and query safety.
- [ ] Test unauthorized document access.

Acceptance criteria:
- Users cannot access documents without permission.
- WebSocket connections enforce the same access rules.
- Sensitive information remains protected.
- Critical security tests pass.

### Feature 12.3: Responsive UI and Accessibility

Tasks:
- [ ] Test dashboard on mobile.
- [ ] Test editor on mobile.
- [ ] Test navigation on mobile.
- [ ] Verify keyboard accessibility.
- [ ] Verify focus states.
- [ ] Verify accessible labels.
- [ ] Check contrast and readable typography.

Acceptance criteria:
- Core workflows work on desktop and mobile.
- Keyboard users can navigate major controls.
- Interactive elements have accessible names.

### Feature 12.4: Automated Testing

Tasks:
- [ ] Add unit tests for shared utilities.
- [ ] Add backend API tests.
- [ ] Add authentication tests.
- [ ] Add document authorization tests.
- [ ] Add Yjs synchronization tests.
- [ ] Add persistence and recovery tests.
- [ ] Add critical frontend workflow tests.
- [ ] Add end-to-end tests for major user journeys.

Acceptance criteria:
- Critical functionality has automated coverage.
- Tests run consistently.
- No known critical failures remain.

### Feature 12.5: Production Deployment

Tasks:
- [ ] Configure production environment variables.
- [ ] Prepare frontend deployment.
- [ ] Prepare backend deployment.
- [ ] Configure Neon production database.
- [ ] Configure WebSocket support.
- [ ] Configure CORS and trusted origins.
- [ ] Configure HTTPS.
- [ ] Run production migrations.
- [ ] Verify health checks.
- [ ] Test real-time collaboration in production.
- [ ] Document deployment and recovery procedures.

Acceptance criteria:
- Frontend and backend are deployed.
- Database connections work.
- WebSocket collaboration works over the deployed infrastructure.
- Production environment secrets are protected.
- Core user workflows pass production verification.

---

# 5. End-to-End MVP Acceptance Checklist

The MVP is ready only when all of the following work:

- [ ] A user can register and log in.
- [ ] An authenticated user can access the dashboard.
- [ ] A user can create a document.
- [ ] A user can open and edit a document.
- [ ] Rich-text formatting works.
- [ ] Document content saves automatically.
- [ ] Saved content survives a page refresh.
- [ ] Two authorized users can edit the same document simultaneously.
- [ ] Concurrent edits synchronize correctly.
- [ ] Collaboration state survives server restart.
- [ ] Owners can share documents.
- [ ] Editors can edit shared documents.
- [ ] Viewers can read but cannot edit.
- [ ] Unauthorized users cannot access documents.
- [ ] Users can see active collaborators.
- [ ] Users can see live cursors.
- [ ] Core workflows work on mobile.
- [ ] Critical tests pass.
- [ ] Production deployment works.

---

# 6. Standard Antigravity Task Template

Use this template whenever asking Antigravity to implement a feature.

## Prompt

You are working on the CollabNote project.

Before implementing anything:

1. Read `AGENTS.md`.
2. Read `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `DESIGN.md`, and `FEATURES.md` where relevant.
3. Inspect the existing repository and understand what is already implemented.
4. Identify the exact feature requested below.
5. Check its dependencies and acceptance criteria.

### Current feature

**Feature ID:** [Enter feature ID]

**Feature name:** [Enter feature name]

### Implementation instructions

- Implement only this feature.
- Do not start the next feature.
- Follow the documented architecture and design.
- Reuse existing code where appropriate.
- Do not introduce unnecessary dependencies.
- Implement real functionality rather than mock behavior.
- Add appropriate validation and error handling.
- Follow security and authorization requirements.
- Add or update tests for the feature.
- Update documentation if implementation decisions change.

### Before finishing

1. Run relevant tests.
2. Run TypeScript checks.
3. Run linting.
4. Run the production build where appropriate.
5. Fix errors introduced by the implementation.
6. Review the feature against its acceptance criteria.

### Final report

Provide:

- What was implemented.
- Files created or modified.
- Dependencies added or changed.
- Tests and commands executed.
- Test results.
- Known limitations or remaining issues.
- Whether the feature is ready for review.

**Stop after completing this feature. Wait for approval before proceeding.**

---

# 7. Current Development Progress

Update this section as development proceeds.

| Phase | Feature Group | Status |
|---|---|---|
| 1 | Project Foundation | Not Started |
| 2 | Database Foundation | Not Started |
| 3 | Authentication | Not Started |
| 4 | Application Dashboard | Not Started |
| 5 | Document Management | Not Started |
| 6 | Rich-Text Editor | Not Started |
| 7 | Auto-Save and Persistence | Not Started |
| 8 | Real-Time Collaboration | Not Started |
| 9 | Yjs Persistence and Recovery | Not Started |
| 10 | Sharing and Permissions | Not Started |
| 11 | Presence and Live Cursors | Not Started |
| 12 | Quality and Deployment | Not Started |

**Important:** These statuses are initial planning values, not verified statements about the actual repository. Inspect the code before updating them.

---

# 8. Final Development Principle

Build CollabNote as a sequence of small, working, testable features.

Do not optimize for writing the most code in the shortest time.

Optimize for:

- Correct architecture.
- Secure access control.
- Reliable data persistence.
- Real-time synchronization.
- Maintainable code.
- Clear user experience.
- Verified functionality.

**One feature. One implementation. One verification. Then move forward.**