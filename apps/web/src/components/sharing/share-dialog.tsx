"use client";

import { useState, useEffect } from "react";
import { membersApi } from "@/lib/api";

type Member = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

interface ShareDialogProps {
  documentId: string;
  documentTitle: string;
  userRole: string; // "owner" | "editor" | "viewer"
  open: boolean;
  onClose: () => void;
  onMemberChange?: () => void;
}

export function ShareDialog({
  documentId,
  documentTitle,
  userRole,
  open,
  onClose,
  onMemberChange,
}: ShareDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"editor" | "viewer">("editor");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!open) return;
    let ignore = false;
    const fetchMembers = async () => {
      await Promise.resolve();
      if (ignore) return;
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const res = await membersApi.list(documentId);
        if (!ignore) {
          if (res.success && res.data?.members) {
            setMembers(res.data.members);
          } else {
            setError(res.error?.message || "Failed to load members");
          }
        }
      } catch {
        if (!ignore) {
          setError("Failed to load members");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetchMembers();
    return () => {
      ignore = true;
    };
  }, [open, documentId]);

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAdding(true);
    try {
      const res = await membersApi.add(documentId, newEmail, newRole);
      if (res.success && res.data?.member) {
        setNewEmail("");
        setMembers((prev) => [...prev, res.data!.member]);
        setSuccess("Member added successfully");
        onMemberChange?.();
      } else {
        setError(res.error?.message || "Failed to add member");
      }
    } catch {
      setError("Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const res = await membersApi.updateRole(documentId, memberId, newRole as "editor" | "viewer");
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.userId === memberId ? { ...m, role: newRole } : m
          )
        );
        setSuccess("Role updated");
        onMemberChange?.();
      } else {
        setError(res.error?.message || "Failed to update role");
      }
    } catch {
      setError("Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }
    try {
      const res = await membersApi.remove(documentId, memberId);
      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.userId !== memberId));
        setSuccess("Member removed");
        onMemberChange?.();
      } else {
        setError(res.error?.message || "Failed to remove member");
      }
    } catch {
      setError("Failed to remove member");
    }
  };

  if (!open) return null;

  const canManage = userRole === "owner";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Share Document</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-900">{documentTitle}</h3>
          <p className="text-xs text-gray-500">
            Share this document with other users
          </p>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded bg-red-100 border border-red-400 text-sm text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 p-3 rounded bg-green-100 border border-green-400 text-sm text-green-800">
            {success}
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Members</h4>
          {loading ? (
            <p className="text-sm text-gray-500">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-gray-500">No members yet</p>
          ) : (
            <ul className="space-y-2">
              {members.map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-900">{member.name}</span>
                    <span className="text-xs text-gray-500">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role !== "owner" && (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleUpdateRole(member.userId, e.target.value)
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    )}
                    {member.role !== "owner" && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {canManage && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Add Member</h4>
            <form onSubmit={handleAddMember} className="space-y-2">
              <div className="flex gap-2">
                <input
                  id="share-member-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  suppressHydrationWarning
                  placeholder="Email address"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(e.target.value as "editor" | "viewer")
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  disabled={adding || !newEmail.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Only document owners can add and manage members.
              </p>
            </form>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
