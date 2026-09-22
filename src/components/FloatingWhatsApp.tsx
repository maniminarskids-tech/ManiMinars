import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { MANI_MINARS_WHATSAPP_NUMBER } from '../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const directChatUrl = `https://wa.me/${MANI_MINARS_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Assalam-o-Alaikum Mani Minars! 👋 I am browsing your store and would like some assistance with sizes and ordering.'
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-auto">
      {/* Popover Bubble */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-xl border border-neutral-100 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between pb-2 border-b border-neutral-100 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                MM
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Mani Minars Care</h4>
                <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Online for Direct Orders
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
            Need urgent sizing advice or want to place your order directly via WhatsApp?
          </p>

          <a
            href={directChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat & Order on WhatsApp</span>
          </a>
        </div>
      )}

      {/* Floating Pill/Button */}
      <button
        id="floating-whatsapp-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
        aria-label="Direct WhatsApp Order and Support"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline font-semibold">Order via WhatsApp</span>
        <span className="sm:hidden font-semibold">WhatsApp</span>
      </button>
    </div>
  );
};

export default FloatingWhatsApp;
