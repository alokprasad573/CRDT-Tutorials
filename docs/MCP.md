# MCP.md

# CollabNote — Model Context Protocol Integration

## 1. Purpose

This document defines how CollabNote integrates with the **Model Context Protocol (MCP)** to connect AI applications with external tools, services, and servers.

MCP is an open protocol that allows AI applications to discover and interact with external capabilities through a standardized interface.

The goal is to make CollabNote extensible so that AI features can interact with external systems without implementing a separate custom integration for every service.

Examples of possible integrations:

- GitHub
- GitLab
- Google Drive
- Notion
- Slack
- File systems
- Databases
- Developer tools
- Custom business APIs
- Custom MCP servers

**Important:** MCP connects AI applications to tools and data. It does not replace the AI model, authentication system, application backend, or business logic.

---

# 2. MCP Fundamentals

## 2.1 Main Components

MCP has three important architectural roles.

| Component | Responsibility |
|---|---|
| MCP Host | The AI application that users interact with |
| MCP Client | Connects the host to an MCP server |
| MCP Server | Exposes tools, resources, and prompts |

In CollabNote:

- The AI interface is part of the application.
- The backend manages MCP client connections.
- External MCP servers provide capabilities.
- The AI model decides when to use available tools, subject to application policies and user permissions.

## 2.2 How MCP Works

```text
                 USER
                   |
                   v
          COLLABNOTE FRONTEND
                   |
                   v
            COLLABNOTE BACKEND
                   |
                   v
              AI SERVICE
                   |
                   v
             MCP CLIENT
                   |
          +--------+--------+
          |        |        |
          v        v        v
       GitHub   Notion    Google Drive
       Server   Server      Server
          |        |           |
          v        v           v
        Tools    Tools       Tools
          |        |           |
          +--------+-----------+
                   |
                   v
             TOOL RESULTS
                   |
                   v
              AI SERVICE
                   |
                   v
             USER RESPONSE
```

The MCP client communicates with MCP servers using the MCP protocol.

The AI model does not directly open arbitrary server connections or execute arbitrary commands.

---

# 3. MCP Capabilities

MCP servers can expose three primary types of capabilities.

## 3.1 Tools

Tools allow an AI application to perform actions.

Examples:

| Tool | Purpose |
|---|---|
| `github_create_issue` | Create a GitHub issue |
| `github_list_repositories` | Retrieve repositories |
| `notion_search` | Search Notion content |
| `drive_search_files` | Search Google Drive |
| `slack_send_message` | Send a Slack message |
| `database_query` | Execute an approved database query |

Tools can have side effects, so authorization and user confirmation may be necessary.

## 3.2 Resources

Resources expose information that an application can read.

Examples:

- Document contents.
- Repository information.
- Project documentation.
- File metadata.
- Database records.
- Application configuration.

Resources should generally be treated as read-only information.

## 3.3 Prompts

Prompts expose reusable templates from MCP servers.

Examples:

- Generate a project summary.
- Review a pull request.
- Analyze a document.
- Create a technical report.
- Explain a codebase.

Prompts help standardize recurring AI workflows.

---

# 4. CollabNote MCP Architecture

CollabNote should support two integration directions.

## 4.1 Direction A: CollabNote Connects to External MCP Servers

<badge color="success">Primary MVP direction</badge>

CollabNote acts as an MCP host through its AI integration layer.

The backend:

1. Registers an external MCP server.
2. Establishes a connection.
3. Discovers available tools, resources, and prompts.
4. Makes approved capabilities available to the AI service.
5. Executes requested tool calls.
6. Returns results to the AI service.
7. Displays the final response to the user.

Examples:

- Ask AI to search a GitHub repository.
- Ask AI to retrieve a Notion page.
- Ask AI to search Google Drive.
- Ask AI to perform an approved action in an external service.

## 4.2 Direction B: External AI Applications Connect to CollabNote

<badge color="info">Future direction</badge>

CollabNote can also expose its own MCP server.

External AI clients could then discover and use CollabNote capabilities.

Potential tools:

| Tool | Purpose |
|---|---|
| `collabnote_list_documents` | List accessible documents |
| `collabnote_get_document` | Read an authorized document |
| `collabnote_create_document` | Create a document |
| `collabnote_update_document` | Update authorized document content |
| `collabnote_search_documents` | Search accessible documents |
| `collabnote_get_document_members` | Retrieve document collaborators |

All operations must enforce the same permissions as the normal CollabNote APIs.

This direction is not required for the initial MVP.

---

# 5. Technology Decisions

## 5.1 Recommended Technology

