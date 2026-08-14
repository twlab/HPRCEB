import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowUturnLeftIcon,
  Bars3Icon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowUpIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  InboxArrowDownIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlayIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Modal from './Modal';
import { DataSelectorState } from './DataSelector';
import {
  MAX_SESSIONS,
  SessionData,
  applyTrackSelection,
  deleteSession,
  duplicateSession,
  exportSessions,
  getSessions,
  mergeSessions,
  overwriteSession,
  parseSessionsJson,
  reorderSessions,
  saveSession,
  updateSessionName,
  updateSessionViewRegion,
  writeSessions,
} from '../utils/sessionUtils';
import { selectTracks, Track } from '../utils/trackSelection';
import { getGenomeData, getTrackData } from '../utils/genomeDataService';
import { DATA_TYPES, BUTTON, dataTypeBadge, secondaryButton } from '../utils/theme';
import type { DataLayer } from '../utils/genomeTypes';

interface SessionsProps {
  dataSelectorState: DataSelectorState;
  selectedTracks: Track[];
  onLoadSession: (state: DataSelectorState, tracks: Track[]) => void;
  nightMode?: boolean;
  /** Lets the empty state send a first-time visitor to the Sample tab. */
  onNavigateToSampleTab?: () => void;
}

type ToastTone = 'success' | 'error';

interface Toast {
  tone: ToastTone;
  message: string;
  /** Present on a reversible action; renders an Undo button on the toast. */
  undo?: () => void;
}

const TOAST_MS = 6000;

/* ------------------------------------------------------------- formatting */

/** "3 minutes ago" for anything recent, falling back to a date for older saves. */
function relativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 45) return 'just now';

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.35],
    ['month', 12],
  ];

  let value = seconds;
  for (const [unit, step] of units) {
    if (Math.abs(value) < step) {
      return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(-Math.round(value), unit);
    }
    value /= step;
  }
  return new Date(timestamp).toLocaleDateString();
}

function absoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/** A short, unique-ish default so the save dialog is never blank. */
function defaultSessionName(state: DataSelectorState, existing: SessionData[]): string {
  const parts = [state.referenceGenome];
  if (state.selectedGenomes.length === 1) parts.push(state.selectedGenomes[0]);
  else if (state.selectedGenomes.length > 1) parts.push(`${state.selectedGenomes.length} samples`);

  const base = parts.join(' · ');
  const taken = new Set(existing.map((s) => s.name));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base} (${n})`;
    if (!taken.has(candidate)) return candidate;
  }
}

/* ---------------------------------------------------------- small pieces */

function StatPair({ label, value, nightMode }: { label: string; value: React.ReactNode; nightMode: boolean }) {
  return (
    <div>
      <dt className={`text-[11px] font-semibold uppercase tracking-wide ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {label}
      </dt>
      <dd className={`text-sm font-semibold mt-0.5 ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>{value}</dd>
    </div>
  );
}

function LayerChips({ layers, nightMode }: { layers: DataLayer[]; nightMode: boolean }) {
  if (layers.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {layers.map((layer) => (
        <span key={layer} className={`px-2 py-0.5 rounded text-xs font-medium ${dataTypeBadge(layer, nightMode)}`}>
          {DATA_TYPES[layer]?.label ?? layer}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- component */

export default function Sessions({
  dataSelectorState,
  selectedTracks,
  onLoadSession,
  nightMode = false,
  onNavigateToSampleTab,
}: SessionsProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTargetId, setSaveTargetId] = useState('');
  const [newSessionName, setNewSessionName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingRegion, setEditingRegion] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSessions = useCallback(() => setSessions(getSessions()), []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const notify = useCallback((next: Toast) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  /* ------------------------------------------------ current selection */

  const knownSampleIds = useMemo(() => new Set(getGenomeData().map((g) => g.id)), []);

  const enabledTrackCount = selectedTracks.filter((t) => t.isSelected).length;
  const hasSomethingToSave = dataSelectorState.selectedGenomes.length > 0 || selectedTracks.length > 0;
  const atCapacity = sessions.length >= MAX_SESSIONS;

  /* ---------------------------------------------------------- saving */

  const openSaveDialog = () => {
    setSaveTargetId('');
    setNewSessionName(defaultSessionName(dataSelectorState, sessions));
    setSaveError(null);
    setShowSaveDialog(true);
  };

  const handleSaveSession = () => {
    if (saveTargetId) {
      const target = sessions.find((s) => s.id === saveTargetId);
      if (!target) {
        setSaveError('That session no longer exists — pick another target.');
        loadSessions();
        return;
      }
      overwriteSession(saveTargetId, dataSelectorState, selectedTracks);
      setShowSaveDialog(false);
      loadSessions();
      notify({ tone: 'success', message: `Overwrote “${target.name}”.` });
      return;
    }

    const name = newSessionName.trim();
    if (!name) {
      setSaveError('Give the session a name so you can find it later.');
      return;
    }
    if (sessions.some((s) => s.name === name)) {
      setSaveError('A session with that name already exists. Rename it, or overwrite that session instead.');
      return;
    }
    if (atCapacity) {
      setSaveError(`You already have ${MAX_SESSIONS} sessions. Delete one, or overwrite an existing session.`);
      return;
    }

    saveSession(name, dataSelectorState, selectedTracks);
    setShowSaveDialog(false);
    loadSessions();
    notify({ tone: 'success', message: `Saved “${name}”.` });
  };

  /* -------------------------------------------------------- deleting */

  // Delete is immediate and reversible rather than gated behind a confirm
  // prompt: one click to remove, one click to put it back where it was.
  const handleDeleteSession = (session: SessionData) => {
    const index = sessions.findIndex((s) => s.id === session.id);

    deleteSession(session.id);
    loadSessions();
    notify({
      tone: 'success',
      message: `Deleted “${session.name}”.`,
      undo: () => {
        const restored = getSessions();
        restored.splice(index < 0 ? restored.length : index, 0, session);
        writeSessions(restored);
        loadSessions();
        dismissToast();
      },
    });
  };

  const handleDuplicate = (session: SessionData) => {
    if (atCapacity) {
      notify({ tone: 'error', message: `Cannot duplicate: already at ${MAX_SESSIONS} sessions.` });
      return;
    }
    const copy = duplicateSession(session.id);
    loadSessions();
    if (copy) notify({ tone: 'success', message: `Duplicated as “${copy.name}”.` });
  };

  /* --------------------------------------------------------- editing */

  const startEditing = (session: SessionData) => {
    setEditingId(session.id);
    setEditingName(session.name);
    setEditingRegion(session.dataSelectorState.userViewRegion || '');
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
    setEditingRegion('');
    setEditError(null);
  };

  const handleSaveEdit = (sessionId: string) => {
    const name = editingName.trim();
    if (!name) {
      setEditError('A session needs a name.');
      return;
    }
    if (sessions.some((s) => s.id !== sessionId && s.name === name)) {
      setEditError('Another session already uses that name.');
      return;
    }
    updateSessionName(sessionId, name);
    updateSessionViewRegion(sessionId, editingRegion.trim());
    cancelEditing();
    loadSessions();
    notify({ tone: 'success', message: `Updated “${name}”.` });
  };

  /* ------------------------------------------------------- reordering */

  const moveSession = (from: number, to: number) => {
    if (to < 0 || to >= sessions.length || from === to) return;
    const next = [...sessions];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSessions(next);
    reorderSessions(next);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null) moveSession(dragIndex, index);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  /* --------------------------------------------------------- loading */

  const missingSamplesFor = useCallback(
    (session: SessionData) =>
      session.dataSelectorState.selectedGenomes.filter((id) => !knownSampleIds.has(id)),
    [knownSampleIds]
  );

  const handleLoadSession = (session: SessionData) => {
    try {
      const result = selectTracks({
        selectedSamples: session.dataSelectorState.selectedGenomes,
        reference: session.dataSelectorState.referenceGenome,
        availableTracks: getTrackData(),
        selectedLayers: session.dataSelectorState.selectedLayers,
      });

      onLoadSession(session.dataSelectorState, applyTrackSelection(result.tracks, session.tracks));

      const missing = missingSamplesFor(session);
      if (missing.length > 0) {
        notify({
          tone: 'error',
          message: `Loaded “${session.name}”, but ${missing.length} sample${
            missing.length > 1 ? 's are' : ' is'
          } no longer in the dataset: ${missing.join(', ')}.`,
        });
      } else {
        notify({ tone: 'success', message: `Loaded “${session.name}”.` });
      }
    } catch (error) {
      console.error('Error loading session:', error);
      notify({ tone: 'error', message: 'Could not load that session. See the browser console for details.' });
    }
  };

  /* ------------------------------------------------- export / import */

  const downloadJson = (json: string, filename: string) => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = () => new Date().toISOString().split('T')[0];

  const handleExportAll = () => {
    if (sessions.length === 0) {
      notify({ tone: 'error', message: 'There are no sessions to export yet.' });
      return;
    }
    downloadJson(exportSessions(), `hprc-sessions-${today()}.json`);
    notify({ tone: 'success', message: `Exported ${sessions.length} session${sessions.length > 1 ? 's' : ''}.` });
  };

  const handleExportOne = (session: SessionData) => {
    const slug = session.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'session';
    downloadJson(exportSessions([session]), `hprc-session-${slug}-${today()}.json`);
  };

  const openImportDialog = () => {
    setImportJson('');
    setImportUrl('');
    setImportError(null);
    setShowImportDialog(true);
  };

  // Parsed continuously so the dialog can preview what an import would bring in.
  const importPreview = useMemo(
    () => (importJson.trim() ? parseSessionsJson(importJson) : null),
    [importJson]
  );

  const handleImport = () => {
    if (!importPreview) {
      setImportError('That does not look like an exported session file.');
      return;
    }
    const result = mergeSessions(importPreview);
    setShowImportDialog(false);
    loadSessions();

    const notes: string[] = [`Imported ${result.added} session${result.added === 1 ? '' : 's'}`];
    if (result.duplicates > 0) notes.push(`${result.duplicates} already saved`);
    if (result.dropped > 0) notes.push(`${result.dropped} skipped (${MAX_SESSIONS}-session limit)`);
    notify({
      tone: result.dropped > 0 ? 'error' : 'success',
      message: `${notes.join(' · ')}.`,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImportJson(String(reader.result ?? ''));
      setImportError(null);
    };
    reader.onerror = () => setImportError('Could not read that file.');
    reader.readAsText(file);
    // Reset so selecting the same file again still triggers onChange
    e.target.value = '';
  };

  const handleFetchUrl = async () => {
    const url = importUrl.trim();
    if (!url) return;
    setFetchingUrl(true);
    setImportError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      setImportJson(await response.text());
    } catch (error) {
      setImportError(`Could not fetch that URL: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setFetchingUrl(false);
    }
  };

  /* ---------------------------------------------------------- render */

  const visibleSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.dataSelectorState.referenceGenome.toLowerCase().includes(q) ||
        s.dataSelectorState.selectedGenomes.some((id) => id.toLowerCase().includes(q)) ||
        s.dataSelectorState.selectedLayers.some((l) => l.toLowerCase().includes(q))
    );
  }, [sessions, search]);

  const card = nightMode ? 'bg-gray-800' : 'bg-white';
  const muted = nightMode ? 'text-gray-400' : 'text-gray-600';
  const faint = nightMode ? 'text-gray-500' : 'text-gray-500';
  const fieldCls = `w-full px-3 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
    nightMode
      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const iconBtn = `p-2 rounded-lg transition-colors ${
    nightMode ? 'text-gray-300 hover:bg-gray-600 hover:text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
  }`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast. Announced politely so a screen reader hears the outcome of a
          save or delete without the focus being yanked away. */}
      <div className="fixed top-20 right-4 z-50" aria-live="polite" aria-atomic="true">
        {toast && (
          <div
            className={`animate-slide-in-right flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl text-white max-w-sm ${
              toast.tone === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.tone === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            {toast.undo && (
              <button
                onClick={toast.undo}
                className="flex items-center gap-1 text-sm font-bold underline underline-offset-2 hover:no-underline flex-shrink-0"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
                Undo
              </button>
            )}
            <button onClick={dismissToast} aria-label="Dismiss notification" className="flex-shrink-0">
              <XMarkIcon className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className={`${card} rounded-2xl shadow-lg p-6 transition-colors duration-300`}>
        <h1 className={`text-3xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Sessions</h1>
        <p className={muted}>
          A session is a bookmark for your whole setup — reference genome, samples, data layers, which tracks are
          enabled, and where the browser was looking. Save one now and pick up exactly where you left off later.
        </p>
      </div>

      {/* What will be saved. Showing this up front means the Save button is
          never a leap of faith, and it explains the disabled state. */}
      <div className={`${card} rounded-2xl shadow-lg p-6 transition-colors duration-300`}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className={`text-lg font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Current setup</h2>
            <p className={`text-sm ${muted}`}>This is what a new session would capture.</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${nightMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {sessions.length} / {MAX_SESSIONS} saved
          </span>
        </div>

        <dl className={`grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl p-4 mb-4 ${nightMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <StatPair label="Reference" value={dataSelectorState.referenceGenome} nightMode={nightMode} />
          <StatPair
            label="Samples"
            value={
              dataSelectorState.selectedGenomes.length > 0 ? (
                dataSelectorState.selectedGenomes.length
              ) : (
                <span className={faint}>None</span>
              )
            }
            nightMode={nightMode}
          />
          <StatPair
            label="Data layers"
            value={
              dataSelectorState.selectedLayers.length > 0 ? (
                dataSelectorState.selectedLayers.length
              ) : (
                <span className={faint}>None</span>
              )
            }
            nightMode={nightMode}
          />
          <StatPair
            label="Tracks enabled"
            value={
              selectedTracks.length > 0 ? (
                `${enabledTrackCount} / ${selectedTracks.length}`
              ) : (
                <span className={faint}>None</span>
              )
            }
            nightMode={nightMode}
          />
        </dl>

        {dataSelectorState.selectedLayers.length > 0 && (
          <div className="mb-4">
            <LayerChips layers={dataSelectorState.selectedLayers} nightMode={nightMode} />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={openSaveDialog}
            disabled={!hasSomethingToSave}
            title={hasSomethingToSave ? undefined : 'Select at least one sample on the Sample tab first'}
            className={`px-5 py-2.5 font-semibold rounded-xl transition-all flex items-center gap-2 ${BUTTON.primary}`}
          >
            <InboxArrowDownIcon className="w-5 h-5" />
            Save current setup
          </button>

          <button
            onClick={handleExportAll}
            className={`px-5 py-2.5 font-semibold rounded-xl transition-colors flex items-center gap-2 ${secondaryButton(nightMode)}`}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export all
          </button>

          <button
            onClick={openImportDialog}
            className={`px-5 py-2.5 font-semibold rounded-xl transition-colors flex items-center gap-2 ${secondaryButton(nightMode)}`}
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            Import
          </button>
        </div>

        {!hasSomethingToSave && (
          <p className={`text-sm mt-3 ${muted}`}>
            Nothing to save yet — choose at least one sample on the <strong>Sample</strong> tab
            {onNavigateToSampleTab && (
              <>
                {' '}
                <button
                  onClick={onNavigateToSampleTab}
                  className="underline underline-offset-2 font-semibold text-primary-600 hover:text-primary-800"
                >
                  (go there now)
                </button>
              </>
            )}
            .
          </p>
        )}
      </div>

      {/* Saved sessions */}
      <div className={`${card} rounded-2xl shadow-lg p-6 transition-colors duration-300`}>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Saved sessions ({sessions.length})
          </h2>
          {sessions.length > 3 && (
            <div className="relative w-full sm:w-72">
              <MagnifyingGlassIcon
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name, sample or layer…"
                aria-label="Filter saved sessions"
                className={`${fieldCls} pl-9 text-sm`}
              />
            </div>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className={`text-center py-12 ${muted}`}>
            <ArchiveBoxIcon className="w-14 h-14 mx-auto mb-4 opacity-40" />
            <p className={`text-lg font-medium ${nightMode ? 'text-gray-200' : 'text-gray-800'}`}>No saved sessions yet</p>
            <p className="mt-2 max-w-md mx-auto text-sm">
              Once you have picked samples and tracks, save the setup here. Sessions live in this browser, and you can
              export them to a file to move them to another machine or share them with a colleague.
            </p>
          </div>
        ) : visibleSessions.length === 0 ? (
          <p className={`text-center py-10 text-sm ${muted}`}>
            No session matches “{search}”.{' '}
            <button onClick={() => setSearch('')} className="underline underline-offset-2 font-semibold">
              Clear the filter
            </button>
          </p>
        ) : (
          <ul className="space-y-3">
            {visibleSessions.map((session) => {
              const index = sessions.indexOf(session);
              const isEditing = editingId === session.id;
              const isExpanded = expandedId === session.id;
              const missing = missingSamplesFor(session);
              const enabled = session.tracks.filter((t) => t.isSelected).length;
              const reorderable = !search;

              return (
                <li
                  key={session.id}
                  draggable={!isEditing && reorderable}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`${nightMode ? 'bg-gray-700/60' : 'bg-gray-50'} rounded-xl p-4 transition-all duration-200 animate-slide-in-up ${
                    dragIndex === index ? 'opacity-40' : ''
                  } ${
                    dragOverIndex === index && dragIndex !== index
                      ? nightMode
                        ? 'ring-2 ring-primary-500'
                        : 'ring-2 ring-primary-400'
                      : ''
                  }`}
                  style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor={`name-${session.id}`}
                          className={`block text-xs font-semibold mb-1 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          Name
                        </label>
                        <input
                          id={`name-${session.id}`}
                          type="text"
                          value={editingName}
                          onChange={(e) => {
                            setEditingName(e.target.value);
                            setEditError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(session.id);
                            else if (e.key === 'Escape') cancelEditing();
                          }}
                          className={fieldCls}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`region-${session.id}`}
                          className={`block text-xs font-semibold mb-1 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          Browser location
                        </label>
                        <input
                          id={`region-${session.id}`}
                          type="text"
                          value={editingRegion}
                          onChange={(e) => setEditingRegion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(session.id);
                            else if (e.key === 'Escape') cancelEditing();
                          }}
                          placeholder="e.g. chr1:1,000,000-2,000,000 — leave empty for the default view"
                          className={`${fieldCls} font-mono text-sm`}
                        />
                      </div>
                      {editError && <p className="text-sm text-red-500">{editError}</p>}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEditing}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${secondaryButton(nightMode)}`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(session.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${BUTTON.primary}`}
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        {/* Reorder controls. Drag alone was unreachable by
                            keyboard, so the arrows are the primary affordance
                            and the handle just advertises that drag works too. */}
                        {reorderable && sessions.length > 1 && (
                          <div className="flex flex-col items-center flex-shrink-0 -mt-1">
                            <button
                              onClick={() => moveSession(index, index - 1)}
                              disabled={index === 0}
                              aria-label={`Move “${session.name}” up`}
                              className={`p-0.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                                nightMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                              }`}
                            >
                              <ChevronUpIcon className="w-4 h-4" />
                            </button>
                            <Bars3Icon
                              className={`w-4 h-4 cursor-move ${faint}`}
                              title="Drag to reorder"
                              aria-hidden="true"
                            />
                            <button
                              onClick={() => moveSession(index, index + 1)}
                              disabled={index === sessions.length - 1}
                              aria-label={`Move “${session.name}” down`}
                              className={`p-0.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                                nightMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                              }`}
                            >
                              <ChevronDownIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-lg font-semibold truncate ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {session.name}
                            </h3>
                            {missing.length > 0 && (
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  nightMode ? 'bg-amber-900/40 text-amber-200' : 'bg-amber-100 text-amber-800'
                                }`}
                                title={`Not in the current dataset: ${missing.join(', ')}`}
                              >
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                {missing.length} sample{missing.length > 1 ? 's' : ''} missing
                              </span>
                            )}
                          </div>

                          <p className={`text-sm mt-1 ${muted}`}>
                            {session.dataSelectorState.referenceGenome}
                            {' · '}
                            {session.dataSelectorState.selectedGenomes.length} sample
                            {session.dataSelectorState.selectedGenomes.length === 1 ? '' : 's'}
                            {' · '}
                            {enabled}/{session.tracks.length} tracks enabled
                            {session.dataSelectorState.userViewRegion && (
                              <>
                                {' · '}
                                <span className="font-mono text-xs">{session.dataSelectorState.userViewRegion}</span>
                              </>
                            )}
                          </p>

                          <p className={`text-xs mt-1 ${faint}`} title={absoluteTime(session.timestamp)}>
                            Saved {relativeTime(session.timestamp)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleLoadSession(session)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${BUTTON.primary}`}
                            title="Restore this session"
                          >
                            <PlayIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Load</span>
                          </button>
                          <button onClick={() => startEditing(session)} className={iconBtn} title="Rename / edit location" aria-label={`Edit “${session.name}”`}>
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDuplicate(session)} className={iconBtn} title="Duplicate" aria-label={`Duplicate “${session.name}”`}>
                            <DocumentDuplicateIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleExportOne(session)} className={iconBtn} title="Export this session" aria-label={`Export “${session.name}”`}>
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session)}
                            className={`p-2 rounded-lg transition-colors ${
                              nightMode ? 'text-gray-300 hover:bg-red-900/50 hover:text-red-300' : 'text-gray-500 hover:bg-red-100 hover:text-red-700'
                            }`}
                            title="Delete (you can undo)"
                            aria-label={`Delete “${session.name}”`}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : session.id)}
                        aria-expanded={isExpanded}
                        className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
                          nightMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        {isExpanded ? 'Hide details' : 'Show details'}
                      </button>

                      {isExpanded && (
                        <div className={`mt-3 pt-3 border-t space-y-3 ${nightMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div>
                            <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${faint}`}>Samples</p>
                            {session.dataSelectorState.selectedGenomes.length === 0 ? (
                              <p className={`text-sm ${muted}`}>None</p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {session.dataSelectorState.selectedGenomes.map((id) => {
                                  const gone = !knownSampleIds.has(id);
                                  return (
                                    <span
                                      key={id}
                                      title={gone ? 'No longer in the dataset' : undefined}
                                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        gone
                                          ? nightMode
                                            ? 'bg-amber-900/40 text-amber-200 line-through'
                                            : 'bg-amber-100 text-amber-800 line-through'
                                          : nightMode
                                            ? 'bg-gray-600 text-gray-100'
                                            : 'bg-gray-200 text-gray-800'
                                      }`}
                                    >
                                      {id}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${faint}`}>Data layers</p>
                            {session.dataSelectorState.selectedLayers.length === 0 ? (
                              <p className={`text-sm ${muted}`}>None</p>
                            ) : (
                              <LayerChips layers={session.dataSelectorState.selectedLayers} nightMode={nightMode} />
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Save dialog */}
      <Modal
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        title="Save session"
        description="Captures the reference genome, selected samples, data layers, track selections and browser location."
        nightMode={nightMode}
        footer={
          <>
            <button
              onClick={() => setShowSaveDialog(false)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${secondaryButton(nightMode)}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSession}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${BUTTON.primary}`}
            >
              {saveTargetId ? 'Overwrite session' : 'Save session'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="save-target" className={`block text-sm font-semibold mb-1.5 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Save to
            </label>
            <select
              id="save-target"
              value={saveTargetId}
              onChange={(e) => {
                setSaveTargetId(e.target.value);
                setSaveError(null);
              }}
              className={fieldCls}
            >
              <option value="">A new session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  Overwrite: {s.name}
                </option>
              ))}
            </select>
          </div>

          {saveTargetId ? (
            <div
              className={`flex items-start gap-2.5 rounded-xl p-3 text-sm ${
                nightMode ? 'bg-amber-900/20 text-amber-200' : 'bg-amber-50 text-amber-800'
              }`}
            >
              <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                “{sessions.find((s) => s.id === saveTargetId)?.name}” will be replaced with your current setup. This
                cannot be undone.
              </span>
            </div>
          ) : (
            <div>
              <label htmlFor="save-name" className={`block text-sm font-semibold mb-1.5 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Session name
              </label>
              <input
                id="save-name"
                type="text"
                value={newSessionName}
                onChange={(e) => {
                  setNewSessionName(e.target.value);
                  setSaveError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveSession();
                }}
                placeholder="e.g. hg38 · trio methylation"
                className={fieldCls}
              />
            </div>
          )}

          <dl className={`grid grid-cols-2 gap-3 rounded-xl p-3 ${nightMode ? 'bg-gray-700/60' : 'bg-gray-50'}`}>
            <StatPair label="Reference" value={dataSelectorState.referenceGenome} nightMode={nightMode} />
            <StatPair label="Samples" value={dataSelectorState.selectedGenomes.length} nightMode={nightMode} />
            <StatPair label="Data layers" value={dataSelectorState.selectedLayers.length} nightMode={nightMode} />
            <StatPair
              label="Tracks enabled"
              value={`${enabledTrackCount} / ${selectedTracks.length}`}
              nightMode={nightMode}
            />
          </dl>

          {saveError && (
            <p className="text-sm text-red-500 flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {saveError}
            </p>
          )}
        </div>
      </Modal>

      {/* Import dialog */}
      <Modal
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        title="Import sessions"
        description="Load a session file exported from this portal — from disk, a URL, or pasted below."
        maxWidth="max-w-2xl"
        nightMode={nightMode}
        footer={
          <>
            <button
              onClick={() => setShowImportDialog(false)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${secondaryButton(nightMode)}`}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!importPreview}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${BUTTON.primary}`}
            >
              {importPreview
                ? `Import ${importPreview.length} session${importPreview.length > 1 ? 's' : ''}`
                : 'Import'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <label
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer font-semibold text-sm transition-colors ${secondaryButton(nightMode)}`}
            >
              <DocumentArrowUpIcon className="w-5 h-5" />
              Choose file
              <input type="file" accept=".json,application/json" onChange={handleFileSelect} className="hidden" />
            </label>

            <div className="flex flex-1 gap-2">
              <div className={`flex items-center flex-1 gap-2 px-3 rounded-xl border ${nightMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <LinkIcon className={`w-5 h-5 flex-shrink-0 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFetchUrl();
                  }}
                  placeholder="https://example.com/sessions.json"
                  aria-label="Session file URL"
                  className={`flex-1 bg-transparent py-2.5 text-sm focus:outline-none ${
                    nightMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
              <button
                onClick={handleFetchUrl}
                disabled={fetchingUrl || !importUrl.trim()}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${secondaryButton(nightMode)}`}
              >
                {fetchingUrl ? 'Fetching…' : 'Fetch'}
              </button>
            </div>
          </div>

          <textarea
            value={importJson}
            onChange={(e) => {
              setImportJson(e.target.value);
              setImportError(null);
            }}
            placeholder="…or paste the exported JSON here"
            aria-label="Exported session JSON"
            className={`${fieldCls} font-mono text-xs`}
            rows={9}
          />

          {/* Preview. An import used to be a leap of faith: paste, press, hope. */}
          {importPreview && (
            <div className={`rounded-xl p-3 ${nightMode ? 'bg-gray-700/60' : 'bg-gray-50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${faint}`}>
                Ready to import ({importPreview.length})
              </p>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {importPreview.map((s) => (
                  <li key={s.id} className={`text-sm flex items-baseline gap-2 ${nightMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <span className="font-semibold truncate">{s.name}</span>
                    <span className={`text-xs ${faint}`}>
                      {s.dataSelectorState.referenceGenome} · {s.dataSelectorState.selectedGenomes.length} sample
                      {s.dataSelectorState.selectedGenomes.length === 1 ? '' : 's'}
                    </span>
                  </li>
                ))}
              </ul>
              {sessions.length + importPreview.length > MAX_SESSIONS && (
                <p className={`text-xs mt-2 flex items-start gap-1.5 ${nightMode ? 'text-amber-300' : 'text-amber-700'}`}>
                  <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                  Only {MAX_SESSIONS} sessions can be stored — the oldest beyond that will not be imported.
                </p>
              )}
            </div>
          )}

          {importJson.trim() && !importPreview && (
            <p className={`text-sm flex items-start gap-2 ${nightMode ? 'text-amber-300' : 'text-amber-700'}`}>
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              No readable sessions found. Expected a JSON array exported from this portal.
            </p>
          )}

          {importError && (
            <p className="text-sm text-red-500 flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {importError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
