# DEBUGGING.md

# CollabNote — Debugging & Troubleshooting Guide

## 1. Purpose

This document defines the debugging strategy for CollabNote.

The objective is to identify, reproduce, diagnose, fix, and verify software problems without introducing new bugs.

Debugging must cover:

- Frontend errors.
- Backend errors.
- API failures.
- Database errors.
- Authentication and authorization failures.
- Real-time collaboration problems.
- WebSocket connection failures.
- Yjs synchronization problems.
- Hocuspocus server errors.
- MCP integration failures.
- Build and deployment issues.

**Core principle: Do not guess at the cause of a bug. Reproduce it, collect evidence, identify the root cause, fix it, and verify the fix.**

---

# 2. Debugging Philosophy

Every debugging task must follow this workflow:

1. **Understand:** Read the error message and understand the expected behavior.
2. **Reproduce:** Find a reliable way to reproduce the issue.
3. **Investigate:** Inspect relevant code, logs, requests, and runtime behavior.
4. **Identify:** Determine the root cause.
5. **Plan:** Explain the proposed fix and affected files.
6. **Fix:** Make the smallest appropriate code change.
7. **Verify:** Run relevant tests and reproduce the original scenario.
8. **Review:** Check for regressions and security problems.
9. **Report:** Explain the cause, fix, and verification results.

### Mandatory rules

- Never randomly change code to see whether an error disappears.
- Never suppress an error without understanding it.
- Never delete tests to make a build pass.
- Never introduce unnecessary dependencies.
- Never modify unrelated features while fixing a bug.
- Never expose secrets in debugging logs.
- Never claim a bug is fixed without verification.
- Preserve existing working functionality.
- Explain any necessary architecture changes before implementing them.

---

# 3. Debugging Environment

## 3.1 Development Environment

User's reported environment:

| Tool | Version |
|---|---|
| Node.js | v26.13.0 |
| npm | 11.20.0 |
| Git | 2.56.0.windows.4 |
| Operating system | Windows |

Verify the actual environment before troubleshooting.

PowerShell commands:

```powershell
node -v
npm -v
git --version
```

Check installed workspace dependencies:

```powershell
npm ls --workspaces --depth=0
```

Check running development processes and ports when necessary:

```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :4000
```

Typical development ports:

- Next.js frontend: `3000`
- Express backend: `4000`

These ports are configurable.

## 3.2 Debugging Tools

| Tool | Purpose |
|---|---|
| Browser DevTools | Frontend inspection |
| Browser Console | JavaScript errors |
| Network Panel | API and WebSocket requests |
| VS Code Debugger | Breakpoints and code inspection |
| Node.js Inspector | Backend debugging |
| PostgreSQL logs | Database investigation |
| Playwright Trace Viewer | E2E failure investigation |
| Git | Change tracking and regression analysis |

---

# 4. Frontend Debugging

## 4.1 Common Problems

### Problem: Frontend does not start

Possible causes:

- Missing dependencies.
- Invalid package scripts.
- Incorrect workspace configuration.
- TypeScript errors.
- Invalid environment variables.
- Port already in use.

Troubleshooting:

```powershell
npm install
npm run dev --workspace=@collabnote/web
```

Inspect the complete terminal output before changing configuration.

### Problem: Blank page

Check:

1. Browser console.
2. Network requests.
3. React rendering errors.
4. Next.js server logs.
5. Missing environment variables.
6. Invalid imports or module paths.

Do not assume a blank page is a styling issue.

### Problem: API requests fail

Inspect:

- Request URL.
- HTTP method.
- Request headers.
- Request payload.
- Response status.
- Response body.
- CORS errors.
- Cookie configuration.

Verify that the frontend is calling the correct backend URL.

### Problem: Authentication state disappears

Check:

- Session cookie configuration.
- Credentialed fetch requests.
- CORS configuration.
- Session expiration.
- Current-user API.
- Frontend authentication state initialization.

