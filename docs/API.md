# API.md

# CollabNote — API Specification

**Status:** Draft  
**Version:** 1.0  
**Backend:** Express.js + Node.js  
**Database:** Neon PostgreSQL  
**ORM:** Drizzle ORM (provisional)  
**Real-time Collaboration:** Hocuspocus + Yjs  
**API Base Path:** `/api/v1`

---

## 1. Purpose

This document defines the API contract between the CollabNote frontend and backend.

It covers:

- Authentication and user sessions
- Document management
- Document sharing and permissions
- User information
- Real-time collaboration connections
- Error handling and validation
- Security requirements

The API should remain consistent with the product requirements and architecture documents.

## 2. API Design Principles

1. Use REST APIs for standard application operations.
2. Use WebSockets for real-time document collaboration.
3. Use JSON for REST request and response bodies.
4. Use UUIDs for public resource identifiers.
5. Validate every request on the backend.
6. Enforce document permissions on the server.
7. Never trust user IDs, document IDs, or roles supplied by the client without verification.
8. Keep database operations inside the backend.
9. Return consistent error responses.
10. Never expose internal database errors or sensitive information.

## 3. Base Configuration

### REST API

```text
/api/v1
```

### Collaboration WebSocket

```text
/collaboration
```

### Content Type

```http
Content-Type: application/json
```

### Authentication

The proposed authentication approach is a secure, HTTP-only session cookie.

This is provisional until the authentication strategy is finalized.

Cookie requirements:

- `HttpOnly`
- `Secure` in production
- Appropriate `SameSite` policy
- Appropriate expiration
- Server-side session validation

The frontend must not store sensitive session credentials in local storage.

---

## 4. API Response Standards

### Successful response

```json
{
  "success": true,
  "data": {
    "id": "document-uuid",
    "title": "My Document"
  }
}
```

### Error response

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "The requested document was not found."
  }
}
```

### HTTP status codes

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 204 | Request successful, no response body |
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | Resource conflict |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 503 | Service temporarily unavailable |

---

## 5. Authentication APIs

Authentication endpoints are subject to the final authentication provider and session implementation.

### 5.1 Register

```http
POST /api/v1/auth/register
```

Request:

```json
{
  "name": "Alex",
  "email": "alex@example.com",
  "password": "example-password"
}
```

Success: `201 Created`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Alex",
      "email": "alex@example.com"
    }
  }
}
```

Requirements:

- Validate email format.
- Enforce password policy.
- Reject duplicate email addresses.
- Never store plaintext passwords.
- Hash passwords using a suitable password-hashing algorithm.
- Do not return password hashes.

### 5.2 Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "alex@example.com",
  "password": "example-password"
}
```

Success: `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Alex",
      "email": "alex@example.com"
    }
  }
}
```

The server establishes the authenticated session using the configured secure cookie.

### 5.3 Get Current User

```http
GET /api/v1/auth/me
```

Authentication required.

Success:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Alex",
      "email": "alex@example.com",
      "avatarUrl": null
    }
  }
}
```

### 5.4 Logout

```http
POST /api/v1/auth/logout
```

Authentication required.

Success: `204 No Content`

The server invalidates the current session and clears its cookie.

---

## 6. User APIs

### 6.1 Get User Profile

```http
GET /api/v1/users/me
```

Authentication required.

### 6.2 Update User Profile

```http
PATCH /api/v1/users/me
```

Request:

```json
{
  "name": "Alex Updated",
  "avatarUrl": "https://example.com/avatar.png"
}
```

Only supported profile fields may be updated.

The backend must validate supplied URLs and field lengths.

---

## 7. Document APIs

All document endpoints require authentication.

### 7.1 Create Document

```http
POST /api/v1/documents
```

Request:

```json
{
  "title": "Untitled Document"
}
```

Success: `201 Created`

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "document-uuid",
      "title": "Untitled Document",
      "ownerId": "user-uuid",
      "createdAt": "2026-11-09T10:00:00.000Z",
      "updatedAt": "2026-11-09T10:00:00.000Z"
    }
  }
}
```

Requirements:

- Assign the authenticated user as owner.
- Generate the document UUID on the server.
- Create the document in the database.
- Do not accept an arbitrary owner ID from the client.

### 7.2 List Documents

```http
GET /api/v1/documents
```

Authentication required.

Optional query parameters:

```text
?page=1&limit=20&search=project
```

Success:

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "document-uuid",
        "title": "Project Notes",
        "ownerId": "user-uuid",
        "role": "owner",
        "updatedAt": "2026-11-09T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

Return documents the authenticated user owns or has permission to access.

### 7.3 Get Document

```http
GET /api/v1/documents/:documentId
```

Authentication required.

Success:

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "document-uuid",
      "title": "Project Notes",
      "ownerId": "user-uuid",
      "role": "editor",
      "createdAt": "2026-11-09T10:00:00.000Z",
      "updatedAt": "2026-11-09T10:00:00.000Z"
    }
  }
}
```

