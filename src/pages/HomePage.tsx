import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import CurrencySelector from '../components/CurrencySelector';
import { useCart } from '../context/CartContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const [hoveredPanel, setHoveredPanel] = useState<'kids' | 'juniors' | null>(null);

  return (
    <main
      id="homepage-split-container"
      className="relative w-screen h-screen overflow-hidden flex flex-col md:flex-row select-none"
    >
      {/* Floating Top Brand Identity Bar */}
      <header className="absolute top-0 inset-x-0 z-30 px-6 py-5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Brand mark */}
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm">
            <span className="font-logo font-bold text-lg tracking-tight">MM</span>
          </div>
          <span className="font-logo font-bold text-xl sm:text-2xl text-white drop-shadow-xs tracking-tight">
            Mani Minars
          </span>
        </div>

        {/* Quick Nav & Bag Button */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <Link
            to="/new-arrivals"
            className="hidden sm:inline-flex text-xs font-semibold text-white/90 hover:text-white px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/20"
          >
            New Arrivals
          </Link>
          <Link
            to="/about"
            id="homepage-top-about-btn"
            className="hidden sm:inline-flex text-xs font-semibold text-white/90 hover:text-white px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/20"
          >
            About
          </Link>

          {/* Bag button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={`Shopping bag with ${totalItems} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#1E1E1E] text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* LEFT PANEL: Little Loom Kids (Bright Coral-Red) */}
      <section
        id="panel-little-loom-kids"
        onMouseEnter={() => setHoveredPanel('kids')}
        onMouseLeave={() => setHoveredPanel(null)}
        onClick={() => navigate('/kids')}
        className={`relative flex-1 h-[50vh] md:h-full flex items-center justify-center cursor-pointer transition-all duration-500 ease-out overflow-hidden ${
          hoveredPanel === 'kids'
            ? 'bg-[#E33E2E] md:flex-[1.08]'
            : hoveredPanel === 'juniors'
            ? 'bg-[#D43F30] md:flex-[0.92]'
            : 'bg-[#E84D3D]'
        }`}
      >
        {/* Subtle decorative background motif */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
          <svg className="w-[120%] h-[120%]" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>

        {/* Center Content */}
        <div
          className={`relative z-10 flex flex-col items-center text-center px-6 transition-transform duration-500 ease-out ${
            hoveredPanel === 'kids' ? 'scale-105' : 'scale-100'
          }`}
        >
          {/* Original Handwritten-style Brand Mark & Logo */}
          <div className="mb-3 flex items-center justify-center">
            {/* Playful kite SVG icon */}
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-white/90 drop-shadow-sm mb-2 animate-bounce-subtle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3 8 8-8 10-8-10Z" />
              <path d="M12 3v18" />
              <path d="M4 11h16" />
              <path d="m14 21 2 2" />
              <path d="m10 21-2 2" />
            </svg>
          </div>

          <h2
            id="kids-logo-heading"
            className="font-handwritten text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide leading-tight drop-shadow-sm"
          >
            Little Loom Kids
          </h2>

          {/* Age indicator */}
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-bold tracking-[0.25em] text-white/90 uppercase font-sans">
            0–10 YEARS
          </p>

          <p className="mt-1 text-xs text-white/80 font-medium max-w-xs hidden sm:block">
            Soft, joyful organic cotton essentials for toddlers & growing explorers.
          </p>

          {/* Outlined Button with border animation */}
          <div className="mt-6 sm:mt-8">
            <button
              id="shop-kids-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/kids');
              }}
              className="group/btn relative px-7 sm:px-9 py-3 sm:py-3.5 rounded-full border-2 border-white text-white font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 overflow-hidden hover:bg-white hover:text-[#E84D3D] shadow-md focus:outline-none focus:ring-4 focus:ring-white/40"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>SHOP KIDS</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Panel Hover Ambient Glow */}
        <div
          className={`absolute inset-0 bg-white/5 pointer-events-none transition-opacity duration-300 ${
            hoveredPanel === 'kids' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </section>

      {/* SUBTLE VERTICAL DIVIDER (Desktop) / HORIZONTAL DIVIDER (Mobile) */}
      <div className="relative z-20 w-full h-[1px] md:w-[1.5px] md:h-full bg-white/25 backdrop-blur-md shadow-xs pointer-events-none" />

      {/* RIGHT PANEL: Little Loom Juniors (Warm Sunny-Yellow) */}
      <section
        id="panel-little-loom-juniors"
        onMouseEnter={() => setHoveredPanel('juniors')}
        onMouseLeave={() => setHoveredPanel(null)}
        onClick={() => navigate('/juniors')}
        className={`relative flex-1 h-[50vh] md:h-full flex items-center justify-center cursor-pointer transition-all duration-500 ease-out overflow-hidden ${
          hoveredPanel === 'juniors'
            ? 'bg-[#EDB125] md:flex-[1.08]'
            : hoveredPanel === 'kids'
            ? 'bg-[#E5AA20] md:flex-[0.92]'
            : 'bg-[#F5BE38]'
        }`}
      >
        {/* Subtle decorative background motif */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
          <svg className="w-[120%] h-[120%]" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50 0, 100 50, 50 100, 0 50" />
          </svg>
        </div>

        {/* Center Content */}
        <div
          className={`relative z-10 flex flex-col items-center text-center px-6 transition-transform duration-500 ease-out ${
            hoveredPanel === 'juniors' ? 'scale-105' : 'scale-100'
          }`}
        >
          {/* Bold Modern Display Icon */}
          <div className="mb-3 flex items-center justify-center">
            {/* Geometric lightning / dynamic chevron */}
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-[#1E1E1E]/90 drop-shadow-sm mb-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>

          <h2
            id="juniors-logo-heading"
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#1E1E1E] tracking-wider leading-none drop-shadow-xs uppercase"
          >
            Little Loom Juniors
          </h2>

          {/* Age indicator */}
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-bold tracking-[0.25em] text-[#1E1E1E]/90 uppercase font-sans">
            11–16 YEARS
          </p>

          <p className="mt-1 text-xs text-[#1E1E1E]/80 font-medium max-w-xs hidden sm:block">
            Varsity jackets, relaxed cargos & trend-forward junior streetwear.
          </p>

          {/* Outlined Button with border animation */}
          <div className="mt-6 sm:mt-8">
            <button
              id="shop-juniors-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/juniors');
              }}
              className="group/btn relative px-7 sm:px-9 py-3 sm:py-3.5 rounded-full border-2 border-[#1E1E1E] text-[#1E1E1E] font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 overflow-hidden hover:bg-[#1E1E1E] hover:text-[#F5BE38] shadow-md focus:outline-none focus:ring-4 focus:ring-black/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>SHOP JUNIORS</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Panel Hover Ambient Glow */}
        <div
          className={`absolute inset-0 bg-black/5 pointer-events-none transition-opacity duration-300 ${
            hoveredPanel === 'juniors' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </section>

      {/* LOWER-LEFT CORNER: Currency Selector showing PKR */}
      <div className="absolute bottom-5 left-5 z-30 flex items-center gap-2">
        <CurrencySelector />
        <span className="hidden sm:inline-block text-[11px] font-semibold text-white/75 drop-shadow-xs">
          Pakistan Delivery
        </span>
      </div>

      {/* LOWER-RIGHT CORNER: Sale & Help Tags (positioned safely to the left of the floating Contact Us button) */}
      <div className="absolute bottom-5 right-36 sm:right-40 z-30 flex items-center gap-2.5 text-xs font-semibold text-[#1E1E1E]/80">
        <Link
          to="/sale"
          id="homepage-bottom-sale-btn"
          className="px-3.5 py-1.5 rounded-full bg-[#E84D3D] text-white hover:bg-[#d63b2c] backdrop-blur-md transition-all border border-white/30 shadow-xs font-bold"
        >
          Sale
        </Link>
        <Link
          to="/contact"
          className="px-3 py-1.5 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md text-[#1E1E1E] transition-all border border-black/10"
        >
          Help
        </Link>
      </div>
    </main>
  );
};

export default HomePage;