| Area | Proposed technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| MCP implementation | Official MCP TypeScript SDK |
| Backend | Existing Express.js server |
| Validation | Zod |
| AI integration | Provider-independent AI service layer |
| Connection management | Dedicated MCP service |
| Configuration | Environment variables and database configuration |
| Logging | Existing backend logging infrastructure |

Use the current stable MCP TypeScript SDK documented at:

https://ts.sdk.modelcontextprotocol.io/v2/

Do not automatically copy examples from the older SDK v1 documentation into a v2 implementation.

Check current package requirements and migration guidance before installation.

## 5.2 Transport Types

MCP supports different communication transports.

### STDIO

Used mainly for local MCP servers launched as child processes.

Example use cases:

- Local filesystem tools.
- Local development utilities.
- Local developer tools.

Security requirements:

- Never execute arbitrary commands supplied by an AI model.
- Use explicitly approved executable paths.
- Restrict command arguments.
- Apply timeouts and process limits.
- Do not expose unrestricted environment variables.

### Streamable HTTP

Used for remote MCP servers.

Example use cases:

- Hosted GitHub integrations.
- Hosted Notion integrations.
- Remote custom MCP servers.

Security requirements:

- Use HTTPS in production.
- Authenticate remote connections appropriately.
- Validate server origins and destinations.
- Apply request timeouts.
- Handle connection failures.
- Protect credentials.

### Legacy SSE

Older MCP servers may use HTTP with Server-Sent Events.

Support should be considered only when required for compatibility. Prefer Streamable HTTP for new remote integrations.

---

# 6. Proposed Project Structure

Extend the existing backend without disrupting the current application architecture.

```text
apps/
└── server/
    └── src/
        ├── modules/
        │   ├── ai/
        │   │   ├── ai.routes.ts
        │   │   ├── ai.controller.ts
        │   │   └── ai.service.ts
        │   │
        │   └── mcp/
        │       ├── mcp.routes.ts
        │       ├── mcp.controller.ts
        │       ├── mcp.service.ts
        │       ├── mcp-client.service.ts
        │       ├── mcp-connection.manager.ts
        │       ├── mcp-tool.registry.ts
        │       ├── mcp-tool.executor.ts
        │       ├── mcp-resource.service.ts
        │       ├── mcp-prompt.service.ts
        │       ├── mcp.validation.ts
        │       └── mcp.types.ts
        │
        ├── security/
        │   ├── mcp-access.ts
        │   └── tool-approval.ts
        │
        └── config/
            └── mcp.config.ts
```

This is a proposed structure. Antigravity must inspect the existing repository before creating or moving files.

---

# 7. MCP Server Registry

CollabNote needs a registry to manage external MCP servers.

## 7.1 Server Information

Each registered server should have:

| Field | Purpose |
|---|---|
| id | Unique server identifier |
| name | Display name |
| description | Server description |
| transport | STDIO or Streamable HTTP |
| connection_config | Non-secret connection configuration |
| status | Enabled, disabled, or error |
| created_at | Registration timestamp |
| updated_at | Last update timestamp |

Authentication credentials must be stored separately in a secure secrets mechanism.

Never store plaintext access tokens in ordinary configuration records.

## 7.2 Server Lifecycle

A registered server should support:

1. Registration.
2. Configuration validation.
3. Connection.
4. Capability discovery.
5. Tool registration.
6. Health monitoring.
7. Disconnection.
8. Reconnection.
9. Disablement.
10. Removal.

A disabled server must not be available for AI tool execution.

## 7.3 Server Configuration Example

The following is an illustrative CollabNote configuration format, not a universal MCP configuration standard.

```json
{
  "name": "github",
  "transport": "streamable-http",
  "url": "https://example-mcp-server.com/mcp",
  "enabled": true
}
```

Credentials should be supplied through a secure authentication mechanism, not embedded in this configuration.

---

# 8. Tool Discovery and Registry

When an MCP server connects, CollabNote should discover its capabilities.

## 8.1 Discovery Workflow

1. Establish the MCP connection.
2. Initialize protocol communication.
3. Negotiate supported capabilities.
4. Request the server's tool list.
5. Retrieve tool descriptions and input schemas.
6. Validate the returned definitions.
7. Register permitted tools.
8. Make approved tools available to the AI orchestration layer.

## 8.2 Tool Information

Each tool should have:

- Tool name.
- Server identifier.
- Description.
- Input schema.
- Output format where available.
- Permission requirements.
- Risk classification.
- Enabled or disabled state.

## 8.3 Tool Naming

Use namespaced internal tool identifiers to prevent collisions.

Example:

