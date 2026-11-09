import { describe, it, expect } from "vitest";
import {
  isDocumentRole,
  DOCUMENT_ROLES,
  ROLE_CAPABILITIES,
  DocumentRole,
} from "../index";

describe("Shared — Document Roles", () => {
  describe("isDocumentRole", () => {
    it("should return true for valid roles", () => {
      expect(isDocumentRole("owner")).toBe(true);
      expect(isDocumentRole("editor")).toBe(true);
      expect(isDocumentRole("viewer")).toBe(true);
    });

    it("should return false for invalid roles", () => {
      expect(isDocumentRole("admin")).toBe(false);
      expect(isDocumentRole("")).toBe(false);
      expect(isDocumentRole("OWNER")).toBe(false);
    });
  });

  describe("DOCUMENT_ROLES", () => {
    it("should contain all three roles", () => {
      expect(DOCUMENT_ROLES.owner).toBe("owner");
      expect(DOCUMENT_ROLES.editor).toBe("editor");
      expect(DOCUMENT_ROLES.viewer).toBe("viewer");
    });
  });

  describe("ROLE_CAPABILITIES", () => {
    it("should define correct capabilities for owner", () => {
      expect(ROLE_CAPABILITIES.owner).toEqual({
        canRead: true,
        canEdit: true,
        canManageAccess: true,
        canDelete: true,
      });
    });

    it("should define correct capabilities for editor", () => {
      expect(ROLE_CAPABILITIES.editor).toEqual({
        canRead: true,
        canEdit: true,
        canManageAccess: false,
        canDelete: false,
      });
    });

    it("should define correct capabilities for viewer", () => {
      expect(ROLE_CAPABILITIES.viewer).toEqual({
        canRead: true,
        canEdit: false,
        canManageAccess: false,
        canDelete: false,
      });
    });
  });

  it("should export DocumentRole type", () => {
    const role: DocumentRole = "editor";
    expect(role).toBe("editor");
  });
});
