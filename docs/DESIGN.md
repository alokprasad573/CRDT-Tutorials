# DESIGN.md

# CollabNote — UI/UX Design Guidelines

**Document version:** 1.0  
**Status:** Initial design specification  
**Product type:** Real-time collaborative text editor  
**Frontend:** Next.js  
**Styling:** Tailwind CSS  
**Component library:** Shadcn UI  
**Editor:** Tiptap

---

## 1. Design Vision

CollabNote should feel like a clean, modern, distraction-free writing workspace.

The interface should prioritize the document and its content rather than unnecessary controls or visual decoration.

The design should combine:
- The simplicity of a modern note-taking application.
- The focused writing experience of a document editor.
- The collaboration experience of a real-time shared workspace.

### Core design principles

1. **Minimalism:** Avoid unnecessary visual elements.
2. **Clarity:** Make navigation and actions easy to understand.
3. **Focus:** Give the editor the largest and most important area.
4. **Consistency:** Reuse components and design patterns.
5. **Feedback:** Clearly communicate saving, connection, and collaboration status.
6. **Accessibility:** Make controls usable with keyboards and assistive technologies.

---

## 2. Visual Identity

### 2.1 Overall Style

Use a modern SaaS interface with:
- Neutral backgrounds.
- Subtle borders.
- Rounded corners.
- Soft shadows only when necessary.
- Clear typography hierarchy.
- Restrained accent colors.

Avoid:
- Excessive gradients.
- Heavy shadows.
- Overly colorful interfaces.
- Excessive animations.
- Unnecessary decorative elements.

### 2.2 Color Palette

Use the following initial design tokens.

| Token | Color | Usage |
|---|---|---|
| Primary | `#4F46E5` | Primary buttons and active states |
| Primary Hover | `#4338CA` | Button hover |
| Background | `#FFFFFF` | Main application background |
| Surface | `#F8FAFC` | Sidebar and secondary surfaces |
| Foreground | `#0F172A` | Main text |
| Muted | `#64748B` | Secondary text |
| Border | `#E2E8F0` | Dividers and outlines |
| Success | `#16A34A` | Saved and connected states |
| Warning | `#D97706` | Connection or sync warnings |
| Destructive | `#DC2626` | Delete and error actions |

These values are initial defaults and may be refined during implementation.

### 2.3 Typography

Use a clean sans-serif font for the application interface.

Recommended:
- Interface: Inter or a similar sans-serif.
- Document content: a readable sans-serif font.
- Code blocks: monospace.

Typography hierarchy:

| Element | Suggested size |
|---|---|
| Page heading | 24–30px |
| Section heading | 18–20px |
| Card title | 16px |
| Body text | 14–16px |
| Supporting text | 12–13px |
| Editor content | 16–18px |

Maintain comfortable line height for long-form writing.

---

## 3. Application Layout

The application has three primary areas:

1. Dashboard.
2. Document editor.
3. Authentication screens.

### 3.1 Dashboard Layout

The dashboard should contain:

- Sidebar navigation.
- Application logo and name.
- Main content area.
- Create document action.
- Document listing.
- User profile menu.

Suggested structure:

```text
+------------------------------------------------------+
| Logo / CollabNote                         User Menu  |
+---------------+--------------------------------------+
|               |                                      |
| Sidebar       |  My Documents        + New Document  |
|               |                                      |
| All Documents |  Search documents...                 |
| Shared        |                                      |
|               |  +-------------+  +-------------+    |
|               |  | Document 1  |  | Document 2  |    |
|               |  | Updated     |  | Updated     |    |
|               |  +-------------+  +-------------+    |
|               |                                      |
+---------------+--------------------------------------+
```

#### Dashboard requirements

- Display the user's documents.
- Provide a clear create-document button.
- Show document title and last updated time.
- Include empty states when no documents exist.
- Provide loading and error states.
- Make document cards or rows clickable.

---

## 4. Document Editor Layout

The editor is the most important screen in the application.

It should provide a focused writing experience with collaboration controls available without distracting from the document.

### 4.1 Editor Structure

```text
+------------------------------------------------------+
| Logo | Document Title        Saved | Users | Share   |
+------------------------------------------------------+
|                                                      |
| Bold  Italic  Underline  Lists  Link  Undo  Redo      |
+------------------------------------------------------+
|                                                      |
|                                                      |
|              Document Content                        |
|                                                      |
|              Start writing...                        |
|                                                      |
|                                                      |
|                                                      |
|                                                      |
+------------------------------------------------------+
| Connected                         Collaborators: 2   |
+------------------------------------------------------+
```

### 4.2 Editor Header

The header should contain:

- Application logo or back navigation.
- Editable document title.
- Save or synchronization status.
- Collaborator avatars.
- Share button.
- User profile menu.

The header should remain visually compact.

### 4.3 Formatting Toolbar

Use Tiptap for rich-text editing.

Initial toolbar controls:

- Bold.
- Italic.
- Underline.
- Strikethrough.
- Heading levels.
- Paragraph.
- Bullet list.
- Numbered list.
- Blockquote.
- Code block.
- Link.
- Undo.
- Redo.

Toolbar requirements:

- Use Shadcn UI buttons and tooltips.
- Clearly indicate active formatting.
- Disable actions when unavailable.
- Keep controls grouped logically.
- Support keyboard shortcuts where appropriate.

### 4.4 Editor Canvas

The editor canvas should:

- Be centered in the available content area.
- Have a comfortable maximum reading width.
- Provide generous whitespace.
- Use readable typography.
- Avoid unnecessary borders around the document.
- Support long-form content.
- Show an appropriate placeholder when empty.

The document itself should receive the strongest visual emphasis.

---

## 5. Collaboration Experience