Requirements:

- Verify document access.
- Return only metadata needed by the frontend.
- Do not return the entire Yjs update history through this endpoint.

### 7.4 Update Document Metadata

```http
PATCH /api/v1/documents/:documentId
```

Authentication required. Owner or editor permission required.

Request:

```json
{
  "title": "Updated Project Notes"
}
```

Success:

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "document-uuid",
      "title": "Updated Project Notes",
      "updatedAt": "2026-11-09T10:30:00.000Z"
    }
  }
}
```

### 7.5 Delete Document

```http
DELETE /api/v1/documents/:documentId
```

Authentication required. Owner permission required.

Success: `204 No Content`

Requirements:

- Use soft deletion through `deleted_at` initially.
- Prevent normal document access after deletion.
- Define permanent deletion and data-retention behavior separately.
- Do not allow editors or viewers to delete documents.

---

## 8. Document Sharing APIs

The MVP supports three document roles:

| Role | Permissions |
|---|---|
| Owner | Full control |
| Editor | Read and edit |
| Viewer | Read only |

The document owner is stored in `documents.owner_id`. Other members are represented in `document_members`.

### 8.1 List Document Members

```http
GET /api/v1/documents/:documentId/members
```

Authentication required. Document access required.

Success:

```json
{
  "success": true,
  "data": {
    "members": [
      {
        "userId": "user-uuid",
        "name": "Alex",
        "email": "alex@example.com",
        "role": "owner"
      },
      {
        "userId": "another-user-uuid",
        "name": "Sam",
        "email": "sam@example.com",
        "role": "editor"
      }
    ]
  }
}
```

### 8.2 Add a Member

```http
POST /api/v1/documents/:documentId/members
```

Authentication required. Owner permission required.

Proposed request:

```json
{
  "email": "sam@example.com",
  "role": "editor"
}
```

Success:

```json
{
  "success": true,
  "data": {
    "member": {
      "userId": "another-user-uuid",
      "role": "editor"
    }
  }
}
```

The initial implementation may add an existing registered user directly.

Invitations for users who do not yet have accounts can be implemented as a later extension.

### 8.3 Update Member Role

```http
PATCH /api/v1/documents/:documentId/members/:userId
```

Authentication required. Owner permission required.

Request:

```json
{
  "role": "viewer"
}
```

Allowed roles:

```text
editor
viewer
```

The owner role cannot be assigned through this endpoint.

### 8.4 Remove a Member

```http
DELETE /api/v1/documents/:documentId/members/:userId
```

Authentication required. Owner permission required.

Success: `204 No Content`

The backend must also ensure that removed members cannot continue editing through an existing collaboration connection.

---

## 9. Real-Time Collaboration API

Real-time collaboration is handled by Hocuspocus and Yjs, not by ordinary REST endpoints.

### 9.1 Connection

```text
WebSocket: /collaboration
```

The frontend uses a Yjs-compatible Hocuspocus provider.

Conceptual client setup:

```ts
const ydoc = new Y.Doc();

