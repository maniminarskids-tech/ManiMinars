import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Package, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'track'>('login');
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedMessage(`Welcome back! One-Time Password sent to ${phone || 'your phone number'}.`);
    setTimeout(() => {
      setSubmittedMessage('');
      onClose();
    }, 2000);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    const query = orderNumber.trim();
    if (query) {
      navigate(`/my-orders?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/my-orders');
    }
  };

  return (
    <div
      id="account-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="account-modal-content"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-[#E84D3D] flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-logo font-bold text-lg text-neutral-900">Mani Minars Account</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-neutral-100 mt-4">
            <button
              onClick={() => {
                setActiveTab('login');
                setSubmittedMessage('');
              }}
              className={`flex-1 py-2.5 text-xs uppercase font-bold tracking-wider text-center border-b-2 transition-colors ${
                activeTab === 'login'
                  ? 'border-[#E84D3D] text-[#E84D3D]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Sign In / Register
            </button>
            <button
              onClick={() => {
                setActiveTab('track');
                setSubmittedMessage('');
              }}
              className={`flex-1 py-2.5 text-xs uppercase font-bold tracking-wider text-center border-b-2 transition-colors ${
                activeTab === 'track'
                  ? 'border-[#E84D3D] text-[#E84D3D]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Track Order
            </button>
          </div>

          {submittedMessage ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-800 leading-relaxed">
                {submittedMessage}
              </p>
            </div>
          ) : activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (Pakistan)
                </label>
                <div className="flex rounded-xl border border-neutral-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#E84D3D] focus-within:border-transparent">
                  <span className="bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500 font-medium border-r border-neutral-200">
                    +92
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="300 1234567"
                    className="flex-1 px-3 py-2.5 text-sm outline-none bg-white text-neutral-900"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  We'll send you an instant SMS verification code.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#1E1E1E] hover:bg-black text-white text-sm font-semibold transition-colors shadow-sm"
              >
                Continue with OTP
              </button>

              <div className="pt-3 text-center text-xs text-neutral-400">
                <span>By continuing, you agree to Mani Minars terms & conditions.</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleTrackSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Order ID or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. MM-94821 or 0300 1234567"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] focus:border-transparent text-neutral-900"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Find orders placed using your contact details or Order receipt number.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#E84D3D] hover:bg-[#DF3E2E] text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Track Order Live</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/my-orders');
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline font-medium cursor-pointer"
                >
                  Go to All My Orders Tracker Page
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
