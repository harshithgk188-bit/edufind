import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  MapPin, 
  Scale, 
  Sparkles, 
  Heart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Bot,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { useFavorites } from '../../context/FavoritesContext';

export default function Navbar({ onOpenAiChat }) {
  const { user, logout, isSuperAdmin, isCollegeAdmin } = useAuth();
  const { count: compareCount } = useCompare();
  const { count: favCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Colleges', path: '/colleges' },
    { name: 'Districts', path: '/districts' },
    { name: 'Recommendations', path: '/recommendations' },
    { name: 'Compare', path: '/compare', badge: compareCount },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                EduFind
              </span>
              <span className="hidden sm:block text-[10px] tracking-wider uppercase font-semibold text-indigo-600 -mt-1">
                College Discovery System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
                {link.badge > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full bg-indigo-600 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-200/60 shadow-sm"
            >
              <Bot className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>AI Assistant</span>
            </button>
          </div>

          {/* Right Action Icons & User Account */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Favorites Icon */}
            <Link
              to="/favorites"
              className="relative p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="My Favorites"
            >
              <Heart className="w-5 h-5" />
              {favCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                {/* Admin Portals */}
                {isSuperAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors border border-amber-300"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Admin Panel
                  </Link>
                )}
                {isCollegeAdmin && (
                  <Link
                    to="/college-admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-900 hover:bg-purple-200 transition-colors border border-purple-300"
                  >
                    <Building className="w-4 h-4 text-purple-700" />
                    College Portal
                  </Link>
                )}

                {/* User Dropdown / Greeting */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight truncate max-w-[100px]">{user.name}</p>
                    <p className="text-slate-500 capitalize text-[10px]">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={onOpenAiChat}
              className="p-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
              title="AI Assistant"
            >
              <Bot className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex justify-between items-center px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <span>{link.name}</span>
              {link.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-600 text-white">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <Link
            to="/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className="flex justify-between items-center px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600"
          >
            <span>My Saved Favorites</span>
            {favCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                {favCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="px-3 py-2 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              {isSuperAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold bg-amber-50 text-amber-800"
                >
                  Super Admin Dashboard
                </Link>
              )}
              {isCollegeAdmin && (
                <Link
                  to="/college-admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold bg-purple-50 text-purple-800"
                >
                  College Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
