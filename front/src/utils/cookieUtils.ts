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

/**
 * List of strictly necessary cookies that are always allowed
 * These are required for the site to function properly
 */
const STRICTLY_NECESSARY_COOKIES = [
  'hprc_cookie_consent', // Cookie consent preference
];

/**
 * Cookie category mapping
 */
const COOKIE_CATEGORIES: Record<string, CookieCategory> = {
  'hprc_cookie_consent': CookieCategory.STRICTLY_NECESSARY,
  'hprc_skip_landing': CookieCategory.FUNCTIONAL,
  'hprc_sessions': CookieCategory.FUNCTIONAL,
};

/**
 * Check if user has consented to cookies
 */
export function hasConsent(): CookieConsent {
  const consent = getCookieRaw('hprc_cookie_consent');
  if (consent === 'accepted') return 'accepted';
  if (consent === 'rejected') return 'rejected';
  return null;
}

/**
 * Check if a specific cookie category is allowed
 */
export function isCategoryAllowed(category: CookieCategory): boolean {
  // Strictly necessary cookies are always allowed
  if (category === CookieCategory.STRICTLY_NECESSARY) {
    return true;
  }
  
  // Check consent status
  const consent = hasConsent();
  return consent === 'accepted';
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
 * Set a cookie with consent check (use this for non-essential cookies)
 */
export function setCookie(name: string, value: string, days: number = 365): boolean {
  // Check if this cookie is allowed
  if (!isCookieAllowed(name)) {
    console.warn(`Cookie "${name}" blocked: User has not consented to ${COOKIE_CATEGORIES[name] || 'functional'} cookies`);
    return false;
  }
  
  setCookieRaw(name, value, days);
  return true;
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
  setCookieRaw('hprc_cookie_consent', consent, 365);
  
  // If rejected, clean up non-essential cookies
  if (consent === 'rejected') {
    cleanupNonEssentialCookies();
  }
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

