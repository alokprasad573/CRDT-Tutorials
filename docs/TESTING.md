# TESTING.md

# CollabNote — Testing Strategy

## 1. Purpose

This document defines the testing strategy for CollabNote.

The goal is to ensure that every feature is reliable, secure, maintainable, and works correctly before it is considered complete.

Testing must cover:

1. Unit testing.
2. Integration testing.
3. End-to-end testing.
4. API testing.
5. Authentication and authorization testing.
6. Real-time collaboration testing.
7. Database persistence testing.
8. Security testing.
9. Regression testing.

**Core principle: Every feature must be tested before moving to the next feature.**

---

# 2. Testing Philosophy

CollabNote follows a layered testing strategy.

| Testing level | What it verifies |
|---|---|
| Unit tests | Individual functions and components |
| Integration tests | Multiple modules working together |
| API tests | Backend endpoints and responses |
| E2E tests | Complete user workflows |
| Collaboration tests | Real-time synchronization between users |
| Security tests | Authentication, authorization, and data protection |

### Testing rules

- Write tests alongside feature implementation.
- Test both successful and unsuccessful scenarios.
- Test edge cases, not only normal behavior.
- Never rely exclusively on frontend validation.
- Test authorization on the backend.
- Use isolated test data.
- Avoid tests that depend on execution order.
- Do not use production databases for automated tests.
- Never commit real credentials or secrets.
- Fix failing tests before declaring a feature complete.

---

# 3. Recommended Testing Stack

Use the following testing tools.

| Area | Recommended tool | Purpose |
|---|---|---|
| Unit testing | Vitest | Test functions and modules |
| Frontend component testing | Vitest + React Testing Library | Test React components |
| API testing | Vitest + Supertest | Test Express endpoints |
| E2E testing | Playwright | Test complete browser workflows |
| Database testing | Vitest + isolated PostgreSQL database | Test database operations |
| Coverage | Vitest Coverage / V8 | Measure test coverage |
| Browser debugging | Playwright Trace Viewer | Diagnose E2E failures |

Official documentation:

- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Supertest: https://github.com/ladjs/supertest
- Playwright: https://playwright.dev/
- Testing Library user-event: https://testing-library.com/docs/user-event/intro/

Use compatible stable package versions and verify compatibility with the installed Node.js version before installation.

---

# 4. Monorepo Testing Architecture

Testing must work across all workspaces.

Proposed structure:

```text
collabnote/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   └── tests/
│   │       ├── unit/
│   │       └── components/
│   │
│   └── server/
│       ├── src/
│       └── tests/
│           ├── unit/
│           ├── integration/
│           └── api/
│
├── packages/
│   └── shared/
│       ├── src/
│       └── tests/
│
├── e2e/
│   ├── tests/
│   │   ├── authentication.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── documents.spec.ts
│   │   ├── editor.spec.ts
│   │   ├── collaboration.spec.ts
│   │   └── permissions.spec.ts
│   │
│   ├── fixtures/
│   └── playwright.config.ts
│
├── vitest.workspace.ts
└── package.json
```

This is a proposed organization. Antigravity must inspect the actual repository before creating folders or changing configuration.

---

# 5. Unit Testing

## 5.1 What Are Unit Tests?

Unit tests verify small individual pieces of code independently.

Examples:

- Password validation.
- Email normalization.
- Permission checking.
- Document title validation.
- API response formatting.
- Shared utility functions.
- React component behavior.

Unit tests should run quickly and avoid unnecessary external dependencies.

## 5.2 Backend Unit Tests

Test backend functions and services independently.

### Authentication

- [ ] Valid email normalization.
- [ ] Invalid email rejection.
- [ ] Password hashing.
- [ ] Password verification.
- [ ] Invalid password rejection.
- [ ] Session validation.
- [ ] Session expiration handling.

### Document Management

- [ ] Document creation logic.
- [ ] Document title validation.
- [ ] Document ownership checks.
- [ ] Document deletion rules.
- [ ] Document access checks.

### Permissions

- [ ] Owner permissions.
- [ ] Editor permissions.
- [ ] Viewer permissions.
- [ ] Unauthorized access rejection.
- [ ] Invalid role rejection.

### Collaboration

- [ ] Yjs document initialization.
- [ ] Update encoding and decoding.
- [ ] Snapshot generation.
- [ ] Snapshot restoration.
- [ ] Update validation.

