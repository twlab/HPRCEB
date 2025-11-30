/**
 * Session management utilities for saving and loading user selections
 */

import { DataSelectorState } from '../components/DataSelector';
import type { Track } from './trackSelection';

const SESSIONS_STORAGE_KEY = 'hprc_sessions';
const MAX_SESSIONS = 20;

/**
 * Session data structure
 */
export interface SessionData {
  id: string;
  name: string;
  timestamp: number;
  // Data selector state (reference genome, selected samples, layers, etc.)
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
 * Get all saved sessions from localStorage
 */
export function getSessions(): SessionData[] {
  try {
    const sessionsJson = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!sessionsJson) {
      return [];
    }
    return JSON.parse(sessionsJson);
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
  tracks: Track[]
): SessionData {
  const sessions = getSessions();
  
  const newSession: SessionData = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    timestamp: Date.now(),
    dataSelectorState,
    tracks: serializeTracks(tracks),
  };
  
  // Add new session at the beginning
  sessions.unshift(newSession);
  
  // Keep only the most recent MAX_SESSIONS
  const trimmedSessions = sessions.slice(0, MAX_SESSIONS);
  
  // Save to localStorage
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(trimmedSessions));
  
  return newSession;
}

/**
 * Delete a session by ID
 */
export function deleteSession(sessionId: string): void {
  const sessions = getSessions();
  const filteredSessions = sessions.filter(s => s.id !== sessionId);
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filteredSessions));
}

/**
 * Update a session name
 */
export function updateSessionName(sessionId: string, newName: string): void {
  const sessions = getSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex !== -1) {
    sessions[sessionIndex].name = newName;
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }
}

/**
 * Export sessions as JSON string (for backup/sharing)
 */
export function exportSessions(): string {
  const sessions = getSessions();
  return JSON.stringify(sessions, null, 2);
}

/**
 * Import sessions from JSON string
 */
export function importSessions(jsonString: string): boolean {
  try {
    const sessions = JSON.parse(jsonString);
    if (Array.isArray(sessions)) {
      // Merge with existing sessions, avoiding duplicates by ID
      const existingSessions = getSessions();
      const existingIds = new Set(existingSessions.map(s => s.id));
      const newSessions = sessions.filter((s: SessionData) => !existingIds.has(s.id));
      const mergedSessions = [...newSessions, ...existingSessions].slice(0, MAX_SESSIONS);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(mergedSessions));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing sessions:', error);
    return false;
  }
}

