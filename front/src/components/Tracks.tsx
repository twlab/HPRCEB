import React, { useState, useEffect, useMemo } from 'react';
import type { Track } from '../utils/trackSelection';

interface TracksComponentProps {
  tracks: Track[];
  selectedGenomes: string[];
  referenceGenome: string;
  nightMode?: boolean;
  onTracksChange: (tracks: Track[]) => void;
  onNavigateToDataSelector?: () => void;
}

// Check if track is a reference track (not a sample track)
const isReferenceTrack = (track: Track, referenceGenome: string): boolean => {
  return track.sampleId === referenceGenome || 
         track.sampleId === 'hg38' || 
         track.sampleId === 't2t-chm13-v2.0';
};

// Check if a track is a genome alignment track
const isGenomeAlignTrack = (track: Track): boolean => {
  return track.displayAttributes?.type === 'genomealign';
};

// Get the query genome from a genome alignment track
const getQueryGenome = (track: Track): string | undefined => {
  return track.displayAttributes?.querygenome;
};

// Get the coordinate (which genome this track relies on) from a track
const getTrackCoordinate = (track: Track): string | undefined => {
  return track.metadata?.coordinate as string | undefined;
};

export default function Tracks({ 
  tracks,
  selectedGenomes, 
  referenceGenome, 
  nightMode = false,
  onTracksChange,
  onNavigateToDataSelector 
}: TracksComponentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSample, setFilterSample] = useState<string>('all');

  // Get unique sample IDs for filter dropdown
  const sampleIds = React.useMemo(() => {
    const ids = new Set(tracks.map(t => t.sampleId));
    return ['all', ...Array.from(ids)];
  }, [tracks]);

  // Map from query genome to genome align track index (for all genome align tracks, not just selected)
  const queryGenomeToAlignTrackIndex = useMemo(() => {
    const mapping = new Map<string, number>();
    tracks.forEach((track, index) => {
      if (isGenomeAlignTrack(track)) {
        const queryGenome = getQueryGenome(track);
        if (queryGenome) {
          mapping.set(queryGenome, index);
        }
      }
    });
    return mapping;
  }, [tracks]);

  // Compute which genome align tracks cannot be disabled
  // A genome align track cannot be disabled if there are other selected+enabled tracks
  // whose coordinate relies on its query genome
  const lockedGenomeAlignIndices = useMemo(() => {
    const locked = new Set<number>();
    
    // Now check all selected non-genome-align tracks to see which query genomes they depend on
    tracks.forEach((track, index) => {
      if (!isGenomeAlignTrack(track) && track.isSelected) {
        const coordinate = getTrackCoordinate(track);
        // Check if this coordinate matches a query genome from a genome align track
        if (coordinate && queryGenomeToAlignTrackIndex.has(coordinate)) {
          const alignTrackIndex = queryGenomeToAlignTrackIndex.get(coordinate)!;
          // Only lock if the genome align track is also selected
          if (tracks[alignTrackIndex].isSelected) {
            locked.add(alignTrackIndex);
          }
        }
      }
    });

    return locked;
  }, [tracks, queryGenomeToAlignTrackIndex]);

  // Get all unique metadata keys across all tracks
  const metadataKeys = React.useMemo(() => {
    const keys = new Set<string>();
    tracks.forEach(track => {
      Object.keys(track.metadata).forEach(key => keys.add(key));
    });
    return Array.from(keys);
  }, [tracks]);

  // Filter tracks based on search and sample filter
  const filteredTracks = React.useMemo(() => {
    return tracks.filter((track) => {
      const trackName = (track.displayAttributes.name || '').toLowerCase();
      const sampleId = track.sampleId.toLowerCase();
      const metadataStr = Object.values(track.metadata).join(' ').toLowerCase();
      
      const matchesSearch = searchTerm === '' || 
        trackName.includes(searchTerm.toLowerCase()) ||
        sampleId.includes(searchTerm.toLowerCase()) ||
        metadataStr.includes(searchTerm.toLowerCase());
      
      const matchesSample = filterSample === 'all' || track.sampleId === filterSample;
      
      return matchesSearch && matchesSample;
    });
  }, [tracks, searchTerm, filterSample]);

  // Check if a track can be toggled (disabled)
  const canToggleTrack = (index: number): boolean => {
    const track = tracks[index];
    // If track is not selected, it can always be enabled
    if (!track.isSelected) return true;
    // If it's not a genome align track, it can be disabled
    if (!isGenomeAlignTrack(track)) return true;
    // If it's a genome align track, check if it's locked
    return !lockedGenomeAlignIndices.has(index);
  };

  // Toggle a single track's isSelected
  const toggleTrack = (index: number) => {
    // Check if this track can be toggled
    if (!canToggleTrack(index)) {
      console.log("Tracks: cannot disable track at index", index, "- other tracks depend on its query genome");
      return;
    }
    
    const track = tracks[index];
    const isEnabling = !track.isSelected;
    
    // Start with the basic toggle
    let newTracks = tracks.map((t, i) => 
      i === index ? { ...t, isSelected: !t.isSelected } : t
    );
    
    // If enabling a non-genome-align track that depends on a query genome,
    // automatically enable the corresponding genome align track
    if (isEnabling && !isGenomeAlignTrack(track)) {
      const coordinate = getTrackCoordinate(track);
      if (coordinate && queryGenomeToAlignTrackIndex.has(coordinate)) {
        const alignTrackIndex = queryGenomeToAlignTrackIndex.get(coordinate)!;
        // Enable the genome align track if it's not already selected
        if (!tracks[alignTrackIndex].isSelected) {
          console.log("Tracks: auto-enabling genome align track at index", alignTrackIndex, "for coordinate", coordinate);
          newTracks = newTracks.map((t, i) => 
            i === alignTrackIndex ? { ...t, isSelected: true } : t
          );
        }
      }
    }
    
    console.log("Tracks: toggling index", index, "new selected count:", newTracks.filter(t => t.isSelected).length);
    onTracksChange(newTracks);
  };

  // Enable all tracks (genome align dependencies are automatically satisfied since all are enabled)
  const enableAll = () => {
    const newTracks = tracks.map(track => ({ ...track, isSelected: true }));
    onTracksChange(newTracks);
  };

  // Disable all tracks (respects locked genome align tracks)
  const disableAll = () => {
    const newTracks = tracks.map((track, i) => {
      // Keep locked genome align tracks selected
      if (lockedGenomeAlignIndices.has(i)) {
        return track;
      }
      return { ...track, isSelected: false };
    });
    onTracksChange(newTracks);
  };

  // Enable filtered tracks (also enables required genome align tracks)
  const enableFiltered = () => {
    const filteredIndices = new Set(filteredTracks.map(t => tracks.indexOf(t)));
    
    // First, enable the filtered tracks
    let newTracks = tracks.map((track, i) => 
      filteredIndices.has(i) ? { ...track, isSelected: true } : track
    );
    
    // Then, find and enable any genome align tracks required by newly enabled tracks
    const requiredAlignIndices = new Set<number>();
    filteredTracks.forEach(track => {
      if (!isGenomeAlignTrack(track)) {
        const coordinate = getTrackCoordinate(track);
        if (coordinate && queryGenomeToAlignTrackIndex.has(coordinate)) {
          requiredAlignIndices.add(queryGenomeToAlignTrackIndex.get(coordinate)!);
        }
      }
    });
    
    // Enable required genome align tracks
    newTracks = newTracks.map((track, i) => 
      requiredAlignIndices.has(i) ? { ...track, isSelected: true } : track
    );
    
    onTracksChange(newTracks);
  };

  // Disable filtered tracks (respects locked genome align tracks)
  const disableFiltered = () => {
    const filteredIndices = new Set(filteredTracks.map(t => tracks.indexOf(t)));
    const newTracks = tracks.map((track, i) => {
      if (!filteredIndices.has(i)) return track;
      // Keep locked genome align tracks selected
      if (lockedGenomeAlignIndices.has(i)) {
        return track;
      }
      return { ...track, isSelected: false };
    });
    onTracksChange(newTracks);
  };

  const selectedCount = tracks.filter(t => t.isSelected).length;

  return (
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-6 transition-colors duration-300`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
          Track Configuration
        </h2>
        <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Review and select tracks to display in the browser
        </p>
      </div>

      <>
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className={`${nightMode ? 'bg-gradient-to-br from-primary-900/50 to-primary-800/50 border-primary-700' : 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200'} rounded-lg p-3 border`}>
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${nightMode ? 'text-primary-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <div>
                <p className={`text-xs ${nightMode ? 'text-primary-300' : 'text-primary-600'} font-medium`}>Total Tracks</p>
                <p className={`text-lg font-bold ${nightMode ? 'text-primary-100' : 'text-primary-900'}`}>{tracks.length}</p>
              </div>
            </div>
          </div>

          <div className={`${nightMode ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'} rounded-lg p-3 border`}>
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${nightMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <div>
                <p className={`text-xs ${nightMode ? 'text-green-300' : 'text-green-600'} font-medium`}>Selected</p>
                <p className={`text-lg font-bold ${nightMode ? 'text-green-100' : 'text-green-900'}`}>{selectedCount}</p>
              </div>
            </div>
          </div>

          <div className={`${nightMode ? 'bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-amber-700' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'} rounded-lg p-3 border`}>
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${nightMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
              </svg>
              <div>
                <p className={`text-xs ${nightMode ? 'text-amber-300' : 'text-amber-600'} font-medium`}>Filtered</p>
                <p className={`text-lg font-bold ${nightMode ? 'text-amber-100' : 'text-amber-900'}`}>{filteredTracks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={`${nightMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 mb-5`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className={`block text-sm font-medium ${nightMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Search Tracks
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, sample, or metadata..."
                className={`w-full px-3 py-2 rounded-lg border ${
                  nightMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              />
            </div>

            {/* Sample Filter */}
            <div className="md:w-48">
              <label className={`block text-sm font-medium ${nightMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Sample
              </label>
              <select
                value={filterSample}
                onChange={(e) => setFilterSample(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  nightMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              >
                {sampleIds.map(id => (
                  <option key={id} value={id}>
                    {id === 'all' ? 'All Samples' : id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-300">
            <button
              onClick={enableAll}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                nightMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              Select All ({tracks.length})
            </button>
            <button
              onClick={disableAll}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                nightMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Deselect All
            </button>
            <button
              onClick={enableFiltered}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                nightMode
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              Select Filtered ({filteredTracks.length})
            </button>
            <button
              onClick={disableFiltered}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                nightMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Deselect Filtered
            </button>
          </div>
        </div>

        {/* Tracks Table */}
        <div className={`rounded-lg border ${nightMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${nightMode ? 'bg-gray-700' : 'bg-gray-50'} sticky top-0 z-10`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider w-12`}>
                    #
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider w-16`}>
                    Selected
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Sample ID
                  </th>
                  {/* Dynamic metadata columns */}
                  {metadataKeys.map(key => (
                    <th key={key} className={`px-4 py-3 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`${nightMode ? 'bg-gray-800' : 'bg-white'} divide-y ${nightMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredTracks.map((track) => {
                  const originalIndex = tracks.indexOf(track);
                  const isRef = isReferenceTrack(track, referenceGenome);
                  
                  return (
                    <tr 
                      key={originalIndex} 
                      className={`${
                        track.isSelected 
                          ? nightMode ? 'bg-primary-900/20' : 'bg-primary-50' 
                          : nightMode ? 'bg-gray-800' : 'bg-white'
                      } hover:${nightMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                    >
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {originalIndex + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {(() => {
                          const isLocked = lockedGenomeAlignIndices.has(originalIndex);
                          return (
                            <div className="relative group">
                              <input
                                type="checkbox"
                                checked={track.isSelected}
                                onChange={() => toggleTrack(originalIndex)}
                                disabled={isLocked}
                                className={`w-5 h-5 rounded focus:ring-2 focus:ring-primary-500 ${
                                  isLocked
                                    ? 'bg-gray-400 border-gray-400 cursor-not-allowed opacity-60'
                                    : nightMode 
                                      ? 'bg-gray-700 border-gray-600 checked:bg-primary-600 checked:border-primary-600' 
                                      : 'bg-white border-gray-300 checked:bg-primary-600'
                                }`}
                              />
                              {isLocked && (
                                <div className={`absolute left-8 top-1/2 -translate-y-1/2 hidden group-hover:block z-20 
                                  px-2 py-1 text-xs rounded shadow-lg whitespace-nowrap
                                  ${nightMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-800 text-white'}`}>
                                  Cannot disable: other tracks depend on this genome alignment
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap`}>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isRef
                            ? nightMode 
                              ? 'bg-purple-900/50 text-purple-300' 
                              : 'bg-purple-100 text-purple-800'
                            : nightMode 
                              ? 'bg-green-900/50 text-green-300' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {track.sampleId}
                        </span>
                      </td>
                      {/* Dynamic metadata values */}
                      {metadataKeys.map(key => (
                        <td key={key} className={`px-4 py-3 text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {track.metadata[key] !== undefined ? String(track.metadata[key]) : '-'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty state */}
        {tracks.length === 0 && (
          <div className={`text-center py-12 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>No tracks available. Select samples from the Sample tab to load tracks.</p>
            {onNavigateToDataSelector && (
              <button
                onClick={onNavigateToDataSelector}
                className={`mt-4 px-4 py-2 rounded-lg ${
                  nightMode 
                    ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                Go to Sample Selection
              </button>
            )}
          </div>
        )}

        {/* Footer hints */}
        {tracks.length > 0 && (
          <div className={`mt-4 space-y-2`}>
            <div className={`p-3 rounded-lg ${nightMode ? 'bg-primary-900/20 border-primary-700' : 'bg-primary-50 border-primary-200'} border`}>
              <p className={`text-sm ${nightMode ? 'text-primary-300' : 'text-primary-700'}`}>
                💡 <strong>Tip:</strong> After selecting your tracks, navigate to the Browser tab to visualize them.
              </p>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
