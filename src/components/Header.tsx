import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import SearchModal from './SearchModal';
import AccountModal from './AccountModal';

interface HeaderProps {
  currentCategory?: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Shop Kids', path: '/kids', age: '0–10Y', accent: '#E84D3D' },
    { name: 'Shop Juniors', path: '/juniors', age: '11–16Y', accent: '#F5BE38' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Sale', path: '/sale', isSale: true },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      {/* Top micro-bar: Shipping Notice */}
      <div className="bg-[#1E1E1E] text-white text-[11px] sm:text-xs tracking-wider uppercase py-1.5 px-4 text-center flex items-center justify-center gap-2 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#F5BE38]" />
        <span>Free nationwide delivery across Pakistan on orders over PKR 4,000</span>
        <span className="hidden md:inline text-white/50">•</span>
        <span className="hidden md:inline text-white/80">Cash on Delivery (COD) Available</span>
      </div>

      {/* Main Sticky Header */}
      <header
        id="main-header"
        className={`sticky top-0 z-40 transition-all duration-200 bg-white/95 backdrop-blur-md border-b ${
          isScrolled ? 'border-neutral-200/80 shadow-sm py-2.5' : 'border-neutral-200/50 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-neutral-800 hover:text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              id="header-brand-logo"
              className="group flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded-lg p-1"
            >
              {/* Original Brand Mark: geometric playful kite/monogram */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E84D3D] to-[#F5BE38] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <span className="font-logo font-bold text-base tracking-tighter">MM</span>
              </div>
              <div className="flex flex-col">
                <span className="font-logo font-bold text-xl tracking-tight text-[#1E1E1E] leading-none group-hover:text-[#E84D3D] transition-colors">
                  Mani Minars
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-neutral-400 leading-tight mt-0.5">
                  Little Loom Studios
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`relative px-3.5 py-2 text-sm font-medium transition-colors rounded-full flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#1E1E1E] bg-neutral-100 font-semibold'
                      : link.isSale
                      ? 'text-[#E84D3D] hover:bg-red-50 font-semibold'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.age && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-normal">
                      {link.age}
                    </span>
                  )}
                  {link.isSale && (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#E84D3D] text-white">
                      Sale
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Search Button */}
            <button
              id="header-search-btn"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
              aria-label="Search collections"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Button */}
            <button
              id="header-account-btn"
              onClick={() => setAccountOpen(true)}
              className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
              aria-label="User account"
              title="Account & Orders"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Shopping Bag Button */}
            <button
              id="header-cart-btn"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
              aria-label={`Shopping cart with ${totalItems} items`}
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span
                  id="header-cart-badge"
                  className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 bg-[#E84D3D] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse"
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 animate-in slide-in-from-top-2">
            <div className="space-y-1 mb-4">
              <Link
                to="/kids"
                className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 hover:bg-orange-50 text-neutral-900 border border-orange-100/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#E84D3D]"></span>
                  <span className="font-semibold text-base">Little Loom Kids</span>
                </div>
                <span className="text-xs bg-white text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200">
                  0–10 Years
                </span>
              </Link>
              <Link
                to="/juniors"
                className="flex items-center justify-between p-3 rounded-xl bg-yellow-50/50 hover:bg-yellow-50 text-neutral-900 border border-yellow-100/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#F5BE38]"></span>
                  <span className="font-semibold text-base">Little Loom Juniors</span>
                </div>
                <span className="text-xs bg-white text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200">
                  11–16 Years
                </span>
              </Link>
              <Link
                to="/new-arrivals"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 text-neutral-800 font-medium"
              >
                <span>New Arrivals</span>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </Link>
              <Link
                to="/sale"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-[#E84D3D] font-semibold"
              >
                <span>Sale & Special Offers</span>
                <span className="text-xs bg-[#E84D3D] text-white px-2 py-0.5 rounded">Up to 40%</span>
              </Link>
              <Link
                to="/about"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 text-neutral-800 font-medium"
              >
                <span>About Mani Minars</span>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </Link>
              <Link
                to="/contact"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 text-neutral-800 font-medium"
              >
                <span>Help & Contact</span>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </Link>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Currency: PKR (Pakistani Rupee)</span>
              <span>Nationwide Delivery</span>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AccountModal isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
};

export default Header;
