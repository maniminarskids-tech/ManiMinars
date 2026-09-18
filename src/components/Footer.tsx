import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Check, Heart, ShieldCheck, Truck, RefreshCw, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer id="main-footer" className="bg-[#1E1E1E] text-white pt-14 pb-10 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 mb-12 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-[#E84D3D] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">Free Nationwide Delivery</h5>
              <p className="text-xs text-neutral-400">On all orders above PKR 4,000</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-[#F5BE38] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">14-Day Easy Exchange</h5>
              <p className="text-xs text-neutral-400">Hassle-free size and style swaps</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-[#7E9F85] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">Cash on Delivery (COD)</h5>
              <p className="text-xs text-neutral-400">Pay at your doorstep anywhere in Pakistan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-pink-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">100% Breathable Cotton</h5>
              <p className="text-xs text-neutral-400">Crafted tenderly for sensitive young skin</p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E84D3D] to-[#F5BE38] flex items-center justify-center text-white font-bold font-logo text-base">
                MM
              </div>
              <span className="font-logo font-bold text-2xl tracking-tight text-white">
                Mani Minars
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Stylish, comfortable clothing for children across Pakistan. From newborn cuddles to teenage street trends, we weave playfulness and lasting comfort into every stitch.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-neutral-400">
              <span className="inline-flex items-center gap-1.5 bg-neutral-800 px-2.5 py-1 rounded-md text-white font-medium">
                Currency: PKR
              </span>
              <span>Karachi • Lahore • Islamabad</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-sans">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link to="/kids" className="hover:text-[#E84D3D] transition-colors">
                  Little Loom Kids (0–10Y)
                </Link>
              </li>
              <li>
                <Link to="/juniors" className="hover:text-[#F5BE38] transition-colors">
                  Little Loom Juniors (11–16Y)
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/sale" className="text-[#E84D3D] hover:underline font-semibold">
                  Sale & Clearance
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-sans">
              Help & Support
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Brand
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Customer Care
                </Link>
              </li>
              <li>
                <span className="text-neutral-400">Delivery: Trax & TCS Express</span>
              </li>
              <li>
                <a
                  href="https://wa.me/923046466815"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Helpline: +923046466815
                </a>
              </li>
              <li>
                <a
                  href="mailto:maniminarskids@gmail.com"
                  className="hover:text-white transition-colors truncate block"
                >
                  maniminarskids@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-sans">
              Mani Minars Club
            </h4>
            <p className="text-xs text-neutral-400 mb-3">
              Subscribe for exclusive secret drop alerts and 10% off your first order.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-1.5 text-xs text-green-400 font-semibold bg-neutral-800 p-2.5 rounded-xl">
                <Check className="w-4 h-4" />
                <span>Thank you! Welcome to the family.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="parent@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 outline-none focus:border-[#E84D3D]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#E84D3D] hover:bg-[#DF3E2E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Join Club
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Methods */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} Mani Minars Clothing Co. All rights reserved.</p>
            <Link
              to="/admin"
              className="text-neutral-600 hover:text-neutral-400 transition-colors flex items-center gap-1 text-[11px]"
              title="Secret Admin Portal"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-semibold text-neutral-300">
              Cash on Delivery (COD)
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-semibold text-neutral-300">
              Visa / Mastercard
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-semibold text-neutral-300">
              JazzCash
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-semibold text-neutral-300">
              EasyPaisa
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