```text
github.search_repositories
github.create_issue

notion.search_pages
notion.create_page

slack.search_messages
slack.send_message
```

Preserve the original MCP tool name when calling the external server.

---

# 9. AI Tool Execution

## 9.1 Execution Workflow

```text
User asks a question
        |
        v
AI receives user request
        |
        v
AI receives approved tool definitions
        |
        v
AI selects a tool
        |
        v
Backend validates tool request
        |
        v
Permission and approval checks
        |
        v
MCP client calls external server
        |
        v
MCP server executes the tool
        |
        v
Tool result returned to backend
        |
        v
AI processes tool result
        |
        v
Final response displayed to user
```

## 9.2 Execution Rules

- Validate all tool arguments.
- Validate against the discovered input schema.
- Verify that the server is enabled.
- Verify that the user has permission to use the integration.
- Apply approval rules before sensitive actions.
- Execute tools through the MCP client.
- Apply timeouts and cancellation where supported.
- Handle failed tool calls safely.
- Return structured results to the AI orchestration layer.
- Record relevant audit events.

Never let the AI bypass the backend tool executor.

## 9.3 Tool Risk Levels

Classify tools by risk.

| Risk level | Example | Approval |
|---|---|---|
| Low | Read public repository metadata | Usually not required |
| Medium | Read private workspace information | Require appropriate access |
| High | Send a message or create an issue | Explicit user confirmation by default |
| Critical | Delete data or change permissions | Strong confirmation and authorization |

The application must be able to override tool-provided descriptions and enforce its own risk policies.

---

# 10. Permissions and Security

MCP integrations must follow CollabNote's authentication and authorization rules.

Refer to:

- `AUTH.md`
- `API.md`
- `DATABASE.md`

## 10.1 User Isolation

Each user's integration credentials must remain isolated.

Requirements:

- Do not share one user's OAuth tokens with another user.
- Do not expose credentials to the frontend.
- Do not allow users to access other users' private integrations.
- Associate tool execution with the authenticated user.
- Enforce permissions on every tool invocation.

## 10.2 Credential Management

Use a secure credential-storage mechanism.

Requirements:

- Encrypt credentials at rest.
- Keep encryption keys outside the database.
- Support credential rotation.
- Support credential revocation.
- Never log tokens or secrets.
- Never include secrets in AI prompts.
- Never return secrets through MCP management APIs.

For remote integrations, use the authentication mechanism supported by the MCP server, such as OAuth where appropriate.

Do not forward the CollabNote session cookie to external MCP servers.

## 10.3 External Server Trust

An MCP server is an external execution boundary.

Treat its:

- Tool descriptions.
- Resource content.
- Prompt templates.
- Tool outputs.

as untrusted input.

Never allow external MCP content to override system instructions, application security rules, or user permissions.

## 10.4 Network Security

For remote MCP servers:

- Require HTTPS in production.
- Block localhost and private network destinations unless explicitly approved.
- Validate DNS resolution and destination addresses.
- Prevent DNS rebinding and SSRF.
- Revalidate destinations after redirects.
- Restrict outbound network access.
- Apply connection and request timeouts.

For STDIO servers:

- Use an allowlist of executables.
- Never use shell command construction with model-provided input.
- Restrict working directories and environment variables.
- Apply resource and process limits.

## 10.5 Audit Logging

Record important events:

- MCP server registration.
- Connection and disconnection.
- Tool discovery.
- Tool execution.
- Tool approval or rejection.
- Execution failures.
- Credential changes.

Audit logs must not contain passwords, access tokens, private keys, or sensitive tool arguments.

---

# 11. MCP Management APIs

Base route:

`/api/v1/mcp`

