# AUTH.md

# CollabNote — Authentication & Authorization Specification

## 1. Purpose

This document defines how authentication and authorization must work in CollabNote.

The objective is to ensure that:

- Users can securely register and log in.
- Users can access their own accounts.
- Users can access only documents they are authorized to use.
- Document permissions are enforced by the backend.
- WebSocket collaboration connections are authenticated and authorized.
- Sessions are handled securely.
- Unauthorized users cannot read or modify protected resources.

This document works alongside:

- `PRD.md`
- `DESIGN.md`
- `ARCHITECTURE.md`
- `DATABASE.md`
- `API.md`
- `AGENTS.md`
- `FEATURES.md`

**Important:** Authentication proves who a user is. Authorization determines what that user is allowed to do. Both must be enforced independently.

---

# 2. Authentication Strategy

## 2.1 Authentication Method

For the initial MVP, use:

**Email and password authentication with secure server-managed sessions.**

Proposed implementation:

- Password hashing: Argon2id.
- Session management: server-managed sessions.
- Session transport: HTTP-only cookies.
- Backend: Express.js.
- Database: Neon PostgreSQL.
- Frontend: Next.js.

The exact session library and storage adapter must be selected before implementation and documented in the architecture.

Do not store session IDs, passwords, or authentication tokens in browser local storage or session storage.

## 2.2 Authentication Flow

The application should support:

1. User registration.
2. User login.
3. Current authenticated user retrieval.
4. Protected frontend routes.
5. Protected backend API routes.
6. User logout.
7. Session expiration.
8. Invalid session handling.

Future authentication methods may include:

- Google OAuth.
- GitHub OAuth.
- Email verification.
- Password reset.
- Multi-factor authentication.

These are not required for the initial MVP unless explicitly approved.

---

# 3. User Database Model

Refer to `DATABASE.md` for the canonical database schema.

The authentication implementation must support the following logical user information:

| Field | Purpose |
|---|---|
| id | Unique user identifier |
| name | User's display name |
| email | Unique login email |
| password_hash | Securely hashed password, if password authentication is used |
| avatar_url | Optional profile image |
| created_at | Account creation time |
| updated_at | Last profile update |

### Security requirements

- Never store plaintext passwords.
- Never return `password_hash` in API responses.
- Never expose authentication secrets to the frontend.
- Normalize email addresses consistently.
- Enforce email uniqueness at the database level.
- Use UUIDs for user identifiers.
- Validate user input on the backend.

**Schema decision:** If the current `users` table does not contain `password_hash`, either extend it or introduce a separate authentication credentials table. Inspect the existing schema before making migrations.

---

# 4. Password Security

## 4.1 Password Hashing

Use Argon2id for password hashing.

Requirements:

- Use a maintained password-hashing library.
- Use secure library defaults or appropriately configured parameters.
- Generate a unique salt for each password.
- Never implement custom hashing algorithms.
- Never log passwords or password hashes.

## 4.2 Password Validation

Define and enforce a consistent password policy.

Initial recommendation:

- Minimum 12 characters.
- Maximum accepted length should be documented and enforced safely.
- Accept spaces and common special characters.
- Do not silently truncate passwords.
- Do not require arbitrary character combinations that reduce usability.
- Provide clear validation messages.

## 4.3 Login Security

- Return a generic error for invalid email/password combinations.
- Apply rate limiting to login attempts.
- Avoid account enumeration through different error messages.
- Never log submitted passwords.
- Use secure session creation after successful authentication.

---

# 5. Session Management

## 5.1 Session Architecture

Use server-managed sessions stored in a persistent session store.

PostgreSQL-backed session storage is a suitable MVP option.

Requirements:

- Generate unpredictable session identifiers.
- Store session records server-side.
- Associate sessions with authenticated users.
- Support session expiration.
- Invalidate sessions on logout.
- Support session revocation.
- Avoid in-memory-only session storage in production.

Do not use a session cookie as a substitute for backend authorization.

## 5.2 Cookie Configuration

The session cookie should use:

