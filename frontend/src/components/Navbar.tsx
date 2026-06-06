import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Dumbbell, ShoppingCart, User as UserIcon, LogOut, Menu, X, LayoutDashboard, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { cart, user, logout, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.length;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    ...(user ? [{ name: 'Portal', path: '/dashboard' }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/5 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-brand-neon p-2 rounded-xl text-black transition-transform duration-300 group-hover:rotate-12">
            <Dumbbell className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-white">
            FIT<span className="text-brand-neon text-glow-neon">SPHERE</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium tracking-wide text-sm transition-all duration-300 hover:text-brand-neon ${
                  isActive ? 'text-brand-neon text-glow-neon' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Actions (Theme, Cart, Profile / Auth) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-brand-neon hover:text-brand-neon transition-all duration-300"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link
            to="/cart"
            className="relative p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-brand-neon hover:text-brand-neon transition-all duration-300 group"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-neon text-black text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-bg-dark animate-pulse-slow">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-white/20"
                />
                <span className="text-sm font-semibold text-white max-w-[120px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-brand-red/10 hover:border-brand-red hover:text-brand-red transition-all duration-300"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-neon text-black font-semibold text-sm hover:scale-[1.03] transition-all duration-300 shadow-[0_0_20px_rgba(184,255,34,0.2)] hover:shadow-[0_0_30px_rgba(184,255,34,0.4)]"
            >
              <UserIcon className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <Link
            to="/cart"
            className="relative p-2 rounded-full bg-white/5 border border-white/10 text-white"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-neon text-black text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-bg-dark/95 border-b border-white/5 px-6 py-6 flex flex-col gap-6 backdrop-blur-xl animate-fade-in">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-medium py-1 transition-all ${
                  location.pathname === link.path ? 'text-brand-neon' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <hr className="border-white/5" />

          {user ? (
            <div className="flex flex-col gap-4">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-1"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover border border-white/15"
                />
                <div>
                  <div className="text-white font-semibold">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
              </Link>
              <div className="flex gap-3">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="flex-1 py-3 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-neon text-black font-semibold text-sm shadow-[0_0_15px_rgba(184,255,34,0.15)]"
            >
              <UserIcon className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
