import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Patent Review App</h2>
          <div className="mt-4">
            <p>{user?.name}</p>
            <button
              onClick={logout}
              className="mt-2 text-sm text-gray-300 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
} 