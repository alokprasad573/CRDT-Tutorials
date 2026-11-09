# CollabNote

**A lightweight, real-time collaborative writing application.**

CollabNote is a web-based collaborative text editor that allows users to create, edit, organize, and share documents with others in real time.

The goal is to build a simple, responsive, and reliable writing experience where multiple users can work on the same document simultaneously.

> **Project status:** In development  
> **Product name:** CollabNote (working name)  
> **Version:** 0.1.0  
> **Development approach:** AI-assisted development with Google Antigravity

---

## 1. Project Vision

Build a lightweight collaborative writing platform that makes working together on documents simple.

Users should be able to:

- Create and manage documents.
- Write using a rich-text editor.
- Collaborate with multiple users in real time.
- See other collaborators' cursors and presence.
- Share documents with other users.
- Control document access through permissions.
- Automatically save document changes.

The MVP focuses on the essential collaborative writing experience rather than unnecessary complexity.

---

## 2. Core Features

### MVP Features

| Feature | Description |
|---|---|
| Authentication | Register, login, and logout |
| Dashboard | View and manage documents |
| Document Management | Create, edit, rename, and delete documents |
| Rich Text Editor | Format content using Tiptap |
| Real-Time Collaboration | Multiple users edit the same document |
| Live Cursors | See collaborators' editing positions |
| Presence | See who is currently collaborating |
| Auto-Save | Persist document changes |
| Document Sharing | Share documents with other users |
| Access Control | Owner, Editor, and Viewer roles |
| Responsive UI | Support desktop, tablet, and mobile |

### Future Features

These are not part of the initial MVP:

- Document comments.
- Version history.
- Offline editing.
- AI writing assistance.
- File attachments.
- Document templates.
- Advanced workspace management.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI |
| Rich Text Editor | Tiptap |
| Collaboration Model | Yjs |
| Collaboration Server | Hocuspocus |
| Communication | WebSockets |
| Backend | Express.js |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM (provisional) |
| Package Manager | npm |
| Monorepo | npm workspaces |
| AI Coding Assistant | Google Antigravity |

### Why These Technologies?

- **Next.js:** Provides the frontend application framework.
- **Tailwind CSS:** Enables consistent and maintainable styling.
- **Shadcn UI:** Provides reusable UI components.
- **Tiptap:** Provides the rich-text editing experience.
- **Yjs:** Handles concurrent document editing and conflict resolution.
- **Hocuspocus:** Provides the server-side collaboration infrastructure.
- **Express.js:** Handles REST APIs and backend business logic.
- **Neon:** Provides managed PostgreSQL database hosting.

---

## 4. Architecture Overview

CollabNote uses a monorepo architecture with three main workspaces.

```text
                  ┌──────────────────────┐
                  │      Next.js         │
                  │     Frontend         │
                  └──────────┬───────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
            REST API                 WebSocket
                 │                       │
                 ▼                       ▼
        ┌─────────────────┐    ┌─────────────────┐
        │   Express.js    │    │   Hocuspocus    │
        │   REST Server   │    │ Collaboration  │
        └────────┬────────┘    └────────┬────────┘
                 │                      │
                 └──────────┬───────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Neon PostgreSQL │
                   │    Database     │
                   └─────────────────┘
```

### Collaboration Architecture

The collaboration system uses three important technologies:

- WebSockets transport messages between clients and the server.
- Yjs maintains shared document state and resolves concurrent edits.
- Hocuspocus manages collaboration sessions and synchronization.

Tiptap integrates with Yjs to provide the collaborative editing interface.

**Important:** WebSockets alone do not provide conflict resolution. Yjs is responsible for the shared editing model.

---

## 5. Project Structure

```text
collabnote/
│
├── apps/
│   ├── web/                 # Next.js frontend
│   │
│   └── server/              # Express.js + Hocuspocus backend
│
├── packages/
│   └── shared/              # Shared types and utilities
│
├── PRD.md                   # Product requirements
├── DESIGN.md                # UI/UX design specification
├── ARCHITECTURE.md          # Technical architecture
├── DATABASE.md              # Database schema and persistence
├── API.md                   # REST and collaboration API
├── AGENTS.md                # AI coding agent instructions
│
├── package.json             # Root workspace configuration
├── package-lock.json        # Dependency lockfile
└── README.md                # Project overview
```

The structure may evolve as the application grows, but changes should follow `ARCHITECTURE.md`.

---

## 6. Project Documentation

Read these documents before implementing major features.

| Document | Description |
|---|---|
| [PRD.md](./PRD.md) | Defines product vision, requirements, and MVP scope |
| [DESIGN.md](./DESIGN.md) | Defines visual design and user experience |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Defines system architecture and component responsibilities |
| [DATABASE.md](./DATABASE.md) | Defines database tables and persistence strategy |
| [API.md](./API.md) | Defines backend APIs and collaboration interfaces |
| [AGENTS.md](./AGENTS.md) | Defines development rules for AI coding agents |

