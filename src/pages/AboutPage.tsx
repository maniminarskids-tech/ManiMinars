import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Sparkles, Heart, ShieldCheck, Truck, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-[#E84D3D] via-[#F16556] to-[#F5BE38] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full mb-4">
              Our Story & Philosophy
            </span>
            <h1 className="font-logo text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Crafted for Childhood in Pakistan
            </h1>
            <p className="text-white/95 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              At Mani Minars, we believe children’s fashion should be as joyful, comfortable, and durable as childhood itself.
            </p>
          </div>
        </section>

        {/* Narrative & Two Lines */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E84D3D]">
                Rooted in Craftsmanship
              </span>
              <h2 className="font-logo font-bold text-2xl sm:text-3xl text-neutral-900 mt-2 mb-4">
                Born in Lahore, Loved Nationwide
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Pakistan produces some of the world's most luxurious long-staple cotton, yet parents frequently struggled to find children's apparel that matched international minimalist aesthetics without compromising on daily resilience.
              </p>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Mani Minars bridges that gap with two distinct sub-collections tailored specifically for the physiological and stylistic needs of distinct age chapters: Little Loom Kids and Little Loom Juniors.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[#E84D3D] text-white space-y-3">
                <span className="font-handwritten text-3xl font-bold block">Little Loom Kids</span>
                <span className="text-xs font-bold tracking-widest uppercase opacity-90 block">0–10 Years</span>
                <p className="text-xs text-white/80 leading-relaxed">
                  Ultra-soft combed slubs, gentle organic knits, and scratch-free seams for messy, laughter-filled discovery.
                </p>
                <Link
                  to="/kids"
                  className="inline-flex items-center gap-1 text-xs font-bold underline pt-2"
                >
                  Shop Kids <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-[#F5BE38] text-neutral-900 space-y-3">
                <span className="font-display text-3xl font-black uppercase tracking-wider block">
                  Little Loom Juniors
                </span>
                <span className="text-xs font-bold tracking-widest uppercase opacity-90 block">
                  11–16 Years
                </span>
                <p className="text-xs text-neutral-800 leading-relaxed">
                  Boxy drop-shoulder tees, heavy-duty cargo joggers, and varsity jackets made for growing individuality.
                </p>
                <Link
                  to="/juniors"
                  className="inline-flex items-center gap-1 text-xs font-bold underline pt-2"
                >
                  Shop Juniors <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-neutral-200">
            <div className="p-6 bg-white rounded-2xl border border-neutral-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#E84D3D] flex items-center justify-center mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-logo font-bold text-base text-neutral-900">100% Breathable Cotton</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                We exclusively use combed long-staple cotton yarn knit to specific GSMs suited for Pakistan’s climate.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 text-[#F5BE38] flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-logo font-bold text-base text-neutral-900">Childhood Resilience</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Reinforced bar-tacking, double-stitched knee panels, and pre-shrunk washes withstand daily machine laundering.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-logo font-bold text-base text-neutral-900">Fast Nationwide Delivery</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Tracked shipping to over 250 cities, towns, and villages across all four provinces with hassle-free exchanges.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