### MCP Integration

- [ ] MCP tool argument validation.
- [ ] Tool permission checks.
- [ ] Disabled tool rejection.
- [ ] Tool execution error handling.
- [ ] Approval policy evaluation.

## 5.3 Frontend Unit and Component Tests

Use React Testing Library.

Test:

- [ ] Login form rendering.
- [ ] Registration form validation.
- [ ] Button interactions.
- [ ] Dashboard empty state.
- [ ] Document list rendering.
- [ ] Document title editing.
- [ ] Toolbar actions.
- [ ] Loading indicators.
- [ ] Error messages.
- [ ] Permission-dependent UI.
- [ ] Responsive navigation behavior where practical.

Test observable behavior rather than implementation details.

For example, verify that clicking a button produces the expected result rather than checking internal component state.

## 5.4 Shared Package Unit Tests

Test:

- [ ] Shared types and runtime validators.
- [ ] Common utility functions.
- [ ] Date formatting.
- [ ] API response helpers.
- [ ] Document role helpers.
- [ ] Input validation utilities.

---

# 6. Integration Testing

## 6.1 What Are Integration Tests?

Integration tests verify that multiple application modules work together.

Unlike unit tests, integration tests may use:

- A real test database.
- Actual Express routes.
- Real middleware.
- Authentication sessions.
- Database repositories.
- Collaboration services.

Use an isolated test environment.

## 6.2 Database Integration Tests

Test against a dedicated PostgreSQL test database.

- [ ] Database connection succeeds.
- [ ] User records can be created.
- [ ] Email uniqueness is enforced.
- [ ] Document records can be created.
- [ ] Foreign keys work.
- [ ] Document memberships work.
- [ ] Yjs updates can be stored.
- [ ] Snapshots can be stored.
- [ ] Snapshot restoration works.
- [ ] Transactions behave correctly.
- [ ] Database cleanup works.

Do not assume SQLite is an adequate substitute for PostgreSQL when testing PostgreSQL-specific behavior.

## 6.3 API Integration Tests

Use Supertest to test the Express application.

### Authentication APIs

- [ ] Register a user.
- [ ] Reject invalid registration.
- [ ] Reject duplicate email.
- [ ] Log in successfully.
- [ ] Reject invalid credentials.
- [ ] Retrieve the current user.
- [ ] Log out.
- [ ] Reject expired sessions.

### Document APIs

- [ ] Create a document.
- [ ] List accessible documents.
- [ ] Retrieve a document.
- [ ] Rename a document.
- [ ] Delete a document.
- [ ] Reject unauthorized document access.

### Sharing APIs

- [ ] Add a document member.
- [ ] List document members.
- [ ] Change member role.
- [ ] Remove a member.
- [ ] Reject unauthorized membership changes.

## 6.4 Collaboration Integration Tests

Test the backend collaboration lifecycle.

- [ ] Hocuspocus server initializes.
- [ ] Authenticated user can connect.
- [ ] Unauthenticated user is rejected.
- [ ] Authorized document access succeeds.
- [ ] Unauthorized document access fails.
- [ ] Yjs updates are persisted.
- [ ] Persisted updates restore correctly.
- [ ] Snapshots restore correctly.
- [ ] Removed users lose access.
- [ ] Viewers cannot submit updates.

## 6.5 MCP Integration Tests

- [ ] MCP client connects to a test server.
- [ ] Tool discovery works.
- [ ] Invalid tool definitions are rejected.
- [ ] Valid tool arguments execute successfully.
- [ ] Unauthorized execution is rejected.
- [ ] Tool errors are handled.
- [ ] Disabled servers cannot execute tools.
- [ ] Sensitive actions follow approval rules.

Use a local test MCP server rather than depending on a third-party production service.

---

# 7. End-to-End Testing

## 7.1 What Are E2E Tests?

End-to-end tests verify complete user journeys through the application.

They simulate real users interacting with the frontend.

Playwright will be the primary E2E testing tool.

E2E tests should verify:

- Frontend behavior.
- Backend API communication.
- Authentication.
- Database persistence.
- Navigation.
- Real-time collaboration.
- User permissions.

## 7.2 Browser Configuration

Use Playwright with Chromium initially.

Add Firefox and WebKit testing later when the core MVP is stable.

Recommended initial configuration:

- Base URL: `http://localhost:3000`
- Backend URL: `http://localhost:4000`
- Test timeout: configurable.
- Screenshots: on failure.
- Trace: retain on failure.
- Video: retain on failure when useful.

Use separate test accounts and isolated test data.

## 7.3 E2E Test: Registration

Scenario:

1. Open the registration page.
2. Enter a name.
3. Enter a new email.
4. Enter a valid password.
5. Confirm the password.
6. Submit the form.
7. Verify successful registration.
8. Verify the expected redirect.
9. Verify the user is authenticated.

Expected result:

- Account is created.
- User can access the dashboard.
- No password or secret information is exposed.

## 7.4 E2E Test: Login and Logout

Scenario:

1. Open the login page.
2. Enter valid credentials.
3. Submit the form.
4. Verify dashboard access.
5. Refresh the page.
6. Verify the session remains valid.
7. Log out.
8. Attempt to open the dashboard again.

Expected result:

- Login succeeds.
- Session persists according to the configured policy.
- Logout invalidates the session.
- Protected pages require authentication.

## 7.5 E2E Test: Document Creation

Scenario:

1. Log in.
2. Open the dashboard.
3. Click Create Document.
4. Verify the editor opens.
5. Enter a document title.
6. Verify the title is displayed.
7. Return to the dashboard.
8. Verify the document appears in the list.

Expected result:

- Document is created.
- Owner is correct.
- Document appears in the dashboard.

## 7.6 E2E Test: Rich-Text Editing

Scenario:

1. Open an existing document.
2. Enter text.
3. Select a portion of text.
4. Apply bold formatting.
5. Add a heading.
6. Add a list.
7. Navigate away.
8. Reopen the document.

Expected result:

- Formatting works.
- Content is saved.
- Content is restored after reopening.

## 7.7 E2E Test: Auto-Save

Scenario:

1. Open a document.
2. Modify its content.
3. Wait for the save indicator.
4. Refresh the browser.
5. Verify the latest content remains.

Expected result:

- Content is saved automatically.
- Refreshing does not lose successfully persisted changes.

## 7.8 E2E Test: Real-Time Collaboration

This is one of the most important tests in CollabNote.

Use two independent browser contexts.

Scenario:

1. Create two test users.
2. User A creates a document.
3. User A shares it with User B as an editor.
4. Open the document in Browser A.
5. Open the same document in Browser B.
6. User A enters text.
7. Verify User B sees the update.
8. User B enters different text.
9. Verify User A sees the update.
10. Perform simultaneous edits.
11. Verify both documents converge.
12. Refresh both browsers.
13. Verify persisted content remains correct.

Expected result:

- Both clients synchronize without manual refresh.
- Concurrent edits converge.
- Content survives refresh.
- No unauthorized editing occurs.

**Important:** Do not test collaboration using two tabs sharing the same browser storage context as a substitute for two independent authenticated users.

## 7.9 E2E Test: Permissions

Scenario:

1. User A creates a document.
2. User A shares it with User B as an editor.
3. User B opens and edits the document.
4. User A changes User B's role to viewer.
5. Verify User B cannot edit.
6. User A removes User B.
7. Verify User B loses document access.
8. Attempt to reconnect from User B's session.

Expected result:

- Editor permissions work.
- Viewer restrictions work.
- Removed members lose access.
- Active WebSocket sessions respect permission changes.

## 7.10 E2E Test: MCP Tool Execution

When MCP integration is implemented:

1. Connect a trusted test MCP server.
2. Discover its tools.
3. Enable a read-only tool.
4. Open the AI interface.
5. Ask AI to use the tool.
6. Verify the backend executes it.
7. Verify the result reaches the AI service.
8. Verify the final response.
9. Attempt an unauthorized tool call.
10. Verify it is rejected.

Expected result:

- AI can use approved tools.
- Tool calls are validated.
- Unauthorized actions cannot execute.

---

# 8. Test Data and Fixtures

Use reusable test fixtures.

Suggested fixtures:

```text
e2e/
├── fixtures/
│   ├── users.ts
│   ├── documents.ts
│   ├── sessions.ts
│   └── test-database.ts
│
└── tests/
    ├── authentication.spec.ts
    ├── dashboard.spec.ts
    ├── documents.spec.ts
    ├── editor.spec.ts
    ├── collaboration.spec.ts
    └── permissions.spec.ts
```

Requirements:

- Generate unique test emails.
- Create predictable test users.
- Create test documents through approved setup helpers or APIs.
- Clean up test data after execution.
- Avoid relying on records from previous test runs.
- Never use real user data.
- Keep test fixtures separate from production fixtures.

For collaboration tests, use at least two independently authenticated users.

---

# 9. Test Environment Configuration

Use separate environment files.

Suggested files:

```text
.env.example
.env.development
.env.test
.env.production
```

Example test configuration:

```env
NODE_ENV=test

DATABASE_URL=your_isolated_test_database_url

FRONTEND_URL=http://localhost:3000
PORT=4000
```

Requirements:

- Never use the production database for tests.
- Never commit real secrets.
- Use a dedicated test database.
- Validate environment variables before running tests.
- Ensure test cleanup cannot affect development or production data.

---

# 10. NPM Testing Scripts

Suggested root scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

These scripts are illustrative.

Antigravity must adapt them to the installed workspace configuration and ensure commands execute the intended tests.

Possible workspace scripts:

Frontend:

```bash
npm run test --workspace=@collabnote/web
```

Backend:

```bash
npm run test --workspace=@collabnote/server
```

Shared:

```bash
npm run test --workspace=@collabnote/shared
```

Run E2E tests from the repository root.

---

# 11. Test Coverage

Coverage helps identify untested code but does not prove that the application is correct.

Suggested initial coverage targets:

| Area | Target |
|---|---:|
| Shared utilities | 90% |
| Authentication and authorization logic | 90% |
| Backend business logic | 80% |
| Frontend components | 70% |
| Critical application workflows | 100% of defined scenarios |

Prioritize meaningful tests over reaching arbitrary coverage numbers.

Critical security and collaboration behavior must have direct tests.

---

# 12. CI/CD Testing

Automated tests should run during the development workflow and before production deployment.

Suggested pipeline:

```text
Developer pushes code
        |
        v
Install dependencies
        |
        v
TypeScript checks
        |
        v
Lint
        |
        v
Unit tests
        |
        v
Integration tests
        |
        v
Build applications
        |
        v
Start test environment
        |
        v
Run Playwright E2E tests
        |
        v
Generate test reports
        |
        v
Allow deployment if checks pass
```

Requirements:

- Run tests on pull requests.
- Run type checks and linting.
- Run unit and integration tests.
- Run critical E2E workflows.
- Preserve useful failure artifacts.
- Block production deployment on critical failures.

The CI provider and deployment platform will be selected separately.

---

# 13. Development Testing Workflow

For every new feature:

1. Read the relevant specification.
2. Implement the smallest functional part.
3. Write unit tests.
4. Write integration tests where multiple modules interact.
5. Run tests.
6. Fix failures.
7. Run type checks and linting.
8. Add or update E2E tests for important user journeys.
9. Review security and edge cases.
10. Update documentation.
11. Mark the feature complete only after verification.

Do not wait until the entire project is built before starting testing.

---

# 14. Definition of Done

A feature is complete only when:

- [ ] Implementation matches its specification.
- [ ] Relevant unit tests pass.
- [ ] Relevant integration tests pass.
- [ ] API tests pass where applicable.
- [ ] E2E tests pass for critical user workflows.
- [ ] TypeScript checks pass.
- [ ] Linting passes.
- [ ] No critical regression exists.
- [ ] Authorization and security behavior is tested.
- [ ] Known limitations are documented.

The MVP testing milestone is complete when all critical end-to-end workflows work reliably.

---

# 15. Instructions for Antigravity

Before implementing tests:

1. Read `AGENTS.md`.
2. Read `FEATURES.md`.
3. Read the relevant feature specification.
4. Inspect the current test setup.
5. Identify existing testing tools and scripts.
6. Avoid duplicating test frameworks unnecessarily.
7. Explain which tests will be added.
8. Implement tests for the current feature only.
9. Run the relevant test commands.
10. Fix failures introduced by the implementation.
11. Report the test results and remaining issues.
12. Stop and wait for approval.

Never claim tests passed unless they were actually executed successfully.

Do not weaken or delete a failing test just to make the test suite pass.

Do not replace real integration or E2E tests with mocks when the real behavior needs to be verified.

---

# 16. Final Testing Principle

CollabNote is a collaborative application, so testing must verify not only individual components but also how multiple users, sessions, databases, and WebSocket connections behave together.

**A feature is not complete because its code was written. It is complete when its behavior has been tested and verified.**