const provider = new HocuspocusProvider({
  url: COLLABORATION_URL,
  name: documentId,
  document: ydoc,
});
```

The actual provider configuration must follow the installed Hocuspocus client version.

### 9.2 Authentication

Every WebSocket connection must be authenticated.

The server must:

1. Identify the authenticated user.
2. Read the requested document identifier.
3. Verify that the document exists and is not deleted.
4. Verify that the user has access.
5. Reject unauthorized connections.
6. Enforce the user's role for incoming document updates.

The document name is a routing identifier, not proof of authorization.

### 9.3 Permission Rules

| User role | Connect | Receive updates | Send updates |
|---|---|---|---|
| Owner | Yes | Yes | Yes |
| Editor | Yes | Yes | Yes |
| Viewer | Yes | Yes | No |
| Unauthorized | No | No | No |

Read-only permissions must be enforced on the server, not only by disabling editor controls in the frontend.

### 9.4 Yjs Synchronization

Yjs manages concurrent editing and conflict resolution.

The backend must:

- Load the persisted Yjs document state.
- Synchronize updates between connected clients.
- Persist accepted updates.
- Support recovery from stored snapshots and updates.
- Avoid treating raw WebSocket messages as application-level authorization.

### 9.5 Awareness and Presence

Yjs Awareness is used for temporary collaboration information, including:

- User presence
- Cursor positions
- Selection information
- User display name
- Avatar information

Awareness data is temporary and should not be treated as durable user or document data.

Do not trust awareness identity fields for authentication.

### 9.6 Permission Revocation

When a member loses access or changes from editor to viewer:

- Revalidate their active collaboration session.
- Stop accepting unauthorized updates.
- Disconnect or downgrade the affected connection.
- Ensure future reconnections use the updated permissions.

---

## 10. Persistence APIs and Internal Operations

Yjs persistence is an internal backend responsibility, not a public REST API.

The server should use the database tables defined in `DATABASE.md`.

| Table | Purpose |
|---|---|
| `document_updates` | Stores append-only Yjs updates |
| `document_snapshots` | Stores periodic document snapshots |
| `documents` | Stores document metadata |

### Persistence lifecycle

1. A client sends a Yjs update.
2. The collaboration server validates the connection and permissions.
3. The update is applied to the shared Yjs document.
4. The update is persisted.
5. Connected clients receive synchronization updates.
6. Periodic snapshots reduce recovery time.

The implementation must protect against losing updates during snapshot creation or compaction.

Do not expose database persistence endpoints to the browser.

---

## 11. Authorization Matrix

| Endpoint group | Guest | Owner | Editor | Viewer |
|---|---:|---:|---:|---:|
| Register / Login | Yes | Yes | Yes | Yes |
| Get own profile | No | Yes | Yes | Yes |
| Create document | No | Yes | Yes | Yes |
| List accessible documents | No | Yes | Yes | Yes |
| View document | No | Yes | Yes | Yes |
| Update document title | No | Yes | Yes | No |
| Delete document | No | Yes | No | No |
| List members | No | Yes | Yes | Yes |
| Add member | No | Yes | No | No |
| Change member role | No | Yes | No | No |
| Remove member | No | Yes | No | No |
| Join collaboration | No | Yes | Yes | Yes |
| Submit collaboration updates | No | Yes | Yes | No |

Note: Creating documents is available to any authenticated user, regardless of their role on other documents.

---

## 12. Validation Requirements

All incoming requests must be validated before business logic executes.

Examples:

| Field | Validation |
|---|---|
| Email | Valid email format |
| Password | Meets password policy |
| Name | Non-empty, maximum length enforced |
| Document title | Non-empty, maximum length enforced |
| Document ID | Valid UUID |
| Role | `editor` or `viewer` |
| Page | Positive integer |
| Limit | Positive integer with a maximum |

Recommended implementation:

- Use a shared validation approach such as Zod.
- Validate request body, parameters, and query strings.
- Reject unknown or unsupported fields where appropriate.
- Return useful validation errors without exposing internal details.

---

## 13. Security Requirements

Security is mandatory for every API and collaboration connection.

### Authentication

- Protect all private endpoints.
- Use secure session handling.
- Hash passwords with an appropriate password-hashing algorithm.
- Never expose session secrets or password hashes.

### Authorization

- Check resource ownership and membership on the backend.
- Never trust frontend role information.
- Enforce read-only access on the collaboration server.
- Revalidate access after permission changes.

### Web security

- Configure CORS with explicit allowed origins.
- Use appropriate CSRF protection for cookie-authenticated state-changing requests.
- Apply rate limiting to authentication and sensitive endpoints.
- Validate and sanitize user-provided data.
- Avoid exposing stack traces in production.

### Database security

- Use parameterized database operations.
- Keep `DATABASE_URL` on the server.
- Never expose database credentials to the frontend.
- Use migrations to manage schema changes.

---

## 14. Error Codes

Use consistent machine-readable error codes.

| Code | Meaning |
|---|---|
| `VALIDATION_ERROR` | Invalid input |
| `UNAUTHENTICATED` | User is not authenticated |
| `FORBIDDEN` | User lacks permission |
| `DOCUMENT_NOT_FOUND` | Document does not exist or is inaccessible |
| `USER_NOT_FOUND` | User does not exist |
| `EMAIL_ALREADY_EXISTS` | Email is already registered |
| `INVALID_CREDENTIALS` | Login failed |
| `MEMBER_ALREADY_EXISTS` | User is already a member |
| `OWNER_ACTION_REQUIRED` | Operation requires document ownership |
| `COLLABORATION_REJECTED` | Collaboration connection rejected |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_SERVER_ERROR` | Unexpected server error |