These APIs are proposed for the CollabNote backend.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/servers` | Register an MCP server |
| GET | `/servers` | List accessible servers |
| GET | `/servers/:id` | Get server details |
| PATCH | `/servers/:id` | Update configuration |
| DELETE | `/servers/:id` | Remove a server |
| POST | `/servers/:id/connect` | Connect to a server |
| POST | `/servers/:id/disconnect` | Disconnect a server |
| GET | `/servers/:id/tools` | List discovered tools |
| POST | `/tools/:id/execute` | Execute an approved tool |
| GET | `/servers/:id/resources` | List available resources |
| GET | `/servers/:id/prompts` | List available prompts |

Requirements:

- Require authentication.
- Enforce server ownership and access permissions.
- Validate all inputs.
- Protect sensitive operations.
- Never expose credentials in responses.

These endpoints are an application-level API design, not MCP protocol endpoint requirements.

---

# 12. Database Considerations

Refer to `DATABASE.md` before adding tables.

Potential future tables:

### `mcp_servers`

Stores registered MCP server metadata.

### `mcp_credentials`

Stores references to securely stored integration credentials.

### `mcp_tools`

Stores discovered tool metadata and enablement settings.

### `mcp_user_connections`

Tracks user-specific integration access.

### `mcp_tool_executions`

Stores execution metadata and audit information.

Do not store raw authentication secrets in ordinary database columns.

For the MVP, avoid introducing unnecessary tables until the server ownership, user integration, and credential models are finalized.

---

# 13. Frontend MCP Management

Create an MCP integration management interface when backend functionality is ready.

Suggested route:

`/settings/integrations`

## 13.1 Integration Dashboard

Display:

- Connected MCP servers.
- Server name.
- Connection status.
- Transport type.
- Available tools.
- Last connection time.
- Enable/disable control.

## 13.2 Add MCP Server

Provide:

- Server name.
- Description.
- Transport selection.
- Server URL or approved local process configuration.
- Authentication configuration.
- Connection test.
- Save action.

Do not expose secret values after they have been saved.

## 13.3 Tool Management

Allow users or administrators to:

- View discovered tools.
- Inspect descriptions and input schemas.
- Enable or disable tools.
- Review tool risk levels.
- Configure approval requirements.

Only expose controls appropriate to the user's permissions.

## 13.4 Tool Approval UI

Before a sensitive action, display:

- Tool name.
- Server name.
- Requested action.
- Relevant arguments.
- Potential impact.
- Confirm or cancel action.

Do not automatically approve critical operations.

---

# 14. AI Provider Integration

MCP and AI model providers are separate integration layers.

CollabNote should avoid coupling MCP functionality to one AI provider.

Suggested architecture:

```text
AI ORCHESTRATION SERVICE
          |
          v
AI PROVIDER ADAPTER
          |
          v
MODEL RESPONSE
          |
          v
TOOL CALL NORMALIZATION
          |
          v
MCP TOOL EXECUTOR
          |
          v
MCP CLIENT
          |
          v
