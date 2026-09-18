import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currency, setCurrency] = useState('PKR');

  const currencies = [
    { code: 'PKR', label: 'Pakistani Rupee', symbol: 'Rs', flag: '🇵🇰' },
    { code: 'USD', label: 'US Dollar (Intl Shipping)', symbol: '$', flag: '🇺🇸' },
    { code: 'AED', label: 'UAE Dirham (GCC Delivery)', symbol: 'AED', flag: '🇦🇪' },
    { code: 'GBP', label: 'British Pound (UK Diaspora)', symbol: '£', flag: '🇬🇧' },
  ];

  return (
    <div className="relative inline-block text-left z-30">
      <button
        id="currency-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md text-white text-xs font-semibold tracking-wider transition-all border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Select currency, currently PKR"
      >
        <span className="text-sm">🇵🇰</span>
        <span>{currency}</span>
        <ChevronDown className="w-3 h-3 text-white/80" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-56 rounded-2xl bg-white shadow-2xl border border-neutral-100 p-2 text-neutral-800 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1.5 border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Select Billing Currency
            </div>
            <div className="space-y-1 mt-1">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currency === c.code
                      ? 'bg-neutral-100 text-neutral-900 font-bold'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                    <span className="text-[10px] text-neutral-400">({c.symbol})</span>
                  </div>
                  {currency === c.code && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                </button>
              ))}
            </div>
            <div className="p-2 mt-1 bg-neutral-50 rounded-xl text-[10px] text-neutral-500 text-center">
              All store orders are fulfilled in Pakistan in PKR.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySelector;
