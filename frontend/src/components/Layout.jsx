import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'librarian', 'member'] },
  { to: '/profile', label: 'Profile', roles: ['admin', 'librarian', 'member'] },
  { to: '/books', label: 'Books', roles: ['admin', 'librarian', 'member'] },
  { to: '/loans', label: 'Loans', roles: ['admin', 'librarian'] },
  { to: '/reservations', label: 'Reservations', roles: ['admin', 'librarian'] }
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200">
          <Link to="/dashboard" className="flex items-center gap-2 text-primary font-semibold text-lg">
            📚 Library
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition ${
                    isActive ? 'bg-blue-50 text-primary' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-200 text-sm text-slate-600">
          <div className="font-semibold">{user?.name}</div>
          <div className="text-slate-500">{user?.role}</div>
          <button className="btn btn-ghost mt-3 w-full" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0">
          <div>
            <div className="text-slate-800 font-semibold">Welcome back</div>
            <div className="text-slate-500 text-sm">Track library operations</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              <span className="text-xs text-slate-500">{user?.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-semibold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

