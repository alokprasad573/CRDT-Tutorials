import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-sm border border-gray-200 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CollabNote</h1>
        <p className="text-gray-500 mb-6">
          Real-time collaborative text editor
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="block w-full border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 text-gray-900 px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
