"use client";

import Link from "next/link";
import { useAppAuth } from "@/lib/auth-provider";

export function AppHeader() {
  const { user } = useAppAuth();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">C</span>
            <span className="text-lg font-bold text-gray-900">CollabNote</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:block text-sm text-gray-500">
            {user?.email}
          </span>
          <Link href="/dashboard" className="hidden md:inline-block">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              New Document
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
