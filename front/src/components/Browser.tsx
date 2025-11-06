import React, { useMemo, useState } from 'react';
import { GenomeBrowserViewer } from "./GenomeBrowserViewer";
import type { DataLayer, Genome } from '../utils/genomeTypes';
import type { TracksProps } from '../utils/browserTypes';
import { getAllTracksForGenomes } from '../utils/assemblyUtils';
import { getGenomeData } from '../utils/genomeDataService';

// Re-export for backwards compatibility
export { GenomeBrowserViewer };


// Testing track set #1
const trackSet1: TracksProps[] = [{
  "name": "HG002 mat",
  "type": "genomealign",
  "querygenome": "HG002_mat",
  "showOnHubLoad": true,
  "metadata": {
      "genome": "hg38",
  },
  "url": "https://wangftp.wustl.edu/~xzhuo/pangenome_alignments/HG01978_mat.hg38.unique.align.gz"
}];

// Testing track set #2
const trackSet2: TracksProps[] = [{
  type: "methylc",
  name: "H1",
  url: "https://vizhub.wustl.edu/public/hg19/methylc2/h1.liftedtohg19.gz",
  options: {
    label: "methylc track demo",
    combineStrands: true,
    colorsForContext: {
      CG: { color: "#648bd8", background: "#d9d9d9" },
      CHG: { color: "#ff944d", background: "#ffe0cc" },
      CHH: { color: "#ff00ff", background: "#ffe5ff" },
    },
    depthColor: "#01E9FE",
  },
},]


const hg38_default_tracks: TracksProps[] = [
        {
          type: "ruler",
          name: "Ruler",
        },
        {
          type: "geneAnnotation",
          name: "refGene",
          genome: "hg38",
        },
        {
          type: "geneAnnotation",
          name: "gencodeV47",
          genome: "hg38",
        },
        {
          type: "geneAnnotation",
          name: "MANE_select_1.4",
          label: "MANE selection v1.4",
          genome: "hg38",
        },
        {
          type: "repeatmasker",
          name: "rmsk_all",
          options: { label: "RepeatMasker" },
          url: "https://vizhub.wustl.edu/public/hg38/rmsk16.bb",
        }
      ]


const chm13_t2t_v2_default_tracks: TracksProps[] = [
        {
          type: "ruler",
          name: "Ruler",
        },
        {
          type: "geneAnnotation",
          name: "genes",
          label: "genes from CAT and Liftoff",
          genome: "t2t-chm13-v2.0",
          options: {
            maxRows: 10,
          },
        },
        {
          type: "rmskv2",
          name: "RepeatMaskerV2",
          url: "https://vizhub.wustl.edu/public/t2t-chm13-v1.1/rmsk.bigBed",
        }
      ];


interface BrowserProps {
  selectedGenomes: string[];
  selectedLayers: DataLayer[];
  referenceGenome: string;
  nightMode?: boolean;
}

