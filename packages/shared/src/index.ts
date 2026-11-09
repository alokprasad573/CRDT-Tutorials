/**
 * @collabnote/shared
 * Shared TypeScript types, constants, and validation schemas
 * used by both the frontend and backend workspaces.
 */

// ============================================================================
// Document Roles
// ============================================================================

export type DocumentRole = "owner" | "editor" | "viewer";

export const DOCUMENT_ROLES: Record<string, DocumentRole> = {
  owner: "owner",
  editor: "editor",
  viewer: "viewer",
} as const;

export function isDocumentRole(value: string): value is DocumentRole {
  return value === "owner" || value === "editor" || value === "viewer";
}

export interface DocumentRoleCapabilities {
  readonly canRead: boolean;
  readonly canEdit: boolean;
  readonly canManageAccess: boolean;
  readonly canDelete: boolean;
}

export const ROLE_CAPABILITIES: Record<DocumentRole, DocumentRoleCapabilities> = {
  owner: {
    canRead: true,
    canEdit: true,
    canManageAccess: true,
    canDelete: true,
  },
  editor: {
    canRead: true,
    canEdit: true,
    canManageAccess: false,
    canDelete: false,
  },
  viewer: {
    canRead: true,
    canEdit: false,
    canManageAccess: false,
    canDelete: false,
  },
};

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

// ============================================================================
// Document Types
// ============================================================================

export interface Document {
  id: string;
  ownerId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DocumentWithRole extends Document {
  role: DocumentRole;
}

export interface CreateDocumentRequest {
  title: string;
}

export interface UpdateDocumentRequest {
  title: string;
}

// ============================================================================
// Document Member Types
// ============================================================================

export interface DocumentMember {
  userId: string;
  name: string;
  email: string;
  role: DocumentRole;
}

export interface AddMemberRequest {
  email: string;
  role: "editor" | "viewer";
}

export interface UpdateMemberRoleRequest {
  role: "editor" | "viewer";
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<{
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {}

// ============================================================================
// Error Codes
// ============================================================================

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "DOCUMENT_NOT_FOUND"
  | "USER_NOT_FOUND"
  | "EMAIL_ALREADY_EXISTS"
  | "INVALID_CREDENTIALS"
  | "MEMBER_ALREADY_EXISTS"
  | "OWNER_ACTION_REQUIRED"
  | "COLLABORATION_REJECTED"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_FOUND";

// ============================================================================
// Constants
// ============================================================================

export const API_BASE_PATH = "/api/v1";
export const COLLABORATION_PATH = "/collaboration";

export const MAX_DOCUMENT_TITLE_LENGTH = 255;
export const MIN_PASSWORD_LENGTH = 12;