Avoid revealing whether a private document exists when the requester is not authorized to access it.

---

## 15. Suggested Backend Folder Structure

```text
apps/server/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── documents/
│   │   └── members/
│   │
│   ├── collaboration/
│   │   ├── hocuspocus.ts
│   │   ├── authentication.ts
│   │   ├── authorization.ts
│   │   └── persistence.ts
│   │
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── error-handler.ts
│   │   └── rate-limit.ts
│   │
│   ├── database/
│   │   ├── schema/
│   │   └── migrations/
│   │
│   ├── lib/
│   │   ├── errors.ts
│   │   └── validation.ts
│   │
│   └── routes/
│       └── index.ts
│
└── package.json
```

Keep route handlers, business logic, database access, and collaboration logic separated.

---

## 16. API Testing Requirements

Every API endpoint should have tests for successful and unsuccessful cases.

### Authentication tests

- Register with valid data.
- Reject duplicate email.
- Reject invalid registration data.
- Login successfully.
- Reject incorrect credentials.
- Access protected endpoint without a session.
- Logout and verify session invalidation.

### Document tests

- Create a document.
- List accessible documents.
- Get a document.
- Update document title.
- Delete a document.
- Reject access to an inaccessible document.

### Permission tests

- Owner can perform owner operations.
- Editor can edit document content.
- Viewer cannot submit content updates.
- Viewer cannot change document metadata.
- Non-owner cannot manage members.
- Removed members cannot reconnect.

### Collaboration tests

- Two clients can connect to the same document.
- Changes from one client reach the other.
- Concurrent edits converge correctly.
- Awareness updates reach connected clients.
- Unauthorized connections are rejected.
- Read-only users cannot submit updates.
- Persisted documents recover after a server restart.

---

## 17. MVP Implementation Order

Implement the API in small, testable stages.

| Phase | Work |
|---|---|
| 1 | Express server setup and health endpoint |
| 2 | Database connection and migrations |
| 3 | Authentication and current-user endpoint |
| 4 | Document CRUD APIs |
| 5 | Document membership and authorization |
| 6 | Hocuspocus connection and two-client synchronization |
| 7 | Yjs update persistence |
| 8 | Snapshot and recovery implementation |
| 9 | Presence and awareness |
| 10 | Security hardening and integration tests |

Do not build all endpoints at once.

Each phase must pass its tests before proceeding.

---

## 18. Health Check

### Endpoint

```http
GET /api/v1/health
```

Success:

```json
{
  "success": true,
  "data": {
    "status": "healthy"
  }
}
```

This endpoint should report application health without revealing secrets or internal infrastructure details.

A separate readiness check may verify whether critical dependencies, such as the database, are available.

---

## 19. Environment Variables

Proposed server environment variables:

```env
NODE_ENV=development
PORT=4000

DATABASE_URL=

FRONTEND_URL=http://localhost:3000

SESSION_SECRET=

COLLABORATION_URL=ws://localhost:4000/collaboration
```

These values are examples. Production values must be configured through the deployment platform's environment settings.

Never commit real secrets to Git.

---

## 20. Open Decisions

The following decisions remain provisional:

1. Authentication implementation: custom email/password or an authentication provider.
2. Session storage and session-management strategy.
3. Drizzle ORM confirmation.
4. Direct member addition versus invitation-based sharing.
5. Invitation expiration and acceptance flow.
6. Exact Hocuspocus authentication mechanism.
7. Yjs snapshot frequency and update compaction policy.
8. Deployment and WebSocket hosting strategy.

Do not make major architectural changes to settle these questions without reviewing the project documents first.

---

## 21. Instructions for Antigravity

When implementing this API:

1. Read `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DATABASE.md`, and this file before coding.
2. Inspect the existing repository before modifying files.
3. Follow the documented monorepo structure.
4. Implement one phase at a time.
5. Do not generate the entire backend in one step.
6. Do not invent endpoints that conflict with this API specification.
7. Validate authentication and authorization on the server.
8. Keep REST API logic separate from Hocuspocus collaboration logic.
9. Never fake real-time collaboration with polling or local-only state.
10. Write tests for every implemented feature.
11. Run tests and report their actual results.
12. Explain changed files, commands, and important technical decisions.
13. Update this document if an approved API contract changes.

**Important:** A successful HTTP response does not prove that real-time collaboration works. Collaboration must be verified using at least two independent browser clients connected to the same document.

---

**End of API Specification**