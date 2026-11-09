"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { HocuspocusProvider } from "@hocuspocus/provider";
import type { useEditor } from "@tiptap/react";
import { useAppAuth } from "@/lib/auth-provider";
import { documentsApi } from "@/lib/api";
import { RichTextEditor, EditorToolbar } from "@/components/editor/rich-text-editor";
import { ShareDialog } from "@/components/sharing/share-dialog";
import { CollaboratorPresence } from "@/components/collaboration/collaborator-presence";

const COLLABORATION_URL =
  process.env.NEXT_PUBLIC_COLLABORATION_URL ||
  "ws://localhost:4000/collaboration";

export default function DocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, logout } = useAppAuth();
  const router = useRouter();
  const [document, setDocument] = useState<{
    id: string;
    title: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [editorInstance, setEditorInstance] = useState<
    ReturnType<typeof useEditor> | null
  >(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Yjs document and awareness state for rendering
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [awareness, setAwareness] = useState<Awareness | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchDoc = async () => {
      try {
        const { id } = await params;
        const res = await documentsApi.get(id);
        if (!ignore) {
          if (res.success && res.data?.document) {
            setDocument(res.data.document);
            setNewTitle(res.data.document.title);
            setContent("");
          } else {
            setError(res.error?.message || "Failed to load document");
            if (
              res.error?.code === "DOCUMENT_NOT_FOUND" ||
              res.error?.code === "FORBIDDEN"
            ) {
              router.push("/dashboard");
            }
          }
        }
      } catch {
        if (!ignore) {
          setError("Failed to load document");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetchDoc();
    return () => {
      ignore = true;
    };
  }, [params, router]);

  // Set up Yjs + Hocuspocus collaboration when document is loaded
  useEffect(() => {
    if (!document) return;

    let cancelled = false;
    const documentId = document.id;
    const docName = `document:${documentId}`;

    // Create Yjs document
    const newYdoc = new Y.Doc();
    const newAwareness = new Awareness(newYdoc);

    Promise.resolve().then(() => {
      if (!cancelled) {
        setYdoc(newYdoc);
        setAwareness(newAwareness);
      }
    });

    // Set local awareness state with user info
    if (user) {
      newAwareness.setLocalStateField("user", {
        name: user.name,
        email: user.email,
        color: "#4f46e5",
      });
    }

    // Create Hocuspocus provider
    const provider = new HocuspocusProvider({
      url: COLLABORATION_URL,
      name: docName,
      document: newYdoc,
      awareness: newAwareness,
      token: null, // Authentication via session cookie (handled by backend)
      sessionAwareness: false,
    });
    providerRef.current = provider;

    provider.on("status", ({ status }: { status: string }) => {
      if (status === "connected") {
        setConnectionStatus("connected");
      } else if (status === "disconnected") {
        setConnectionStatus("disconnected");
      }
    });

    provider.on("authenticated", () => {
      setConnectionStatus("connected");
    });

    provider.on("authenticationFailed", () => {
      setConnectionStatus("disconnected");
      setError("Authentication failed for collaboration");
    });

    // Sync Yjs content changes to React state
    newYdoc.on("update", () => {
      const yText = newYdoc.getText("content");
      setContent(yText.toString());
    });

    Promise.resolve().then(() => {
      if (!cancelled) {
        const yText = newYdoc.getText("content");
        if (yText.length > 0) {
          setContent(yText.toString());
        }
      }
    });

    return () => {
      cancelled = true;
      provider.destroy();
      newYdoc.destroy();
      newAwareness.destroy();
      providerRef.current = null;
      setYdoc(null);
      setAwareness(null);
    };
  }, [document, user]);

  const handleRename = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { id } = await params;
      const res = await documentsApi.updateTitle(id, newTitle.trim());
      if (res.success && res.data?.document) {
        setDocument((prev) =>
          prev ? { ...prev, title: res.data!.document.title } : prev
        );
      } else {
        setError(res.error?.message || "Failed to rename document");
      }
    } catch {
      setError("Failed to rename document");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm("Are you sure you want to delete this document?")
    ) {
      return;
    }
    try {
      const { id } = await params;
      const res = await documentsApi.delete(id);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error?.message || "Failed to delete document");
      }
    } catch {
      setError("Failed to delete document");
    }
  };

  const handleContentChange = (html: string) => {
    setContent(html);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-500">Loading document...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const canEdit = document.role === "owner" || document.role === "editor";

  return (
    <>
      <div className="flex flex-col h-full bg-white">
        <header className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-500 hover:text-gray-900"
            >
              ← Back
            </button>
            <form onSubmit={handleRename} className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={!canEdit || saving}
                className={`border border-transparent rounded-lg px-3 py-1.5 text-lg font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-colors ${
                  canEdit
                    ? "border-gray-200 hover:border-indigo-600"
                    : "text-gray-500"
                }`}
                placeholder="Untitled document"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium px-2 py-1 rounded bg-indigo-100 text-indigo-600">
              {document.role}
            </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                connectionStatus === "connected"
                  ? "bg-green-100 text-green-700"
                  : connectionStatus === "disconnected"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {connectionStatus}
            </span>
            {awareness && (
              <CollaboratorPresence
                awareness={awareness}
                localClientId={awareness.clientID}
              />
            )}
            <button
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Sign out
            </button>
            {canEdit && (
              <>
                <button
                  onClick={() => setShareOpen(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Share
                </button>
                <button
                  onClick={handleDelete}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </header>

        {/* Editor toolbar — rendered when editor instance is available */}
        {editorInstance && canEdit && (
          <div className="border-b border-gray-200 bg-gray-50">
            <EditorToolbar editor={editorInstance} />
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="h-full w-full max-w-3xl mx-auto p-8 bg-white">
            {canEdit ? (
              <RichTextEditor
                initialContent={content}
                editable
                onUpdate={handleContentChange}
                onEditorCreated={setEditorInstance}
                ydoc={ydoc || undefined}
                awareness={awareness}
                collaborationEnabled
              />
            ) : (
              <div className="border border-gray-200 rounded-lg min-h-100 flex items-center justify-center text-gray-400">
                <p>
                  View-only mode. You do not have edit access to this document.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareDialog
        documentId={document.id}
        documentTitle={document.title}
        userRole={document.role}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        onMemberChange={() => {
          // Refresh member list when sharing changes
        }}
      />
    </>
  );
}
