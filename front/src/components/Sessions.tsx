import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  InboxArrowDownIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArchiveBoxIcon,
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { DataSelectorState } from './DataSelector';
import {
  getSessions,
  saveSession,
  deleteSession,
  updateSessionName,
  exportSessions,
  importSessions,
  applyTrackSelection,
  SessionData,
} from '../utils/sessionUtils';
import { selectTracks, Track } from '../utils/trackSelection';
import { getTrackData } from '../utils/genomeDataService';

interface SessionsProps {
  dataSelectorState: DataSelectorState;
  selectedTracks: Track[];
  onLoadSession: (state: DataSelectorState, tracks: Track[]) => void;
  nightMode?: boolean;
}

export default function Sessions({
  dataSelectorState,
  selectedTracks,
  onLoadSession,
  nightMode = false,
}: SessionsProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [newSessionName, setNewSessionName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    setSessions(getSessions());
  };

  const handleSaveSession = () => {
    if (!newSessionName.trim()) {
      alert('Please enter a session name');
      return;
    }

    const sessionName = newSessionName.trim();
    saveSession(sessionName, dataSelectorState, selectedTracks);

    setNewSessionName('');
    setShowSaveDialog(false);
    loadSessions();
    setSuccessMessage(`Session "${sessionName}" saved successfully!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSession(sessionId);
      loadSessions();
    }
  };

  const handleUpdateSessionName = (sessionId: string) => {
    if (!editingName.trim()) {
      alert('Please enter a session name');
      return;
    }

    updateSessionName(sessionId, editingName.trim());
    setEditingId(null);
    setEditingName('');
    loadSessions();
  };

  const handleLoadSession = async (session: SessionData) => {
    try {
      // Get available tracks data
      const availableTracks = getTrackData();
      
      // Regenerate tracks based on saved data selector state
      const result = selectTracks({
        selectedSamples: session.dataSelectorState.selectedGenomes,
        reference: session.dataSelectorState.referenceGenome,
        availableTracks: availableTracks,
        selectedLayers: session.dataSelectorState.selectedLayers,
      });
      
      // Apply saved track selection state
      const tracksWithSelection = applyTrackSelection(result.tracks, session.tracks);
      
      // Call the parent handler with restored state (dataSelectorState includes userViewRegion)
      onLoadSession(session.dataSelectorState, tracksWithSelection);
      
      setSuccessMessage(`Session "${session.name}" loaded successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Error loading session. Please try again.');
    }
  };

  const handleExport = () => {
    const json = exportSessions();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hprc-sessions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const success = importSessions(importJson);
      if (success) {
        setImportJson('');
        setImportUrl('');
        setShowImportDialog(false);
        loadSessions();
        setSuccessMessage('Sessions imported successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert('Invalid JSON format');
      }
    } catch (error) {
      alert('Error importing sessions: ' + error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportJson(String(reader.result ?? ''));
    reader.onerror = () => alert('Error reading file');
    reader.readAsText(file);
    // Reset so selecting the same file again still triggers onChange
    e.target.value = '';
  };

  const handleFetchUrl = async () => {
    const url = importUrl.trim();
    if (!url) return;
    setFetchingUrl(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      setImportJson(text);
    } catch (error) {
      alert('Error fetching from URL: ' + error);
    } finally {
      setFetchingUrl(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatSelection = (session: SessionData) => {
    const state = session.dataSelectorState;
    const parts = [];
    parts.push(`Reference: ${state.referenceGenome}`);
    if (state.selectedGenomes.length > 0) {
      parts.push(`${state.selectedGenomes.length} sample${state.selectedGenomes.length > 1 ? 's' : ''}`);
    }
    if (state.selectedLayers.length > 0) {
      parts.push(`${state.selectedLayers.length} layer${state.selectedLayers.length > 1 ? 's' : ''}`);
    }
    if (state.userViewRegion) {
      parts.push(`Location: ${state.userViewRegion}`);
    }
    return parts.join(' • ');
  };

  const formatTrackSelection = (session: SessionData) => {
    const total = session.tracks.length;
    const selected = session.tracks.filter(t => t.isSelected).length;
    return `${selected}/${total} tracks enabled`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]">
            <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 transition-colors duration-300`}>
        <h1 className={`text-3xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
          Sessions
        </h1>
        <p className={`${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Save and restore your data selections, including reference genome, samples, data layers, and track configurations.
        </p>
      </div>

      {/* Action Buttons */}
      <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 transition-colors duration-300`}>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <InboxArrowDownIcon className="w-5 h-5" />
            Save Current Session
          </button>

          <button
            onClick={handleExport}
            className={`px-6 py-3 ${nightMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-semibold rounded-xl transition-all duration-300 flex items-center gap-2`}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export All
          </button>

          <button
            onClick={() => setShowImportDialog(true)}
            className={`px-6 py-3 ${nightMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-semibold rounded-xl transition-all duration-300 flex items-center gap-2`}
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            Import
          </button>
        </div>
      </div>

      {/* Save Session Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full shadow-2xl`}>
            <h3 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              Save Session
            </h3>
            <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              This will save your current reference genome, selected samples, data layers, and track configurations.
            </p>
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveSession()}
              placeholder="Enter session name..."
              className={`w-full px-4 py-3 ${nightMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'} border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveSession}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewSessionName('');
                }}
                className={`flex-1 px-6 py-3 ${nightMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-semibold rounded-xl transition-all duration-300`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-2xl w-full shadow-2xl`}>
            <h3 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              Import Sessions
            </h3>

            {/* Load from file or URL */}
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <label
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer font-medium text-sm transition-colors ${nightMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
              >
                <DocumentArrowUpIcon className="w-5 h-5" />
                Choose File
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <div className="flex flex-1 gap-2">
                <div className={`flex items-center flex-1 gap-2 px-3 rounded-xl border ${nightMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <LinkIcon className={`w-5 h-5 flex-shrink-0 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleFetchUrl(); }}
                    placeholder="https://example.com/sessions.json"
                    className={`flex-1 bg-transparent py-2.5 text-sm focus:outline-none ${nightMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
                <button
                  onClick={handleFetchUrl}
                  disabled={fetchingUrl || !importUrl.trim()}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${nightMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                >
                  {fetchingUrl ? 'Fetching…' : 'Fetch'}
                </button>
              </div>
            </div>

            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste exported JSON here, or load from a file or URL above..."
              className={`w-full px-4 py-3 ${nightMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'} border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm`}
              rows={10}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleImport}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Import
              </button>
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportJson('');
                  setImportUrl('');
                }}
                className={`flex-1 px-6 py-3 ${nightMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-semibold rounded-xl transition-all duration-300`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 transition-colors duration-300`}>
        <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
          Saved Sessions ({sessions.length})
        </h2>
        
        {sessions.length === 0 ? (
          <div className={`text-center py-12 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <ArchiveBoxIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No saved sessions yet</p>
            <p className="mt-2">Save your current selections to quickly restore them later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className={`${nightMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-4 transition-all duration-200 animate-slide-in-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {editingId === session.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateSessionName(session.id);
                          } else if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditingName('');
                          }
                        }}
                        className={`w-full px-3 py-2 ${nightMode ? 'bg-gray-600 text-gray-100 border-gray-500' : 'bg-white text-gray-900 border-gray-300'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        autoFocus
                      />
                    ) : (
                      <h3 className={`text-lg font-semibold ${nightMode ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                        {session.name}
                      </h3>
                    )}
                    <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {formatSelection(session)}
                    </p>
                    <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {formatTrackSelection(session)}
                    </p>
                    <p className={`text-xs ${nightMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      Saved: {formatDate(session.timestamp)}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {editingId === session.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateSessionName(session.id)}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200"
                          title="Save"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                          className={`p-2 ${nightMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} rounded-lg transition-all duration-200`}
                          title="Cancel"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleLoadSession(session)}
                          className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200"
                          title="Load session"
                        >
                          <ArrowUpTrayIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(session.id);
                            setEditingName(session.name);
                          }}
                          className={`p-2 ${nightMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} rounded-lg transition-all duration-200`}
                          title="Rename"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