| Attribute | Requirement |
|---|---|
| HttpOnly | Enabled |
| Secure | Enabled in production |
| SameSite | Strict or Lax, based on the deployment and OAuth/CSRF requirements |
| Path | `/` |
| Domain | Restrict appropriately for deployment |
| Max-Age / Expires | Match the session lifetime |

Do not expose session IDs to frontend JavaScript.

If the frontend and backend are deployed on different origins, explicitly configure:

- Credentialed CORS.
- Allowed origins.
- Cookie behavior.
- CSRF protection.
- HTTPS.

Do not use wildcard origins with credentialed requests.

## 5.3 Session Lifetime

Define configurable session expiration.

Suggested initial policy:

- Idle expiration: 7 days.
- Absolute expiration: 30 days.
- Logout: immediate invalidation.
- Password change: revoke existing sessions as appropriate.

These values are proposed defaults and should be reviewed before production deployment.

---

# 6. Authentication API

Base API path:

`/api/v1/auth`

All authentication operations must be implemented in the backend.

## 6.1 Register

`POST /api/v1/auth/register`

Request:

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "secure-password"
}
```

Backend responsibilities:

1. Validate request data.
2. Normalize the email address.
3. Check email uniqueness.
4. Hash the password.
5. Create the user.
6. Create a session if registration automatically logs the user in.
7. Return safe user information.

Expected response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Example User",
      "email": "user@example.com"
    }
  }
}
```

Possible errors:

- `400` — Invalid input.
- `409` — Email already registered.
- `429` — Too many requests.
- `500` — Internal server error.

## 6.2 Login

