/**
 * Session management utilities for saving and loading user selections
 */

import { DataSelectorState } from '../components/DataSelector';
import { setCookie, getCookie } from './cookieUtils';

export interface SessionData {
  id: string;
  name: string;
  timestamp: number;
  dataSelectorState: DataSelectorState;
  enabledTracks?: string[]; // Array of track IDs
  currentTab?: string;
  browserState?: {
    viewRegion?: string;
    genomeName?: string;
  };
}

const SESSIONS_COOKIE_NAME = 'hprc_sessions';
const MAX_SESSIONS = 10;

/**
 * Get all saved sessions from cookies
 */
export function getSessions(): SessionData[] {
  try {
    const sessionsJson = getCookie(SESSIONS_COOKIE_NAME);
    if (!sessionsJson) {
      return [];
    }
    return JSON.parse(decodeURIComponent(sessionsJson));
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

/**
 * Save a new session
 */
export function saveSession(
  name: string,
  dataSelectorState: DataSelectorState,
  enabledTracks?: Set<string>,
  currentTab?: string,
  browserState?: { viewRegion?: string; genomeName?: string }
): SessionData {
  const sessions = getSessions();
  
  const newSession: SessionData = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    timestamp: Date.now(),
    dataSelectorState,
    enabledTracks: enabledTracks ? Array.from(enabledTracks) : undefined,
    currentTab,
    browserState,
  };
  
  // Add new session at the beginning
  sessions.unshift(newSession);
  
  // Keep only the most recent MAX_SESSIONS
  const trimmedSessions = sessions.slice(0, MAX_SESSIONS);
  
  // Save to cookie
  const sessionsJson = encodeURIComponent(JSON.stringify(trimmedSessions));
  setCookie(SESSIONS_COOKIE_NAME, sessionsJson, 365);
  
  return newSession;
}

/**
 * Delete a session by ID
 */
export function deleteSession(sessionId: string): void {
  const sessions = getSessions();
  const filteredSessions = sessions.filter(s => s.id !== sessionId);
  
  const sessionsJson = encodeURIComponent(JSON.stringify(filteredSessions));
  setCookie(SESSIONS_COOKIE_NAME, sessionsJson, 365);
}

/**
 * Update a session name
 */
export function updateSessionName(sessionId: string, newName: string): void {
  const sessions = getSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex !== -1) {
    sessions[sessionIndex].name = newName;
    const sessionsJson = encodeURIComponent(JSON.stringify(sessions));
    setCookie(SESSIONS_COOKIE_NAME, sessionsJson, 365);
  }
}

/**
 * Export sessions as JSON (for backup)
 */
export function exportSessions(): string {
  const sessions = getSessions();
  return JSON.stringify(sessions, null, 2);
}

/**
 * Import sessions from JSON
 */
export function importSessions(jsonString: string): boolean {
  try {
    const sessions = JSON.parse(jsonString);
    if (Array.isArray(sessions)) {
      const sessionsJson = encodeURIComponent(JSON.stringify(sessions));
      setCookie(SESSIONS_COOKIE_NAME, sessionsJson, 365);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing sessions:', error);
    return false;
  }
}

