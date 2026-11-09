"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppAuth } from "@/lib/auth-provider";
import { documentsApi } from "@/lib/api";

type Document = {
  id: string;
  title: string;
  ownerId: string;
  role: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const { user } = useAppAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchDocs = async () => {
      try {
        const res = await documentsApi.list();
        if (!ignore) {
          if (res.success && res.data?.documents) {
            setDocuments(res.data.documents);
          } else {
            setError(res.error?.message || "Failed to load documents");
          }
        }
      } catch {
        if (!ignore) {
          setError("Failed to load documents");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetchDocs();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await documentsApi.create(newTitle.trim());
      if (res.success && res.data?.document) {
        setNewTitle("");
        setDocuments((prev) => [res.data!.document, ...prev]);
      } else {
        setError(res.error?.message || "Failed to create document");
      }
    } catch {
      setError("Failed to create document");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">
            Your documents and shared documents
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New document title"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={creating}
            required
          />
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-100 border border-red-400 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 text-lg">No documents yet</p>
            <p className="text-gray-400 mt-1">
              Create your first document to get started
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="group border border-gray-200 rounded-lg p-4 hover:border-indigo-600/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                  {doc.title}
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded bg-indigo-100 text-indigo-600">
                  {doc.role}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                {doc.ownerId === (user?.id || "") ? "You own this" : `Shared with you`}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Updated</span>
                <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