Do not solve session problems by storing session IDs in local storage.

---

# 5. Backend Debugging

## 5.1 Common Problems

### Problem: Express server fails to start

Check:

- Missing packages.
- TypeScript compilation errors.
- Invalid imports.
- Environment configuration.
- Port conflicts.
- Database initialization errors.

Run:

```powershell
npm run dev --workspace=@collabnote/server
```

### Problem: API returns 500

Investigate:

1. Backend terminal logs.
2. Route handler.
3. Controller.
4. Service layer.
5. Repository/database query.
6. Input validation.
7. Error middleware.

Record the complete error internally, but return a safe response to the client.

### Problem: API returns 401

Check:

- Whether the user is authenticated.
- Whether the session cookie is present.
- Whether the session exists.
- Whether the session has expired.
- Whether credentials are sent with the request.

### Problem: API returns 403

Check:

- Authenticated user identity.
- Document owner.
- Membership record.
- Effective document role.
- Backend authorization middleware.

Do not change a 403 response into a successful response simply to make the UI work.

---

# 6. Database Debugging

## 6.1 Connection Failures

Check:

- `DATABASE_URL`.
- Database availability.
- Network connectivity.
- SSL configuration.
- Database credentials.
- Connection pool configuration.

Never print the complete database connection string in logs.

## 6.2 Migration Failures

Check:

- Existing database schema.
- Migration history.
- Duplicate table or column names.
- Foreign key dependencies.
- Unique constraints.
- Incorrect migration ordering.

Before changing migrations:

1. Inspect the failed migration.
2. Determine whether it partially executed.
3. Check the actual database schema.
4. Create a safe corrective migration.
5. Verify the result.

Never delete production database tables or migration history as a quick fix.

## 6.3 Data Integrity Problems

Investigate:

- Missing foreign key relationships.
- Duplicate records.
- Incorrect document ownership.
- Invalid membership roles.
- Missing Yjs updates.
- Incorrect snapshot positions.
- Concurrent database writes.

Test fixes against an isolated test database first.

---

# 7. Authentication and Authorization Debugging

Common problems:

- Registration fails.
- Login fails.
- Session cookie is missing.
- Logout does not invalidate the session.
- Protected routes allow unauthenticated access.
- Users can access documents they do not own.
- Viewers can modify content.

Debugging checklist:

- [ ] Verify the authenticated user ID.
- [ ] Verify the session.
- [ ] Verify session expiration.
- [ ] Verify cookie attributes.
- [ ] Verify CORS and CSRF configuration.
- [ ] Verify document ownership.
- [ ] Verify document membership.
- [ ] Verify effective role.
- [ ] Verify server-side authorization.
- [ ] Verify active WebSocket permissions.

**Security rule:** Never fix authorization bugs by weakening access controls.

---

# 8. WebSocket Debugging

Real-time collaboration depends on persistent WebSocket connections.

## 8.1 Connection Failures

Check:

- WebSocket URL.
- Server availability.
- Authentication cookie.
- Origin validation.
- Reverse proxy configuration.
- TLS configuration.
- Connection rejection reason.

Use the browser Network panel and select the WebSocket request.

Inspect:

- Connection handshake.
- HTTP upgrade response.
- Connection close code.
- Close reason.
- Incoming and outgoing frames.

## 8.2 Unexpected Disconnections

Check:

- Server crashes.
- Network interruptions.
- Proxy idle timeouts.
- Session expiration.
- Heartbeat or connection timeout settings.
- Resource limits.

Verify reconnection behavior and ensure reconnection does not create duplicate editor instances.

---

# 9. Yjs and Hocuspocus Debugging

This is one of the most important debugging areas in CollabNote.

## 9.1 Clients Do Not Synchronize

Investigate:

1. Are both clients connected?
2. Are they using the same document identity?
3. Are both connected to the expected collaboration server?
4. Is the Tiptap collaboration extension configured correctly?
5. Are Yjs updates being exchanged?
6. Is server-side document authorization successful?

