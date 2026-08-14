/**
 * Cookie utility functions for managing browser cookies with GDPR compliance
 */

/**
 * Cookie consent values
 */
export type CookieConsent = 'accepted' | 'rejected' | null;

/**
 * Cookie categories for GDPR compliance
 */
export enum CookieCategory {
  STRICTLY_NECESSARY = 'strictly_necessary', // Can't be disabled
  FUNCTIONAL = 'functional',                  // Sessions, preferences
  ANALYTICS = 'analytics',                    // Tracking, analytics
}

const CONSENT_COOKIE = 'hprc_cookie_consent';
/** Per-category choices, so "functional yes, analytics no" can be stored as-is. */
const PREFERENCES_COOKIE = 'hprc_cookie_prefs';

/**
 * List of strictly necessary cookies that are always allowed
 * These are required for the site to function properly
 */
const STRICTLY_NECESSARY_COOKIES = [
  CONSENT_COOKIE, // Cookie consent preference
  PREFERENCES_COOKIE, // The per-category breakdown of that preference
];

/**
 * Cookie category mapping.
 *
 * Only actual cookies belong here. Saved sessions and the tutorial flag live in
 * localStorage, not in a cookie, and are disclosed separately in the settings
 * dialog.
 */
const COOKIE_CATEGORIES: Record<string, CookieCategory> = {
  [CONSENT_COOKIE]: CookieCategory.STRICTLY_NECESSARY,
  [PREFERENCES_COOKIE]: CookieCategory.STRICTLY_NECESSARY,
  'hprc_skip_landing': CookieCategory.FUNCTIONAL,
};

export interface CategoryPreferences {
  functional: boolean;
  analytics: boolean;
}

/**
 * Check if user has consented to cookies
 */
export function hasConsent(): CookieConsent {
  const consent = getCookieRaw(CONSENT_COOKIE);
  if (consent === 'accepted') return 'accepted';
  if (consent === 'rejected') return 'rejected';
  return null;
}

/**
 * The stored per-category choices, or null if only a coarse accept/reject was
 * ever recorded (an older visit, or the banner's Accept/Reject buttons).
 */
function readPreferences(): CategoryPreferences | null {
  const raw = getCookieRaw(PREFERENCES_COOKIE);
  if (!raw) return null;
  const enabled = new Set(decodeURIComponent(raw).split(',').filter(Boolean));
  return { functional: enabled.has('functional'), analytics: enabled.has('analytics') };
}

/** The effective preferences, falling back to the coarse consent. */
export function getCategoryPreferences(): CategoryPreferences {
  const stored = readPreferences();
  if (stored) return stored;
  const accepted = hasConsent() === 'accepted';
  return { functional: accepted, analytics: accepted };
}

/**
 * Check if a specific cookie category is allowed
 */
export function isCategoryAllowed(category: CookieCategory): boolean {
  // Strictly necessary cookies are always allowed
  if (category === CookieCategory.STRICTLY_NECESSARY) {
    return true;
  }

  const prefs = getCategoryPreferences();
  return category === CookieCategory.ANALYTICS ? prefs.analytics : prefs.functional;
}

/**
 * Record a per-category choice.
 *
 * The settings dialog used to collapse anything other than "all on" down to a
 * flat reject, so switching functional on and leaving analytics off — the
 * obvious choice, since analytics is not even implemented — stored the exact
 * opposite of what was asked for.
 */
export function setCategoryPreferences(prefs: CategoryPreferences): void {
  const enabled = [prefs.functional && 'functional', prefs.analytics && 'analytics'].filter(Boolean);
  setCookieRaw(PREFERENCES_COOKIE, encodeURIComponent(enabled.join(',')), 365);
  // The banner keys off this coarse value to decide whether it has been
  // answered at all, so it still has to be written.
  setCookieRaw(CONSENT_COOKIE, enabled.length > 0 ? 'accepted' : 'rejected', 365);

  if (prefs.functional) {
    flushDeferredCookies();
  } else {
    deferredCookies.clear();
    cleanupNonEssentialCookies();
  }
}

/**
 * Check if a specific cookie is allowed based on consent
 */
export function isCookieAllowed(name: string): boolean {
  // Check if it's a strictly necessary cookie
  if (STRICTLY_NECESSARY_COOKIES.includes(name)) {
    return true;
  }
  
  // Get the cookie category
  const category = COOKIE_CATEGORIES[name] || CookieCategory.FUNCTIONAL;
  return isCategoryAllowed(category);
}

/**
 * Preferences the user expressed before there was consent to store them.
 *
 * The landing page's "skip this page in the future" checkbox sits *before* the
 * cookie banner, so on a first visit the write was always refused and the
 * checkbox silently did nothing. Holding the request in memory and replaying it
 * the moment the matching category is allowed honours both answers.
 */
const deferredCookies = new Map<string, { value: string; days: number }>();

/**
 * Set a cookie with consent check (use this for non-essential cookies)
 *
 * @returns true if written now; false if deferred until consent is given.
 */
export function setCookie(name: string, value: string, days: number = 365): boolean {
  // Check if this cookie is allowed
  if (!isCookieAllowed(name)) {
    deferredCookies.set(name, { value, days });
    return false;
  }

  deferredCookies.delete(name);
  setCookieRaw(name, value, days);
  return true;
}

/** Write any deferred preference whose category has since been allowed. */
function flushDeferredCookies(): void {
  for (const [name, pending] of deferredCookies) {
    if (isCookieAllowed(name)) {
      setCookieRaw(name, pending.value, pending.days);
      deferredCookies.delete(name);
    }
  }
}

/**
 * Set a cookie without consent check (internal use only)
 */
function setCookieRaw(name: string, value: string, days: number = 365): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value by name (no consent check needed for reading)
 */
export function getCookie(name: string): string | null {
  return getCookieRaw(name);
}

/**
 * Get a cookie value by name (internal)
 */
function getCookieRaw(name: string): string | null {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

/**
 * Set cookie consent (always allowed as it's strictly necessary)
 */
export function setConsent(consent: 'accepted' | 'rejected'): void {
  const all = consent === 'accepted';
  setCategoryPreferences({ functional: all, analytics: all });
}

/**
 * Delete all non-essential cookies
 */
export function cleanupNonEssentialCookies(): void {
  const allCookies = document.cookie.split(';');
  
  for (const cookie of allCookies) {
    const cookieName = cookie.split('=')[0].trim();
    
    // Don't delete strictly necessary cookies
    if (!STRICTLY_NECESSARY_COOKIES.includes(cookieName)) {
      deleteCookie(cookieName);
    }
  }
}