These documents are the primary reference for project implementation.

---

## 7. Prerequisites

Install the following tools before starting development.

| Tool | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| npm | Package manager |
| Git | Version control |
| VS Code | Code editor (recommended) |
| Google Antigravity | AI-assisted development |
| Neon Account | PostgreSQL database |

The development environment previously reported for this project:

```text
Node.js: v26.13.0
npm:     11.20.0
Git:     2.56.0.windows.4
```

Verify your installed versions:

```bash
node -v
npm -v
git --version
```

---

## 8. Installation and Setup

### Step 1: Clone the repository

If the project is hosted on GitHub:

```bash
git clone YOUR_REPOSITORY_URL
cd collabnote
```

If you are starting locally without a remote repository, create the project directory and initialize Git instead.

### Step 2: Install dependencies

From the repository root:

```bash
npm install
```

### Step 3: Configure environment variables

Create the environment files required by the web and server workspaces.

Example server configuration:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=
COLLABORATION_URL=ws://localhost:4000/collaboration
```

Example frontend configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_COLLABORATION_URL=ws://localhost:4000/collaboration
```

Use actual variable names from the implemented configuration. These examples are provisional.

Never commit real secrets or production credentials.

### Step 4: Database setup

1. Create a PostgreSQL project in Neon.
2. Obtain its database connection string.
3. Configure `DATABASE_URL` in the server environment.
4. Configure the selected ORM.
5. Generate and run database migrations when the schema is implemented.

Follow `DATABASE.md` for the database design.

### Step 5: Start development

The exact scripts depend on the workspace configuration.

Inspect the root and workspace `package.json` files before running commands.

The intended development workflow is:

```bash
npm run dev
```

The root development script should eventually start the frontend and backend together.

If workspace-specific scripts are used, start the web and server applications separately.

---

## 9. Development Roadmap

The project will be developed incrementally.

| Phase | Objective |
|---|---|
| Phase 1 | Monorepo and development environment |
| Phase 2 | Database connection and initial schema |
| Phase 3 | Authentication |
| Phase 4 | Document CRUD |
| Phase 5 | Basic rich-text editor |
| Phase 6 | Real-time collaboration |
| Phase 7 | Document sharing and permissions |
| Phase 8 | Yjs persistence and recovery |
| Phase 9 | Presence and collaborative cursors |
| Phase 10 | Testing, security, and deployment preparation |

Each phase should be implemented, tested, reviewed, and approved before moving forward.

Refer to `AGENTS.md` for the development workflow.

---

## 10. Important Engineering Principles

### Real collaboration

Do not simulate collaboration using local React state or periodic polling.

Use Yjs and Hocuspocus for actual multi-client synchronization.

### Security first

All private resources must be protected by server-side authentication and authorization.

Never trust frontend permissions.

### Reliable persistence

Document content must survive browser refreshes and server restarts.

### Maintainable architecture

Keep frontend, backend, database, and shared code responsibilities separated.

### Incremental implementation

Build one feature at a time and verify it before proceeding.

---

## 11. Testing

Testing requirements include:

- Frontend component tests.
- Backend API tests.
- Authentication and authorization tests.
- Database integration tests.
- Real-time collaboration tests.
- Persistence and recovery tests.
- Production build verification.

Before considering a feature complete, run the applicable checks configured in the project.

Never report tests as passing unless they have actually been executed.

---

## 12. Deployment

Deployment decisions are not finalized.

The intended deployment architecture must support:

- Next.js frontend hosting.
- A persistent Node.js backend.
- WebSocket connections for Hocuspocus.
- Neon PostgreSQL connectivity.
- Secure environment variable configuration.

**Important:** The collaboration server requires hosting that supports persistent WebSocket connections. Do not assume that a typical serverless REST deployment is sufficient for Hocuspocus.

Finalize the hosting architecture before production deployment.

---

## 13. Contributing and AI-Assisted Development

This project uses Google Antigravity as its primary AI coding assistant.

Before making changes, the agent must:

1. Read `AGENTS.md`.
2. Review relevant project documentation.
3. Inspect the current implementation.
4. Propose a small implementation plan.
5. Implement only the approved task.
6. Run relevant tests.
7. Explain changes and results.

Do not generate the entire application in one step.

Do not change important architecture decisions without approval.

---

## 14. Current Project Status

<text id="project-status">Planning and specification</text>

The initial product and technical documentation has been drafted.

| Deliverable | Status |
|---|---|
| PRD.md | Draft created |
| DESIGN.md | Draft created |
| ARCHITECTURE.md | Draft created |
| DATABASE.md | Draft created |
| API.md | Draft created |
| AGENTS.md | Draft created |
| README.md | Draft created |
| Monorepo setup | To be verified |
| Application implementation | Not yet verified |

This status should be updated as the project progresses.

---

## 15. License

License not yet selected.

---

**Built with the goal of making collaborative writing simple.**

**End of README.md**