Remember:

- WebSockets transport messages.
- Yjs manages concurrent shared state.
- Hocuspocus manages collaboration sessions.
- Awareness manages temporary presence information.

A successful WebSocket connection alone does not prove collaboration works.

## 9.2 Conflicting or Missing Content

Check:

- Incorrect Y.Doc lifecycle.
- Multiple Y.Doc instances.
- Incorrect provider configuration.
- Incorrect document names.
- Updates not being applied.
- Persistence failures.
- Snapshot restoration errors.

Do not manually overwrite a Yjs document with stale content during synchronization.

## 9.3 Persistence and Recovery Problems

Check:

- Whether update hooks execute.
- Whether updates are stored in PostgreSQL.
- Whether snapshot creation succeeds.
- Whether update ordering is correct.
- Whether updates after the snapshot are replayed.
- Whether compaction removed updates too early.

Test recovery using:

1. A saved document.
2. A server restart.
3. A new client connection.
4. A content comparison.

The restored Yjs state must match the durable saved state.

## 9.4 Presence and Cursor Problems

Check:

- Awareness state updates.
- User identity mapping.
- Cursor extension configuration.
- Stale awareness states.
- Client disconnection cleanup.

Never use awareness metadata as proof of identity or permission.

---

# 10. MCP Debugging

## 10.1 MCP Connection Failures

Check:

- Transport configuration.
- Server URL or executable.
- Authentication.
- Network availability.
- Protocol initialization.
- SDK compatibility.
- Server capabilities.

## 10.2 Tool Discovery Problems

Check:

- Whether initialization succeeded.
- Whether the server exposes tools.
- Tool schemas.
- Duplicate tool names.
- Invalid capability responses.
- Tool registry state.

## 10.3 Tool Execution Failures

Check:

- Tool name.
- Input schema.
- Arguments.
- User permissions.
- Approval status.
- Server availability.
- Execution timeout.
- Tool result format.

Treat external tool responses as untrusted data.

Never bypass validation or approval rules to make an MCP tool execute.

---

# 11. Logging Strategy

Use structured logs.

Suggested log fields:

- Timestamp.
- Log level.
- Service name.
- Request ID.
- User ID where appropriate and safe.
- Operation.
- Error code.
- Error message.
- Duration.

Example:

```json
{
  "level": "error",
  "service": "collaboration",
  "operation": "document_sync",
  "requestId": "request-id",
  "errorCode": "SYNC_FAILED",
  "message": "Unable to persist document update"
}
```

## Log Levels

| Level | Use |
|---|---|
| debug | Detailed development diagnostics |
| info | Normal application events |
| warn | Recoverable problems |
| error | Failed operations |
| fatal | Critical service failures |

### Never log

- Plaintext passwords.
- Password hashes.
- Session IDs.
- Authentication cookies.
- OAuth access tokens.
- API keys.
- Database connection strings.
- Encryption keys.
- Sensitive document content.

Production logging must use appropriate redaction and access controls.

---

# 12. Error Reporting

Use consistent error responses.