export default function Browser({ selectedGenomes, selectedLayers, referenceGenome, nightMode = false }: BrowserProps) {
  // Get genome data
  const genomes = getGenomeData();
  
  // State for track information collapse
  const [isTrackInfoExpanded, setIsTrackInfoExpanded] = useState(false);
  
  // State for control panel
  const [isControlPanelExpanded, setIsControlPanelExpanded] = useState(false);
  
  // State for enabled default tracks
  const [enabledDefaultTracks, setEnabledDefaultTracks] = useState<Set<string>>(() => {
    // Initialize with defaults based on reference genome
    if (referenceGenome === 'hg38') {
      // For hg38: load all except gencode and MANE
      return new Set(['Ruler', 'refGene', 'rmsk_all']);
    } else {
      // For chm13: load all by default
      return new Set(['Ruler', 'genes', 'RepeatMaskerV2']);
    }
  });
  
  // Update enabled tracks when reference genome changes
  React.useEffect(() => {
    if (referenceGenome === 'hg38') {
      setEnabledDefaultTracks(new Set(['Ruler', 'refGene', 'rmsk_all']));
    } else if (referenceGenome === 't2t-chm13-v2.0' || referenceGenome === 'chm13') {
      setEnabledDefaultTracks(new Set(['Ruler', 'genes', 'RepeatMaskerV2']));
    }
  }, [referenceGenome]);

  
  // Helper function to get track identifier
  const getTrackIdentifier = (track: TracksProps): string => {
    return track.name || track.options?.label || track.type;
  };
  
  // Dynamically generate tracks based on selected genomes and reference
  // Track ordering:
  // 1. Default reference genome tracks (hg38 or chm13) - ruler, genes, repeat masker
  // 2. Tracks are grouped by sample
  // 3. For each sample:
  //    a. Tracks using reference genome coordinates (e.g., bigwig expression without haplotype)
  //    b. Maternal (mat/hap1) genome alignment track
  //    c. Tracks using maternal coordinates (methylation, chromatin on mat)
  //    d. Paternal (pat/hap2) genome alignment track  
  //    e. Tracks using paternal coordinates (methylation, chromatin on pat)
  const tracks = useMemo(() => {
    if (selectedGenomes.length === 0 || !referenceGenome) {
      return [];
    }
    
    const genomeTracks = getAllTracksForGenomes(genomes, selectedGenomes, referenceGenome, selectedLayers);
    
    // Add reference genome tracks at the top
    let referenceTracks: TracksProps[] = [];
    
    if (referenceGenome === 'hg38') {
      referenceTracks = hg38_default_tracks;
    } else if (referenceGenome === 't2t-chm13-v2.0' || referenceGenome === 'chm13') {
      referenceTracks = chm13_t2t_v2_default_tracks;
    }
    
    // Filter reference tracks based on enabled state
    const filteredReferenceTracks = referenceTracks.filter(track => {
      const trackId = getTrackIdentifier(track);
      return enabledDefaultTracks.has(trackId);
    });
    
    const allTracks = [...filteredReferenceTracks, ...genomeTracks];
    
    // Debug: Log full tracks to console before sending to browser
    console.log('='.repeat(80));
    console.log('TRACKS BEING SENT TO BROWSER:', allTracks.length, 'tracks');
    console.log('='.repeat(80));
    allTracks.forEach((track, index) => {
      console.log(`\nTrack ${index + 1}:`, JSON.stringify(track, null, 2));
    });
    console.log('='.repeat(80));
    
    return allTracks;
  }, [genomes, selectedGenomes, referenceGenome, selectedLayers, enabledDefaultTracks]);

  // Fallback tracks for demonstration (can be removed once assembly loading is working)


  return (
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-6 hover-lift flex flex-col transition-colors duration-300`}>
      {/* Header with Icon */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${nightMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border`}>
          <img 
            src="https://epgg.github.io/assets/images/eg-51ea8bd8d2ca299ede6ceb5f1c987ff7.png" 
            alt="HPRC Epigenome Browser" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>HPRC Epigenome Browser</h2>
          <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
            Interactive genomic data visualization
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {selectedGenomes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {/* Reference - Moved to First */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-amber-700' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'} rounded-lg p-3 border`}>
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${nightMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div>
                <p className={`text-xs ${nightMode ? 'text-amber-300' : 'text-amber-600'} font-medium`}>Reference</p>
                <p className={`text-sm font-bold ${nightMode ? 'text-amber-100' : 'text-amber-900'}`}>{referenceGenome}</p>
              </div>
            </div>
          </div>

          <div className={`${nightMode ? 'bg-gradient-to-br from-primary-900/50 to-primary-800/50 border-primary-700' : 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200'} rounded-lg p-3 border`}>
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${nightMode ? 'text-primary-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div>
                <p className={`text-xs ${nightMode ? 'text-primary-300' : 'text-primary-600'} font-medium`}>Genomes</p>
                <p className={`text-lg font-bold ${nightMode ? 'text-primary-100' : 'text-primary-900'}`}>{selectedGenomes.length}</p>
              </div>
            </div>
          </div>

          <div className={`${nightMode ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'} rounded-lg p-3 border`}>
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${nightMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
              <div>
                <p className={`text-xs ${nightMode ? 'text-purple-300' : 'text-purple-600'} font-medium`}>Data Layers</p>
                <p className={`text-lg font-bold ${nightMode ? 'text-purple-100' : 'text-purple-900'}`}>{selectedLayers.length}</p>
              </div>
            </div>
          </div>

          <div className={`${nightMode ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'} rounded-lg p-3 border`}>
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${nightMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <div>
                <p className={`text-xs ${nightMode ? 'text-green-300' : 'text-green-600'} font-medium`}>Tracks</p>
                <p className={`text-lg font-bold ${nightMode ? 'text-green-100' : 'text-green-900'}`}>{tracks.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel - Collapsible */}
      {selectedGenomes.length > 0 && (
        <div className={`mb-5 ${nightMode ? 'bg-gray-800/50 border-gray-700' : 'bg-purple-50 border-purple-200'} border-l-4 border-purple-500 rounded-r-xl transition-all duration-300`}>
          {/* Header - Always Visible */}
          <button
            onClick={() => setIsControlPanelExpanded(!isControlPanelExpanded)}
            className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${nightMode ? 'text-purple-400' : 'text-purple-600'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
              <div className="text-left">
                <h3 className={`text-sm font-bold ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>Control Panel</h3>
                <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Configure default reference tracks
                </p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 ${nightMode ? 'text-gray-400' : 'text-gray-600'} transition-transform duration-300 ${isControlPanelExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          {/* Collapsible Content */}
          {isControlPanelExpanded && (
            <div className="px-4 pb-4 animate-fade-in">
              <div className={`${nightMode ? 'bg-gray-700/50' : 'bg-white'} rounded-lg p-4 border ${nightMode ? 'border-gray-600' : 'border-purple-100'}`}>
                <h4 className={`text-sm font-bold ${nightMode ? 'text-gray-200' : 'text-gray-900'} mb-3`}>
                  Default Reference Tracks ({referenceGenome})
                </h4>
                <div className="space-y-2">
                  {(referenceGenome === 'hg38' ? hg38_default_tracks : chm13_t2t_v2_default_tracks).map((track, idx) => {
                    const trackId = getTrackIdentifier(track);
                    const isEnabled = enabledDefaultTracks.has(trackId);
                    const trackLabel = track.options?.label || track.name || track.type;
                    
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isEnabled
                            ? nightMode
                              ? 'bg-purple-900/30 border-purple-600'
                              : 'bg-purple-50 border-purple-300'
                            : nightMode
                              ? 'bg-gray-800/50 border-gray-700 opacity-60'
                              : 'bg-gray-50 border-gray-300 opacity-60'
                        } hover:shadow-md`}
                      >
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            const newEnabled = new Set(enabledDefaultTracks);
                            if (e.target.checked) {
                              newEnabled.add(trackId);
                            } else {
                              newEnabled.delete(trackId);
                            }
                            setEnabledDefaultTracks(newEnabled);
                          }}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {trackLabel}
                          </div>
                          <div className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Type: {track.type}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-300">
                  <button
                    onClick={() => {
                      const allTracks = referenceGenome === 'hg38' ? hg38_default_tracks : chm13_t2t_v2_default_tracks;
                      setEnabledDefaultTracks(new Set(allTracks.map(t => getTrackIdentifier(t))));
                    }}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      nightMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    Enable All
                  </button>
                  <button
                    onClick={() => {
                      if (referenceGenome === 'hg38') {
                        setEnabledDefaultTracks(new Set(['Ruler', 'refGene', 'rmsk_all']));
                      } else {
                        const allTracks = chm13_t2t_v2_default_tracks;
                        setEnabledDefaultTracks(new Set(allTracks.map(t => getTrackIdentifier(t))));
                      }
                    }}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      nightMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={() => setEnabledDefaultTracks(new Set())}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      nightMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Disable All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Track Details Section - Collapsible */}
      {selectedGenomes.length > 0 && tracks.length > 0 && (
        <div className={`mb-5 ${nightMode ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-200'} border-l-4 border-blue-500 rounded-r-xl transition-all duration-300`}>
          {/* Header - Always Visible */}
          <button
            onClick={() => setIsTrackInfoExpanded(!isTrackInfoExpanded)}
            className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${nightMode ? 'text-primary-400' : 'text-primary-600'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-left">
                <h3 className={`text-sm font-bold ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>Track Information</h3>
                <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tracks.length} tracks ({tracks.filter(t => t.type === 'ruler' || t.type === 'geneAnnotation' || t.type === 'repeatmasker' || t.type === 'rmskv2').length} reference + {tracks.filter(t => t.type === 'genomealign' || t.type === 'methylc' || t.type === 'bigwig').length} sample)
                </p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 ${nightMode ? 'text-gray-400' : 'text-gray-600'} transition-transform duration-300 ${isTrackInfoExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          {/* Collapsible Content */}
          {isTrackInfoExpanded && (
            <div className="px-4 pb-4 animate-fade-in">
              <div className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'} space-y-2`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 gap-y-4 max-h-96 overflow-y-auto pr-2 pt-2">
                  {tracks.map((track, idx) => {
                    const trackName = track.name || 'Unknown';
                    const trackType = track.type || 'Unknown';
                    const metadata = (track as any).metadata || {};
                    const dataAttrs = metadata.dataAttributes || {};
                    
                    // Check if data attributes exist
                    const hasDataAttrs = dataAttrs && Object.keys(dataAttrs).length > 0;
                    
                    // Format data_attributes for tooltip (only if exists)
                    const dataAttributesText = hasDataAttrs
                      ? Object.entries(dataAttrs)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join('\n')
                      : '';
                    
                    return (
                      <div 
                        key={idx} 
                        className={`${nightMode ? 'bg-gray-700/50' : 'bg-white'} p-2 rounded-lg border ${nightMode ? 'border-gray-600' : 'border-blue-100'} hover:shadow-lg hover:border-blue-500 transition-all relative overflow-visible group ${hasDataAttrs ? 'cursor-help' : ''}`}
                        title={hasDataAttrs ? dataAttributesText : undefined}
                      >
                        {/* Hover Tooltip - Only show if data attributes exist */}
                        {hasDataAttrs && (
                          <div className={`absolute left-0 bottom-full mb-2 px-3 py-2 rounded-lg shadow-xl z-20 w-64 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${nightMode ? 'bg-gray-900 border border-gray-600' : 'bg-white border border-gray-300'}`}>
                            <div className={`text-xs ${nightMode ? 'text-gray-200' : 'text-gray-800'} space-y-1`}>
                              <p className="font-bold text-sm mb-2 border-b pb-1 border-gray-500">Data Attributes</p>
                              {Object.entries(dataAttrs).map(([key, value], i) => (
                                <div key={i} className="flex">
                                  <span className="font-semibold min-w-[100px]">{key}:</span>
                                  <span className={nightMode ? 'text-gray-300' : 'text-gray-600'}>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                            {/* Tooltip Arrow */}
                            <div className={`absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${nightMode ? 'border-t-gray-900' : 'border-t-white'}`}></div>
                          </div>
                        )}
                        
                        <p className="font-semibold truncate flex items-center gap-2" title={trackName}>
                          <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded text-xs font-bold ${nightMode ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white'}`}>
                            {idx + 1}
                          </span>
                          <span className="truncate">{trackName}</span>
                        </p>
                        <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Type: {trackType}</p>
                        {dataAttrs.description && <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'} mt-1 line-clamp-2`}>{dataAttrs.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dataAttrs.platform && <span className={`inline-block text-xs px-1.5 py-0.5 rounded ${nightMode ? 'bg-primary-900/50 text-primary-300' : 'bg-primary-100 text-primary-800'}`}>{dataAttrs.platform}</span>}
                          {dataAttrs.coverage && <span className={`inline-block text-xs px-1.5 py-0.5 rounded ${nightMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>{dataAttrs.coverage}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Browser Container */}
      <div className="flex-1">
        {selectedGenomes.length === 0 ? (
          <div className={`rounded-xl overflow-hidden border-2 ${nightMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} flex items-center justify-center min-h-[400px]`}>
            <div className="text-center">
              <svg className={`mx-auto h-12 w-12 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 className={`mt-2 text-sm font-medium ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>No genomes selected</h3>
              <p className={`mt-1 text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>Go to Data Selector tab to select genomes</p>
            </div>
          </div>
        ) : (
          <div className={`rounded-xl overflow-y-auto border-2 ${nightMode ? 'border-gray-700' : 'border-gray-200'} max-h-[800px]`}>
            <GenomeBrowserViewer
                tracks={tracks}
            />
          </div>
        )}
      </div>

      {/* Browser Documentation Hint */}
      {selectedGenomes.length > 0 && (
        <div className={`mt-4 p-3 rounded-lg ${nightMode ? 'bg-gray-800/50 border-gray-700' : 'bg-primary-50 border-primary-200'} border flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <svg className={`w-5 h-5 ${nightMode ? 'text-primary-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              💡 <strong>Need help using the browser?</strong> Check out the{' '}
              <a 
                href="https://epgg.github.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 underline font-semibold"
              >
                Browser Documentation
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