Collaboration must be visible but unobtrusive.

### 5.1 Collaborator Avatars

Display active collaborators in the editor header.

Requirements:
- Show user avatars or initials.
- Use a consistent color for each collaborator within a session.
- Show collaborator names through tooltips.
- Indicate when multiple collaborators are present.

### 5.2 Live Cursors

Use Tiptap collaboration extensions with Yjs awareness.

Requirements:
- Display other users' cursor positions.
- Give each collaborator a distinguishable cursor color.
- Display a small name label near the cursor.
- Avoid overwhelming the document with visual indicators.

### 5.3 Presence Status

Display useful connection states:

| State | UI feedback |
|---|---|
| Connected | Green indicator and "Connected" |
| Connecting | Neutral indicator and "Connecting..." |
| Disconnected | Warning indicator and "Reconnecting..." |
| Error | Clear error message |

Presence information is temporary and should not be treated as persistent user data.

---

## 6. Sharing and Permissions

The document sharing interface should be simple.

### Share dialog

Include:
- Document title.
- Invite or sharing controls.
- List of collaborators.
- Permission selector.
- Copy-link action, if link sharing is enabled.

### Initial permission levels

| Permission | Capabilities |
|---|---|
| Owner | Full document control |
| Editor | View and edit |
| Viewer | View only |

The UI must reflect actual server-side permissions. Hiding a button is not a substitute for authorization.

The final invitation methods and sharing rules remain product decisions.

---

## 7. Authentication Screens

Create clean authentication pages.

### Login page

Include:
- Application logo.
- Welcome heading.
- Email input.
- Password input.
- Login button.
- Link to registration.
- Validation and error feedback.

### Registration page

Include:
- Name input.
- Email input.
- Password input.
- Confirm password input, if required by the authentication implementation.
- Registration button.
- Link to login.

Keep authentication screens visually consistent.

---

## 8. Reusable UI Components

Build reusable components rather than duplicating UI across pages.

Suggested components:

```text
components/
├── layout/
│   ├── app-header.tsx
│   ├── app-sidebar.tsx
│   └── app-layout.tsx
│
├── dashboard/
│   ├── document-card.tsx
│   ├── document-list.tsx
│   └── empty-state.tsx
│
├── editor/
│   ├── editor-header.tsx
│   ├── editor-toolbar.tsx
│   ├── editor-content.tsx
│   ├── collaborator-list.tsx
│   ├── collaborator-cursor.tsx
│   └── connection-status.tsx
│
├── sharing/
│   ├── share-dialog.tsx
│   └── permission-selector.tsx
│
└── ui/
    └── Shadcn UI components
```

This is a suggested component organization, not a requirement to create every file immediately.

---

## 9. Responsive Design

The application should work on desktop, tablet, and mobile.

### Desktop

- Full dashboard sidebar.
- Spacious editor canvas.
- Full formatting toolbar.
- Collaborator avatars visible in the header.

### Tablet

- Collapsible sidebar.
- Reduced spacing.
- Compact toolbar.
- Editor canvas uses available width.

### Mobile

- Sidebar becomes a mobile navigation drawer.
- Toolbar becomes compact or horizontally scrollable.
- Header actions should remain accessible.
- Editor content uses nearly the full viewport width.
- Dialogs should fit the screen.

The editor must remain usable on smaller screens.

---

## 10. Interaction and Feedback

Every major user action should provide feedback.

Examples:

| Action | Expected feedback |
|---|---|
| Create document | New document opens |
| Rename document | Updated title appears |
| Save document | Saving, then Saved |
| Share document | Share dialog opens |
| Copy link | Confirmation toast |
| Delete document | Confirmation dialog |
| Connection lost | Reconnection status |
| Permission denied | Clear error message |

Use Shadcn UI toast/sonner notifications where appropriate.

Avoid unnecessary animations. Use subtle transitions for menus, dialogs, and hover states.

---

## 11. Loading, Empty, and Error States

Every major screen should handle:

- Initial loading.
- Empty document lists.
- Empty editor content.
- Failed API requests.
- Lost collaboration connections.
- Unauthorized document access.
- Failed document persistence.

Do not leave users looking at a blank screen when something goes wrong.

Provide clear messages and appropriate recovery actions.

---

## 12. Accessibility

Follow these requirements:

- Use semantic HTML.
- Provide accessible labels for icon-only buttons.
- Maintain sufficient color contrast.
- Support keyboard navigation.
- Show visible focus indicators.
- Use accessible dialog behavior.
- Do not communicate status through color alone.
- Respect reduced-motion preferences.

---

## 13. Implementation Guidelines for Antigravity

When generating the UI:

1. Follow this design specification consistently.
2. Use Tailwind CSS for styling.
3. Use Shadcn UI for common interface components.
4. Prefer reusable components over duplicated markup.
5. Use design tokens instead of scattering arbitrary colors.
6. Keep editor-specific logic separate from dashboard UI.
7. Make layouts responsive from the beginning.
8. Implement loading, empty, success, and error states.
9. Avoid introducing unnecessary UI libraries.
10. Do not implement fake collaboration behavior using static mock data in the production flow.
11. Keep the UI connected to real backend functionality as features are implemented.
12. Do not silently change product requirements to accommodate generated UI.

---

## 14. Design Acceptance Criteria

The design is ready for MVP implementation when:

- Dashboard layout is consistent and responsive.
- Users can clearly identify and open documents.
- Editor content is the primary visual focus.
- Formatting controls are understandable.
- Collaborator presence and connection status are visible.
- Sharing and permission controls are easy to understand.
- Loading, empty, and error states are designed.
- Core interactions are keyboard-accessible.
- Components follow a consistent visual system.

---

**End of DESIGN.md**
