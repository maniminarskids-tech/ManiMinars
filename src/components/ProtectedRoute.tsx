import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import {
  authenticateAdmin,
  verifyCurrentSession,
  getLockoutState,
  logoutAdmin,
  LockoutState,
} from '../utils/security';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => verifyCurrentSession());
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockout, setLockout] = useState<LockoutState>(() => getLockoutState());

  // Periodically update lockout timer if locked
  useEffect(() => {
    if (!lockout.isLocked) return;

    const interval = setInterval(() => {
      const current = getLockoutState();
      setLockout(current);
      if (!current.isLocked) {
        setAuthError(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockout.isLocked]);

  // Check session expiration every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (!verifyCurrentSession()) {
        setIsAuthenticated(false);
        setAuthError('Your session has expired. Please sign in again.');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockout.isLocked) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await authenticateAdmin(passcodeInput);
      if (res.success) {
        setIsAuthenticated(true);
        setPasscodeInput('');
      } else {
        setAuthError(res.error || 'Authentication failed.');
        setLockout(getLockoutState());
      }
    } catch {
      setAuthError('An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient header */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#E84D3D] via-[#F5BE38] to-[#25D366]" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#F5BE38]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-logo text-xl font-bold text-white tracking-wide">
              Mani Minars Portal
            </h2>
            <p className="text-xs text-neutral-400">Restricted Store Management Area</p>
          </div>
        </div>

        {lockout.isLocked ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
            <h4 className="text-sm font-bold text-red-200">Security Cooldown Active</h4>
            <p className="text-xs text-red-300/80">
              Multiple unsuccessful attempts detected. Gateway locked for{' '}
              <span className="font-bold text-white text-sm">{lockout.remainingSeconds}s</span>.
            </p>
          </div>
        ) : authError ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 mb-6 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200 leading-relaxed">{authError}</p>
          </div>
        ) : (
          <div className="bg-neutral-800/60 rounded-2xl p-3.5 mb-6 flex items-center gap-2.5 border border-neutral-700/50">
            <ShieldCheck className="w-4 h-4 text-[#25D366] shrink-0" />
            <p className="text-xs text-neutral-300">
              SHA-256 encrypted authentication & timed session tokens.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Admin Passcode
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                disabled={lockout.isLocked || isSubmitting}
                placeholder="Enter authorized credentials..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#E84D3D] focus:border-transparent transition-all pr-10 disabled:opacity-50"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={lockout.isLocked || isSubmitting || !passcodeInput.trim()}
            className="w-full py-3 px-4 rounded-xl bg-[#E84D3D] hover:bg-[#DF3E2E] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {isSubmitting ? (
              <span>Verifying Hash...</span>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-neutral-800 text-center">
          <a
            href="/"
            className="text-xs text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1"
          >
            ← Return to Mani Minars Storefront
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;
