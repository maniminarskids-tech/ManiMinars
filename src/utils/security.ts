/**
 * Production Security & Cryptographic Utilities
 *
 * Implements Web Crypto API (SHA-256) password verification,
 * brute-force rate-limiting, and timed session validation.
 */

// Authorized Admin Passcode
export const ADMIN_PASSCODE = 'Mani2026';

// Primary SHA-256 hash for 'Mani2026'
const ADMIN_PASSCODE_HASH = '2f13adc16efbda149cc82f0ff0e389620d6641c73b174df6aa2e197c2772a4ad';
// Case-insensitive hash for 'mani2026'
const DEFAULT_ADMIN_HASH = '1077323a9b0e14e2cd222b243f03ca82302cfa67a612a7367bf3794b5f307c4a';
// Legacy hash compatibility
const LEGACY_ADMIN_HASH = '24203e2c65757788fa298198f828a2a53d368e7ec8151dc5316dbb69fffa3dd0';
// Alternative hash for secondary store manager ('minars815')
const SECONDARY_ADMIN_HASH = 'e8204aa7cfeb79ad4611d29bf708ee6b44a2c09fb0fa4b1b31a31d45464cb3d1';

const AUTH_STORAGE_KEY = 'mm_admin_auth_session';
const ATTEMPTS_STORAGE_KEY = 'mm_admin_auth_attempts';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours session timeout

export interface AuthSession {
  token: string;
  authenticatedAt: number;
  expiresAt: number;
  role: 'superadmin' | 'store_manager';
}

export interface LockoutState {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsCount: number;
}

/**
 * Hash a plain string using the native Web Crypto SHA-256 engine
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if the admin portal is currently locked due to too many failed attempts
 */
export function getLockoutState(): LockoutState {
  try {
    const raw = sessionStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (!raw) return { isLocked: false, remainingSeconds: 0, attemptsCount: 0 };

    const data = JSON.parse(raw);
    const now = Date.now();

    if (data.lockedUntil && data.lockedUntil > now) {
      const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds, attemptsCount: data.count || MAX_FAILED_ATTEMPTS };
    }

    // Lock expired, reset
    if (data.lockedUntil && data.lockedUntil <= now) {
      sessionStorage.removeItem(ATTEMPTS_STORAGE_KEY);
      return { isLocked: false, remainingSeconds: 0, attemptsCount: 0 };
    }

    return { isLocked: false, remainingSeconds: 0, attemptsCount: data.count || 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsCount: 0 };
  }
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(): LockoutState {
  const state = getLockoutState();
  const newCount = state.attemptsCount + 1;
  const now = Date.now();

  if (newCount >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_DURATION_MS;
    sessionStorage.setItem(
      ATTEMPTS_STORAGE_KEY,
      JSON.stringify({ count: newCount, lockedUntil })
    );
    return { isLocked: true, remainingSeconds: 60, attemptsCount: newCount };
  }

  sessionStorage.setItem(
    ATTEMPTS_STORAGE_KEY,
    JSON.stringify({ count: newCount, lockedUntil: null })
  );
  return { isLocked: false, remainingSeconds: 0, attemptsCount: newCount };
}

/**
 * Clear failed attempts on successful sign-in
 */
export function clearFailedAttempts(): void {
  sessionStorage.removeItem(ATTEMPTS_STORAGE_KEY);
}

/**
 * Authenticate against configured environment hash or fallback cryptographically
 */
export async function authenticateAdmin(passcode: string): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
  const lockout = getLockoutState();
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Security lock active. Please wait ${lockout.remainingSeconds}s before retrying.`,
    };
  }

  if (!passcode || passcode.trim().length === 0) {
    return { success: false, error: 'Passcode is required.' };
  }

  const cleanPasscode = passcode.trim();
  const computedHash = await sha256(cleanPasscode);
  const targetEnvHash = import.meta.env.VITE_ADMIN_HASH;

  const isValid =
    cleanPasscode === ADMIN_PASSCODE ||
    cleanPasscode.toLowerCase() === ADMIN_PASSCODE.toLowerCase() ||
    cleanPasscode === 'minars815' ||
    computedHash === ADMIN_PASSCODE_HASH ||
    computedHash === DEFAULT_ADMIN_HASH ||
    computedHash === LEGACY_ADMIN_HASH ||
    computedHash === SECONDARY_ADMIN_HASH ||
    (targetEnvHash && computedHash === targetEnvHash);

  if (isValid) {
    clearFailedAttempts();
    const now = Date.now();
    const session: AuthSession = {
      token: `mm_sess_${computedHash.slice(0, 16)}_${now}`,
      authenticatedAt: now,
      expiresAt: now + SESSION_TTL_MS,
      role: 'superadmin',
    };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return { success: true, session };
  }

  const updatedLockout = recordFailedAttempt();
  if (updatedLockout.isLocked) {
    return {
      success: false,
      error: 'Too many incorrect attempts. Admin portal locked for 60 seconds.',
    };
  }

  const attemptsLeft = MAX_FAILED_ATTEMPTS - updatedLockout.attemptsCount;
  return {
    success: false,
    error: `Incorrect passcode. ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining before temporary lockout.`,
  };
}

/**
 * Verify current session validity and expiration
 */
export function verifyCurrentSession(): boolean {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;

    const session: AuthSession = JSON.parse(raw);
    if (!session || !session.expiresAt || !session.token) return false;

    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Terminate active admin session
 */
export function logoutAdmin(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Sanitize plain user text input to mitigate XSS in customer comments / notes
 */
export function sanitizeInput(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
