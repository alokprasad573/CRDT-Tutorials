"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppAuth } from "@/lib/auth-provider";

export function AppSidebar() {
  const { user, logout } = useAppAuth();
  const router = useRouter();

  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r border-gray-200 bg-gray-50">
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-600">C</span>
          <span className="text-lg font-bold text-gray-900">CollabNote</span>
        </Link>
      </div>

      <nav className="p-4 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600/10 text-indigo-600 font-medium"
        >
          <span className="w-5 text-center">📄</span>
          Documents
        </Link>
      </nav>

      <div className="mt-auto p-6 border-t border-gray-200">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate max-w-37.5">
            {user?.email}
          </p>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