`POST /api/v1/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Backend responsibilities:

1. Validate input.
2. Normalize the email.
3. Find the user.
4. Verify the password hash.
5. Create a server-managed session.
6. Set the secure session cookie.
7. Return safe user information.

Possible errors:

- `400` — Invalid input.
- `401` — Invalid credentials.
- `429` — Too many requests.

## 6.3 Current User

`GET /api/v1/auth/me`

Purpose:

Retrieve the authenticated user's information.

Requirements:

- Require a valid session.
- Retrieve the user from the authenticated session.
- Return safe profile information.
- Never trust a user ID supplied by the browser to determine the authenticated identity.

Possible errors:

- `401` — Not authenticated.
- `500` — Internal server error.

## 6.4 Logout

`POST /api/v1/auth/logout`

Backend responsibilities:

1. Identify the current session.
2. Invalidate the session server-side.
3. Clear the session cookie.
4. Return a successful logout response.

Possible errors:

- `401` — No valid authenticated session, if required by the API contract.
- `500` — Internal server error.

Logout should be safe to retry.

---

# 7. Frontend Authentication

## 7.1 Registration Page

Route:

`/register`

UI elements:

- Name input.
- Email input.
- Password input.
- Confirm password input.
- Register button.
- Login link.
- Validation messages.
- Loading state.
- Error feedback.

Requirements:

- Validate required fields.
- Validate email format.
- Validate password policy.
- Confirm password matches.
- Prevent duplicate submissions.
- Display backend errors clearly.

## 7.2 Login Page

Route:

`/login`

UI elements:

- Email input.
- Password input.
- Login button.
- Registration link.
- Validation messages.
- Loading state.
- Error feedback.

Requirements:

- Validate input.
- Disable the submit button while processing.
- Display generic invalid-credentials errors.
- Navigate to the dashboard after successful login.

## 7.3 Authentication State

The frontend should have a centralized authentication mechanism.

Suggested responsibilities:

- Retrieve the current user.
- Track loading state.
- Track authenticated state.
- Track unauthenticated state.
- Handle expired sessions.
- Refresh authentication state when necessary.
- Provide the current user to protected application components.

Use a suitable React context or equivalent state-management approach.

Do not store passwords or session identifiers in frontend state.

## 7.4 Protected Routes

Protect routes such as:

- `/dashboard`
- `/documents/[id]`
- `/settings`

Requirements:

- Unauthenticated users should be redirected to login.
- Authenticated users should be allowed to continue.
- Preserve the intended destination when redirecting to login.
- Avoid redirect loops.
- Show an appropriate loading state while checking authentication.

Frontend route protection improves user experience but is not a security boundary.

The backend must independently protect every private API and collaboration connection.

---

# 8. Authorization System

## 8.1 Document Roles

CollabNote supports three document roles:

| Role | Description |
|---|---|
| Owner | Full control over the document and membership |
| Editor | Can view and edit document content |
| Viewer | Can view document content without editing |

Ownership is represented by:

`documents.owner_id`

Additional membership is represented by:

`document_members`

## 8.2 Permission Matrix

| Action | Owner | Editor | Viewer |
|---|---|---|---|
| Open document | Yes | Yes | Yes |
| Read document | Yes | Yes | Yes |
| Edit content | Yes | Yes | No |
| Rename document | Yes | Yes | No |
| Delete document | Yes | No | No |
| View members | Yes | Yes | Yes |
| Add members | Yes | No | No |
| Change member role | Yes | No | No |
| Remove members | Yes | No | No |
| Manage ownership | Yes | No | No |

The owner must not be represented as an ordinary member row unless the database design explicitly changes.

## 8.3 Authorization Rules

Every protected document operation must:

1. Identify the authenticated user.
2. Identify the requested document.
3. Retrieve the document and its ownership information.
4. Check membership where necessary.
5. Determine the user's effective role.
6. Verify that the requested action is permitted.
7. Execute the operation only after authorization succeeds.

Never rely on frontend role information.

Never assume that knowing a document ID grants access.

## 8.4 Authorization Middleware

Create reusable backend authorization utilities.

Suggested responsibilities:

- `requireAuth` — Require a valid authenticated user.
- `getDocumentAccess` — Retrieve the user's access to a document.
- `requireDocumentAccess` — Require at least read access.
- `requireDocumentRole` — Require a specified role or permission.
- `requireDocumentOwner` — Require document ownership.

These are proposed names. Reuse existing middleware if equivalent functionality already exists.

---

# 9. WebSocket Authentication

Real-time collaboration is a security-critical part of CollabNote.

Authentication and authorization must apply to WebSocket connections, not only REST APIs.

## 9.1 Connection Authentication

When a client connects to Hocuspocus:

1. Read the session cookie securely.
2. Validate the session with the backend session store.
3. Identify the authenticated user.
4. Reject invalid or expired sessions.
5. Attach trusted user identity to the connection context.

Never accept a user ID supplied by the frontend as proof of identity.

## 9.2 Document Authorization

When a client requests a collaboration document:

1. Resolve the requested document ID.
2. Confirm that the document exists.
3. Verify that the authenticated user can access it.
4. Determine the effective document role.
5. Allow or reject the connection.
6. Store the verified role in trusted connection context.

## 9.3 Read-Only Enforcement

Viewers must not be able to modify shared document content.

Requirements:

- Enforce permissions on the server.
- Reject unauthorized document updates.
- Do not rely only on disabling the editor in the frontend.
- Verify permissions for every collaboration session.
- Test attempts to submit unauthorized Yjs updates.

## 9.4 Permission Changes During Active Sessions

When a user is removed or downgraded:

- Revoke or restrict their active collaboration sessions.
- Prevent further unauthorized updates.
- Handle stale sessions.
- Re-check authorization when reconnecting.

The implementation must define how permission changes are propagated to active sessions.

## 9.5 Awareness and Presence

Yjs Awareness may contain:

- Display name.
- Avatar URL.
- Cursor information.
- Selection information.

Requirements:

- Derive trusted identity from the authenticated server context.
- Do not trust client-supplied identity fields.
- Do not use Awareness as authentication.
- Do not use Awareness as authorization.
- Do not persist transient presence data as document content.

---

# 10. Security Requirements

## 10.1 CSRF Protection

Because authentication uses cookies, protect state-changing requests against cross-site request forgery.

Requirements:

- Select and implement a suitable CSRF defense.
- Validate request origin where appropriate.
- Configure SameSite cookie behavior.
- Protect state-changing operations.
- Handle WebSocket origin checks separately.

SameSite cookies alone should not be assumed to solve every CSRF scenario.

## 10.2 CORS

Configure CORS explicitly.

Requirements:

- Allow only trusted frontend origins.
- Enable credentials only for approved origins.
- Do not use wildcard origins with credentials.
- Keep development and production origins configurable.

## 10.3 Rate Limiting

Apply rate limiting to:

- Registration.
- Login.
- Password reset when implemented.
- Other sensitive authentication endpoints.

Use appropriate limits and responses.

Do not make limits so restrictive that normal users are blocked unnecessarily.

## 10.4 Input Validation

Validate all incoming data on the backend.

Check:

- Name length.
- Email format and normalization.
- Password policy.
- Document IDs.
- Role values.
- Request body structure.

Reject unexpected or invalid values.

## 10.5 Logging

Never log:

- Plaintext passwords.
- Session IDs.
- Authentication cookies.
- Password reset tokens.
- Database connection strings.
- Secret keys.

Log useful security events without exposing sensitive information.

---

# 11. Error Handling

Use consistent API error responses.

Example:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}
```