Example:

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "The requested document could not be found."
  }
}
```

Requirements:

- Use stable error codes.
- Return useful but safe messages.
- Keep detailed diagnostics in protected server logs.
- Include request IDs where appropriate.
- Do not expose stack traces in production.

---

# 13. Git-Based Regression Debugging

When a bug appears after a code change:

1. Check recent Git changes.
2. Identify the last known working state.
3. Review modified files.
4. Compare behavior before and after the change.
5. Reproduce the issue.
6. Identify the responsible change.
7. Apply the smallest safe correction.
8. Run regression tests.

Useful commands:

```powershell
git status
git log --oneline -10
git diff
git diff --stat
```

Inspect a specific file:

```powershell
git diff -- path/to/file
```

Do not reset or discard user changes without explicit permission.

---

# 14. Build and Dependency Debugging

When installation or build fails:

1. Read the complete error.
2. Check Node.js and npm versions.
3. Inspect package manifests.
4. Check workspace configuration.
5. Check dependency compatibility.
6. Inspect the lockfile.
7. Identify the actual failing package.

Useful commands:

```powershell
node -v
npm -v
npm ls
npm run build --workspace=@collabnote/web
```

If a native package fails:

- Check operating system compatibility.
- Check Node.js version support.
- Check optional dependencies.
- Check package installation logs.
- Check whether the package has a compatible prebuilt binary.

Do not immediately delete `package-lock.json` or the entire `node_modules` directory. First identify the cause and preserve reproducible dependency versions.

---

# 15. Debugging Checklist

Use this checklist for every bug.

## Before Fixing

- [ ] Understand the expected behavior.
- [ ] Capture the exact error.
- [ ] Reproduce the problem.
- [ ] Identify the affected feature.
- [ ] Inspect relevant logs.
- [ ] Inspect recent changes.
- [ ] Identify the root cause.

## During Fixing

- [ ] Explain the proposed solution.
- [ ] Change only necessary files.
- [ ] Preserve existing architecture.
- [ ] Handle errors properly.
- [ ] Add a regression test.
- [ ] Protect security boundaries.

## After Fixing

- [ ] Reproduce the original scenario.
- [ ] Verify the fix.
- [ ] Run relevant unit tests.
- [ ] Run relevant integration tests.
- [ ] Run relevant E2E tests.
- [ ] Run TypeScript checks.
- [ ] Run linting.
- [ ] Check for regressions.
- [ ] Update documentation if necessary.

---

# 16. Standard Antigravity Debugging Prompt

Use this prompt whenever a bug occurs.

## Prompt

You are debugging the CollabNote project.

Before changing any code:

1. Read `AGENTS.md`.
2. Read the relevant project documentation.
3. Inspect the current repository and understand its architecture.
4. Read the complete error message.
5. Reproduce the issue if possible.
6. Inspect relevant logs, requests, and recent Git changes.

### Bug Information

**Bug title:** [Describe the issue]

**Expected behavior:** [What should happen]

**Actual behavior:** [What happens instead]

**Error message:** [Paste the complete error]

**Steps to reproduce:** [List the steps]

### Debugging Instructions

- Identify the actual root cause.
- Do not guess.
- Do not randomly modify code.
- Explain the root cause before implementing the fix.
- Identify all affected files.
- Propose the smallest safe fix.
- Preserve existing functionality.
- Add a regression test.
- Do not weaken security or authorization.
- Do not modify unrelated features.

### Verification

After fixing:

1. Reproduce the original problem.
2. Verify the fix.
3. Run relevant unit tests.
4. Run relevant integration tests.
5. Run relevant E2E tests.
6. Run TypeScript checks.
7. Run linting.
8. Check for regressions.

### Final Report

Provide:

- Root cause.
- Why the bug occurred.
- Files changed.
- Fix implemented.
- Tests executed.
- Test results.
- Remaining risks or limitations.

Do not claim success if the issue was not reproduced or the fix was not verified.

**Stop after fixing this bug. Wait for approval before making unrelated changes.**

---

# 17. Definition of Done

A bug is considered fixed only when:

- [ ] The root cause is understood.
- [ ] The issue is reproducible or the original failure is otherwise verified.
- [ ] The fix addresses the actual cause.
- [ ] A regression test is added where appropriate.
- [ ] Relevant tests pass.
- [ ] TypeScript checks pass.
- [ ] Linting passes.
- [ ] Existing functionality remains intact.
- [ ] Security is not weakened.
- [ ] The debugging report is complete.

---

# 18. Final Debugging Principle

Do not optimize for making an error disappear temporarily.

Optimize for identifying and correcting the actual cause.

**Reproduce → Investigate → Identify → Fix → Test → Verify → Document.**

This is the standard debugging workflow for CollabNote.