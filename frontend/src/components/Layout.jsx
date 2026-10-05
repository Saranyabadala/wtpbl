import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

function FloatingCart() {
  const { itemCount } = useCart();
  const location = useLocation();

  if (itemCount === 0 || location.pathname === '/cart' || location.pathname === '/checkout') return null;

  return (
    <div className="fixed bottom-[84px] sm:bottom-6 left-0 right-0 z-40 mx-4 sm:mx-auto max-w-2xl">
      <Link to="/cart" className="flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-700">
        <span>{itemCount} item{itemCount === 1 ? '' : 's'} added</span>
        <span className="flex items-center gap-2">View Cart <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></span>
      </Link>
    </div>
  );
}

function navClass({ isActive }) {
  return `flex flex-col items-center justify-center gap-1 sm:flex-row sm:justify-start sm:gap-2 sm:px-3 sm:py-2 text-[10px] sm:text-sm font-semibold transition ${
    isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
  }`;
}

function CartIcon({ count }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-sm">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a4.5 4.5 0 00-4.4 3.6A3.5 3.5 0 004 8.2V18a1 1 0 001 1h10a1 1 0 001-1V8.2a3.5 3.5 0 00-1.6-3.6A4.5 4.5 0 0010 2z" />
                </svg>
              </span>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">HealthPlate</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 sm:flex">
            <NavLink to="/" end className={navClass}>
              <span className="flex items-center gap-1.5 hover:text-brand-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </span>
            </NavLink>
            <NavLink to="/dishes" className={navClass}>
              <span className="flex items-center gap-1.5 hover:text-brand-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </span>
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/orders" className={navClass}>
                  <span className="flex items-center gap-1.5 hover:text-brand-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Orders
                  </span>
                </NavLink>
                <div className="group relative">
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {user?.name?.split(' ')[0] || 'Profile'}
                  </button>
                  <div className="absolute right-0 mt-2 hidden w-48 flex-col rounded-xl border border-slate-100 bg-white py-2 shadow-lg group-hover:flex">
                    <Link to="/profile" className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600">Health Profile</Link>
                    <button onClick={handleLogout} className="px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600">Sign Out</button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </Link>
            )}
            
            <Link to="/cart" aria-label={`Cart, ${itemCount} items`} className="flex items-center gap-1.5 text-slate-700 hover:text-brand-600">
              <CartIcon count={itemCount} />
              <span className="text-sm font-semibold">Cart</span>
            </Link>
          </nav>
          
          {/* Mobile Profile Icon */}
          <div className="flex items-center gap-4 sm:hidden">
            {isAuthenticated ? (
              <Link to="/profile" className="text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            ) : (
              <Link to="/login" className="text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 sm:pb-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#111] text-white pt-16 pb-28 sm:pb-16 border-t border-slate-800 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-tight">About HealthPlate</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-brand-500 transition-colors">HealthPlate</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">About Us</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Our Mission</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Contact Us</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-tight">For Users</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Explore Restaurants</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Healthy Dishes</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Health Filters</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">My Orders</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Help & Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-tight">For Restaurants</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Partner With Us</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Restaurant Dashboard</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">List Your Restaurant</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Restaurant Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-tight">Learn More</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Terms of Service</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Cookie Policy</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">FAQs</Link></li>
                <li><Link to="/" className="hover:text-brand-500 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-tight">Social Links</h3>
              <ul className="space-y-3 text-sm text-gray-400 mb-6">
                <li><a href="#" className="hover:text-brand-500 transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">YouTube</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">X/Twitter</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Facebook</a></li>
              </ul>
              <div className="flex flex-col gap-3">
                <button className="bg-black border border-gray-700 hover:border-brand-500 rounded-lg px-4 py-2 flex items-center gap-2 transition-colors">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.14 1.36-.37 2.45-1.12 3.22-.73.8-1.92 1.43-3 1.36-.17-1.32.48-2.29 1.18-3.08z"/></svg>
                  <div className="text-left"><div className="text-[10px] leading-none text-gray-400">Download on the</div><div className="text-sm font-semibold leading-none">App Store</div></div>
                </button>
                <button className="bg-black border border-gray-700 hover:border-brand-500 rounded-lg px-4 py-2 flex items-center gap-2 transition-colors">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M20.2 12.7L5.5 21.6c-.6.4-1.5 0-1.5-.7V3.1c0-.7.9-1.1 1.5-.7l14.7 8.9c.5.3.5 1.1 0 1.4zM5.5 4.3v15.4L18.1 12 5.5 4.3z"/></svg>
                  <div className="text-left"><div className="text-[10px] leading-none text-gray-400">GET IT ON</div><div className="text-sm font-semibold leading-none">Google Play</div></div>
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sm text-gray-500 shrink-0">
              © 2026 HealthPlate. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 sm:text-right max-w-xl">
              HealthPlate helps users discover food based on dietary preferences and health-related filters. Always verify ingredients and nutritional information with the restaurant.
            </p>
          </div>
        </div>
      </footer>
      
      <FloatingCart />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] sm:hidden">
        <NavLink to="/" end className={navClass}>
          <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </NavLink>
        <NavLink to="/dishes" className={navClass}>
          <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search</span>
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/orders" className={navClass}>
            <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Orders</span>
          </NavLink>
        )}
        <NavLink to={isAuthenticated ? "/profile" : "/login"} className={navClass}>
          <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