Suggested error codes:

| Code | Meaning |
|---|---|
| VALIDATION_ERROR | Invalid request data |
| UNAUTHORIZED | User is not authenticated |
| FORBIDDEN | User lacks required permission |
| INVALID_CREDENTIALS | Login credentials are incorrect |
| EMAIL_ALREADY_EXISTS | Email is already registered |
| SESSION_EXPIRED | Session has expired |
| DOCUMENT_NOT_FOUND | Document does not exist or is inaccessible, according to the chosen disclosure policy |
| RATE_LIMITED | Too many requests |
| INTERNAL_ERROR | Unexpected server error |

Do not expose stack traces, internal session information, or sensitive database details.

---

# 12. Suggested Backend Structure

Adapt this structure to the existing repository rather than duplicating existing modules.

```text
apps/server/src/
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.validation.ts
│   │   └── auth.types.ts
│   │
│   ├── users/
│   │   ├── users.routes.ts
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   │
│   └── documents/
│       ├── documents.routes.ts
│       ├── documents.service.ts
│       └── document-access.service.ts
│
├── middleware/
│   ├── require-auth.ts
│   ├── require-document-access.ts
│   ├── error-handler.ts
│   └── rate-limit.ts
│
├── lib/
│   ├── password.ts
│   ├── session.ts
│   └── cookies.ts
│
└── config/
    ├── env.ts
    └── security.ts
```

This is a suggested organization, not a requirement to create every file immediately.

---

# 13. Environment Variables

Example server-side environment variables:

```env
NODE_ENV=development
PORT=4000

DATABASE_URL=your_neon_database_url

SESSION_SECRET=replace_with_a_long_random_secret

FRONTEND_URL=http://localhost:3000
```

Requirements:

- Never commit `.env` files.
- Keep `.env.example` free of real secrets.
- Validate required environment variables at startup.
- Use a strong randomly generated session secret.
- Use separate secrets for separate environments.
- Never expose server secrets through `NEXT_PUBLIC_` variables.

Additional variables may be required depending on the selected session library and CSRF implementation.

---

# 14. Authentication Testing

Authentication is not complete until the following tests pass.

## Registration

- [ ] Valid registration succeeds.
- [ ] Invalid email is rejected.
- [ ] Missing fields are rejected.
- [ ] Weak passwords are rejected according to policy.
- [ ] Duplicate email is rejected.
- [ ] Password is stored as a secure hash.
- [ ] Password hash is never returned.

## Login

- [ ] Valid credentials authenticate successfully.
- [ ] Invalid password is rejected.
- [ ] Unknown email produces a generic credentials error.
- [ ] Rate limiting works.
- [ ] Session cookie is configured correctly.

## Session

