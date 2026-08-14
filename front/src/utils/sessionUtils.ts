/**
 * Session management utilities for saving and loading user selections
 */

import { DataSelectorState } from '../components/DataSelector';
import type { Track } from './trackSelection';

const SESSIONS_STORAGE_KEY = 'hprc_sessions';
/** Cap on stored sessions. Surfaced in the UI so the limit is never a surprise. */
export const MAX_SESSIONS = 20;

/**
 * Session data structure
 */
export interface SessionData {
  id: string;
  name: string;
  timestamp: number;
  // Data selector state (reference genome, selected samples, layers, view region, etc.)
  dataSelectorState: DataSelectorState;
  // Track selection: array of tracks with their isSelected state
  tracks: SerializedTrack[];
}

/**
 * Serialized track for storage (minimal data needed to restore selection)
 */
export interface SerializedTrack {
  // Unique identifier: sampleId + type + name
  id: string;
  isSelected: boolean;
}

/**
 * Generate a unique identifier for a track
 */
export function getTrackId(track: Track): string {
  return `${track.sampleId}__${track.displayAttributes.type}__${track.displayAttributes.name || ''}`;
}

/**
 * Serialize tracks for storage
 */
export function serializeTracks(tracks: Track[]): SerializedTrack[] {
  return tracks.map(track => ({
    id: getTrackId(track),
    isSelected: track.isSelected,
  }));
}

/**
 * Apply saved track selection to regenerated tracks
 */
export function applyTrackSelection(tracks: Track[], savedTracks: SerializedTrack[]): Track[] {
  // Build a map of saved track selections
  const selectionMap = new Map<string, boolean>();
  savedTracks.forEach(t => selectionMap.set(t.id, t.isSelected));
  
  // Apply saved selections to tracks
  return tracks.map(track => {
    const trackId = getTrackId(track);
    if (selectionMap.has(trackId)) {
      return { ...track, isSelected: selectionMap.get(trackId)! };
    }
    return track;
  });
}

/**
 * True if `value` has the shape the rest of the app relies on. Anything stored
 * under our key could have been hand-edited or written by an older build, and a
 * single malformed entry used to take the whole Sessions tab down.
 */
function isValidSession(value: unknown): value is SessionData {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<SessionData>;
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.timestamp === 'number' &&
    !!s.dataSelectorState &&
    typeof s.dataSelectorState === 'object' &&
    Array.isArray(s.dataSelectorState.selectedGenomes) &&
    Array.isArray(s.dataSelectorState.selectedLayers) &&
    Array.isArray(s.tracks)
  );
}

/**
 * Get all saved sessions from localStorage, dropping anything unreadable.
 */
export function getSessions(): SessionData[] {
  try {
    const sessionsJson = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!sessionsJson) {
      return [];
    }
    const parsed = JSON.parse(sessionsJson);
    if (!Array.isArray(parsed)) return [];
    const valid = parsed.filter(isValidSession);
    if (valid.length !== parsed.length) {
      console.warn(`Discarded ${parsed.length - valid.length} malformed saved session(s).`);
    }
    return valid;
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

/** Replace the stored list wholesale. Used by reorder, delete and undo. */
export function writeSessions(sessions: SessionData[]): void {
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
}

function newSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Save a new session
 */
export function saveSession(
  name: string,
  dataSelectorState: DataSelectorState,
  tracks: Track[]
): SessionData {
  const sessions = getSessions();

  const newSession: SessionData = {
    id: newSessionId(),
    name,
    timestamp: Date.now(),
    dataSelectorState,
    tracks: serializeTracks(tracks),
  };

  // Add new session at the beginning
  sessions.unshift(newSession);
  writeSessions(sessions);

  return newSession;
}

/** Copy an existing session under a new id and name. */
export function duplicateSession(sessionId: string): SessionData | null {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return null;

  const source = sessions[index];
  const existingNames = new Set(sessions.map((s) => s.name));
  let name = `${source.name} (copy)`;
  for (let n = 2; existingNames.has(name); n++) {
    name = `${source.name} (copy ${n})`;
  }

  const copy: SessionData = { ...source, id: newSessionId(), name, timestamp: Date.now() };
  sessions.splice(index + 1, 0, copy);
  writeSessions(sessions);
  return copy;
}

/**
 * Overwrite an existing session's content (data selector state + tracks),
 * keeping its id and name. Updates the timestamp.
 */
export function overwriteSession(
  sessionId: string,
  dataSelectorState: DataSelectorState,
  tracks: Track[]
): void {
  const sessions = getSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex !== -1) {
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      timestamp: Date.now(),
      dataSelectorState,
      tracks: serializeTracks(tracks),
    };
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }
}

/**
 * Update the saved browser view region (location) for a session
 */
export function updateSessionViewRegion(sessionId: string, region: string): void {
  const sessions = getSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex !== -1) {
    sessions[sessionIndex].dataSelectorState = {
      ...sessions[sessionIndex].dataSelectorState,
      userViewRegion: region || undefined,
    };
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }
}

/**
 * Persist a new ordering of sessions
 */
export function reorderSessions(newOrder: SessionData[]): void {
  writeSessions(newOrder);
}

/**
 * Delete a session by ID
 */
export function deleteSession(sessionId: string): void {
  writeSessions(getSessions().filter(s => s.id !== sessionId));
}

/**
 * Update a session name
 */
export function updateSessionName(sessionId: string, newName: string): void {
  const sessions = getSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex !== -1) {
    sessions[sessionIndex].name = newName;
    writeSessions(sessions);
  }
}

/**
 * Export sessions as JSON string (for backup/sharing)
 */
export function exportSessions(sessions: SessionData[] = getSessions()): string {
  return JSON.stringify(sessions, null, 2);
}

/**
 * Parse an exported payload without touching storage, so the UI can show the
 * user what an import would bring in before it happens.
 *
 * @returns the readable sessions, or `null` if the text is not an export at all.
 */
export function parseSessionsJson(jsonString: string): SessionData[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return null;
  }
  // A single exported session is a reasonable thing to paste, so accept it too.
  const list = Array.isArray(parsed) ? parsed : [parsed];
  const valid = list.filter(isValidSession);
  return valid.length > 0 ? valid : null;
}

export interface ImportResult {
  /** Sessions written to storage. */
  added: number;
  /** Skipped because a session with the same id is already saved. */
  duplicates: number;
  /** Dropped because the list would have exceeded MAX_SESSIONS. */
  dropped: number;
}

/**
 * Merge parsed sessions into storage, newest first.
 *
 * Anything past MAX_SESSIONS is reported rather than silently discarded — the
 * previous version could quietly evict a user's own saved work to make room for
 * an import.
 */
export function mergeSessions(incoming: SessionData[]): ImportResult {
  const existing = getSessions();
  const existingIds = new Set(existing.map((s) => s.id));
  const fresh = incoming.filter((s) => !existingIds.has(s.id));

  const merged = [...fresh, ...existing];
  const kept = merged.slice(0, MAX_SESSIONS);
  writeSessions(kept);

  const droppedTotal = merged.length - kept.length;
  return {
    added: Math.max(0, fresh.length - droppedTotal),
    duplicates: incoming.length - fresh.length,
    dropped: droppedTotal,
  };
}

/**
 * Import sessions from JSON string.
 * @returns false when the text could not be read as an export.
 */
export function importSessions(jsonString: string): ImportResult | false {
  const parsed = parseSessionsJson(jsonString);
  if (!parsed) return false;
  return mergeSessions(parsed);
}