EXTERNAL MCP SERVER
```

Responsibilities:

- AI provider adapter: communicates with the selected model.
- Tool normalization: maps provider tool calls to internal tool definitions.
- MCP executor: validates and authorizes execution.
- MCP client: communicates with external MCP servers.
- Result adapter: returns tool results to the AI provider.

Do not assume every AI provider supports every MCP capability directly. The backend should handle the integration between model tool calling and MCP.

---

# 15. Implementation Roadmap

Build MCP integration incrementally.

## Phase 1 — MCP Foundation

- [ ] Study the official MCP specification.
- [ ] Review the current TypeScript SDK.
- [ ] Create the MCP module.
- [ ] Add the MCP SDK dependency.
- [ ] Create MCP configuration.
- [ ] Define common MCP types.
- [ ] Create a basic connection manager.

Acceptance criteria:

- MCP module builds successfully.
- Existing application functionality remains unaffected.

## Phase 2 — First MCP Server Connection

- [ ] Choose one trusted test MCP server.
- [ ] Configure its transport.
- [ ] Establish a connection.
- [ ] Initialize protocol communication.
- [ ] Handle connection failures.
- [ ] Disconnect cleanly.

Acceptance criteria:

- CollabNote can connect to a test MCP server.
- Connection errors are handled correctly.

## Phase 3 — Tool Discovery

- [ ] Retrieve available tools.
- [ ] Validate tool definitions.
- [ ] Store tool metadata.
- [ ] Handle tool name collisions.
- [ ] Display discovered tools.

Acceptance criteria:

- CollabNote can discover and list available tools.

## Phase 4 — Tool Execution

- [ ] Implement tool argument validation.
- [ ] Implement the tool executor.
- [ ] Execute a read-only test tool.
- [ ] Process structured tool results.
- [ ] Handle errors and timeouts.
- [ ] Add execution logging.

Acceptance criteria:

- A tool can be called through CollabNote.
- Results are returned safely.

## Phase 5 — AI Integration

- [ ] Connect the MCP tool registry to the AI orchestration service.
- [ ] Convert tool definitions into the selected provider's tool format.
- [ ] Receive model tool-call requests.
- [ ] Validate and execute requested tools.
- [ ] Return results to the model.
- [ ] Display the final AI response.

Acceptance criteria:

- AI can use an approved MCP tool to complete a user request.

## Phase 6 — Security and Approvals

- [ ] Add per-user server permissions.
- [ ] Add secure credential storage.
- [ ] Add tool risk classification.
- [ ] Add confirmation for sensitive actions.
- [ ] Add audit logging.
- [ ] Add network security controls.
- [ ] Test unauthorized execution attempts.

Acceptance criteria:

- Users cannot execute tools without authorization.
- Sensitive actions follow approval policies.
- Credentials remain protected.

## Phase 7 — MCP Management UI

- [ ] Create integrations dashboard.
- [ ] Add server registration.
- [ ] Add connection testing.
- [ ] Add tool discovery UI.
- [ ] Add enable/disable controls.
- [ ] Add approval interface.

Acceptance criteria:

- Authorized users can manage MCP integrations through the UI.

## Phase 8 — Advanced Capabilities

- [ ] Add resource support.
- [ ] Add prompt support.
- [ ] Add additional trusted servers.
- [ ] Add reconnection strategies.
- [ ] Add execution monitoring.
- [ ] Add cancellation for long-running operations.
- [ ] Evaluate exposing CollabNote as an MCP server.

Acceptance criteria:

- Additional MCP capabilities work without compromising the existing architecture.

---

# 16. Testing Requirements

## Connection Tests

- [ ] Valid server connection succeeds.
- [ ] Invalid server connection fails safely.
- [ ] Disconnected servers are handled.
- [ ] Reconnection works.
- [ ] Unsupported capabilities are handled.

## Tool Tests

- [ ] Tool discovery works.
- [ ] Invalid tool arguments are rejected.
- [ ] Valid tool execution works.
- [ ] Tool errors are handled.
- [ ] Timeouts are handled.
- [ ] Disabled tools cannot execute.

## Security Tests

- [ ] Unauthorized users cannot access private integrations.
- [ ] Credentials are never returned to the frontend.
- [ ] AI cannot bypass approval requirements.
- [ ] Untrusted tool outputs cannot override application policies.
- [ ] Remote server connections cannot access prohibited internal networks.
- [ ] Arbitrary shell commands cannot be executed.
- [ ] Tool execution respects user permissions.

## AI Integration Tests

- [ ] AI can discover approved tools.
- [ ] AI can request a tool call.
- [ ] Backend validates the request.
- [ ] MCP server returns a result.
- [ ] AI receives the result.
- [ ] User receives a useful response.

---

# 17. Definition of Done

The initial MCP integration is complete when:

- [ ] CollabNote can connect to at least one trusted MCP server.
- [ ] The connection uses a supported MCP transport.
- [ ] Tool discovery works.
- [ ] Tool metadata is validated.
- [ ] AI can invoke approved tools.
- [ ] Tool execution is handled by the backend.
- [ ] Results are returned to the AI service.
- [ ] User permissions are enforced.
- [ ] Sensitive operations require appropriate approval.
- [ ] Credentials are protected.
- [ ] Errors and timeouts are handled.
- [ ] Security tests pass.

---

# 18. Instructions for Antigravity

Before implementing MCP:

1. Read `AGENTS.md`.
2. Read `ARCHITECTURE.md`.
3. Read `API.md`.
4. Read `AUTH.md`.
5. Read `DATABASE.md`.
6. Read this `MCP.md`.
7. Inspect the existing repository.
8. Identify the first unfinished MCP implementation phase.
9. Explain the plan and affected files.
10. Implement only the approved feature.
11. Add tests and run verification.
12. Report the results and stop for approval.

Additional requirements:

- Use the official MCP TypeScript SDK.
- Check the current stable SDK documentation before writing integration code.
- Keep MCP clients and connection management on the backend.
- Never expose secrets to the browser.
- Never execute arbitrary tools without validation and authorization.
- Keep AI provider integration separate from MCP transport logic.
- Do not implement the entire roadmap in one task.
- Do not claim an MCP server is connected unless the connection has been tested.

---

# 19. Official References

Use these resources as the primary technical references:

1. MCP official documentation: https://modelcontextprotocol.io/
2. TypeScript SDK v2: https://ts.sdk.modelcontextprotocol.io/v2/
3. TypeScript SDK v1 documentation: https://ts.sdk.modelcontextprotocol.io/
4. MCP Python SDK: https://py.sdk.modelcontextprotocol.io/
5. MCP specification updates: https://blog.modelcontextprotocol.io/

Always check the current specification and SDK documentation before implementation because MCP APIs and SDK versions can change.

---

# 20. Final Architecture Principle

MCP should make CollabNote extensible, not less secure.

The AI may decide which approved tool is useful, but the backend remains responsible for:

- Authentication.
- Authorization.
- Tool validation.
- Credential management.
- Execution policies.
- User confirmation.
- Audit logging.

**The AI can request an action. Only the authorized application backend can approve and execute it.**