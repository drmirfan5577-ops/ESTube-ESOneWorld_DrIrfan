import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Footer from './Footer';

export default function Layout() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">▶</div>
          <div>
            <h1 className="text-lg font-bold leading-none">ESTube</h1>
            <p className="text-[10px] text-gray-500">A project of ESOneWorld</p>
          </div>
        </Link>
        <nav className="flex gap-2 text-sm">
          <Link to="/upload" className="px-3 py-1 bg-blue-600 text-white rounded"> Upload</Link>
          <Link to="/live" className="px-3 py-1 bg-red-600 text-white rounded">🔴 Live</Link>
          <Link to="/messages" className="px-3 py-1 bg-green-600 text-white rounded">💬 Chat</Link>
          <Link to="/call" className="px-3 py-1 bg-purple-600 text-white rounded">📹 Call</Link>
          {user?.is_admin && <Link to="/admin" className="px-3 py-1 bg-yellow-600 text-white rounded">👑 Admin</Link>}
          {user ? <button onClick={signOut} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">Sign Out</button>
                : <Link to="/signin" className="px-3 py-1 bg-red-600 text-white rounded">Sign In</Link>}
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6"><Outlet /></main>
      <Footer />
    </div>
  );
}