- [ ] Current-user endpoint works.
- [ ] Unauthenticated requests are rejected.
- [ ] Session survives refresh when valid.
- [ ] Logout invalidates the session.
- [ ] Expired sessions are rejected.
- [ ] Revoked sessions cannot be reused.

## Authorization

- [ ] Users cannot read another user's private documents.
- [ ] Editors can edit shared documents.
- [ ] Viewers cannot edit shared documents.
- [ ] Only owners can delete documents.
- [ ] Only owners can manage members.
- [ ] Changing frontend role data does not bypass authorization.
- [ ] Guessing document IDs does not grant access.

## WebSocket Security

- [ ] Unauthenticated connections are rejected.
- [ ] Unauthorized document connections are rejected.
- [ ] Viewer updates are rejected by the server.
- [ ] Removed users lose active collaboration access.
- [ ] Invalid or expired sessions cannot reconnect.
- [ ] Client-supplied user identity cannot impersonate another user.

---

# 15. Implementation Order

Implement authentication in this order.

| Step | Feature | Dependency |
|---|---|---|
| 1 | User authentication schema | Database foundation |
| 2 | Password hashing utilities | Backend foundation |
| 3 | Session storage and configuration | Database foundation |
| 4 | Registration API | Steps 1–3 |
| 5 | Login API | Steps 1–3 |
| 6 | Current-user API | Session system |
| 7 | Logout API | Session system |
| 8 | Registration and login pages | Authentication APIs |
| 9 | Frontend authentication state | Current-user API |
| 10 | Protected frontend routes | Authentication state |
| 11 | Backend authentication middleware | Session system |
| 12 | Document authorization middleware | Document schema |
| 13 | WebSocket authentication | Session system |
| 14 | WebSocket document authorization | Document membership |
| 15 | Security and integration tests | All previous steps |

Complete each step, test it, and review it before moving forward.

---

# 16. Definition of Done

Authentication and authorization are complete when:

- [ ] Users can register.
- [ ] Users can log in.
- [ ] Users can retrieve their authenticated profile.
- [ ] Users can log out.
- [ ] Passwords are securely hashed.
- [ ] Sessions are stored and validated securely.
- [ ] Protected frontend routes work.
- [ ] Protected backend endpoints work.
- [ ] Document permissions are enforced server-side.
- [ ] WebSocket authentication works.
- [ ] WebSocket document authorization works.
- [ ] Viewer write access is rejected server-side.
- [ ] Session expiration and revocation work.
- [ ] Security tests pass.
- [ ] No critical authentication vulnerabilities remain.

---

# 17. Instructions for Antigravity

When implementing authentication:

1. Read `AGENTS.md` and this document.
2. Read `DATABASE.md`, `ARCHITECTURE.md`, and `API.md`.
3. Inspect the existing authentication and database code.
4. Identify the first unfinished authentication implementation step.
5. Explain the implementation plan.
6. Implement only the approved step.
7. Add relevant tests.
8. Run type checks, linting, and relevant tests.
9. Report modified files and test results.
10. Stop and wait for approval.

Do not implement every authentication feature in one task.

Do not introduce OAuth, email verification, password reset, or multi-factor authentication unless those features are explicitly approved.

Do not assume frontend authentication is sufficient to secure backend APIs or WebSocket connections.

**Security principle: Every protected operation must verify the authenticated identity and the user's permission on the server.**

---

# 18. Open Decisions

The following decisions must be confirmed before the corresponding implementation:

| Decision | Current proposal | Status |
|---|---|---|
| Authentication method | Email and password | Proposed |
| Password hashing | Argon2id | Proposed |
| Session storage | PostgreSQL-backed | Proposed |
| Session transport | HTTP-only cookie | Proposed |
| Session library | To be selected | Pending |
| CSRF strategy | To be selected | Pending |
| Email verification | Excluded from initial MVP | Proposed |
| Google/GitHub OAuth | Future feature | Deferred |
| Password reset | Future feature | Deferred |
| Multi-factor authentication | Future feature | Deferred |
| Session expiration | 7-day idle / 30-day absolute | Proposed |

Do not silently treat proposed values as approved decisions.